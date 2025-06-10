import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase, getCurrentPlayer } from './lib/supabase';
import { LoginForm } from './components/LoginForm';
import { GamePage } from './pages/GamePage';
import { LoadingScreen } from './components/LoadingScreen';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          setIsAuthenticated(true);
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkAuth = async () => {
    try {
      const player = await getCurrentPlayer();
      setIsAuthenticated(!!player);
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={
              isAuthenticated ? (
                <Navigate to="/game\" replace />
              ) : (
                <LoginForm onLogin={handleLogin} />
              )
            } 
          />
          <Route 
            path="/game" 
            element={
              isAuthenticated ? (
                <GamePage />
              ) : (
                <Navigate to="/\" replace />
              )
            } 
          />
          <Route path="*" element={<Navigate to="/\" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;