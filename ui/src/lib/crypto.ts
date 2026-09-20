export async function computeBidCommitment(
  bidAmount: number,
  nonceHex: string,
  vendorAddress: string,
  tenderId: number
): Promise<string> {
  const encoder = new TextEncoder();
  const payload = bidAmount + ':' + nonceHex.toLowerCase() + ':' + vendorAddress.toLowerCase() + ':' + tenderId;
  const data = encoder.encode(payload);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function generateRandomNonce(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function generateEligibilityToken(vendorAddress: string, tier: number): string {
  const randomSalt = Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  const addrPrefix = (vendorAddress || '0200000000').substring(0, 10);
  return ('ELG-T' + tier + '-' + addrPrefix + '-' + randomSalt).toUpperCase();
}

/**
 * Formats and shortens a genuine address without generating fake fallback strings.
 */
export function truncateAddress(addr: string | null | undefined, head = 16, tail = 6): string {
  if (!addr) return '';
  const trimmed = addr.trim();
  if (trimmed.length <= head + tail + 3) return trimmed;
  return trimmed.substring(0, head) + '...' + trimmed.substring(trimmed.length - tail);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
}
