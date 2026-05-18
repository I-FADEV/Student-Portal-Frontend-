// src/services/api.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ========== ADMIN ==========
export async function adminLogin(username, password) {
  const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Admin login failed");
  // Adjust mapping based on actual backend response
  return {
    role: data.role,
    route: data.route,
    title: data.title,
    token: data.token,
  };
}

// ========== STUDENT ==========
export async function studentLogin(username, password, matricNo) {
  const response = await fetch(`${API_BASE_URL}/auth/student/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, matricNo }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Login failed");
  // Expecting { user: { ... }, token: "..." }
  // Adjust if your backend returns different property names
  return {
    user: data.user,
    token: data.token,
  };
}

export async function studentRegister(fullName, phone, username, department) {
  const response = await fetch(`${API_BASE_URL}/auth/student/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullName, phone, username, department }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Registration failed");
  return data; // e.g., { message: "Registration successful" }
}