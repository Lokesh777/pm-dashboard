import { useEffect } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  Box,
  CircularProgress,
} from '@mui/material';
import { useCreateTask, useUpdateTask } from '../../hooks/useTasks';
import type { Task } from '../../types';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Max 100 characters'),
  description: z.string().min(1, 'Description is required').max(500, 'Max 500 characters'),
  assignedUser: z.string().min(1, 'Assigned user is required'),
  priority: z.enum(['low', 'medium', 'high']),
  status: z.enum(['pending', 'in-progress', 'completed']),
  dueDate: z.string().min(1, 'Due date is required'),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  open: boolean;
  task: Task | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TaskForm({ open, task, onClose, onSuccess }: TaskFormProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: { title: '', description: '', assignedUser: '', priority: 'medium', status: 'pending', dueDate: '' },
  });

  useEffect(() => {
    if (task) {
      reset({ title: task.title, description: task.description, assignedUser: task.assignedUser, priority: task.priority, status: task.status, dueDate: task.dueDate });
    } else {
      reset({ title: '', description: '', assignedUser: '', priority: 'medium', status: 'pending', dueDate: '' });
    }
  }, [task, reset]);

  const onSubmit = async (data: TaskFormData) => {
    try {
      if (task) await updateTask.mutateAsync({ id: task.id, data });
      else await createTask.mutateAsync(data);
      onSuccess();
    } catch { /* handled by mutation */ }
  };

  const isPending = createTask.isPending || updateTask.isPending;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth fullScreen={isMobile}>
      <DialogTitle>{task ? 'Edit Task' : 'Create New Task'}</DialogTitle>
      <DialogContent>
        <Box component="form" noValidate sx={{ mt: 1 }}>
          <Controller name="title" control={control} render={({ field }) => (
            <TextField {...field} fullWidth label="Task Title" error={!!errors.title} helperText={errors.title?.message} sx={{ mb: 2, mt: 1 }} />
          )} />
          <Controller name="description" control={control} render={({ field }) => (
            <TextField {...field} fullWidth label="Description" multiline rows={3} error={!!errors.description} helperText={errors.description?.message} sx={{ mb: 2 }} />
          )} />
          <Controller name="assignedUser" control={control} render={({ field }) => (
            <TextField {...field} fullWidth label="Assigned User" error={!!errors.assignedUser} helperText={errors.assignedUser?.message} sx={{ mb: 2 }} />
          )} />
          <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Controller name="priority" control={control} render={({ field }) => (
              <TextField {...field} select fullWidth label="Priority">
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </TextField>
            )} />
            <Controller name="status" control={control} render={({ field }) => (
              <TextField {...field} select fullWidth label="Status">
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </TextField>
            )} />
          </Box>
          <Controller name="dueDate" control={control} render={({ field }) => (
            <TextField {...field} fullWidth type="date" label="Due Date" slotProps={{ inputLabel: { shrink: true } }} error={!!errors.dueDate} helperText={errors.dueDate?.message} sx={{ mt: 2 }} />
          )} />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isPending}>Cancel</Button>
        <Button variant="contained" onClick={handleSubmit(onSubmit)} disabled={isPending} sx={{ minHeight: 44 }}>
          {isPending ? <CircularProgress size={20} color="inherit" /> : task ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
