import { RouterProvider } from 'react-router';
import { appRouter } from './router/app.router';

function GuardApp() {
  return (
    <>
      <RouterProvider router={appRouter} />
    </>
  );
}

export default GuardApp;
