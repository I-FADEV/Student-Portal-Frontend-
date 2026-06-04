// src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ADMIN_TYPE_MAP = {
  general_admin:    { role: "ga",        route: "/admin/ga",        title: "General Admin" },
  finance_admin:    { role: "bursar",    route: "/admin/bursar",    title: "Finance Admin" },
  timetable_admin:  { role: "timetable", route: "/admin/timetable", title: "Timetable Admin" },
  idcard_admin:     { role: "tac",       route: "/admin/tac",       title: "Idcard Admin" },
  registry_admin:   { role: 'registry', route: '/admin/registry', title: 'Registry Admin'   },
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

// ========== ADMIN MANAGEMENT (GA only) ==========

export async function createAdmin({ username, adminType, password }, token) {
  const response = await fetch(`${API_BASE_URL}/auth/admin/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ username, adminType, password,confirmPassword: password }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to create admin'))
  return data
}

export async function getAllAdmins(token) {
  const response = await fetch(`${API_BASE_URL}/admin/all`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await response.json()
  if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to fetch admins'))
  return Array.isArray(data)       ? data       :
         Array.isArray(data.data)   ? data.data   :
         Array.isArray(data.admins) ? data.admins :
         []
}

export async function getActivityLogs(token, { limit } = {}) {
  const params = limit ? `?limit=${limit}` : ''
  const response = await fetch(`${API_BASE_URL}/admin/logs${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await response.json()
  if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to fetch logs'))
  return data
}

export async function deleteAdmin(adminId, token) {
  const response = await fetch(`${API_BASE_URL}/admin/delete/${adminId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  const data = await response.json()
  if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to delete admin'))
  return data
}

// ========== REGISTRY ADMIN ==========
 
export async function getRegistryStats(token) {
  const response = await fetch(`${API_BASE_URL}/registry/stats`, {
    headers: authHeaders(token),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to fetch registry stats'))
  return data
}
 
// ── Faculties ──────────────────────────────────────────────────────────────────
 
export async function getFaculties(token) {
  const response = await fetch(`${API_BASE_URL}/registry/faculties`, {
    headers: authHeaders(token),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to fetch faculties'))
  return data
}
 
export async function createFaculty({ name }, token) {
  const response = await fetch(`${API_BASE_URL}/registry/faculties`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ name }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to create faculty'))
  return data
}
 
export async function deleteFaculty(id, token) {
  const response = await fetch(`${API_BASE_URL}/registry/faculties/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to delete faculty'))
  return data
}
 
// ── Departments ────────────────────────────────────────────────────────────────
 
export async function getDepartments(token) {
  const response = await fetch(`${API_BASE_URL}/registry/departments`, {
    headers: authHeaders(token),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to fetch departments'))
  return data
}
 
export async function createDepartment({ name, facultyId, minLevel, maxLevel, abbreviation }, token) {
  const response = await fetch(`${API_BASE_URL}/registry/departments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ name, facultyId, minLevel, maxLevel, abbreviation }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to create department'))
  return data
}
 
export async function updateDepartment(id, { name, facultyId, minLevel, maxLevel, abbreviation }, token) {
  const response = await fetch(`${API_BASE_URL}/registry/departments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ name, facultyId, minLevel, maxLevel, abbreviation }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to update department'))
  return data
}
 
export async function deleteDepartment(id, token) {
  const response = await fetch(`${API_BASE_URL}/registry/departments/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to delete department'))
  return data
}

// ── MATRIC NUMBER GENERATION ─────────────────────────────────────────────────────

export async function getMatricCounter(level, token) {
  const params = new URLSearchParams({ level: level.toString() })
  const response = await fetch(`${API_BASE_URL}/matric/counter?${params}`, {
    headers: authHeaders(token),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to fetch matric counter'))
  return data
}

export async function generateMatricNumber({ departmentId, level, isTransfer, manualCounter }, token) {
  const response = await fetch(`${API_BASE_URL}/matric/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ departmentId, level, isTransfer: isTransfer || false, manualCounter: manualCounter || null }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to generate matric number'))
  return data
}

export async function getMatricStats(token) {
  const response = await fetch(`${API_BASE_URL}/matric/stats`, {
    headers: authHeaders(token),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to fetch matric stats'))
  return data
}


// ========== FINANCE — STATS ==========
// Backend needs: GET /finance/stats (admin only)
// Returns: { totalStudents, totalFeesCreated, totalCollected, totalOutstanding }
export async function getFinanceStats(token) {
  const response = await fetch(`${API_BASE_URL}/finance/stats`, {
    headers: authHeaders(token),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to fetch stats'))
  return data
}
// ========== FINANCE — RECENT RECORDS ==========
// Backend needs: GET /finance/adminView?limit=6 (admin only, newest first)
export async function getFinanceRecentRecords(token) {
  const response = await fetch(`${API_BASE_URL}/finance/adminView?limit=6`, {
    headers: authHeaders(token),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to fetch recent records'))
  return data
}
// ========== FINANCE — ALL RECORDS (with optional filters) ==========
// Backend needs: GET /finance/adminView?session=&semester=&status= (admin only)
export async function getAllFinanceRecords({ session, semester, status } = {}, token) {
  const params = new URLSearchParams()
  if (session)  params.append('session',  session)
  if (semester) params.append('semester', semester)
  if (status)   params.append('status',   status)
 
  const response = await fetch(`${API_BASE_URL}/finance/adminView?${params.toString()}`, {
    headers: authHeaders(token),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to fetch records'))
  return data
}
// ========== FINANCE — CREATE FINANCE RECORD ==========
// POST /finance/create
// Body: { studentId, session, semester, items: [{ label, amount }] }
export async function createFinanceRecord({ studentId, session, semester, items }, token) {
  const response = await fetch(`${API_BASE_URL}/finance/create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ studentId, session, semester, items }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to create finance record'))
  return data
}
// ========== FINANCE — RECORD PAYMENT ==========
// POST /finance/pay/:id
// Body: { payments: [{ itemLabel, amountPaid }] }
export async function recordFinancePayment(financeId, { payments }, token) {
  const response = await fetch(`${API_BASE_URL}/finance/pay/${financeId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ payments }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to record payment'))
  return data
}

// ========== FINANCE — CREATE BULK FINANCE RECORDS ==========
// POST /finance/bulk
// Body: { session, semester, items: [{ studentId, label, amount }] }
export const createFinanceBulk = async (payload, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/finance/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(token),
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(getErrorMessage(data, 'Failed to create bulk finance records'))
    }

    return data
  } catch (err) {
    throw new Error(err.message || 'Something went wrong')
  }
}
// ========== ADMIN — GET STUDENTS BY FILTER ==========
// GET /auth/student/filter?department=&level=&faculty=
export async function getStudentsByFilter(params = {}, token) {
  const query = new URLSearchParams()

  if (params.department) query.append('department', params.department)
  if (params.level) query.append('level', params.level)
  if (params.faculty) query.append('faculty', params.faculty)

  const response = await fetch(
    `${API_BASE_URL}/auth/student/filter?${query.toString()}`,
    {
      headers: authHeaders(token),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(getErrorMessage(data, 'Failed to fetch students'))
  }

  return data
}
export async function addItemToFinanceRecord(financeId, item, token) {
  const response = await fetch(
    `${API_BASE_URL}/finance/${financeId}/add-item`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders(token),
      },
      body: JSON.stringify(item),
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(getErrorMessage(data, 'Failed to add item'))
  }

  return data
}


// ========== TAC ADMIN ==========

export async function getTACStats(token) {
  const response = await fetch(`${API_BASE_URL}/idcard/stats`, {
    headers: authHeaders(token),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to fetch stats'))
  return data
}

export async function getAllIdCards({ status, limit } = {}, token) {
  const params = new URLSearchParams()
  if (status) params.append('status', status)
  if (limit)  params.append('limit',  limit)
  const paramStr = params.toString() ? `?${params.toString()}` : ''
  const response = await fetch(`${API_BASE_URL}/idcard/admin${paramStr}`, {
    headers: authHeaders(token),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to fetch ID cards'))
  return data
}

export async function markIdCardCollected(idCardId, token) {
  const response = await fetch(`${API_BASE_URL}/idcard/${idCardId}/collect`, {
    method: 'PATCH',
    headers: authHeaders(token),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to mark as collected'))
  return data
}

export async function rejectIdCardAdmin(idCardId, reason, token) {
  const response = await fetch(`${API_BASE_URL}/idcard/${idCardId}/reject`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ reason }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to reject ID card'))
  return data
}

export async function registerStudentByAdmin(payload, token) {
  const response = await fetch(`${API_BASE_URL}/auth/student/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to register student'))
  return data
}

export async function getAllStudents(token, query = '') {
  const params = query ? `?query=${encodeURIComponent(query)}` : ''
  const response = await fetch(`${API_BASE_URL}/auth/students${params}`, {
    headers: authHeaders(token),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to fetch students'))
  return data
}

export async function resetStudentPassword({ studentId, newPassword }, token) {
  const response = await fetch(`${API_BASE_URL}/auth/student/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ studentId, newPassword }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to reset password'))
  return data
}

export async function deleteStudent(studentId, token) {
  const response = await fetch(`${API_BASE_URL}/auth/student/${studentId}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to delete student'))
  return data
}

export async function getAllFaculties(token) {
  return getFaculties(token)   // calls the existing function
}
 
export async function getAllDepartments(token) {
  return getDepartments(token) // calls the existing function
}
// ── TIMETABLE ADMIN — STATS ───────────────────────────────────────────────────
// GET /timetable/stats
// Returns: { totalCourses, totalSessions, totalResults, pendingClashes }
export async function getTimetableStats(token) {
  const response = await fetch(`${API_BASE_URL}/timetable/stats`, {
    headers: authHeaders(token),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to fetch timetable stats'))
  return data
}
 
// ── TIMETABLE COURSES (for generation stage) ─────────────────────────────────
// GET /timetable/courses?session=&semester=
export async function getTimetableCourses(session, semester, token) {
  const params = new URLSearchParams()
  if (session)  params.append('session',  session)
  if (semester) params.append('semester', semester)
  const response = await fetch(`${API_BASE_URL}/timetable/courses?${params}`, {
    headers: authHeaders(token),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to fetch courses'))
  return data
}
 
// POST /timetable/courses
// Body: { courseCode, courseName, lecturer, lecturerPhone, session, semester,
//         targets: [{ type, name, level }] }
export async function createTimetableCourse(courseData, token) {
  const response = await fetch(`${API_BASE_URL}/timetable/courses`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body:    JSON.stringify(courseData),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to create course'))
  return data?.data || data
}
 
// PUT /timetable/courses/:id
export async function updateTimetableCourse(id, courseData, token) {
  const response = await fetch(`${API_BASE_URL}/timetable/courses/${id}`, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body:    JSON.stringify(courseData),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to update course'))
  return data?.data || data
}
 
// DELETE /timetable/courses/:id
export async function deleteTimetableCourse(id, token) {
  const response = await fetch(`${API_BASE_URL}/timetable/courses/${id}`, {
    method:  'DELETE',
    headers: authHeaders(token),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to delete course'))
  return data
}
 
// ── TIMETABLE ENTRIES (published — what students see) ────────────────────────
 
// POST /timetable/save-bulk
// Body: array of expanded entries:
// [{ day, time, courseCode, courseName, lecturer, department, level, session, semester }]
export async function saveTimetableBulk(entries, token) {
  const response = await fetch(`${API_BASE_URL}/timetable/bulk`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body:    JSON.stringify({ entries }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to save timetable'))
  return data
}
 
// GET /timetable/admin?session=&semester=&department=&level=
export async function getAdminTimetable({ session, semester, department, level } = {}, token) {
  const params = new URLSearchParams()
  if (session)    params.append('session',    session)
  if (semester)   params.append('semester',   semester)
  if (department) params.append('department', department)
  if (level)      params.append('level',      level)
  const response = await fetch(`${API_BASE_URL}/timetable/admin?${params}`, {
    headers: authHeaders(token),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to fetch timetable'))
  return data
}
 
// PUT /timetable/:id
// Body: { day, time, lecturer }
export async function updateTimetableEntry(id, updates, token) {
  const response = await fetch(`${API_BASE_URL}/timetable/${id}`, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body:    JSON.stringify(updates),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to update entry'))
  return data?.data || data
}
 
// DELETE /timetable/:id
export async function deleteTimetableEntry(id, token) {
  const response = await fetch(`${API_BASE_URL}/timetable/${id}`, {
    method:  'DELETE',
    headers: authHeaders(token),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to delete entry'))
  return data
}
 
// ── RESULTS ──────────────────────────────────────────────────────────────────
 
// GET /results/course?courseCode=&session=&semester=
// Returns all students enrolled in that course + their existing results if any
export async function getResultsByCourse({ courseCode, session, semester }, token) {
  const params = new URLSearchParams({ courseCode, session, semester })
  const response = await fetch(`${API_BASE_URL}/results/admin-view?${params}`, {
    headers: authHeaders(token),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to fetch course results'))
  return data
}
 
// POST /results/bulk
// Body: [{ courseCode, session, semester, studentName, matricNumber, test, exam, total, grade }]
export async function saveResultsBulk(results, token) {
  const response = await fetch(`${API_BASE_URL}/results/bulk`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body:    JSON.stringify({ results }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to save results'))
  return data
}
 
// GET /results/student?query=&session=&semester=
export async function getResultsByStudent({ query, session, semester }, token) {
  const params = new URLSearchParams({ query, session, semester })
  const response = await fetch(`${API_BASE_URL}/results/student?${params}`, {
    headers: authHeaders(token),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to fetch student results'))
  return data
}
 
// PUT /results/:id
// Body: { test, exam, total, grade }
export async function updateResult(id, updates, token) {
  const response = await fetch(`${API_BASE_URL}/results/${id}`, {
    method:  'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body:    JSON.stringify(updates),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to update result'))
  return data?.data || data
}






























// ── Change Password (shared across all admin types) ───────────────────────────
 
export async function changeAdminPassword({ currentPassword, newPassword, confirmPassword }, token) {
  const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
    body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to change password'))
  return data
}
// ========== STUDENT SEARCH (shared — used by finance) ==========
// Backend needs: GET /auth/student/search?query=xxx
// Returns: [{ _id, matricNumber, name, department, level }]
export async function searchStudents(query, token) {
  const response = await fetch(`${API_BASE_URL}/auth/student/search?query=${encodeURIComponent(query)}`, {
    headers: authHeaders(token),
  })
  const data = await response.json()
  if (!response.ok) throw new Error(getErrorMessage(data, 'Failed to search students'))
  return data
}
// Aliases — pages import these names
export const getBursarStats         = getFinanceStats
export const getBursarRecentRecords = getFinanceRecentRecords
export const rejectIdCard           = rejectIdCardAdmin
export const registerStudent        = registerStudentByAdmin