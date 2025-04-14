import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { ConfirmProvider } from './components/ui/ConfirmDialog.tsx';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
<ConfirmProvider>
  <App />
</ConfirmProvider>
  </React.StrictMode>
);