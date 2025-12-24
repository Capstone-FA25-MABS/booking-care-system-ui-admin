import { useRoutes } from 'react-router-dom';
import routes from './routeConfig';

const AppRoutes = () => {
    return useRoutes(routes);
};

export default AppRoutes;
