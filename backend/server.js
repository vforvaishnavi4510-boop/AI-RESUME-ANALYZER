
import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { PDFParse } from "pdf-parse";

const data = await pdf(req.file.buffer);

const text = data.text;

app.post("/upload", upload.single("resume"), async (req, res) => {

  const pdfData = await pdf(req.file.buffer);

  const text = pdfData.text;

  // Gemini Analysis
});

dotenv.config();


const ai = new GoogleGenAI({
  apiKey:process.env.GEMINI_API_KEY,
});

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
});

app.use(cors({
  origin: "https://ai-resume-analyzer-frontend-tau.vercel.app"
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Backend connected successfully" });
});

app.post("/upload", upload.single("resume"), async (req, res) => {
  try {
   
      const jobDescription = req.body.jobDescription;

      if (!jobDescription) {
  return res.status(400).json({
    error: "Please select a target job role"
  });
}

      console.log("Target Job:", jobDescription);
   const pdf = await pdfjsLib.getDocument({ data: req.file.buffer }).promise;

    let text = "";

for(let i = 1; i <= pdf.numPages; i++) {
  const page = await pdf.getPage(i);

  const content = await page.getTextContent();

  const pageText = content.items
    .map(item => item.str)
    .join(" ");

  text += pageText + "\n";
}


  const prompt = `
You are an ATS Resume Analyzer.

Target Job Role:
${jobDescription}

Resume Content:
${text}

Analyze the resume specifically for the target job role.

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



const response = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents:prompt,
})
let analysisText = response.text;

// remove markdown code fences
analysisText = analysisText
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim();

const analysis = JSON.parse(analysisText);



    console.log("Pages:", pdf.numPages);

   res.json({
  resumeText: text,
  analysis: analysis
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