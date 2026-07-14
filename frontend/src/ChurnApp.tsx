import { RouterProvider } from 'react-router';
import { appRouter } from './router/app.router';

function ChurnApp() {
  return (
    <>
      <RouterProvider router={appRouter} />
    </>
  );
}

export default ChurnApp;
