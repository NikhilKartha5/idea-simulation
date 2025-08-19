import React, { useState } from 'react';
import { apiPost } from '../api.js';

// Auth removed; placeholder to avoid import errors if any stale references remain.
export function Auth(){ return null; }

const styles = {
  box:{display:'flex', flexDirection:'column', gap:8, padding:'0.75rem 1rem', background:'#f9fafb', border:'1px solid #e4e7ec', borderRadius:8, minWidth:260},
  field:{display:'flex', flexDirection:'column', gap:4, fontSize:12},
  btn:{background:'#155eef', color:'#fff', border:'none', padding:'0.5rem .9rem', borderRadius:6, cursor:'pointer'},
  btnOutline:{background:'#fff', color:'#155eef', border:'1px solid #155eef', padding:'0.5rem .9rem', borderRadius:6, cursor:'pointer'},
  error:{background:'#ffe4e6', color:'#b42318', padding:'0.35rem 0.5rem', borderRadius:4, fontSize:12}
};
