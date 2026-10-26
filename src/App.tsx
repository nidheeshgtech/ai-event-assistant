import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { PageLoader } from './components/ui/Misc';

// Every route is code-split; the dashboard pulls in the charts bundle on demand.
const ProductPage = lazy(() => import('./pages/ProductPage'));
const AssistantPage = lazy(() => import('./pages/AssistantPage'));
const MapPage = lazy(() => import('./pages/MapPage'));
const DashboardLayout = lazy(() => import('./pages/dashboard/DashboardLayout'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return;
    }
    // Lazy pages render after navigation, so retry briefly until the anchor exists.
    let tries = 0;
    const timer = window.setInterval(() => {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el || ++tries > 30) {
        window.clearInterval(timer);
        el?.scrollIntoView({ block: 'start' });
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, [pathname, hash]);
  return null;
}

export function App() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Navigate to="/solutions/ai-event-assistant" replace />} />
          <Route path="/solutions/ai-event-assistant" element={<ProductPage />} />
          <Route path="/demo/ai-event-assistant" element={<AssistantPage />} />
          <Route path="/demo/ai-event-assistant/map" element={<MapPage />} />
          <Route path="/demo/ai-event-assistant/dashboard/*" element={<DashboardLayout />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </>
  );
}
