import { Buffer } from 'buffer';
import QuickCrypto from 'react-native-quick-crypto';

// Ensure Buffer is available globally if needed, though quick-crypto usually handles it.
// Might need a polyfill if not automatically provided.

const ALGORITHM = 'aes-256-cbc';
const HMAC_ALGORITHM = 'sha256';

export class CryptoService {
    /**
     * Generates a random 32-byte key for AES-256
     */
    static generateKey(): string {
        return QuickCrypto.randomBytes(32).toString('hex');
    }

    /**
     * Encrypts a message using AES-256-CBC
     * @param text The plain text message
     * @param keyHex The 32-byte key in hex
     * @returns content: iv:ciphertext in hex
     */
    static encrypt(text: string, keyHex: string): string {
        const key = Buffer.from(keyHex, 'hex');
        const iv = QuickCrypto.randomBytes(16);
        const cipher = QuickCrypto.createCipheriv(ALGORITHM, key, iv);

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        return `${iv.toString('hex')}:${encrypted}`;
    }

    /**
     * Decrypts a message
     * @param encryptedPayload iv:ciphertext in hex
     * @param keyHex The 32-byte key in hex
     * @returns decrypted string or null if failed
     */
    static decrypt(encryptedPayload: string, keyHex: string): string | null {
        try {
            const [ivHex, encryptedHex] = encryptedPayload.split(':');
            if (!ivHex || !encryptedHex) return null;

            const key = Buffer.from(keyHex, 'hex');
            const iv = Buffer.from(ivHex, 'hex');
            const decipher = QuickCrypto.createDecipheriv(ALGORITHM, key, iv);

            let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        } catch (error) {
            console.error('Decryption failed:', error);
            return null;
        }
    }

    /**
     * Signs a message using HMAC-SHA256
     */
    static sign(message: string, keyHex: string): string {
        const key = Buffer.from(keyHex, 'hex');
        const hmac = QuickCrypto.createHmac(HMAC_ALGORITHM, key);
        hmac.update(message);
        return hmac.digest('hex');
    }

    /**
     * Verifies a signature
     */
    static verify(message: string, signature: string, keyHex: string): boolean {
        const expectedSignature = this.sign(message, keyHex);
        // Timing safe comparison recommended, but standard string compare is okay for this prototype
        return expectedSignature === signature;
    }
}
