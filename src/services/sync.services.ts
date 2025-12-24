
import type { Note } from "../types/note.types";

// Import DB model functions
// These functions ONLY talk to the database
import {findNoteById, insertNote, updateNote,} from "../models/note.model";

/**
 * Possible results returned by the sync service
 * We keep them explicit so the controller knows what happened
 */
export type SyncResult =
  | {
      type: "accepted";
      note: Note;
    }
  | {
      type: "conflict";
      clientNote: Note;
      serverNote: Note;
    };

/**
 * Sync a single note from client with the server
 *
 * This function:
 * - Compares versions
 * - Decides accept vs conflict
 * - Writes to DB only if accepted
 *
 * It does NOT:
 * - Know about HTTP
 * - Send responses
 * - Handle arrays (one note at a time)
 */
export async function syncNote(clientNote: Note): Promise<SyncResult> {
  // Step 1: Find if this note already exists on server
  const serverNote = await findNoteById(clientNote.id);

  /**
   * CASE 1: Note does NOT exist on server
   * -----------------------------------
   * This means:
   * - Client created the note offline
   * - Server has never seen it
   *
   * Safe to accept as-is
   */
  if (!serverNote) {
    await insertNote(clientNote);

    return {
      type: "accepted",
      note: clientNote,
    };
  }

  /**
   * CASE 2: Versions MATCH
   * ----------------------
   * Client edited the latest version
   * This is the happy path
   */
  if (clientNote.version === serverNote.version) {
    const updatedNote: Note = {
      ...clientNote,
      version: serverNote.version + 1, // increment version
      updatedAt: Date.now(),            // server decides final timestamp
    };

    await updateNote(updatedNote);

    return {
      type: "accepted",
      note: updatedNote,
    };
  }

  /**
   * CASE 3: Client version is OLDER
   * --------------------------------
   * Someone else edited this note already
   * Accepting would overwrite newer data
   *
   * This is a real conflict
   */
  if (clientNote.version < serverNote.version) {
    return {
      type: "conflict",
      clientNote,
      serverNote,
    };
  }

  /**
   * CASE 4: Client version is GREATER
   * ---------------------------------
   * This should not normally happen
   * Could be a bug or bad client state
   *
   * We still treat it as conflict to be safe
   */
  if (clientNote.version > serverNote.version) {
    return {
      type: "conflict",
      clientNote,
      serverNote,
    };
  }

  /**
   * This line should never be reached
   * Added only to satisfy TypeScript exhaustiveness
   */
  throw new Error("Unhandled sync case");
}

/**
 * Sync multiple notes at once
 * ---------------------------
 * Frontend will usually send many dirty notes together
 */
export async function syncNotes(
  clientNotes: Note[]
): Promise<SyncResult[]> {
  const results: SyncResult[] = [];

  for (const note of clientNotes) {
    const result = await syncNote(note);
    results.push(result);
  }

  return results;
}
