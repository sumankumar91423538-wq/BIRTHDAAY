/**
 * Unlock Code Verification
 *
 * Uses SHA-256 hashing via Web Crypto API to compare user input
 * against known codes without exposing the actual values in source.
 */

type UnlockResult = {
  success: boolean;
  role: 'boy' | 'girl' | null;
};

/* Pre-computed SHA-256 hex digests of valid codes */
const BOY_HASHES = [
  '56c7fd2cd690ebc7113777464d79ad81d7641998ddc54515b9a45283610fbc6c', // 01/03/2011
  'e2924a1bfa044a17bdda74065919da3c082870855fc1e8aeb3e86bf1924632ac', // 1/03/2011
] as const;

const GIRL_HASHES = [
  'c403bff65ba1c836a997714007e9117870d08f43e8bd59bb7bf70389a042706e', // 08/07/2011
  '531406596cffe6c99f733eb5fcfaf0fa61dfee8f90c2e49e50049687e782724b', // 8/07/2011
] as const;

async function sha256Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

function normalizeInput(raw: string): string[] {
  const trimmed = raw.trim();
  const candidates: string[] = [trimmed];

  /* If the input looks like a date (contains / or -), generate format variants */
  if (trimmed.includes('/') || trimmed.includes('-')) {
    const separatorNormalized = trimmed.replace(/-/g, '/');
    candidates.push(separatorNormalized);

    const parts = separatorNormalized.split('/');
    if (parts.length === 3) {
      const [day, month, year] = parts;

      /* With leading zero on day */
      const paddedDay = day.padStart(2, '0');
      candidates.push(`${paddedDay}/${month}/${year}`);

      /* Without leading zero on day */
      const unpaddedDay = String(parseInt(day, 10));
      candidates.push(`${unpaddedDay}/${month}/${year}`);

      /* With leading zero on month too */
      const paddedMonth = month.padStart(2, '0');
      candidates.push(`${paddedDay}/${paddedMonth}/${year}`);
      candidates.push(`${unpaddedDay}/${paddedMonth}/${year}`);
    }
  }

  /* Deduplicate */
  return [...new Set(candidates)];
}

export async function verifyUnlockCode(input: string): Promise<UnlockResult> {
  const candidates = normalizeInput(input);

  for (const candidate of candidates) {
    const hash = await sha256Hex(candidate);

    if ((BOY_HASHES as readonly string[]).includes(hash)) {
      return { success: true, role: 'boy' };
    }

    if ((GIRL_HASHES as readonly string[]).includes(hash)) {
      return { success: true, role: 'girl' };
    }
  }

  return { success: false, role: null };
}
