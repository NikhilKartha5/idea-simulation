import React, { useState } from 'react';
import { apiFetch } from '../api.js';

export function Search(){
  const [q,setQ] = useState('');
  const [results,setResults] = useState([]);
  const [loading,setLoading] = useState(false);
  async function run(){
    if(!q) return setResults([]);
    setLoading(true);
  const r = await apiFetch('/api/ideas/search?q='+encodeURIComponent(q));
  setResults(r);
    setLoading(false);
  }
  return <div style={styles.box}>
    <input style={styles.input} value={q} onChange={e=>setQ(e.target.value)} placeholder='Search ideas'/> <button style={styles.btn} onClick={run} disabled={loading}>{loading? '...':'Search'}</button>
    {results.length>0 && <ul style={styles.results}>{results.map(r=> <li key={r.id}>{r.title}</li>)}</ul>}
  </div>;
}

const styles = {
  box:{display:'flex', flexDirection:'column', gap:6, minWidth:260},
  input:{padding:'0.45rem 0.6rem', border:'1px solid #d0d5dd', borderRadius:6},
  btn:{background:'#7f56d9', color:'#fff', border:'none', padding:'0.5rem .9rem', borderRadius:6, cursor:'pointer'},
  results:{margin:0, paddingLeft:18, fontSize:13}
};
