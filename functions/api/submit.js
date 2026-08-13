import { json, ghHeaders } from '../_utils.js';

export async function onRequestPost({ request, env }) {
try {
const data = await request.json();
if (!data || typeof data !== 'object') return json({ ok: false, error: 'Invalid payload' }, 400);
if (data.hp) return json({ ok: true });

const ref = (data.refNo || '').toString().trim();
if (!/^REQ-\d{8}-\d{6}$/.test(ref)) return json({ ok: false, error: 'Invalid reference number' }, 400);

data.status = 'New';
data.receivedAt = new Date().toISOString();
const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));

const resp = await fetch(
`https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/submissions/${ref}.json`,
{ method: 'PUT', headers: ghHeaders(env), body: JSON.stringify({ message: `New submission ${ref}`, content, branch: env.GITHUB_BRANCH || 'main' }) }
);
if (!resp.ok) return json({ ok: false, error: 'Storage failed' }, 502);

if (env.CALLMEBOT_PHONE && env.CALLMEBOT_APIKEY) {
const text = encodeURIComponent(`New submission ${ref} - ${data.bizName || 'unknown business'}`);
fetch(`https://api.callmebot.com/whatsapp.php?phone=${env.CALLMEBOT_PHONE}&text=${text}&apikey=${env.CALLMEBOT_APIKEY}`).catch(() => {});
}

return json({ ok: true, ref });
} catch (e) {
return json({ ok: false, error: 'Server error' }, 500);
}
}
