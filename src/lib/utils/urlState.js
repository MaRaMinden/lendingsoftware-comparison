/**
 * Encode / decode quiz state in the URL hash so results can be shared via link.
 *
 * Format: #s=<base64url(JSON)>
 */

/**
 * @param {{ answers: Record<string,string>, weights: Record<string,number> }} state
 * @returns {string} URL hash string (including #)
 */
export function encodeState(state) {
  const json = JSON.stringify({ a: state.answers, w: state.weights });
  // btoa only works on ASCII – use encodeURIComponent to handle Unicode
  const b64 = btoa(unescape(encodeURIComponent(json)));
  // Make URL-safe
  return '#s=' + b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * @param {string} hash  window.location.hash
 * @returns {{ answers: Record<string,string>, weights: Record<string,number> } | null}
 */
export function decodeState(hash) {
  try {
    const match = hash.match(/[#&]s=([A-Za-z0-9\-_]+)/);
    if (!match) return null;
    const b64 = match[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(escape(atob(b64)));
    const parsed = JSON.parse(json);
    return { answers: parsed.a ?? {}, weights: parsed.w ?? {} };
  } catch {
    return null;
  }
}

/**
 * Build a full shareable URL for the results page.
 * @param {{ answers: Record<string,string>, weights: Record<string,number> }} state
 * @param {string} basePath  SvelteKit base path (from $app/paths)
 * @returns {string}
 */
export function buildShareUrl(state, basePath = '') {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  return `${origin}${basePath}/results${encodeState(state)}`;
}
