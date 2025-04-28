import express, { Request, Response } from "express";
import cors from "cors";
import mongoose, { mongo } from "mongoose";

// Load environment variables
require("dotenv").config({ path: __dirname + "/.env" });

// Type definitions
interface UrlDocument extends mongoose.Document {
  originalUrl: string;
  shortUrl: string;
  createdAt: Date;
}

interface ShortenRequest {
  originalUrl: string;
}

interface ShortenResponse {
  shortUrl: string;
  originalUrl: string;
  createdAt?: Date;
}

interface ErrorResponse {
  error: string;
}

const app = express();

// Environment variables with validation
const PORT = process.env.PORT || 3000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/url-shortener";
const MONGO_USERNAME = process.env.MONGO_INITDB_ROOT_USERNAME || "admin";
const MONGO_PASSWORD = process.env.MONGO_INITDB_ROOT_PASSWORD || "password";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5000";

// Middleware
app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(express.json());

// Health check endpoint
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "URL Shortener API is running" });
});

// MongoDB connection
const connectToDatabase = async () => {
  try {
    const mongoConnectionString = MONGO_URI.replace(
      "<username>",
      MONGO_USERNAME
    ).replace("<password>", MONGO_PASSWORD);

    console.log(mongoConnectionString);
    await mongoose.connect(mongoConnectionString, {
      serverSelectionTimeoutMS: 5000,
      retryWrites: true,
      w: "majority",
    });
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

// Schema and Model
const urlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
    validate: {
      validator: (v: string) => {
        try {
          new URL(v);
          return true;
        } catch {
          return false;
        }
      },
      message: (props: any) => `${props.value} is not a valid URL!`,
    },
  },
  shortUrl: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

const Url = mongoose.model<UrlDocument>("Url", urlSchema);

app.post("/shorten", async (req: Request, res: Response): Promise<any> => {
  const { originalUrl } = req.body;

  if (!originalUrl) {
    return res.status(400).json({ error: "Original URL is required" });
  }

  try {
    // Validate URL format
    new URL(originalUrl);
  } catch (err) {
    return res.status(400).json({ error: "Invalid URL format" });
  }

  try {
    // Check if URL already exists
    const existingUrl = await Url.findOne({ originalUrl });
    if (existingUrl) {
      return res.status(200).json({
        shortUrl: existingUrl.shortUrl,
        originalUrl: existingUrl.originalUrl,
        createdAt: existingUrl.createdAt,
      });
    }

    // Generate and save new short URL
    const shortUrl = await generateUniqueShortUrl();
    const newUrl = new Url({ originalUrl, shortUrl });
    const savedUrl = await newUrl.save();

    console.log("URL shortened successfully:", savedUrl.shortUrl);
    return res.status(201).json({
      shortUrl: savedUrl.shortUrl,
      originalUrl: savedUrl.originalUrl,
      createdAt: savedUrl.createdAt,
    });
  } catch (error) {
    console.error("Error saving URL:", error);
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Helper function to generate unique short URLs
async function generateUniqueShortUrl(): Promise<string> {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const length = 6;
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    let shortUrl = "";
    for (let i = 0; i < length; i++) {
      shortUrl += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }

    const existingUrl = await Url.findOne({ shortUrl });
    if (!existingUrl) {
      return shortUrl;
    }
    attempts++;
  }

  throw new Error("Could not generate a unique short URL");
}

// Start server
const startServer = async () => {
  await connectToDatabase();

  app.listen(Number(PORT), "localhost", () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`MongoDB URI: ${MONGO_URI}`);
    console.log(`CORS enabled for: ${FRONTEND_URL}`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
