import { createHash } from 'crypto';  // Add this import at the top

export function getStringHash(str: string): string {
    return createHash('md5').update(str).digest('hex');
}