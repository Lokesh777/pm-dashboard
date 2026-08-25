import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Assignment as TotalIcon,
  PendingActions as PendingIcon,
  Autorenew as InProgressIcon,
  CheckCircle as CompletedIcon,
  PriorityHigh as HighPriorityIcon,
} from '@mui/icons-material';
import { useTaskStats } from '../hooks/useTasks';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
}

function StatCard({ title, value, icon, color, onClick }: StatCardProps) {
  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': onClick
          ? { transform: 'translateY(-4px)', boxShadow: 4 }
          : {},
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: `${color}15`,
              color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: stats, isLoading, error } = useTaskStats();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">Failed to load dashboard stats</Alert>;
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Overview of your project tasks
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <StatCard
            title="Total Tasks"
            value={stats?.total ?? 0}
            icon={<TotalIcon fontSize="large" />}
            color="#1976d2"
            onClick={() => navigate('/tasks')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <StatCard
            title="Pending Tasks"
            value={stats?.pending ?? 0}
            icon={<PendingIcon fontSize="large" />}
            color="#ed6c02"
            onClick={() => navigate('/tasks?status=pending')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <StatCard
            title="In Progress"
            value={stats?.inProgress ?? 0}
            icon={<InProgressIcon fontSize="large" />}
            color="#9c27b0"
            onClick={() => navigate('/tasks?status=in-progress')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <StatCard
            title="Completed"
            value={stats?.completed ?? 0}
            icon={<CompletedIcon fontSize="large" />}
            color="#2e7d32"
            onClick={() => navigate('/tasks?status=completed')}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <StatCard
            title="High Priority"
            value={stats?.highPriority ?? 0}
            icon={<HighPriorityIcon fontSize="large" />}
            color="#d32f2f"
            onClick={() => navigate('/tasks?priority=high')}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
