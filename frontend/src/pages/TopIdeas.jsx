import React, { useEffect, useState } from 'react';

export function TopIdeas(){
  const [items,setItems] = useState([]);
  useEffect(()=>{ const token = localStorage.getItem('token'); fetch('/api/ideas/top',{ headers:{'Authorization':`Bearer ${token}`}}).then(r=>r.json()).then(setItems); },[]);
  if(!items.length) return null;
  return <div style={{marginBottom:'1rem'}}>
    <h2>Top Ideas</h2>
    <ol>{items.map(i=> <li key={i.id}>{i.id} (score {i.score})</li>)}</ol>
  </div>;
}
