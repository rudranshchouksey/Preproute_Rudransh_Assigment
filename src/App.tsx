import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Login } from './features/auth/Login';
import { Dashboard } from './features/dashboard/Dashboard';
import { MainLayout } from './components/Layout/MainLayout';
import { TestForm } from './features/test/TestForm';
import { QuestionEditorPage } from './features/questions/QuestionEditorPage';
import { TestPublishPage } from './features/publish/TestPublishPage';
import {
  TestTracking,
  ProtectedRoute
} from './pages';

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
              <Route path="/test/create" element={<TestForm />} />
              <Route path="/test/edit/:id" element={<TestForm />} />
              
              <Route path="/test/:id/questions" element={<QuestionEditorPage />} />
              
              {/* Added TestPublishPage */}
              <Route path="/test/:id/publish" element={<TestPublishPage />} />
              
              <Route path="/test/tracking" element={<TestTracking />} />
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
