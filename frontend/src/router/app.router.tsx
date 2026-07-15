import { createBrowserRouter, Navigate } from "react-router";

import { AdminLayout } from "@/admin/layouts/AdminLayout";
import { AdminPage } from "@/admin/pages/AdminPage";
import { ChurnLayout } from "@/churn/layouts/ChurnLayout";
import { HomePage } from "@/churn/pages/home/HomePage";
import { SearchPage } from "@/churn/pages/search/SearchPage";
import { UserPage } from "@/churn/pages/user/UserPage";
import { AdminEDA } from "@/admin/pages/AdminEDA";

// export const appRouter = createBrowserRouter([
// export const appRouter = createHashRouter([
export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <ChurnLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },

      {
        path: "users/:idUser",
        element: <UserPage />,
      },
      {
        path: "search",
        element: <SearchPage />,
      },
      {
        path: "*",
        element: <Navigate to="/" />,
      },
    ],
  },

  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <AdminPage />,
      },
      {
        path: "eda",
        element: <AdminEDA />,
      },
    ],
  },
]);
