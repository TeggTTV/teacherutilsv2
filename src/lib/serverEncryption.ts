/**
 * Server-side password encryption utility for decrypting passwords sent from client
 * This mirrors the client-side encryption logic to decrypt encrypted passwords
 */
export class ServerPasswordEncryption {
	private static readonly ENCRYPTION_KEY = 'Compyy2024Secure!';

	/**
	 * Decrypt password that was encrypted on the client side
	 */
	static decryptPassword(encryptedPassword: string): string {
		try {
			// Check if password is encrypted (has our prefix)
			if (!this.isEncrypted(encryptedPassword)) {
				// Check if it looks like a Base64 encoded password (without ENC_ prefix)
				// This handles cases where the client sends encrypted data without the prefix
				try {
					const decoded = Buffer.from(encryptedPassword, 'base64').toString('utf-8');
					const parts = decoded.split('|');
					if (parts.length === 2) {
						const [timestampStr, encryptedPart] = parts;
						const timestamp = parseInt(timestampStr, 10);
						
						// Check if timestamp is valid (not NaN and reasonable)
						if (isNaN(timestamp)) {
							throw new Error('Invalid timestamp');
						}
						
						// Check if encryption is not too old (7 days max)
						const currentTime = Date.now();
						const maxAge = 7 * 24 * 60 * 60 * 1000;
						
						if (currentTime - timestamp > maxAge) {
							throw new Error('Encrypted password has expired');
						}
						
						// Decrypt using XOR
						const decrypted = this.xorDecrypt(encryptedPart, this.ENCRYPTION_KEY);
						return decrypted;
					}
				} catch (e) {
					// Not a valid Base64 or encrypted format
				}
				
				// Return as-is if not encrypted (backward compatibility)
				return encryptedPassword;
			}

			// Remove the encrypted prefix
			const base64Data = encryptedPassword.replace('ENC_', '');
			
			// Decode from Base64
			const decodedData = Buffer.from(base64Data, 'base64').toString('utf-8');
			
			// Extract timestamp and encrypted password
			const parts = decodedData.split('|');
			if (parts.length !== 2) {
				throw new Error('Invalid encrypted password format');
			}
			
			const [timestampStr, encryptedPart] = parts;
			const timestamp = parseInt(timestampStr, 10);
			
			// Check if encryption is not too old (7 days max for more flexibility)
			const currentTime = Date.now();
			const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
			
			if (currentTime - timestamp > maxAge) {
				throw new Error('Encrypted password has expired');
			}
			
			// Decrypt using XOR
			const decrypted = this.xorDecrypt(encryptedPart, this.ENCRYPTION_KEY);
			
			return decrypted;
		} catch (error) {
			console.error('Password decryption error:', error);
			// For security, if decryption fails, treat as invalid password
			// rather than exposing decryption errors
			throw new Error('Invalid password format');
		}
	}

	/**
	 * Check if a password string is encrypted
	 */
	static isEncrypted(password: string): boolean {
		return typeof password === 'string' && password.startsWith('ENC_');
	}

	/**
	 * XOR decrypt a string using a key
	 */
	private static xorDecrypt(encrypted: string, key: string): string {
		let result = '';
		for (let i = 0; i < encrypted.length; i++) {
			result += String.fromCharCode(
				encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length)
			);
		}
		return result;
	}

	/**
	 * Safely handle password decryption for API routes
	 * Returns the decrypted password or throws an error
	 */
	static safeDecryptPassword(password: string): string {
		if (!password || typeof password !== 'string') {
			throw new Error('Password is required');
		}

		try {
			return this.decryptPassword(password);
		} catch (error) {
			console.error('Safe password decryption failed:', error);
			throw new Error('Invalid password format');
		}
	}
}