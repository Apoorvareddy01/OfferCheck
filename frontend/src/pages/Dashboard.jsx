import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaShieldAlt,
  FaSignOutAlt,
  FaSearch,
  FaFileUpload,
  FaHistory,
  FaCheckCircle,
  FaExclamationTriangle,
  FaChartLine,
  FaStar,
  FaLightbulb,
  FaFileAlt,
} from "react-icons/fa";
import "../App.css";

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [history, setHistory] = useState([]);

  const jobKeywords = [
    "job", "internship", "intern", "hiring", "salary", "company",
    "position", "role", "candidate", "experience", "skills", "apply",
    "recruitment", "work", "developer", "engineer", "manager",
    "employee", "qualification", "responsibilities", "requirements",
    "stipend", "vacancy", "career", "interview", "office", "remote",
    "employment",
  ];

  const isMeaningfulJobDescription = (text) => {
    const trimmed = text.trim();
    const words = trimmed.match(/[a-zA-Z]{2,}/g) || [];

    return (
      trimmed.length >= 30 &&
      words.length >= 5 &&
      jobKeywords.some((keyword) =>
        trimmed.toLowerCase().includes(keyword)
      )
    );
  };

  const analyzeJob = async () => {
    if (!jobDescription.trim() && !file) {
      alert("Please enter a job description or upload a file.");
      return;
    }

    if (!file && !isMeaningfulJobDescription(jobDescription)) {
      alert(
        "Please enter a meaningful job description containing relevant job information."
      );
      return;
    }

    setLoading(true);

    try {
      let response;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);

        response = await axios.post(
          "http://127.0.0.1:5000/upload",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      } else {
        response = await axios.post(
          "http://127.0.0.1:5000/predict",
          { job_description: jobDescription }
        );
      }

      setResult(response.data);
    } catch (error) {
      console.error(error);
      alert("Error connecting to backend");
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await axios.get(
        "http://127.0.0.1:5000/history"
      );
      setHistory(response.data);
    } catch (error) {
      console.error(error);
      alert("Unable to load history");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const riskClass =
    result?.risk_level === "High"
      ? "high-risk"
      : result?.risk_level === "Medium"
      ? "medium-risk"
      : "low-risk";

  const riskStatusClass = (risk) =>
    risk === "High"
      ? "high-status"
      : risk === "Medium"
      ? "medium-status"
      : "low-status";

  const predictionClass = (prediction) =>
    prediction === "scam"
      ? "status-badge scam-status"
      : "status-badge genuine-status";

  return (
    <div className="app-page">

      {/* Navbar */}
      <nav className="navbar modern-navbar">
        <div className="brand">
          <div className="brand-icon">
            <FaShieldAlt />
          </div>

          <div>
            <h2>OfferCheck</h2>
            <span>AI Scam Detection</span>
          </div>
        </div>

        <div className="nav-right">
          <div className="welcome-text">
            <span>Welcome back,</span>
            <strong>{user?.fullname || "User"}</strong>
          </div>

          <button className="logout-btn" onClick={logout}>
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </nav>

      <main className="dashboard-wrapper">

        {/* Hero */}
        <section className="hero-section">
          <div className="hero-badge">
            <FaShieldAlt />
            AI-Powered Protection
          </div>

          <h1>
            Detect Fake Jobs <span>Before You Apply</span>
          </h1>

          <p>
            Analyze job descriptions, internship offers, recruitment posters,
            and offer letters using AI-powered scam detection.
          </p>
        </section>

        {/* Analysis */}
        <section className="analysis-grid">

          <div className="analysis-card">
            <div className="section-heading">
              <div className="heading-icon">
                <FaSearch />
              </div>

              <div>
                <h3>Analyze Job Offer</h3>
                <p>Paste a description or upload a document</p>
              </div>
            </div>

            <div className="input-group">
              <label>Job Description</label>

              <textarea
                placeholder="Paste the job description, internship offer, or recruitment message here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="divider">
              <span>OR</span>
            </div>

            <div className="upload-section">
              <input
                type="file"
                id="file-upload"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => setFile(e.target.files[0])}
                disabled={loading}
                hidden
              />

              <label htmlFor="file-upload" className="upload-area">
                <FaFileUpload className="upload-icon" />

                <h4>
                  {file ? "File Selected" : "Upload Offer Letter"}
                </h4>

                <p>
                  {file
                    ? file.name
                    : "Click to browse PDF, PNG, JPG or JPEG files"}
                </p>

                <span>PDF • PNG • JPG • JPEG</span>
              </label>
            </div>

            <button
              className="analyze-btn"
              onClick={analyzeJob}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  AI is Analyzing...
                </>
              ) : (
                <>
                  <FaSearch />
                  Analyze Job Offer
                </>
              )}
            </button>
          </div>

          {/* Safety Tips */}
          <aside className="tips-card">
            <div className="tips-header">
              <FaLightbulb />
              <h3>Stay Safe</h3>
            </div>

            <p className="tips-description">
              Keep these important safety checks in mind before accepting a
              job offer.
            </p>

            {[
              "Never pay registration or processing fees.",
              "Verify the company's official website.",
              "Check the recruiter's official email domain.",
              "Be careful with unrealistic salary promises.",
              "Avoid sharing sensitive personal information.",
            ].map((tip, index) => (
              <div className="tip-item" key={index}>
                <FaCheckCircle />
                <span>{tip}</span>
              </div>
            ))}

            <div className="supported-box">
              <FaFileAlt />

              <div>
                <strong>Supported Files</strong>
                <p>PDF, JPG, JPEG, PNG</p>
              </div>
            </div>
          </aside>
        </section>

        {/* Results */}
        {result && (
          <section className="results-section">

            <div className="results-heading">
              <div>
                <span className="section-tag">
                  ANALYSIS COMPLETE
                </span>

                <h2>AI Analysis Result</h2>

                <p>
                  Here is the risk assessment for the submitted job offer.
                </p>
              </div>
            </div>

            <div className="metrics-grid">

              <div className="metric-card prediction-card">
                <div className="metric-icon">
                  <FaShieldAlt />
                </div>

                <span>Prediction</span>

                <strong
                  className={
                    result.prediction === "scam"
                      ? "text-danger"
                      : "text-success"
                  }
                >
                  {result.prediction === "scam"
                    ? "SCAM"
                    : "GENUINE"}
                </strong>
              </div>

              <div className="metric-card">
                <div className="metric-icon blue-icon">
                  <FaChartLine />
                </div>

                <span>Confidence</span>
                <strong>{result.confidence}%</strong>
              </div>

              <div className="metric-card">
                <div className="metric-icon green-icon">
                  <FaStar />
                </div>

                <span>Trust Score</span>
                <strong>{result.trust_score}/100</strong>
              </div>

              <div className="metric-card">
                <div className={`metric-icon ${riskClass}`}>
                  <FaExclamationTriangle />
                </div>

                <span>Risk Level</span>
                <strong className={riskClass}>
                  {result.risk_level}
                </strong>
              </div>
            </div>

            {/* Trust Score */}
            <div className="trust-section">
              <div className="trust-header">
                <span>Trust Score</span>
                <strong>{result.trust_score}%</strong>
              </div>

              <div className="progress-track">
                <div
                  className={`progress-fill ${
                    result.trust_score >= 70
                      ? "progress-good"
                      : result.trust_score >= 40
                      ? "progress-medium"
                      : "progress-danger"
                  }`}
                  style={{ width: `${result.trust_score}%` }}
                ></div>
              </div>
            </div>

            <div className="details-grid">

              {/* Reasons */}
              <div className="reasons-card">
                <div className="card-title">
                  <FaExclamationTriangle />
                  <h3>Detected Indicators</h3>
                </div>

                {result.reasons?.length > 0 ? (
                  <div className="reasons-list">
                    {result.reasons.map((reason, index) => (
                      <div className="reason-badge" key={index}>
                        <FaExclamationTriangle />
                        {reason}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="safe-message">
                    <FaCheckCircle />
                    No suspicious indicators were detected.
                  </div>
                )}
              </div>

              {/* Recommendation */}
              <div
                className={`recommendation-card ${
                  result.prediction === "scam"
                    ? "recommendation-danger"
                    : "recommendation-safe"
                }`}
              >
                <div className="card-title">
                  {result.prediction === "scam" ? (
                    <FaExclamationTriangle />
                  ) : (
                    <FaCheckCircle />
                  )}

                  <h3>Recommendation</h3>
                </div>

                <p>
                  {result.prediction === "scam"
                    ? "This job offer appears suspicious. Avoid paying fees, sharing sensitive information, or responding through unofficial channels until the company is independently verified."
                    : "This job offer appears relatively safe based on the available information. However, always verify the company and recruitment details independently."}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* History */}
        <section className="history-action">
          <div>
            <FaHistory />

            <div>
              <h3>Previous Analyses</h3>
              <p>View your previously scanned job offers.</p>
            </div>
          </div>

          <button className="history-btn" onClick={loadHistory}>
            <FaHistory />
            View History
          </button>
        </section>

        {history.length > 0 && (
          <section className="history-section">
            <div className="history-title">
              <div>
                <span className="section-tag">SAVED RECORDS</span>
                <h2>Scan History</h2>
              </div>
            </div>

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Prediction</th>
                    <th>Confidence</th>
                    <th>Trust Score</th>
                    <th>Risk Level</th>
                  </tr>
                </thead>

                <tbody>
                  {history.map((item) => (
                    <tr key={item.id}>
                      <td>#{item.id}</td>

                      <td>
                        <span className={predictionClass(item.prediction)}>
                          {item.prediction === "scam"
                            ? "Scam"
                            : "Genuine"}
                        </span>
                      </td>

                      <td>{item.confidence}%</td>

                      <td>
                        <strong>{item.trust_score}/100</strong>
                      </td>

                      <td>
                        <span
                          className={`status-badge ${riskStatusClass(
                            item.risk_level
                          )}`}
                        >
                          {item.risk_level}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

      </main>
    </div>
  );
}

export default Dashboard;