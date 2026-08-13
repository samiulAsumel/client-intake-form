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
  const jsonFiles = files.filter(f => f.name.endsWith('.json'));

const items = await Promise.all(jsonFiles.map(async f => {
  const ref = f.name.replace('.json', '');
  try {
    const fileResp = await fetch(f.url, { headers: ghHeaders(env) });
    if (!fileResp.ok) return { ref, sha: f.sha };
    const fileData = await fileResp.json();
    const content = JSON.parse(decodeURIComponent(escape(atob(fileData.content))));
    return {
      ref,
      sha: f.sha,
      bizName: content.bizName || '',
      bizType: content.bizType || '',
      projectType: content.projectType || '',
      status: content.status || 'New',
      createdAt: content.createdAt || content.receivedAt || ''
    };
  } catch (e) {
    return { ref, sha: f.sha };
  }
}));

items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  return json({ ok: true, items });
}
