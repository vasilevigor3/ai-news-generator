import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NewsForm from './NewsForm';
import LoginPage from './LoginPage';
import axios from 'axios';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Initially null to indicate loading.
  const path = "http://localhost:5000";
  // const path = "https://content-helper-f8fjehc2c4asgua8.canadacentral-01.azurewebsites.net";

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      axios.get(`${path}/auth/status`, {
        headers: { 'Authorization': `Bearer ${token}` },
      })
        .then(response => {
          setIsAuthenticated(response.data.logged_in); // Set authentication status
        })
        .catch(error => {
          console.error("Error fetching auth status", error);
          setIsAuthenticated(false); // If error, set as unauthenticated
        });
    } else {
      setIsAuthenticated(false); // No token, not authenticated
    }
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>; // Show loading screen while checking auth status
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={isAuthenticated ? <NewsForm /> : <Navigate to="/login" />}
        />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </Router>
  );
}

export default App;
