export function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json' } });
  }
  export function hexToBytes(hex) {
    const bytes = new Uint8Array(hex.length / 2);
      for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
        return bytes;
        }
        export function bytesToHex(bytes) {
          return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
          }
          // stored format: "100000$<saltHex>$<hashHex>"
          export async function verifyPassword(password, stored) {
            const [iterStr, saltHex, hashHex] = stored.split('$');
              const iterations = parseInt(iterStr, 10);
                const salt = hexToBytes(saltHex);
                  const enc = new TextEncoder();
                    const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
                      const derived = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations, hash: 'SHA-256' }, keyMaterial, 256);
                        return bytesToHex(new Uint8Array(derived)) === hashHex;
                        }
                        async function hmac(secret, message) {
                          const enc = new TextEncoder();
                            const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
                              const sig = await crypto.subtle.sign('HMAC', key, enc.encode(message));
                                return bytesToHex(new Uint8Array(sig));
                                }
                                export async function signToken(secret) {
                                  const payload = JSON.stringify({ iat: Date.now(), exp: Date.now() + 12 * 3600 * 1000 });
                                    const b64 = btoa(payload);
                                      return b64 + '.' + (await hmac(secret, b64));
                                      }
                                      export async function requireAuth(request, env) {
                                        const token = (request.headers.get('Authorization') || '').replace(/^Bearer\s+/i, '');
                                          if (!token) return { ok: false, error: 'Missing token' };
                                            const [b64, sigHex] = token.split('.');
                                              if (!b64 || !sigHex) return { ok: false, error: 'Malformed token' };
                                                if ((await hmac(env.SESSION_SECRET, b64)) !== sigHex) return { ok: false, error: 'Invalid token' };
                                                  let payload;
                                                    try { payload = JSON.parse(atob(b64)); } catch (e) { return { ok: false, error: 'Malformed token' }; }
                                                      if (!payload.exp || Date.now() > payload.exp) return { ok: false, error: 'Token expired' };
                                                        return { ok: true };
                                                        }
                                                        export function ghHeaders(env) {
                                                          return { Authorization: `Bearer ${env.GITHUB_TOKEN}`, 'User-Agent': 'clif91-intake', Accept: 'application/vnd.github+json' };
                                                          }
                                                          
