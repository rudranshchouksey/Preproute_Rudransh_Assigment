import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './features/auth/Login';
import { Dashboard } from './features/dashboard/Dashboard';
import { MainLayout } from './components/Layout/MainLayout';
import { TestForm } from './features/test/TestForm';
import {
  TestQuestions,
  TestPublish,
  TestTracking,
  ProtectedRoute
} from './pages';

function App() {
  return (
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
            {/* Unified TestForm for Create and Edit */}
            <Route path="/test/create" element={<TestForm />} />
            <Route path="/test/edit/:id" element={<TestForm />} />
            
            <Route path="/test/:id/questions" element={<TestQuestions />} />
            <Route path="/test/:id/publish" element={<TestPublish />} />
            <Route path="/test/tracking" element={<TestTracking />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
