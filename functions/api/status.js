import { json, ghHeaders, requireAuth } from '../_utils.js';

export async function onRequestPost({ request, env }) {
const auth = await requireAuth(request, env);
if (!auth.ok) return json({ ok: false, error: auth.error }, 401);

const { ref, status } = await request.json();
if (!/^REQ-\d{8}-\d{6}$/.test(ref || '')) return json({ ok: false, error: 'Invalid ref' }, 400);
const allowed = ['New', 'Contacted', 'Quoted', 'Negotiating', 'Won', 'Lost'];
if (!allowed.includes(status)) return json({ ok: false, error: 'Invalid status' }, 400);

const getResp = await fetch(
`https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/submissions/${ref}.json?ref=${env.GITHUB_BRANCH || 'main'}`,
{ headers: ghHeaders(env) }
);
if (!getResp.ok) return json({ ok: false, error: 'Not found' }, 404);
const file = await getResp.json();
const data = JSON.parse(decodeURIComponent(escape(atob(file.content))));
data.status = status;
data.statusUpdatedAt = new Date().toISOString();

const putResp = await fetch(
`https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/submissions/${ref}.json`,
{ method: 'PUT', headers: ghHeaders(env), body: JSON.stringify({ message: `Update status for ${ref} -> ${status}`, content: btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2)))), sha: file.sha, branch: env.GITHUB_BRANCH || 'main' }) }
);
if (!putResp.ok) return json({ ok: false, error: 'Update failed' }, 502);
return json({ ok: true });
}
