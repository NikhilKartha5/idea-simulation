import React, { useState } from 'react';
import { apiPost, apiFetch } from '../api.js';

export function IdeaList({ ideas, onAction }){
  const [pending,setPending] = useState({}); // id -> true while voting
  const [open,setOpen] = useState({}); // idea_id -> comments array or null while loading
  async function vote(id, direction){
    if(pending[id]) return; // debounce
    setPending(p=>({...p,[id]:true}));
    try {
      await apiPost('/api/votes', { idea_id:id, direction });
      onAction && onAction();
    } catch(e){ /* could surface error */ }
    setPending(p=>{ const n={...p}; delete n[id]; return n; });
  }
  async function toggleComments(id){
    if(open[id]) { setOpen(o=>{ const n={...o}; delete n[id]; return n; }); return; }
    setOpen(o=>({...o,[id]:null}));
    try {
      const list = await apiFetch(`/api/comments/${id}`);
      setOpen(o=>({...o,[id]:list}));
    } catch { setOpen(o=>{ const n={...o}; delete n[id]; return n; }); }
  }
  async function addComment(id){
    const content = prompt('Comment'); if(!content) return;
    try {
      await apiPost('/api/comments', { idea_id:id, content });
      const list = await apiFetch(`/api/comments/${id}`);
      setOpen(o=>({...o,[id]:list}));
    } catch {}
  }
  if(!ideas.length) return <div style={{color:'#667085', fontSize:14}}>No ideas yet. Be the first!</div>;
  return <ul style={styles.list}>
    {ideas.map(i=> <li key={i.id} style={styles.item}>
      <div style={styles.voteCol}>
  <button style={styles.voteBtn} disabled={pending[i.id]} onClick={()=>vote(i.id,1)}>▲</button>
        <div style={styles.score}>{i.score||0}</div>
  <button style={styles.voteBtn} disabled={pending[i.id]} onClick={()=>vote(i.id,-1)}>▼</button>
      </div>
      <div style={{flex:1}}>
        <div style={styles.title}>{i.title}</div>
        <div style={styles.desc}>{i.description}</div>
        <div style={styles.meta}>
          <button style={styles.metaBtn} onClick={()=>toggleComments(i.id)}>{open[i.id]? 'Hide':'Comments'}</button>
          <button style={styles.metaBtn} onClick={()=>addComment(i.id)}>Add</button>
        </div>
        { open[i.id] && <ul style={styles.comments}>{open[i.id]===null? <li style={styles.comment}>Loading...</li> : open[i.id].length? open[i.id].map(c=> <li key={c.id} style={styles.comment}>{c.content}</li>) : <li style={styles.commentEmpty}>No comments</li> }</ul> }
      </div>
    </li>)}
  </ul>;
}

const styles = {
  list:{listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:12},
  item:{display:'flex', gap:12, background:'#fff', padding:'0.9rem 1rem', border:'1px solid #e4e7ec', borderRadius:10, alignItems:'stretch'},
  voteCol:{display:'flex', flexDirection:'column', alignItems:'center', gap:4},
  voteBtn:{background:'#f2f4f7', border:'1px solid #d0d5dd', borderRadius:6, cursor:'pointer', width:28, height:28, fontSize:14, lineHeight:'14px'},
  score:{fontSize:13, fontWeight:600, color:'#344054'},
  title:{fontWeight:600, fontSize:16, marginBottom:4},
  desc:{fontSize:14, color:'#475467', marginBottom:6},
  meta:{display:'flex', gap:8},
  metaBtn:{background:'#fff', border:'1px solid #d0d5dd', borderRadius:20, padding:'4px 10px', fontSize:12, cursor:'pointer'},
  comments:{margin:'6px 0 0', paddingLeft:18, display:'flex', flexDirection:'column', gap:4},
  comment:{background:'#f2f4f7', padding:'4px 8px', borderRadius:6, fontSize:12},
  commentEmpty:{color:'#98a2b3', fontSize:12}
};
