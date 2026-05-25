// src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ADMIN_TYPE_MAP = {
  general_admin:    { role: "ga",        route: "/admin/ga",        title: "General Admin" },
  finance_admin:    { role: "bursar",    route: "/admin/bursar",    title: "Bursar Admin" },
  timetable_admin:  { role: "timetable", route: "/admin/timetable", title: "Timetable Admin" },
  idcard_admin:     { role: "tac",       route: "/admin/tac",       title: "TAC Admin" },
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

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` };
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
  return { role: adminInfo.role, route: adminInfo.route, title: adminInfo.title, token };
}

// ========== STUDENT AUTH ==========
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
  return { user: { userId: payload.userId, role: payload.role }, token };
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

// ========== STUDENT PROFILE ==========
// Server: app.use("/profile", profileRoutes) + router.get("/", ...)
export async function getStudentProfile(token) {
  const response = await fetch(`${API_BASE_URL}/profile`, {
    headers: authHeaders(token),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(getErrorMessage(data, "Failed to fetch profile"));
  return data;
}

// ========== STUDENT ID CARD ==========
// Server: app.use("/idcard/", idCardRoutes) + router.get("/view", ...)
export async function getStudentIDCard(token) {
  const response = await fetch(`${API_BASE_URL}/idcard/view`, {
    headers: authHeaders(token),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(getErrorMessage(data, "Failed to fetch ID card"));
  return data;
}

// Server: router.post("/create", upload.single("photoURL"), ...)
// NOTE: multer field name is "photoURL" — must match exactly
export async function submitIDCard(formData, token) {
  const response = await fetch(`${API_BASE_URL}/idcard/create`, {
    method: "POST",
    headers: authHeaders(token), // No Content-Type — browser sets multipart boundary
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(getErrorMessage(data, "Failed to submit ID card"));
  return data;
}

// ========== STUDENT FINANCE ==========
// Server: app.use("/finance", financeRoutes) + router.get("/view", ...)
export async function getStudentFinances(token) {
  const response = await fetch(`${API_BASE_URL}/finance/view`, {
    headers: authHeaders(token),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(getErrorMessage(data, "Failed to fetch finances"));
  return data;
}

// ========== STUDENT TIMETABLE ==========
// Server: app.use("/timetable", timetableRoutes) + router.get("/view", ...)
export async function getStudentTimetable(token) {
  const response = await fetch(`${API_BASE_URL}/timetable/view`, {
    headers: authHeaders(token),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(getErrorMessage(data, "Failed to fetch timetable"));
  return data;
}

// ========== STUDENT COURSES ==========
// Server: app.use("/courses", courseRoutes) + router.get("/view", ...)
export async function getStudentCourses(token) {
  const response = await fetch(`${API_BASE_URL}/courses/view`, {
    headers: authHeaders(token),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(getErrorMessage(data, "Failed to fetch courses"));
  return data;
}

// ========== STUDENT RESULTS ==========
// Server: app.use("/results", resultRoutes) + router.get("/view", ...)
export async function getStudentResults(token) {
  const response = await fetch(`${API_BASE_URL}/results/view`, {
    headers: authHeaders(token),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(getErrorMessage(data, "Failed to fetch results"));
  return data;
}

// ========== HELPERS ==========
// Since multer stores files locally, photoURL in DB is just the filename.
// Use this helper anywhere you display a student's passport photo.
export function getPhotoURL(filename) {
  if (!filename) return null;
  // If it's already a full URL (http/https), return as-is
  if (filename.startsWith("http")) return filename;
  return `${API_BASE_URL}/uploads/${filename}`;
}