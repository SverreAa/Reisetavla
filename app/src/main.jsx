import { createRoot } from 'react-dom/client';
import 'reisetavla-ds/styles.css';
import 'leaflet/dist/leaflet.css';
import './app.css';
import App from './App.jsx';

createRoot(document.getElementById('app')).render(<App />);
