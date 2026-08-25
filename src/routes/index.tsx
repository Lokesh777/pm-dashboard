import { lazy, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Layout from '../components/Layout';

const LoginPage = lazy(() => import('../features/auth/LoginPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const TasksPage = lazy(() => import('../pages/TasksPage'));

export interface RouteConfig {
  path: string;
  element: ReactNode;
  children?: RouteConfig[];
}

export const publicRoutes: RouteConfig[] = [
  { path: '/login', element: <LoginPage /> },
];

export const protectedRoutes: RouteConfig[] = [
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/', element: <DashboardPage /> },
      { path: '/tasks', element: <TasksPage /> },
    ],
  },
];

export const fallbackRoute = <Navigate to="/" replace />;
