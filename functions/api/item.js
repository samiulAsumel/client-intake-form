import { json, ghHeaders, requireAuth } from '../_utils.js';

export async function onRequestGet({ request, env }) {
const auth = await requireAuth(request, env);
if (!auth.ok) return json({ ok: false, error: auth.error }, 401);

const url = new URL(request.url);
const ref = url.searchParams.get('ref') || '';
if (!/^REQ-\d{8}-\d{6}$/.test(ref)) return json({ ok: false, error: 'Invalid ref' }, 400);

const resp = await fetch(
`https://api.github.com/repos/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/submissions/${ref}.json?ref=${env.GITHUB_BRANCH || 'main'}`,
{ headers: ghHeaders(env) }
);
if (!resp.ok) return json({ ok: false, error: 'Not found' }, 404);
const file = await resp.json();
const content = decodeURIComponent(escape(atob(file.content)));
return json({ ok: true, item: JSON.parse(content), sha: file.sha });
}
