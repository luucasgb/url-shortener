import express, { Request, Response } from "express";
import cors from "cors";
import moongose from "mongoose";

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

const urlSchema = new moongose.Schema();
({
  originalUrl: { type: String, required: true },
  shortUrl: { type: String, required: true, unique: true },
});
const Url = moongose.model("Url", urlSchema);

app.post("/shorten", async (req: Request, res: Response) => {
  const { originalUrl } = req.body;
  const shortUrl = generateShortUrl(originalUrl); // Implement this function to generate a short URL

  try {
    const newUrl = new Url({ originalUrl, shortUrl });
    await newUrl.save();
    res.status(201).json(newUrl);
  } catch (error) {
    res.status(500).json({ error: "Error saving URL" });
  }
});
app.get("/shorten/:shortUrl", async (req: Request, res: Response) => {
  const { shortUrl } = req.params;

  try {
    const url = await Url.findOne({ shortUrl });
    if (!url) {
      return res.status(404).json({ error: "URL not found" });
    }
    res.redirect(url.originalUrl);
  } catch (error) {
    res.status(500).json({ error: "Error retrieving URL" });
  }
});
