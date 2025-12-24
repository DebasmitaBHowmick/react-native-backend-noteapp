import type { Request, Response } from "express";
import { syncNotes } from "../services/sync.services";
import type { Note } from "../types/note.types";
import { json } from "node:stream/consumers";


/**
 * Controller to handle syncing notes
 *
 * This function:
 * - Reads notes from request body
 * - Calls sync service
 * - Sends back the result
 *
 * It does NOT:
 * - Compare versions
 * - Talk to database directly
 */

export async function syncNotesController(req : Request, res: Response){
    try {
        // Extract notes from request body
    // Expected shape: { notes: Note[] }
    const { notes } = req.body as { notes: Note[] };

    // Basic validation 
    if (!Array.isArray(notes)) {
      return res.status(400).json({
        error: "Invalid payload. 'notes' must be an array.",
      });
    }

    // Call sync service (core business logic)
    const results = await syncNotes(notes);

    // Send back sync results
    return res.status(200).json({
      results,
    });
    
    } catch (error) {
       console.error("sync failed", error)
       return res.status(500),json({
        error: "Failed to sync notes",
       })
    }
}