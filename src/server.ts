// src/server.ts
import app from "../src/app";
import dotenv from "dotenv";


dotenv.config();
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

