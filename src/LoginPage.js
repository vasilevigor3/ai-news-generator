// src/LoginPage.js
import React, { useState } from 'react';
import axios from 'axios';

function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  // const path = "http://localhost:5000";
  const path = "https://content-helper-f8fjehc2c4asgua8.canadacentral-01.azurewebsites.net";

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(path + '/auth/login', {
        username,
        password
      });
      localStorage.setItem('auth_token', response.data.token); // Save token
      window.location.href = '/'; // Redirect to home page after login
    } catch (error) {
      console.error('Error during login:', error);
    }
  };


  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${path}/auth/register`, {
        username,
        password,
        email
      });
      localStorage.setItem('auth_token', response.data.token); // Store token
      window.location.href = '/'; // Redirect to home page
    } catch (error) {
      console.error('Error during registration:', error);
    }
  };

  return (
    <div style={styles.container}>
      <h2>{isRegister ? 'Register' : 'Login'}</h2>
      {error && <p style={styles.error}>{error}</p>}
      <form onSubmit={isRegister ? handleRegister : handleLogin} style={styles.form}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
          required
        />
        {isRegister && (
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
        )}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />
        <button type="submit" style={styles.button}>
          {isRegister ? 'Register' : 'Log In'}
        </button>
      </form>
      <button onClick={() => setIsRegister(!isRegister)} style={styles.toggleButton}>
        {isRegister ? 'Already have an account? Log In' : 'Need an account? Register'}
      </button>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '100px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    width: '300px',
  },
  input: {
    marginBottom: '15px',
    padding: '10px',
    fontSize: '16px',
  },
  button: {
    padding: '10px',
    fontSize: '16px',
    cursor: 'pointer',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
  },
  toggleButton: {
    marginTop: '15px',
    cursor: 'pointer',
    color: '#007bff',
    background: 'none',
    border: 'none',
    textDecoration: 'underline',
  },
  error: {
    color: 'red',
    marginBottom: '15px',
  }
};

export default LoginPage;
