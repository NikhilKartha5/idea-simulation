import React, { useEffect, useState } from 'react';

export function IdeaList(){
  const [ideas, setIdeas] = useState([]);
  useEffect(()=>{ const token = localStorage.getItem('token'); fetch('/api/ideas', { headers:{'Authorization':`Bearer ${token}`}}).then(r=>r.json()).then(d=>setIdeas(d.items||d)); },[]);
  async function vote(id, direction){
    const token = localStorage.getItem('token');
    await fetch('/api/votes', { method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`}, body: JSON.stringify({ idea_id:id, direction }) });
  }
  async function comment(id){
    const content = prompt('Comment'); if(!content) return; const token = localStorage.getItem('token');
    await fetch('/api/comments', { method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`}, body: JSON.stringify({ idea_id:id, content }) });
  }
  return <div>
    <h2>Recent Ideas</h2>
    <ul>
      {ideas.map(i=> <li key={i.id || i.title}>{i.title} - {i.description} <button onClick={()=>vote(i.id,1)}>▲</button> <button onClick={()=>vote(i.id,-1)}>▼</button> <button onClick={()=>comment(i.id)}>💬</button></li>)}
    </ul>
  </div>;
}
