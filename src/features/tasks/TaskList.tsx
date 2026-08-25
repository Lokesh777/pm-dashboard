import { useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  TablePagination,
  InputAdornment,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert as MuiAlert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  ArrowUpward as SortAscIcon,
  ArrowDownward as SortDescIcon,
} from '@mui/icons-material';
import { useTasks, useDeleteTask } from '../../hooks/useTasks';
import { useDebounce } from '../../hooks/useDebounce';
import TaskForm from './TaskForm';
import TaskDetail from './TaskDetail';
import type { Task, Status, Priority, TaskFilters } from '../../types';

const statusColors: Record<Status, 'warning' | 'info' | 'success'> = {
  pending: 'warning',
  'in-progress': 'info',
  completed: 'success',
};

const priorityColors: Record<Priority, 'error' | 'warning' | 'default'> = {
  high: 'error',
  medium: 'warning',
  low: 'default',
};

export default function TaskList() {
  const [searchParams] = useSearchParams();
  const deleteMutation = useDeleteTask();

  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(searchInput, 500);

  const [statusFilter, setStatusFilter] = useState<Status | ''>(
    (searchParams.get('status') as Status) || ''
  );
  const [priorityFilter, setPriorityFilter] = useState<Priority | ''>(
    (searchParams.get('priority') as Priority) || ''
  );
  const [sortBy, setSortBy] = useState<'createdAt' | 'dueDate' | 'title'>(
    (searchParams.get('sortBy') as 'createdAt' | 'dueDate' | 'title') || 'createdAt'
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(
    (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
  );
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
  const limit = 6;

  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const filters: TaskFilters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      status: statusFilter || undefined,
      priority: priorityFilter || undefined,
      sortBy,
      sortOrder,
      page,
      limit,
    }),
    [debouncedSearch, statusFilter, priorityFilter, sortBy, sortOrder, page]
  );

  const { data, isLoading, error } = useTasks(filters);

  const handleStatusFilter = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setStatusFilter(e.target.value as Status | '');
    setPage(1);
  }, []);

  const handlePriorityFilter = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPriorityFilter(e.target.value as Priority | '');
    setPage(1);
  }, []);

  const handleSort = useCallback(
    (field: typeof sortBy) => {
      if (sortBy === field) {
        setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortBy(field);
        setSortOrder('asc');
      }
      setPage(1);
    },
    [sortBy]
  );

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      setSnackbar({ open: true, message: 'Task deleted', severity: 'success' });
    } catch {
      setSnackbar({ open: true, message: 'Failed to delete task', severity: 'error' });
    }
    setDeleteConfirm(null);
  };

  const handleFormSuccess = () => {
    setFormOpen(false);
    setEditTask(null);
    setSnackbar({ open: true, message: editTask ? 'Task updated' : 'Task created', severity: 'success' });
  };

  const SortIcon = sortOrder === 'asc' ? SortAscIcon : SortDescIcon;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Tasks
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => { setEditTask(null); setFormOpen(true); }}
        >
          New Task
        </Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          size="small"
          placeholder="Search tasks..."
          value={searchInput}
          onChange={(e) => { setSearchInput(e.target.value); setPage(1); }}
          sx={{ minWidth: 250 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          select
          size="small"
          label="Status"
          value={statusFilter}
          onChange={handleStatusFilter}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="in-progress">In Progress</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
        </TextField>
        <TextField
          select
          size="small"
          label="Priority"
          value={priorityFilter}
          onChange={handlePriorityFilter}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="high">High</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="low">Low</MenuItem>
        </TextField>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">Failed to load tasks</Alert>
      ) : !data?.data.length ? (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No tasks found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Try adjusting your filters or create a new task
          </Typography>
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell onClick={() => handleSort('title')} sx={{ cursor: 'pointer', fontWeight: 700 }}>
                    Title {sortBy === 'title' && <SortIcon fontSize="small" sx={{ verticalAlign: 'middle' }} />}
                  </TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell onClick={() => handleSort('dueDate')} sx={{ cursor: 'pointer', fontWeight: 700 }}>
                    Due Date {sortBy === 'dueDate' && <SortIcon fontSize="small" sx={{ verticalAlign: 'middle' }} />}
                  </TableCell>
                  <TableCell>Assigned</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.data.map((task) => (
                  <TableRow key={task.id} hover>
                    <TableCell>
                      <Typography sx={{ fontWeight: 500 }}>{task.title}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={task.status.replace('-', ' ')}
                        color={statusColors[task.status]}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={task.priority}
                        color={priorityColors[task.priority]}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{task.dueDate}</TableCell>
                    <TableCell>{task.assignedUser}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => setDetailTask(task)}>
                        <ViewIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => { setEditTask(task); setFormOpen(true); }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => setDeleteConfirm(task.id)}>
                        <DeleteIcon fontSize="small" color="error" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={data.total}
            page={page - 1}
            onPageChange={(_, newPage) => setPage(newPage + 1)}
            rowsPerPage={limit}
            rowsPerPageOptions={[6]}
          />
        </>
      )}

      <TaskForm
        open={formOpen}
        task={editTask}
        onClose={() => { setFormOpen(false); setEditTask(null); }}
        onSuccess={handleFormSuccess}
      />

      <TaskDetail
        task={detailTask}
        onClose={() => setDetailTask(null)}
      />

      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this task?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <MuiAlert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
}
