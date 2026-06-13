import React, { useState, useEffect } from "react";
import axios from "axios";
import "./index.css";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaLightbulb,
} from "react-icons/fa";

function App() {
  const [message, setMessage] = useState("");
  const [resume, setResume] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleAnalyze = async () => {
    if (!resume) {
      alert("Please select a resume");
      return;
    }
    if (!jobDescription.trim()) {
      alert("Please paste a Job Description");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resume);
    formData.append("jobDescription", jobDescription);

    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/upload",
        formData,
      );

      setResumeText(response.data.resumeText);
      setAnalysis(response.data.analysis);
    } catch (error) {
      console.log("ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    axios
      .get("http://localhost:5000")
      .then((response) => {
        setMessage(response.data.message);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <div className="hero-card">
      <div className="app-container">
        <div className="heading">
          <h1 className="analysis-title">AI-Resume Analyzer</h1>
        </div>
        <div className="sub-heading">
          <div className="box"></div>
          <p>Upload your resume and get ATS Insights</p>
        </div>

        <div className="select-button">
<div className="input-section">


          <div className="job-description-container">
  <label className="job-label">
    Job Description
  </label>
 
          
          <textarea
            className="job-description"
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
          </div>
          <div className="upload-section">

  <label className="job-label">
    Resume Upload
  </label>
            <label
              htmlFor="resume-upload"
              className={`upload-box ${dragActive ? "active" : ""}`}
              onDragEnter={() => setDragActive(true)}
              onDragLeave={() => setDragActive(false)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);

                const file = e.dataTransfer.files[0];
                if (!file) return;

                if (file.type !== "application/pdf") {
                  alert("Please upload a PDF file");
                  return;
                }

                setResume(file);
              }}
            >
              <h3>📄 Upload Resume</h3>

              {resume ? (
                <p>✅ {resume.name}</p>
              ) : (
                <>
                  <p>Drag & Drop your PDF here</p>
                  <p>or click to browse</p>
                </>
              )}
            </label>
            </div>

            <input
              id="resume-upload"
              type="file"
              accept=".pdf"
              hidden
              onChange={(e) => setResume(e.target.files[0])}
            />
          </div>
          <button onClick={handleAnalyze} disabled={loading}>
            {loading ? "Analyzing..." : "Analyze Resume"}
          </button>

          {analysis && (
            <>
             <div className="heading"> <h2>ATS Analysis</h2></div>
              <div className="score-row">

              <div className="job-match-card">
                <h3>Job Match Score</h3>

                <h1 className="job-match-number">{analysis.jobMatch}%</h1>

                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${analysis.jobMatch}%`,
                    }}
                  />
                </div>
                </div>
              
            
                <div className="score-card">
                  <h3>ATS Score</h3>
                  <h2>{analysis.score}/100</h2>

                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${analysis.score}%` }}
                    ></div>
                  </div>

                  
                </div>
                
                
                </div>

                <div className="cards-container">
                  <div className="strengths-card">
                    <div className="card-title">
                      <FaCheckCircle />
                      <h3>Strengths</h3>
                    </div>
                    <ul>
                      {analysis.strengths.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="missing-card">
                    <div className="card-title">
                      <FaExclamationTriangle />
                      <h3> Missing Skills
                      </h3>
                    </div>
                    <ul>
                      {analysis.missingSkills.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="suggestion-card">
                    <div className="card-title">
                      {" "}
                      <FaLightbulb />
                      <h3> Suggestions</h3>
                    </div>
                    <ul>
                      {analysis.suggestions.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
            
            </>
          )}
        </div>
      </div>
    </div>
  );
}
export default App;
