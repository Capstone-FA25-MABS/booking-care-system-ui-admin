import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import ReduxProvider from './store/ReduxProvider';
import GoogleOAuthWrapper from './providers/GoogleOAuthProvider';
import AccountNotificationProvider from './providers/AccountNotificationProvider';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App: React.FC = () => {
    return (
        <ReduxProvider>
            <GoogleOAuthWrapper>
                <AccountNotificationProvider>
                    <ToastContainer
                        position="top-right"
                        autoClose={2000}
                        hideProgressBar={false}
                        newestOnTop
                        closeOnClick
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                        theme="colored"
                    />
                    <BrowserRouter>
                        <AppRoutes />
                    </BrowserRouter>
                </AccountNotificationProvider>
            </GoogleOAuthWrapper>
        </ReduxProvider>
    );
};

export default App;
