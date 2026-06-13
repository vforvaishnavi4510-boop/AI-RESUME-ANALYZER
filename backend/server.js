import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";




dotenv.config();


const ai = new GoogleGenAI({
  apiKey:process.env.GEMINI_API_KEY,
});

const app = express();
const upload = multer({
  dest: "uploads/",
});

app.use(cors());
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
    const pdf = await pdfjsLib.getDocument(req.file.path).promise;

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


const getScoreColor = (score) => {
  if(score >= 80) return "#22c55e";
  if(score >= 60) return "#2563eb";
  return "#ef4444";
};



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
fs.unlinkSync(req.file.path);
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
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
