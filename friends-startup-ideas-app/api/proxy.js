export const config = {
  api: {
    bodyParser: false, // important for file uploads
  },
};

export default async function handler(req, res) {
  try {
    const response = await fetch("https://q7olippj80.execute-api.ap-south-1.amazonaws.com/dev/api/analysis/", {
      method: req.method,
      headers: {
        Authorization: "Token 4e00e89b38321538f02e0d3932469a1a8a666339",
      },
      body: req.method === "POST" ? req : undefined,
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ error: "Proxy error", details: error.message });
  }
}
