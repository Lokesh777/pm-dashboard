import { useMediaQuery, useTheme } from '@mui/material';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
} from '@mui/material';
import type { Task } from '../../types';

interface TaskDetailProps {
  task: Task | null;
  onClose: () => void;
}

const statusColors = { pending: 'warning' as const, 'in-progress': 'info' as const, completed: 'success' as const };
const priorityColors = { high: 'error' as const, medium: 'warning' as const, low: 'default' as const };

export default function TaskDetail({ task, onClose }: TaskDetailProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  if (!task) return null;

  return (
    <Dialog open={!!task} onClose={onClose} maxWidth="sm" fullWidth fullScreen={isMobile}>
      <DialogTitle sx={{ fontWeight: 700 }}>{task.title}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Chip label={task.status.replace('-', ' ')} color={statusColors[task.status]} size="small" />
          <Chip label={task.priority} color={priorityColors[task.priority]} size="small" variant="outlined" />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Description</Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>{task.description}</Typography>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Assigned To</Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>{task.assignedUser}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Due Date</Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>{task.dueDate}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Created</Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>{task.createdAt}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Last Updated</Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>{task.updatedAt}</Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ minHeight: 44 }}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
