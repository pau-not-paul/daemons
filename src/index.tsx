import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './assets/styles/styles.css';

import App from './App';

const container = document.getElementById('root');

if (container) {
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} else {
  console.error('Root container not found.');
}
