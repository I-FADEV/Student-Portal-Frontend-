// src/services/mockApi.js

export async function mockStudentLogin(username, password, matricNo) {
  console.log("Mock login:", { username, password, matricNo });
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Accept any credentials – you can add validation if needed
  return {
    user: {
      name: username,
      role: "student",
      matricNo: matricNo,
      department: "Computer Science",
    },
    token: "mock-student-token-123",
  };
}

export async function mockAdminLogin(username, password) {
  console.log("Mock admin login:", { username, password });
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const validAdmins = [
    { username: "ga", password: "ga123", role: "ga", route: "/admin/ga", title: "General Admin" },
    { username: "tac", password: "tac123", role: "tac", route: "/admin/tac", title: "TAC Admin" },
    { username: "bursar", password: "bursar123", role: "bursar", route: "/admin/bursar", title: "Bursar Admin" },
    { username: "timetable", password: "timetable123", role: "timetable", route: "/admin/timetable", title: "Timetable Admin" },
  ];
  
  const match = validAdmins.find(a => a.username === username && a.password === password);
  if (!match) throw new Error("Invalid admin credentials");
  
  return {
    role: match.role,
    route: match.route,
    title: match.title,
    token: "mock-admin-token-456",
  };
}