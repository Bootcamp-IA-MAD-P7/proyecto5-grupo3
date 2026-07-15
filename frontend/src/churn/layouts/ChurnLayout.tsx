// @path: frontend/src/churn/layouts/ChurnLayout.tsx
import { Outlet } from 'react-router';
import { Navbar } from '../components/navbar';

export const ChurnLayout = () => {
  // return <Outlet />;
  return (
    // <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
    <div
      className="min-h-screen bg-cover bg-center bg-fixed bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(rgba(126, 91, 91, 0.7), rgba(35, 35, 35, 0.7)), url('/churn-hero.png')`,
      }}
    >
      <div className="max-w-7xl mx-auto">
        <Navbar />
        <Outlet />
      </div>
    </div>
  );
};
