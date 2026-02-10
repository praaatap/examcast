import { v4 as uuidv4 } from 'uuid';
import { CryptoService } from './crypto';

export interface Session {
    id: string;      // Unique Session ID
    key: string;     // AES-256 Key (Hex)
    role: 'TEACHER' | 'STUDENT';
}

class AuthService {
    private currentSession: Session | null = null;

    /**
     * Starts a new exam session (Teacher Mode)
     */
    startSession(): Session {
        const key = CryptoService.generateKey();
        const id = uuidv4();

        this.currentSession = {
            id,
            key,
            role: 'TEACHER'
        };

        return this.currentSession;
    }

    /**
     * Joins an existing session (Student Mode)
     */
    joinSession(id: string, key: string) {
        this.currentSession = {
            id,
            key,
            role: 'STUDENT'
        };
    }

    getSession(): Session | null {
        return this.currentSession;
    }

    endSession() {
        this.currentSession = null;
    }

    isAuthenticated(): boolean {
        return this.currentSession !== null;
    }
}

export const authService = new AuthService();
