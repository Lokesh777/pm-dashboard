import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ThemeProvider } from './components/ui/ThemeProvider';
import App from './App';
import './index.css';

declare const __MSW_ENABLED__: boolean;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function renderApp() {
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
}

if (__MSW_ENABLED__) {
  import('./mocks/browser').then(({ worker }) =>
    worker.start({ onUnhandledRequest: 'bypass' }).then(renderApp)
  ).catch((err) => {
    console.error('MSW failed to start:', err);
    renderApp();
  });
} else {
  renderApp();
}
