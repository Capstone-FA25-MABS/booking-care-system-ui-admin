import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/assets/js/bootstrap.bundle.min.js';
import '@/assets/plugins/simplebar/simplebar.min.js';
import 'simplebar-react/dist/simplebar.min.css';
import './styles/index.scss';
import '@/assets/css/style.css';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>
);
