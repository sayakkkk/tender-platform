export async function computeBidCommitment(
  bidAmount: number,
  nonceHex: string,
  vendorAddress: string,
  tenderId: number
): Promise<string> {
  const encoder = new TextEncoder();
  const payload = bidAmount + ":" + nonceHex.toLowerCase() + ":" + vendorAddress.toLowerCase() + ":" + tenderId;
  const data = encoder.encode(payload);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateRandomNonce(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateEligibilityToken(vendorAddress: string, tier: number): string {
  const randomSalt = Array.from(crypto.getRandomValues(new Uint8Array(8)))
    .map(b => b.toString(16).padStart(2, '0')).join('');
  return ("ELG-T" + tier + "-" + vendorAddress.substring(0, 10) + "-" + randomSalt).toUpperCase();
}

export function truncateAddress(addr: string | null | undefined, head = 6, tail = 4): string {
  if (!addr) return 'Not Connected';
  if (addr.length <= head + tail) return addr;
  return addr.substring(0, head) + "..." + addr.substring(addr.length - tail);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
}
