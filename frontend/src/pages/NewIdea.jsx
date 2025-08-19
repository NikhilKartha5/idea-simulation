import React, { useState } from 'react';

export function NewIdea(){
  const [title,setTitle] = useState('');
  const [description,setDescription] = useState('');
  const submit = async e => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    await fetch('/api/ideas', { method:'POST', headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`}, body: JSON.stringify({ title, description }) });
    setTitle(''); setDescription('');
  };
  return <form onSubmit={submit} style={{marginBottom:'1rem'}}>
    <input placeholder='Title' value={title} onChange={e=>setTitle(e.target.value)} required />{' '}
    <input placeholder='Description' value={description} onChange={e=>setDescription(e.target.value)} required />{' '}
    <button>Add Idea</button>
  </form>;
}
