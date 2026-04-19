// src/services/api.js
import { mockStudentLogin, mockAdminLogin } from "./mockApi";

const USE_MOCK = true;  // Set to false when backend is fixed
const API_BASE_URL = "https://student-portal-backend-x6w.onrender.com";

// ========== ADMIN ==========
export async function adminLogin(username, password) {
  if (USE_MOCK) {
    console.log("Using mock admin login");
    return mockAdminLogin(username, password);
  }

  // Real backend call (only when USE_MOCK = false)
  const response = await fetch(`${API_BASE_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Admin login failed");
  return {
    role: data.role,
    route: data.route,
    title: data.title,
    token: data.token,
  };
}

// ========== STUDENT ==========
export async function studentLogin(username, password, matricNo) {
  if (USE_MOCK) {
    console.log("Using mock student login");
    return mockStudentLogin(username, password, matricNo);
  }

  const response = await fetch(`${API_BASE_URL}/api/student/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, matricNo }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Login failed");
  return {
    user: data.user,
    token: data.token,
  };
}

// Student registration (only if needed later)
export async function studentRegister(fullName, phone, username, department) {
  const response = await fetch(`${API_BASE_URL}/api/student/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullName, phone, username, department }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Registration failed");
  return data;
}