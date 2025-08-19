import React, { useState } from 'react';

export function Search(){
  const [q,setQ] = useState('');
  const [results,setResults] = useState([]);
  async function run(){
    const token = localStorage.getItem('token');
    const r = await fetch('/api/ideas/search?q='+encodeURIComponent(q), { headers:{'Authorization':`Bearer ${token}`}});
    setResults(await r.json());
  }
  return <div style={{marginBottom:'1rem'}}>
    <input value={q} onChange={e=>setQ(e.target.value)} placeholder='Search ideas'/> <button onClick={run}>Search</button>
    {results.length>0 && <ul>{results.map(r=> <li key={r.id}>{r.title}</li>)}</ul>}
  </div>;
}
