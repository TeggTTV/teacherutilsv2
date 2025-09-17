// Client-side encryption service for password protection
// Uses simple encryption to prevent plain text transmission

/**
 * Simple password encryption using XOR and Base64 encoding
 * Not cryptographically secure but prevents plain text transmission
 */
export class PasswordEncryption {
	private static readonly ENCRYPTION_KEY = 'Compyy2024Secure!';

	/**
	 * Encrypt password for transmission (client-side)
	 */
	public static encryptPassword(password: string): string {
		try {
			// XOR encryption
			let encrypted = '';
			for (let i = 0; i < password.length; i++) {
				const passwordChar = password.charCodeAt(i);
				const keyChar = this.ENCRYPTION_KEY.charCodeAt(i % this.ENCRYPTION_KEY.length);
				encrypted += String.fromCharCode(passwordChar ^ keyChar);
			}
			
			// Add timestamp for security
			const timestamp = Date.now().toString();
			const combined = `${timestamp}|${encrypted}`;
			
			// Base64 encode and add prefix
			const base64Data = btoa(combined);
			return `ENC_${base64Data}`;
		} catch (error) {
			console.error('Password encryption error:', error);
			// In case of encryption failure, return original password
			// This ensures login still works even if encryption fails
			return password;
		}
	}

	/**
	 * Check if a password appears to be encrypted
	 */
	public static isEncrypted(password: string): boolean {
		return typeof password === 'string' && password.startsWith('ENC_');
	}
}