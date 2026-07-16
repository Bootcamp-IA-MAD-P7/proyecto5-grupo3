// @path: frontend/src/router/app.router.tsx
import { createHashRouter, Navigate } from 'react-router';

import { AdminLayout } from '@/admin/layouts/AdminLayout';
import { AdminPage } from '@/admin/pages/AdminPage';
import { ChurnLayout } from '@/churn/layouts/ChurnLayout';
import { HomePage } from '@/churn/pages/home/HomePage';
import { MetricsPage } from '@/churn/pages/metrics/MetricsPage';
import { ModelPage } from '@/churn/pages/model/ModelPage';
import { PanelPage } from '@/churn/pages/panel/PanelPage';
import { PredictsPage } from '@/churn/pages/predicts/PredictsPage';

// export const appRouter = createBrowserRouter([
// export const appRouter = createHashRouter([
export const appRouter = createHashRouter([
  {
    path: '/',
    element: <ChurnLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'panel',
        element: <PanelPage />,
      },
      {
        path: 'metricas',
        element: <MetricsPage />,
      },
      {
        path: 'modelo',
        element: <ModelPage />,
      },
      {
        path: 'predicciones',
        element: <PredictsPage />,
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
