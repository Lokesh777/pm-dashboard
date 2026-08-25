import {
  Dashboard as DashboardIcon,
  Task as TaskIcon,
} from '@mui/icons-material';

export interface NavItem {
  label: string;
  path: string;
  icon: React.ReactElement;
}

export const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
  { label: 'Tasks', path: '/tasks', icon: <TaskIcon /> },
];

export const APP_TITLE = 'PM Dashboard';
