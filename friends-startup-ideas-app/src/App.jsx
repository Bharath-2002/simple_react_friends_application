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
              "Token 4e00e89b38321538f02e0d3932469a1a8a666339",
          },
          body: formData,
        }
      );
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Error while uploading");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-100 p-4 flex flex-col items-center">
      <div className="max-w-xl w-full shadow-xl rounded-2xl p-6 bg-white">
        <h1 className="text-2xl font-bold mb-4 text-center text-purple-700">
          Skin Analysis
        </h1>

        <div className="space-y-4">
          <input
            className="w-full p-2 border rounded"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            className="w-full p-2 border rounded"
            placeholder="Enter your email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <textarea
            className="w-full p-2 border rounded"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <input type="file" accept="image/*" onChange={handleImageUpload} />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
          >
            {loading ? "Analyzing..." : "Submit"}
          </button>
        </div>
      </div>

      {result && (
        <div className="mt-6 w-full max-w-2xl space-y-6">
          <div className="p-4 bg-white rounded shadow">
            <h2 className="text-xl font-semibold text-purple-700">
              Analysis Result
            </h2>
            <p className="mt-2 text-gray-700">Skin Score: {result.analysis.skin_score}</p>
            <p className="text-gray-700">Skin Type: {result.analysis.skin_type}</p>
            <p className="text-gray-700">
              Primary Concern: {result.analysis.primary_concern}
            </p>

            <h3 className="mt-4 font-semibold">Issues:</h3>
            <ul className="list-disc ml-6 text-gray-600">
              {result.analysis.issues.map((issue, i) => (
                <li key={i}>{issue}</li>
              ))}
            </ul>

            <h3 className="mt-4 font-semibold">Basic Issues with Severity:</h3>
            <ul className="list-disc ml-6 text-gray-600">
              {result.analysis.basic_issues_with_severity.map((item, i) => (
                <li key={i}>
                  {item.name}: {item.severity}%
                </li>
              ))}
            </ul>

            <h3 className="mt-4 font-semibold">Result:</h3>
            <p className="text-gray-700">{result.analysis.result}</p>

            <h3 className="mt-4 font-semibold">Remedies:</h3>
            <p className="text-gray-700">{result.analysis.remedies}</p>

            <h3 className="mt-4 font-semibold">Recommended Ingredients:</h3>
            <ul className="list-disc ml-6 text-gray-600">
              {result.analysis.recommended_ingredients.map((ing, i) => (
                <li key={i}>{ing}</li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-white rounded shadow">
            <h2 className="text-xl font-semibold text-purple-700">
              Product Recommendations
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {result.recommendations.map((rec) => (
                <div key={rec.id} className="p-4 bg-purple-50 rounded shadow">
                  <h3 className="font-semibold text-lg">{rec.name}</h3>
                  <p className="text-gray-600">{rec.description}</p>
                  <p className="text-sm mt-2 text-gray-500">
                    Applicable For: {rec.applicable_for.join(", ")}
                  </p>
                  <p className="font-bold mt-2 text-purple-700">₹{rec.price}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}