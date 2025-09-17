export const config = {
  api: {
    bodyParser: false, // important for file uploads
  },
};

export default async function handler(req, res) {
  try {
    const response = await fetch(
      "https://q7olippj80.execute-api.ap-south-1.amazonaws.com/dev/api/analysis/",
      {
        method: req.method,
        headers: {
          Authorization: "Token da7e89194787cf793661168d0c3e6edb8ee5342e",
          // Don't set Content-Type, let fetch handle it for FormData
        },
        body: req.method === "POST" ? req : undefined,
        duplex: "half", // <-- THIS fixes the error
      }
    );

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    res.status(500).json({ error: "Proxy error", details: error.message });
  }
}