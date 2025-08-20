// Central API helper to ensure correct gateway base when using built preview (no Vite dev proxy)
const isLocalDevPreview = typeof window !== 'undefined' && window.location.port === '5173';
// When loaded at 5173 (vite preview) we explicitly call the gateway at 8080.
export const API_BASE = isLocalDevPreview ? 'http://localhost:8080' : '';

async function handle(r){
  let bodyText = '';
  try { bodyText = await r.text(); } catch(_){}
  let data = {};
  if(bodyText){ try { data = JSON.parse(bodyText); } catch { data = { _raw: bodyText }; } }
  if(!r.ok) throw Object.assign(new Error(data.error || `Request failed ${r.status}`), { status:r.status, data });
  return data;
}

export function apiFetch(path, opts={}){
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers = { ...(opts.headers||{}), ...(token? { Authorization:`Bearer ${token}` }: {}) };
  return fetch(API_BASE + path, { ...opts, headers }).then(handle);
}
export function apiPost(path, json, opts={}){
  const headers = { 'Content-Type':'application/json', ...(opts.headers||{}) };
  return apiFetch(path, { method:'POST', ...opts, headers, body: JSON.stringify(json) });
}
