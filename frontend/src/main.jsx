import React from 'react';
import { createRoot } from 'react-dom/client';
import { IdeaList } from './pages/IdeaList.jsx';
import { NewIdea } from './pages/NewIdea.jsx';
import { Auth } from './pages/Auth.jsx';
import { Search } from './pages/Search.jsx';
import { TopIdeas } from './pages/TopIdeas.jsx';

function App(){
  return <div style={{fontFamily:'system-ui', margin:'2rem'}}>
    <h1>AHA Ideas</h1>
  <Auth />
  <NewIdea />
  <Search />
  <TopIdeas />
  <IdeaList />
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
