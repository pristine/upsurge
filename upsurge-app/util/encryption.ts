/* eslint-disable @typescript-eslint/no-non-null-assertion */
import crypto from 'crypto';

// Encrypt a message
export function encrypt(text: string) {
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(process.env.ENCRYPTION_KEY!, 'hex'),
    Buffer.from(process.env.ENCRYPTION_IV!, 'hex')
  );
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// Decrypt a message
export function decrypt(encrypted: string) {
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(process.env.ENCRYPTION_KEY!, 'hex'),
    Buffer.from(process.env.ENCRYPTION_IV!, 'hex')
  );
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
