import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './App.css';
import GuardApp from './GuardApp.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GuardApp />
  </StrictMode>,
);
