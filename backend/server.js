import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
});

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://ai-resume-analyzer-frontend-tau.vercel.app"
  ]
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Backend connected successfully" });
});

app.post("/upload", upload.single("resume"), async (req, res) => {
  try {
    const jobDescription = req.body.jobDescription;
    if (!req.file) {
      return res.status(400).json({
        error: "Please upload a PDF",
      });
    }
    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({
        error: "Only PDF files are allowed",
      });
    }
    if (!jobDescription) {
      return res.status(400).json({
        error: "Please select a target job role",
      });
    }

    console.log("Target Job:", jobDescription);

    const pdfFile = {
      inlineData: {
        mimeType: "application/pdf",
        data: req.file.buffer.toString("base64"),
      },
    };

    const prompt = `
You are an ATS Resume Analyzer.

Target Job Role:
${jobDescription}



Analyze the attached PDF resume for the target job role.
Read the PDF content yourself.

Return ONLY valid JSON.


{
  "score": 0,
  "jobMatch": 0,
  "strengths": [],
  "missingSkills": [],
  "suggestions": []
}

Rules:

- score = ATS score out of 100
- jobMatch = percentage match for the selected role
- strengths = resume strengths relevant to the role
- missingSkills = important missing skills for the role
- suggestions = improvements to get hired for this role

in the most least content direct and to the point 
`;


console.log("File:", req.file.originalname);
console.log("Type:", req.file.mimetype);
console.log("Size:", req.file.size);

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        pdfFile,
        {
          text: prompt,
        },
      ],
    });
    let analysisText = response.text;

    // remove markdown code fences
    analysisText = analysisText
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let analysis;

try {
  analysis = JSON.parse(analysisText);
} catch (err) {
  console.error("Gemini returned invalid JSON:");
  console.log(analysisText);

  return res.status(500).json({
    error: "Failed to parse Gemini response",
  });
}

    res.json({
      analysis: analysis,
    });
  } catch (error) {
    console.error("ERROR:", error);

    res.status(500).json({
      error: error.message,
    });
  }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));

export default app;
