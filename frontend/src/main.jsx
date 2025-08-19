import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppShell } from './pages/AppShell.jsx';

function App(){ return <AppShell />; }

createRoot(document.getElementById('root')).render(<App />);
