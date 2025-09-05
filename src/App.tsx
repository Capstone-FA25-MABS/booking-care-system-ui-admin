import AppRoutes from './routes/AppRoutes';
import { BrowserRouter } from 'react-router-dom';
import ReduxProvider from './store/ReduxProvider';

function App() {
    return (
        <ReduxProvider>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </ReduxProvider>
    );
}

export default App;
