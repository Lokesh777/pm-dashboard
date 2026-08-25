import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ThemeProvider } from './components/ui/ThemeProvider';
import App from './App';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

async function enableMocking() {
  if (import.meta.env.VITE_ENABLE_MSW !== 'true') return;
  try {
    const { worker } = await import('./mocks/browser');
    await worker.start({ onUnhandledRequest: 'bypass' });
    console.log('MSW enabled');
  } catch (error) {
    console.error('MSW failed to start:', error);
  }
}

enableMocking().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <App />
            </LocalizationProvider>
          </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>
  );
});
