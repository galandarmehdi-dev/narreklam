import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/index.css';

// The router handles scroll position (see ScrollToTop in SiteLayout).
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

const root = document.getElementById('root')!;
// Prerendered fallback content is replaced by the live app.
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
