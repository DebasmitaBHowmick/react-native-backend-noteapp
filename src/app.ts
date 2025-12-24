// src/app.ts
import express from "express";
import cors from "cors";
import "../src/db";
import noteRoutes from "./routes/note.routes";



const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    server: "notes-backend",
    timestamp: Date.now()
  });
});

app.use("/notes", noteRoutes)
export default app;





