import express from "express";
import cors from "cors";
import moongose from "mongoose";
import type { Request, Response } from "express";

require("dotenv").config({ path: __dirname + "/.env" });

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// MongoDB connection
const mongoURI =
  process.env.MONGO_URI || "mongodb://localhost:27017/url-shortener";
moongose
  .connect(mongoURI, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

const urlSchema = new moongose.Schema({
  originalUrl: { type: String, required: true },
  shortUrl: { type: String, required: true, unique: true },
});

const Url = moongose.model("Url", urlSchema);

app.post("/", (req: Request, res: Response) => {
  const { originalUrl } = req.body;

  if (!originalUrl) {
    res.status(400).json({ error: "Original URL is required" });
    return;
  }

  const shortUrl = generateShortUrl(originalUrl);

  const newUrl = new Url({ originalUrl, shortUrl });
  newUrl
    .save()
    .then((savedUrl) => {
      console.log("Sending response:", savedUrl);
      res.status(201).json({
        shortUrl: savedUrl.shortUrl,
        originalUrl: savedUrl.originalUrl,
      });
    })
    .catch((error) => {
      console.error("Error saving URL:", error);
      res.status(500).json({ error: "Error saving URL" });
    });
});

function generateShortUrl(originalUrl: string): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let shortUrl = "";
  for (let i = 0; i < 6; i++) {
    shortUrl += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  return shortUrl;
}
