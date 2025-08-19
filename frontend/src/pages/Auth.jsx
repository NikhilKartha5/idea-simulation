import React, { useState } from 'react';

export function Auth(){
  const [email,setEmail] = useState('user@example.com');
  const [password,setPassword] = useState('password');
  const [token,setToken] = useState(localStorage.getItem('token')||'');

  async function register(e){ e.preventDefault(); await fetch('/api/auth/register',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password })}); }
  async function login(e){ e.preventDefault(); const r= await fetch('/api/auth/login',{method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password })}); const d= await r.json(); if(d.token){ localStorage.setItem('token', d.token); setToken(d.token); } }
  function logout(){ localStorage.removeItem('token'); setToken(''); }

  return <div style={{marginBottom:'1rem'}}>
    <h3>Auth</h3>
    {token ? <div>Logged in <button onClick={logout}>Logout</button></div> : (
      <form onSubmit={login} style={{display:'flex', gap:'0.5rem'}}>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder='email' />
        <input type='password' value={password} onChange={e=>setPassword(e.target.value)} placeholder='password' />
        <button type='submit'>Login</button>
        <button onClick={register} type='button'>Register</button>
      </form>
    )}
  </div>;
}
