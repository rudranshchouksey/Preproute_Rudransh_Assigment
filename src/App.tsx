import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import {
  Login,
  Dashboard,
  TestCreate,
  TestEdit,
  TestQuestions,
  TestPublish,
  ProtectedRoute
} from './pages';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-secondary">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/test/create" 
            element={
              <ProtectedRoute>
                <TestCreate />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/test/edit/:id" 
            element={
              <ProtectedRoute>
                <TestEdit />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/test/:id/questions" 
            element={
              <ProtectedRoute>
                <TestQuestions />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/test/:id/publish" 
            element={
              <ProtectedRoute>
                <TestPublish />
              </ProtectedRoute>
            } 
          />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
