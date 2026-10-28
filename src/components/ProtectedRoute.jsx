import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center text-white">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin"></div>
          <Loader2 className="w-5 h-5 text-emerald-400 absolute animate-pulse" />
        </div>
        <p className="mt-4 text-xs font-mono uppercase tracking-widest text-zinc-400">
          Decrypting Security Session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page and preserve attempted route
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
