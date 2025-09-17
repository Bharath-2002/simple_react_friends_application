import React, { useState } from "react";

export default function App() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleImageUpload = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async () => {
    if (!username || !email || !image) {
      alert("Username, Email, and Image are required");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("description", description);
    formData.append("image", image);

    try {
      const res = await fetch(
        "https://q7olippj80.execute-api.ap-south-1.amazonaws.com/dev/api/analysis/",
        {
          method: "POST",
          headers: {
            Authorization:
              "Token a306c3e535187b029478ba5dad851bd7d6d32bfa",
          },
          body: formData,
        }
      );

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error("Error:", err);
      alert("Something went wrong, please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h1 className="title">Skin Analysis</h1>

        <input
          className="input"
          placeholder="Enter your username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          className="input"
          placeholder="Enter your email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <textarea
          className="textarea"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          className="file-input"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
        />

        <button
          className="button"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Submit"}
        </button>
      </div>

      {result && (
        <div className="card">
          <h2>Analysis Result</h2>
          <p><strong>Skin Score:</strong> {result.analysis.skin_score}</p>
          <p><strong>Skin Type:</strong> {result.analysis.skin_type}</p>
          <p><strong>Primary Concern:</strong> {result.analysis.primary_concern}</p>

          <h3>Issues:</h3>
          <ul>
            {result.analysis.issues.map((issue, i) => (
              <li key={i}>{issue}</li>
            ))}
          </ul>

          <h3>Basic Issues with Severity:</h3>
          <ul>
            {result.analysis.basic_issues_with_severity.map((item, i) => (
              <li key={i}>
                {item.name}: {item.severity}%
              </li>
            ))}
          </ul>

          <h3>Result:</h3>
          <p>{result.analysis.result}</p>

          <h3>Remedies:</h3>
          <p>{result.analysis.remedies}</p>

          <h3>Recommended Ingredients:</h3>
          <ul>
            {result.analysis.recommended_ingredients.map((ing, i) => (
              <li key={i}>{ing}</li>
            ))}
          </ul>
        </div>
      )}

      {result?.recommendations && (
        <div className="card">
          <h2>Product Recommendations</h2>
          <div className="grid">
            {result.recommendations.map((rec) => (
              <div key={rec.id} className="sub-card">
                <h3>{rec.name}</h3>
                <p>{rec.description}</p>
                <p><em>Applicable For:</em> {rec.applicable_for.join(", ")}</p>
                <p><strong>₹{rec.price}</strong></p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
