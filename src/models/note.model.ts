import db from "../db";
import { Note } from "../types/note.types";

/**
 * Convert a raw SQLite row into a proper Note object
 * SQLite stores booleans as 0 / 1, so we normalize here
 */
function mapRowToNote(row: any): Note {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    version: row.version,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deleted: Boolean(row.deleted), // convert 0/1 → true/false
  };
}


/**
 * Find a note by its ID
 * @param id - note id
 * @returns Note or null if not found
 */

export function findNoteById(id: string): Promise<Note | null>{
    return new Promise ((res, rej ) => {
        db.get("SELECT * FROM notes WHERE id = ?", [id], (error, row ) =>{
            if(error) {
                return rej(error)
            };

            if(!row){
                return res(null)  // No note found → not an error
            }

            // Convert DB row to Note object
             res(mapRowToNote(row));
        } )
    })
};

/**
 * Insert a new note into the database
 * Used when the server has never seen this note before
 *
 * @param note - full note object
 */
export function insertNote(note: Note): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(
      `
      INSERT INTO notes (
        id,
        title,
        content,
        version,
        createdAt,
        updatedAt,
        deleted
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        note.id, note.title, note.content, note.version, note.createdAt, note.updatedAt, note.deleted ? 1 : 0, // boolean → 0/1
      ],
      (err) => {
        if (err) {
          return reject(err);
        }

        resolve();
      }
    );
  });
};

/**
 * Update an existing note
 * Used when sync service ACCEPTS a client update
 *
 * @param note - updated note object
 */
export function updateNote(note: Note): Promise<void> {
  return new Promise((resolve, reject) => {
    db.run(
      `
      UPDATE notes
      SET
        title = ?,
        content = ?,
        version = ?,
        updatedAt = ?,
        deleted = ?
      WHERE id = ?
      `,
      [
        note.title, note.content, note.version, note.updatedAt, note.deleted ? 1 : 0, note.id,
      ],
      (err) => {
        if (err) {
          return reject(err);
        }

        resolve();
      }
    );
  });
}

/**
 * Get all notes from the database
 * Useful for debugging or initial sync
 *
 * @returns array of notes
 */
export function getAllNotes(): Promise<Note[]> {
  return new Promise((resolve, reject) => {
    db.all(
      "SELECT * FROM notes",
      [],
      (err, rows) => {
        if (err) {
          return reject(err);
        }

        // Convert all rows to Note objects
        const notes = rows.map(mapRowToNote);
        resolve(notes);
      }
    );
  });
}