import React from 'react'
import ReactDOM from 'react-dom/client'
// import App from './App.tsx'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// old index.tsx
// import React from 'react';
// import { createRoot } from 'react-dom/client';
// import './index.css';
// import App from './App';

// const container = document.getElementById('root') as HTMLElement
// const root = createRoot(container);
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );
