import React, { useState } from 'react';
import { apiPost } from '../api.js';
import { useRoute } from '../main.jsx';
import { useEffect } from 'react';

export function Register(){
  const { navigate } = useRoute();
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [error,setError] = useState('');
  const [loading,setLoading] = useState(false);
  const [done,setDone] = useState(false);
  async function submit(e){ e.preventDefault(); setError(''); setLoading(true);
    try {
      await apiPost('/api/auth/register',{ email, password });
      setDone(true); setTimeout(()=>navigate('/login'), 1200);
    } catch(err){ setError(err.data?.error || err.message); }
    finally { setLoading(false); }
  }
  useEffect(()=>{ if(localStorage.getItem('token')) navigate('/ideas'); },[]);
  return <div style={styles.outer}>
    <form onSubmit={submit} style={styles.form}>
      <h2 style={{margin:'0 0 1rem'}}>Create Account</h2>
      {error && <div style={styles.error}>{error}</div>}
      {done && <div style={styles.success}>Registered! Redirecting…</div>}
      <label style={styles.field}>Email
        <input style={styles.input} type='email' value={email} onChange={e=>setEmail(e.target.value)} required />
      </label>
      <label style={styles.field}>Password
        <input style={styles.input} type='password' value={password} onChange={e=>setPassword(e.target.value)} required minLength={6} />
      </label>
      <button disabled={loading} style={styles.primary}>{loading? 'Creating...':'Register'}</button>
      <div style={styles.alt}>Have an account? <a style={styles.link} onClick={()=>navigate('/login')}>Login</a></div>
    </form>
  </div>;
}

const styles = {
  outer:{minHeight:'calc(100dvh - 60px)', display:'flex', alignItems:'center', justifyContent:'center', background:'#f2f4f7', fontFamily:'system-ui, sans-serif'},
  form:{background:'#fff', padding:'2rem 2rem 2.25rem', borderRadius:16, width:340, display:'flex', flexDirection:'column', gap:14, boxShadow:'0 6px 18px -4px rgba(16,24,40,0.15)'},
  field:{display:'flex', flexDirection:'column', fontSize:13, gap:4},
  input:{padding:'0.6rem 0.75rem', border:'1px solid #d0d5dd', borderRadius:8, fontSize:14},
  primary:{background:'#155eef', color:'#fff', border:'none', padding:'0.75rem 1rem', borderRadius:10, fontSize:15, cursor:'pointer', fontWeight:500},
  error:{background:'#fee4e2', color:'#b42318', padding:'.55rem .75rem', borderRadius:8, fontSize:13},
  success:{background:'#ecfdf3', color:'#027a48', padding:'.55rem .75rem', borderRadius:8, fontSize:13},
  alt:{fontSize:12, textAlign:'center', marginTop:4, color:'#475467'},
  link:{color:'#155eef', cursor:'pointer'}
};
