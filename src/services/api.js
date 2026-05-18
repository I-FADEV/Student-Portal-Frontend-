// src/services/api.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Maps backend adminType values to frontend role/route/title
const ADMIN_TYPE_MAP = {
  general_admin: { role: "ga", route: "/admin/ga", title: "General Admin" },
  finance_admin: { role: "bursar", route: "/admin/bursar", title: "Bursar Admin" },
  timetable_admin: { role: "timetable", route: "/admin/timetable", title: "Timetable Admin" },
  idcard_admin: { role: "tac", route: "/admin/tac", title: "TAC Admin" },
};

function getErrorMessage(data, fallback) {
  if (data.message && !data.token) return data.message;
  if (data.error) return data.error;
  if (Array.isArray(data.errors)) return data.errors.join(", ");
  return fallback;
}

function decodeJwtPayload(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(atob(base64));
}

// ========== ADMIN ==========
export async function adminLogin(username, password) {
  const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(getErrorMessage(data, "Admin login failed"));

  const token = data.token;
  const payload = decodeJwtPayload(token);
  const adminInfo = ADMIN_TYPE_MAP[payload.adminType] || {
    role: payload.adminType,
    route: "/admin/login",
    title: payload.adminType,
  };

  return {
    role: adminInfo.role,
    route: adminInfo.route,
    title: adminInfo.title,
    token,
  };
}

// ========== STUDENT ==========
export async function studentLogin(matricNumber, password) {
  const response = await fetch(`${API_BASE_URL}/auth/student/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ matricNumber, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(getErrorMessage(data, "Login failed"));

  const token = data.token;
  const payload = decodeJwtPayload(token);

  return {
    user: { userId: payload.userId, role: payload.role },
    token,
  };
}

export async function studentRegister(fullName, phone, username, department) {
  const response = await fetch(`${API_BASE_URL}/auth/student/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullName, phone, username, department }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(getErrorMessage(data, "Registration failed"));
  return data;
}