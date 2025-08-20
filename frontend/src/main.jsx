import React, { createContext, useContext, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { AppShell } from './pages/AppShell.jsx';
import { Home } from './pages/Home.jsx';
import { Login } from './pages/Login.jsx';
import { Register } from './pages/Register.jsx';

// Simple client side router (hash-based) to avoid new deps
const RouteContext = createContext();
export function useRoute(){ return useContext(RouteContext); }
function Router({ children }){
	const [path,setPath] = useState(window.location.hash.slice(1) || '/');
	useEffect(()=>{
		const h=()=>setPath(window.location.hash.slice(1)||'/');
		window.addEventListener('hashchange', h); return ()=>window.removeEventListener('hashchange', h);
	},[]);
	return <RouteContext.Provider value={{ path, navigate:(p)=>{ window.location.hash=p; } }}>{children}</RouteContext.Provider>;
}

// Auth context storing JWT in localStorage
const AuthContext = createContext();
export function useAuth(){ return useContext(AuthContext); }
function AuthProvider({ children }){
	const [token,setToken] = useState(()=>localStorage.getItem('token')||'');
	const [email,setEmail] = useState(()=>localStorage.getItem('email')||'');
	function login(t, e){ setToken(t); setEmail(e); localStorage.setItem('token',t); localStorage.setItem('email',e); }
	function logout(){ setToken(''); setEmail(''); localStorage.removeItem('token'); localStorage.removeItem('email'); window.location.hash='/'; }
	return <AuthContext.Provider value={{ token, email, login, logout }}>{children}</AuthContext.Provider>;
}

function NavBar(){
	const { path, navigate } = useRoute();
	const { token, email, logout } = useAuth();
	return <nav style={styles.nav}>
		<div style={styles.brand} onClick={()=>navigate('/')}>IdeaSim</div>
		<div style={styles.links}>
			<a style={navLink(path==='/' )} onClick={()=>navigate('/')}>Home</a>
			<a style={navLink(path==='/ideas')} onClick={()=>navigate('/ideas')}>Ideas</a>
			{ token ? <>
				<span style={styles.user}>{email}</span>
				<button style={styles.outBtn} onClick={logout}>Sign Out</button>
			</> : <>
				<a style={navLink(path==='/login')} onClick={()=>navigate('/login')}>Login</a>
				<a style={navLink(path==='/register')} onClick={()=>navigate('/register')}>Register</a>
			</> }
		</div>
	</nav>;
}

function AppRoutes(){
	const { path } = useRoute();
	if(path === '/login') return <Login />;
	if(path === '/register') return <Register />;
	if(path === '/ideas') return <AppShell />;
	return <Home />;
}

function App(){
	console.debug('[App] render');
	return <AuthProvider>
		<Router>
			<NavBar />
			<AppRoutes />
		</Router>
	</AuthProvider>;
}

const styles = {
	nav:{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'0.75rem 1.25rem', background:'#101828', color:'#fff', fontFamily:'system-ui, sans-serif'},
	brand:{fontWeight:600, fontSize:20, cursor:'pointer'},
	links:{display:'flex', gap:18, alignItems:'center'},
	user:{fontSize:13, opacity:.9},
	outBtn:{background:'#fff', color:'#101828', border:'1px solid #344054', padding:'4px 10px', borderRadius:6, cursor:'pointer', fontSize:12}
};
function navLink(active){ return { cursor:'pointer', fontSize:14, color: active? '#84caff':'#fff', textDecoration:'none'}; }

createRoot(document.getElementById('root')).render(<App />);
