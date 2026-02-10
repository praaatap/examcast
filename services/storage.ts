import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('examcast.db');

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MessageLog {
    id: string;
    senderRole: 'TEACHER' | 'STUDENT';
    encryptedPayload: string;
    receivedAt: number;
    ttl: number;
}

export interface ViolationLog {
    id?: number;
    type: string;
    timestamp: number;
    details?: string;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export class StorageService {

    // ─── Schema ──────────────────────────────────────────────────────────

    static async init(): Promise<void> {
        await db.execAsync(`
            PRAGMA journal_mode = WAL;
            CREATE TABLE IF NOT EXISTS messages (
                id TEXT PRIMARY KEY NOT NULL,
                senderRole TEXT NOT NULL,
                encryptedPayload TEXT NOT NULL,
                receivedAt INTEGER NOT NULL,
                ttl INTEGER NOT NULL
            );
            CREATE TABLE IF NOT EXISTS violations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                type TEXT NOT NULL,
                timestamp INTEGER NOT NULL,
                details TEXT
            );
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY NOT NULL,
                value TEXT NOT NULL
            );
        `);
    }

    // ─── Messages ────────────────────────────────────────────────────────

    static async saveMessage(message: MessageLog): Promise<void> {
        await db.runAsync(
            'INSERT OR IGNORE INTO messages (id, senderRole, encryptedPayload, receivedAt, ttl) VALUES (?, ?, ?, ?, ?)',
            message.id,
            message.senderRole,
            message.encryptedPayload,
            message.receivedAt,
            message.ttl
        );
    }

    static async getMessages(): Promise<MessageLog[]> {
        return await db.getAllAsync<MessageLog>(
            'SELECT * FROM messages ORDER BY receivedAt DESC'
        );
    }

    static async getMessageCount(): Promise<number> {
        const result = await db.getFirstAsync<{ count: number }>(
            'SELECT COUNT(*) as count FROM messages'
        );
        return result?.count ?? 0;
    }

    // ─── Violations ──────────────────────────────────────────────────────

    static async logViolation(type: string, details: string = ''): Promise<void> {
        await db.runAsync(
            'INSERT INTO violations (type, timestamp, details) VALUES (?, ?, ?)',
            type,
            Date.now(),
            details
        );
    }

    static async getViolations(): Promise<ViolationLog[]> {
        return await db.getAllAsync<ViolationLog>(
            'SELECT * FROM violations ORDER BY timestamp DESC'
        );
    }

    static async getViolationCount(): Promise<number> {
        const result = await db.getFirstAsync<{ count: number }>(
            'SELECT COUNT(*) as count FROM violations'
        );
        return result?.count ?? 0;
    }

    // ─── Settings (Key/Value) ────────────────────────────────────────────

    static async setSetting(key: string, value: string): Promise<void> {
        await db.runAsync(
            'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
            key,
            value
        );
    }

    static async getSetting(key: string): Promise<string | null> {
        const result = await db.getFirstAsync<{ value: string }>(
            'SELECT value FROM settings WHERE key = ?',
            key
        );
        return result ? result.value : null;
    }

    // ─── Session Cleanup ─────────────────────────────────────────────────

    /**
     * Clears all messages and violations for a fresh exam session.
     * Settings are preserved.
     */
    static async clearSession(): Promise<void> {
        await db.execAsync(`
            DELETE FROM messages;
            DELETE FROM violations;
        `);
    }
}
