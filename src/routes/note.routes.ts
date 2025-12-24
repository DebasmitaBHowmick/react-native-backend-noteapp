import { Router } from "express";

import { syncNotesController } from "../controllers/note.controller";

const router = Router();

router.post("/sync", syncNotesController);

export default router;