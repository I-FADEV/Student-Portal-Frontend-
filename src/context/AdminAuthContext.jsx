import { createContext, useContext, useState } from 'react';

const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {

  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem('adminUser');
    return saved ? JSON.parse(saved) : null;
  });
  const [adminToken, setAdminToken] = useState(() => {
    return localStorage.getItem('adminToken') || null;
  });
  const login = (userData, userToken) => {
    setAdminUser(userData);
    setAdminToken(userToken);
    localStorage.setItem('adminToken', userToken);
    localStorage.setItem('adminUser', JSON.stringify(userData));
  };
  const logout = () => {
    setAdminUser(null);
    setAdminToken(null);
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
  };
  const isAuthenticated = !!adminToken;
  return (
    <AdminAuthContext.Provider value={{ adminUser, adminToken, login, logout, isAuthenticated }}>
      {children}
    </AdminAuthContext.Provider>
  );
}
export function useAdminAuth() {
  return useContext(AdminAuthContext);
}