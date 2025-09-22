import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'simplebar-react/dist/simplebar.min.css';
import './styles/index.scss';
import '@/assets/css/style.css';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>
);

// import { StrictMode } from 'react';
// import { createRoot } from 'react-dom/client';
// import App from './App';
// import 'bootstrap/dist/js/bootstrap.bundle.min.js';
// import 'simplebar-react/dist/simplebar.min.css';
// import './styles/index.scss';

// createRoot(document.getElementById('root')!).render(
//     <StrictMode>
//         <App />
//     </StrictMode>
// );
