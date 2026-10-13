import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { load } from './state/answersStore';
import 'govuk-frontend/dist/govuk/govuk-frontend.min.css';

// Read stored answers once, outside React, so StrictMode's double render
// can't lose the "expired" result (spec §4.7).
const initial = load(Date.now());

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App initial={initial} />
    </BrowserRouter>
  </React.StrictMode>
);
