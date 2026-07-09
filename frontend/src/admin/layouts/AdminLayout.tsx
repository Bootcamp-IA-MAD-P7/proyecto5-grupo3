import { Outlet } from 'react-router';

export const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-purple-50">
      <Outlet />
    </div>
  );
};