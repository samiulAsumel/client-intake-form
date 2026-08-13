import { json, verifyPassword, signToken } from '../_utils.js';

export async function onRequestPost({ request, env }) {
try {
const { password } = await request.json();
if (!password) return json({ ok: false, error: 'Password required' }, 400);
const ok = await verifyPassword(password, env.ADMIN_HASH);
if (!ok) return json({ ok: false, error: 'Invalid password' }, 401);
const token = await signToken(env.SESSION_SECRET);
return json({ ok: true, token });
} catch (e) {
return json({ ok: false, error: 'Server error' }, 500);
}
}
