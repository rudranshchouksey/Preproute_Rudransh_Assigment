import React from 'react';

export const Login = () => <div className="p-8">Login Page (Public)</div>;
export const Dashboard = () => <div className="p-8">Dashboard (Protected)</div>;
export const TestCreate = () => <div className="p-8">Create Test (Protected)</div>;
export const TestEdit = () => <div className="p-8">Edit Test (Protected)</div>;
export const TestQuestions = () => <div className="p-8">Test Questions (Protected)</div>;
export const TestPublish = () => <div className="p-8">Publish Test (Protected)</div>;

// A simple protected route wrapper
export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  // For bootstrapping, we'll just allow it if no token, or redirect if strict.
  // if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
};
