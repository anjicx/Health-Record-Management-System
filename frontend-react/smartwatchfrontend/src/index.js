import React from 'react';
import ReactDOM from 'react-dom/client';
import './style/index.css'; // Stilizovanje globalnih elemenata
import App from './App'; // Glavna komponenta koja sadrži sve rute i druge komponente App.js

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />  {/* [Poziva se glavna aplikacija */}
  </React.StrictMode>
);

