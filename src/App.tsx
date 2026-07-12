import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Login } from './features/auth/Login';
import { Dashboard } from './features/dashboard/Dashboard';
import { MainLayout } from './components/Layout/MainLayout';
import { UnifiedTestEditor } from './features/test/UnifiedTestEditor';
import { TestPublishPage } from './features/publish/TestPublishPage';
import { TestTrackingPage } from './features/tracking/TestTrackingPage';
import { TestPreviewPage } from './features/preview/TestPreviewPage';
import { TestViewPage } from './features/published/TestViewPage';
import { ProtectedRoute } from './pages';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Router>
        <div className="font-sans text-secondary">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes inside MainLayout */}
            <Route 
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/test/create" element={<UnifiedTestEditor />} />
              <Route path="/test/edit/:id" element={<UnifiedTestEditor />} />
              <Route path="/test/:id/questions" element={<UnifiedTestEditor />} />
              
              {/* TestPublishPage */}
              <Route path="/test/:id/publish" element={<TestPublishPage />} />
              <Route path="/test/:id/preview" element={<TestPreviewPage />} />
              <Route path="/test/:id/view" element={<TestViewPage />} />
              
              <Route path="/test/tracking" element={<TestTrackingPage />} />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;
