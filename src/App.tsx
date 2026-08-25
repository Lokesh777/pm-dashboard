import { Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CircularProgress, Box, Fade } from '@mui/material';
import { publicRoutes, protectedRoutes, fallbackRoute } from './routes';
import ErrorBoundary from './components/ErrorBoundary';

function LoadingFallback() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
      <CircularProgress />
    </Box>
  );
}

function FadeTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  return (
    <Fade in timeout={250} key={location.pathname}>
      <Box>{children}</Box>
    </Fade>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <FadeTransition>
            <Routes>
              {publicRoutes.map((route) => (
                <Route key={route.path} path={route.path} element={route.element} />
              ))}
              {protectedRoutes.map((route) => (
                <Route key={route.path} path={route.path} element={route.element}>
                  {route.children?.map((child) => (
                    <Route key={child.path} path={child.path} element={child.element} />
                  ))}
                </Route>
              ))}
              <Route path="*" element={fallbackRoute} />
            </Routes>
          </FadeTransition>
        </Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
