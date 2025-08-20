import React from 'react';
import { useRoute } from '../main.jsx';

export function Home(){
  const { navigate } = useRoute?.() || { navigate:()=>{} };
  return <div style={styles.wrap}>
    <section style={styles.hero}>
      <h1 style={styles.h1}>Crowd‑Powered Idea Incubator</h1>
      <p style={styles.tag}>Brainstorm, validate and refine product ideas collaboratively. Register to start posting & voting.</p>
      <div style={styles.ctas}>
        <button style={styles.primary} onClick={()=>navigate('/register')}>Get Started</button>
        <button style={styles.secondary} onClick={()=>navigate('/ideas')}>Browse Ideas</button>
      </div>
    </section>
  </div>;
}

const styles = {
  wrap:{padding:'3rem 1.5rem', fontFamily:'system-ui, sans-serif', background:'linear-gradient(135deg,#1d2939,#344054) min(100dvh,650px)', color:'#fff', display:'flex', justifyContent:'center', alignItems:'center'},
  hero:{maxWidth:720, textAlign:'center', display:'flex', flexDirection:'column', gap:24},
  h1:{fontSize:'clamp(2rem,6vw,3.5rem)', lineHeight:1.1, margin:0, fontWeight:600},
  tag:{fontSize:'1.05rem', opacity:.9, margin:0},
  ctas:{display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap'},
  primary:{background:'#155eef', color:'#fff', border:'none', padding:'0.85rem 1.4rem', borderRadius:10, fontSize:16, cursor:'pointer', fontWeight:500, boxShadow:'0 4px 12px -2px rgba(0,0,0,0.4)'},
  secondary:{background:'rgba(255,255,255,0.1)', color:'#fff', border:'1px solid rgba(255,255,255,0.4)', padding:'0.85rem 1.4rem', borderRadius:10, fontSize:16, cursor:'pointer'}
};
