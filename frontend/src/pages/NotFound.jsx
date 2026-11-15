import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Home, ArrowLeft } from 'lucide-react';

const NotFound = () => (
  <div className="min-h-[70vh] flex items-center justify-center">
    <div className="text-center">
      <div className="relative inline-block mb-6">
        <p className="pixel-heading text-[8rem] text-cyber-purple/20 leading-none select-none">404</p>
        <div className="absolute inset-0 flex items-center justify-center">
          <Zap className="w-16 h-16 text-cyber-purple text-glow-purple animate-pulse" />
        </div>
      </div>
      <h1 className="text-3xl font-black text-cyber-text mb-3">Page Not Found</h1>
      <p className="text-cyber-muted text-sm mb-8 max-w-sm mx-auto">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex flex-wrap gap-4 justify-center">
        <Link to="/" className="cyber-btn-primary text-sm px-6 py-2.5">
          <Home className="w-4 h-4" /> Go Home
        </Link>
        <Link to="/tournaments" className="cyber-btn-outline text-sm px-6 py-2.5">
          Browse Tournaments
        </Link>
      </div>
    </div>
  </div>
);

export default NotFound;
