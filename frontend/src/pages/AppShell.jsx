import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api.js';
import { NewIdea } from './NewIdea.jsx';
import { Search } from './Search.jsx';
import { TopIdeas } from './TopIdeas.jsx';
import { IdeaList } from './IdeaList.jsx';

export function AppShell(){
  const [ideas,setIdeas] = useState([]);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState('');

  async function loadIdeas(){
    setLoading(true); setError('');
    try {
  const data = await apiFetch('/api/ideas');
  setIdeas(data);
    } catch(e){ setError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(()=>{ loadIdeas(); },[]);

  return <div style={styles.container}>
    <Header />
    <section style={styles.panel}>
      <NewIdea onCreated={loadIdeas} />
      <Search />
      <TopIdeas />
    </section>
    <main style={styles.main}>
        <div style={styles.toolbar}>
          <h2 style={{margin:0}}>Recent Ideas</h2>
          <button onClick={loadIdeas} disabled={loading} style={styles.buttonSecondary}>{loading? 'Refreshing...':'Refresh'}</button>
        </div>
        {error && <div style={styles.error}>{error}</div>}
        <IdeaList ideas={ideas} onAction={loadIdeas} />
    </main>
    <Footer />
  </div>;
}

function Header(){
  return <header style={styles.header}><h1 style={{margin:0,fontSize:'1.8rem'}}>AHA Ideas</h1></header>;
}
function Footer(){
  return <footer style={styles.footer}>Prototype UI – improve styling later</footer>;
}

const styles = {
  container:{fontFamily:'system-ui, sans-serif', minHeight:'100dvh', display:'grid', gridTemplateRows:'auto 1fr auto', background:'#f5f7fa'},
  header:{padding:'1rem 2rem', background:'#101828', color:'#fff', boxShadow:'0 2px 4px rgba(0,0,0,0.1)'},
  panel:{padding:'1rem 2rem', background:'#fff', display:'flex', flexWrap:'wrap', gap:'1.25rem', alignItems:'flex-start', borderBottom:'1px solid #e4e7ec'},
  main:{padding:'1.5rem 2rem'},
  toolbar:{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.75rem'},
  buttonSecondary:{background:'#fff', border:'1px solid #d0d5dd', padding:'0.4rem 0.85rem', borderRadius:6, cursor:'pointer'},
  error:{background:'#ffe4e6', color:'#b42318', padding:'0.5rem 0.75rem', borderRadius:6, marginBottom:'0.75rem', fontSize:'.9rem'},
  footer:{padding:'0.75rem 2rem', fontSize:'0.75rem', color:'#667085'}
};
