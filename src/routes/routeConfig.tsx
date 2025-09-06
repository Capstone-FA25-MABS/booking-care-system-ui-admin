import { RouteObject } from 'react-router-dom';
import { PATHS } from './paths';
import Dashboard from '@/pages/admins/Dashboard';
import NotFoundError from '@/pages/errors/NotFoundError';

const routes: RouteObject[] = [
    {
        path: PATHS.HOME,
        element: <h1>Home</h1>,
    },
    {
        path: PATHS.ADMIN.ROOT,
        children: [
            { path: PATHS.ADMIN.DASHBOARD, element: <Dashboard /> },
            { path: PATHS.ADMIN.SETTINGS, element: <h1>Setting</h1> },
        ],
    },
    {
        path: PATHS.NOT_FOUND,
        element: <NotFoundError />,
    },
];

export default routes;
