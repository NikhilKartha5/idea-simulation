import React, { useState } from 'react';
import { apiPost } from '../api.js';

export function NewIdea({ onCreated }){
  const [title,setTitle] = useState('');
  const [description,setDescription] = useState('');
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState('');
  const submit = async e => {
    e.preventDefault(); if(!title || !description) return;
    setLoading(true); setError('');
    try {
      await apiPost('/api/ideas', { title, description });
      setTitle(''); setDescription('');
      onCreated && onCreated();
    } catch(e){ setError(e.message); }
    finally { setLoading(false); }
  };
  return <form onSubmit={submit} style={styles.box}>
    <div style={{display:'flex', gap:8}}>
      <input style={styles.input} placeholder='Title' value={title} onChange={e=>setTitle(e.target.value)} required />
      <input style={styles.input} placeholder='Description' value={description} onChange={e=>setDescription(e.target.value)} required />
      <button style={styles.btn} disabled={loading}>{loading? 'Adding...':'Add'}</button>
    </div>
    {error && <div style={styles.error}>{error}</div>}
  </form>;
}

const styles = {
  box:{display:'flex', flexDirection:'column', gap:6},
  input:{flex:1, padding:'0.45rem 0.6rem', border:'1px solid #d0d5dd', borderRadius:6},
  btn:{background:'#12a150', color:'#fff', border:'none', padding:'0.55rem 0.9rem', borderRadius:6, cursor:'pointer'},
  error:{color:'#b42318', fontSize:12}
};
