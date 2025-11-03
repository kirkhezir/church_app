// Frontend entry point
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/globals.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <div>
      <h1>Church Management Application</h1>
      <p>Loading...</p>
    </div>
  </React.StrictMode>
);
