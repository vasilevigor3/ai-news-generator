// src/App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import NewsForm from './NewsForm';
import LoginPage from './LoginPage';
import axios from 'axios';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // Изначально `null` для индикации загрузки
  const path = "http://localhost:5000";
  // const path = "https://content-helper-f8fjehc2c4asgua8.canadacentral-01.azurewebsites.net";

  useEffect(() => {
    // Проверка статуса аутентификации при монтировании компонента
    axios.get(`${path}/auth/status`, { withCredentials: true })
      .then(response => {
        console.log(response.data);
        setIsAuthenticated(response.data.logged_in); // Установка статуса аутентификации
      })
      .catch(error => {
        console.error("Error fetching auth status", error);
        setIsAuthenticated(false); // Если ошибка, установим как неавторизованного пользователя
      });
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>; // Показываем экран загрузки, пока идет проверка
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
