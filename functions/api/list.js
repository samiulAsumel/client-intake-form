import { json, ghHeaders, requireAuth } from '../_utils.js';

export async function onRequestGet({ request, env }) {
const auth = await requireAuth(request, env);
if (!auth.ok) return json({ ok: false, error: auth.error }, 401);

const resp = await fetch(
`https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/submissions?ref=${env.GITHUB_BRANCH || 'main'}`,
{ headers: ghHeaders(env) }
);
if (resp.status === 404) return json({ ok: true, items: [] });
if (!resp.ok) return json({ ok: false, error: 'GitHub list failed' }, 502);
const files = await resp.json();
const items = files.filter(f => f.name.endsWith('.json')).map(f => ({ ref: f.name.replace('.json', ''), sha: f.sha, size: f.size }));
return json({ ok: true, items });
}
