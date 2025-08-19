import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api.js';

export function TopIdeas(){
  const [items,setItems] = useState([]);
  useEffect(()=>{ apiFetch('/api/ideas/top').then(setItems).catch(()=>{}); },[]);
  if(!items.length) return null;
  return <div style={styles.box}>
    <h3 style={styles.heading}>Top Ideas</h3>
    <ol style={styles.list}>{items.map(i=> <li key={i.id} style={styles.item}>#{i.id} <span style={styles.score}>{i.score}</span></li>)}</ol>
  </div>;
}

const styles = {
  box:{padding:'0.75rem 1rem', background:'#f9fafb', border:'1px solid #e4e7ec', borderRadius:8, minWidth:180},
  heading:{margin:'0 0 .5rem', fontSize:14, textTransform:'uppercase', letterSpacing:'.5px', color:'#475467'},
  list:{margin:0, paddingLeft:20, display:'flex', flexDirection:'column', gap:4},
  item:{fontSize:13, color:'#344054'},
  score:{background:'#eff8ff', color:'#026aa2', padding:'2px 6px', borderRadius:12, fontSize:12, marginLeft:6}
};
