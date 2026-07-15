// @path: frontend/src/ChurnApp.tsx
import { RouterProvider } from 'react-router';
import { RoleChurnProvider } from './churn/context/RoleChurnContext';
import { appRouter } from './router/app.router';

function ChurnApp() {
  return (
    <RoleChurnProvider>
      <RouterProvider router={appRouter} />
    </RoleChurnProvider>
  );
}

export default ChurnApp;
