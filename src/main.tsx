import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Import CSS files
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/assets/css/bootstrap-datetimepicker.min.css';
import '@/assets/plugins/daterangepicker/daterangepicker.css';
import '@/assets/plugins/fontawesome/css/fontawesome.min.css';
import '@/assets/plugins/fontawesome/css/all.min.css';
import '@/assets/plugins/tabler-icons/tabler-icons.min.css';
import '@/assets/plugins/simplebar/simplebar.min.css';
import 'simplebar-react/dist/simplebar.min.css';
import './styles/index.scss';
import '@/assets/css/style.css';

// Import JS files
import '@/assets/js/bootstrap.bundle.min.js';
import '@/assets/plugins/simplebar/simplebar.min.js';

// Suppress known React errors (removeChild conflicts with DOM libraries)
import '@/utils/suppressReactErrors';

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>
);
