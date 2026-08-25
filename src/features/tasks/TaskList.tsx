import { useState, useMemo, useCallback, memo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMediaQuery, useTheme } from '@mui/material';
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
  Card,
  CardContent,
  Menu,
  ListItemIcon,
  ListItemText,
  Grow,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  ArrowUpward as SortAscIcon,
  ArrowDownward as SortDescIcon,
  MoreVert as MoreIcon,
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

const TaskCard = memo(function TaskCard({
  task,
  onDetail,
  onEdit,
  onDelete,
}: {
  task: Task;
  onDetail: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  return (
    <Card variant="outlined" sx={{ transition: 'all 0.2s ease', '&:hover': { boxShadow: 2 } }}>
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, flex: 1, mr: 1 }}>
            {task.title}
          </Typography>
          <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
            <MoreIcon fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={() => { setAnchorEl(null); onDetail(); }}>
              <ListItemIcon><ViewIcon fontSize="small" /></ListItemIcon>
              <ListItemText>View</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { setAnchorEl(null); onEdit(); }}>
              <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Edit</ListItemText>
            </MenuItem>
            <MenuItem onClick={() => { setAnchorEl(null); onDelete(); }}>
              <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
              <ListItemText sx={{ color: 'error.main' }}>Delete</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1.5 }}>
          <Chip label={task.status.replace('-', ' ')} color={statusColors[task.status]} size="small" />
          <Chip label={task.priority} color={priorityColors[task.priority]} size="small" variant="outlined" />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">Due: {task.dueDate}</Typography>
          <Typography variant="caption" color="text.secondary">{task.assignedUser}</Typography>
        </Box>
      </CardContent>
    </Card>
  );
});

export default function TaskList() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [searchParams] = useSearchParams();
  const deleteMutation = useDeleteTask();

  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(searchInput, 500);
  const [statusFilter, setStatusFilter] = useState<Status | ''>((searchParams.get('status') as Status) || '');
  const [priorityFilter, setPriorityFilter] = useState<Priority | ''>((searchParams.get('priority') as Priority) || '');
  const [sortBy, setSortBy] = useState<'createdAt' | 'dueDate' | 'title'>((searchParams.get('sortBy') as 'createdAt' | 'dueDate' | 'title') || 'createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>((searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
  const limit = 6;

  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  const filters: TaskFilters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      status: statusFilter || undefined,
      priority: priorityFilter || undefined,
      sortBy, sortOrder, page, limit,
    }),
    [debouncedSearch, statusFilter, priorityFilter, sortBy, sortOrder, page]
  );

  const { data, isLoading, error } = useTasks(filters);

  const handleStatusFilter = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setStatusFilter(e.target.value as Status | ''); setPage(1);
  }, []);

  const handlePriorityFilter = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPriorityFilter(e.target.value as Priority | ''); setPage(1);
  }, []);

  const handleSort = useCallback((field: typeof sortBy) => {
    if (sortBy === field) setSortOrder((p) => (p === 'asc' ? 'desc' : 'asc'));
    else { setSortBy(field); setSortOrder('asc'); }
    setPage(1);
  }, [sortBy]);

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
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Tasks</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => { setEditTask(null); setFormOpen(true); }}
          sx={{ minHeight: 44, transition: 'all 0.2s ease', '&:hover': { transform: 'translateY(-1px)', boxShadow: 3 } }}
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
          sx={{ minWidth: { xs: '100%', sm: 250 }, flexGrow: { xs: 1, sm: 0 } }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> } }}
        />
        <TextField select size="small" label="Status" value={statusFilter} onChange={handleStatusFilter} sx={{ minWidth: { xs: 'calc(50% - 8px)', sm: 150 } }}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="in-progress">In Progress</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
        </TextField>
        <TextField select size="small" label="Priority" value={priorityFilter} onChange={handlePriorityFilter} sx={{ minWidth: { xs: 'calc(50% - 8px)', sm: 150 } }}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="high">High</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="low">Low</MenuItem>
        </TextField>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error">Failed to load tasks</Alert>
      ) : !data?.data.length ? (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography variant="h6" color="text.secondary">No tasks found</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Try adjusting your filters or create a new task</Typography>
        </Box>
      ) : isMobile ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {data.data.map((task) => (
            <Grow in timeout={300} key={task.id}>
              <Box>
                <TaskCard
                  task={task}
                  onDetail={() => setDetailTask(task)}
                  onEdit={() => { setEditTask(task); setFormOpen(true); }}
                  onDelete={() => setDeleteConfirm(task.id)}
                />
              </Box>
            </Grow>
          ))}
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell onClick={() => handleSort('title')} sx={{ cursor: 'pointer', fontWeight: 700, userSelect: 'none' }}>
                    Title {sortBy === 'title' && <SortIcon fontSize="small" sx={{ verticalAlign: 'middle' }} />}
                  </TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell onClick={() => handleSort('dueDate')} sx={{ cursor: 'pointer', fontWeight: 700, userSelect: 'none' }}>
                    Due Date {sortBy === 'dueDate' && <SortIcon fontSize="small" sx={{ verticalAlign: 'middle' }} />}
                  </TableCell>
                  <TableCell>Assigned</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.data.map((task) => (
                  <TableRow key={task.id} hover sx={{ transition: 'background-color 0.15s ease' }}>
                    <TableCell><Typography sx={{ fontWeight: 500 }}>{task.title}</Typography></TableCell>
                    <TableCell><Chip label={task.status.replace('-', ' ')} color={statusColors[task.status]} size="small" /></TableCell>
                    <TableCell><Chip label={task.priority} color={priorityColors[task.priority]} size="small" variant="outlined" /></TableCell>
                    <TableCell>{task.dueDate}</TableCell>
                    <TableCell>{task.assignedUser}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => setDetailTask(task)}><ViewIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => { setEditTask(task); setFormOpen(true); }}><EditIcon fontSize="small" /></IconButton>
                      <IconButton size="small" onClick={() => setDeleteConfirm(task.id)}><DeleteIcon fontSize="small" color="error" /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination component="div" count={data.total} page={page - 1} onPageChange={(_, p) => setPage(p + 1)} rowsPerPage={limit} rowsPerPageOptions={[6]} />
        </>
      )}

      <TaskForm open={formOpen} task={editTask} onClose={() => { setFormOpen(false); setEditTask(null); }} onSuccess={handleFormSuccess} />
      <TaskDetail task={detailTask} onClose={() => setDetailTask(null)} />

      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} fullWidth maxWidth="xs" fullScreen={isMobile}>
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent><Typography>Are you sure you want to delete this task?</Typography></DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={() => deleteConfirm && handleDelete(deleteConfirm)} disabled={deleteMutation.isPending} sx={{ minHeight: 44 }}>
            {deleteMutation.isPending ? <CircularProgress size={20} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <MuiAlert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>{snackbar.message}</MuiAlert>
      </Snackbar>
    </Box>
  );
}
