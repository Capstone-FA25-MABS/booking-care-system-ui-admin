import { RouteObject } from 'react-router-dom';
import { PATHS } from './paths';

const routes: RouteObject[] = [
    {
        path: PATHS.HOME,
        element: <h1>Home</h1>,
    },
    {
        path: PATHS.DASHBOARD.ROOT,
        children: [
            { path: PATHS.DASHBOARD.ROOT, element: <h1>Dashboard</h1> },
            { path: PATHS.DASHBOARD.SETTINGS, element: <h1>Setting</h1> },
        ],
    },
    {
        path: PATHS.NOT_FOUND,
        element: <h1>404 - Page Not Found</h1>,
    },
];

export default routes;
