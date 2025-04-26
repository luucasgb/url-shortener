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
