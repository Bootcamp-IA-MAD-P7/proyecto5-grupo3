import { createBrowserRouter, Navigate } from 'react-router';

import { AdminLayout } from '@/admin/layouts/AdminLayout';
import { AdminPage } from '@/admin/pages/AdminPage';
import { GuardLayout } from '@/guard/layouts/GuardLayout';
import { HomePage } from '@/guard/pages/home/HomePage';
import { SearchPage } from '@/guard/pages/search/SearchPage';
import { UserPage } from '@/guard/pages/user/UserPage';

// export const appRouter = createBrowserRouter([
// export const appRouter = createHashRouter([
export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <GuardLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'users/:idUser',
        element: <UserPage />,
      },
      {
        path: 'search',
        element: <SearchPage />,
      },
      {
        path: '*',
        element: <Navigate to="/" />,
      },
    ],
  },

  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <AdminPage />,
      },
    ],
  },
]);
