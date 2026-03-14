import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  // Set default axios header
  if (token) {
    axios.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete axios.defaults.headers.common['x-auth-token'];
  }

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        // Auto-login a guest user
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', { email: 'guest@vibestream.com', password: 'guestpassword' }).catch(() => null);
        if (loginRes && loginRes.data.token) {
           const newToken = loginRes.data.token;
           setToken(newToken);
           localStorage.setItem('token', newToken);
           axios.defaults.headers.common['x-auth-token'] = newToken;
        } else {
           const regRes = await axios.post('http://localhost:5000/api/auth/register', { username: 'Guest', email: 'guest@vibestream.com', password: 'guestpassword' }).catch(() => null);
           if (regRes && regRes.data.token) {
              const newToken = regRes.data.token;
              setToken(newToken);
              localStorage.setItem('token', newToken);
              axios.defaults.headers.common['x-auth-token'] = newToken;
           }
        }
        setLoading(false);
        // Force reload library
        window.location.reload();
        return;
      }
      try {
        const res = await axios.get('http://localhost:5000/api/auth/me');
        setUser(res.data);
      } catch (err) {
        console.error(err);
        setToken('');
        localStorage.removeItem('token');
        setUser(null);
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.msg || 'Login failed' };
    }
  };

  const register = async (username, email, password) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', { username, email, password });
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.msg || 'Registration failed' };
    }
  };

  const logout = () => {
    setToken('');
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
