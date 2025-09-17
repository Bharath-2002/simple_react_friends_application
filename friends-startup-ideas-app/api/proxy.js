import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false, // we parse manually
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const form = formidable({ multiples: false });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err);
      return res.status(500).json({ error: "Error parsing form data" });
    }

    try {
      // Build a fresh FormData
      const formData = new FormData();
      formData.append("username", fields.username);
      formData.append("email", fields.email);
      if (fields.description) {
        formData.append("description", fields.description);
      }

      // Attach uploaded file
      if (files.image) {
        const file = files.image;
        const buffer = fs.readFileSync(file.filepath);
        formData.append("image", new Blob([buffer]), file.originalFilename);
      }

      // Forward to your API
      const response = await fetch(
        "https://q7olippj80.execute-api.ap-south-1.amazonaws.com/dev/api/analysis/",
        {
          method: "POST",
          headers: {
            Authorization: "Token 4e00e89b38321538f02e0d3932469a1a8a666339",
          },
          body: formData,
          duplex: "half",
        }
      );

      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error("Proxy error:", error);
      res.status(500).json({ error: "Proxy error", details: error.message });
    }
  });
}
