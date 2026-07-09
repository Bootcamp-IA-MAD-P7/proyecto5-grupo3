import { Outlet } from 'react-router';

export const GuardLayout = () => {
  return (
    // <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
    <div
      className="min-h-screen bg-cover bg-center bg-fixed bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.7), rgba(255,255,255,0.7)), url('/dc-marvel-bg.jpg')`,
      }}
    >
      <div className="max-w-7xl mx-auto px-16 py-10">
        <Outlet />
      </div>
    </div>
  );
};
