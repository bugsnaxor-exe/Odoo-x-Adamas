const BASE_URL = "/api";

function getToken() {
  return localStorage.getItem("hrms_token");
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  signup: (payload) => request("/auth/signup", { method: "POST", body: payload, auth: false }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload, auth: false }),
  me: () => request("/auth/me"),

  getProfile: (id) => request(`/profile/${id}`),
  getAllProfiles: () => request("/profile/all"),
  updateProfile: (id, payload) => request(`/profile/${id}`, { method: "PUT", body: payload }),

  checkIn: () => request("/attendance/check-in", { method: "POST" }),
  checkOut: () => request("/attendance/check-out", { method: "POST" }),
  myAttendance: () => request("/attendance/my"),
  allAttendance: () => request("/attendance/all"),
  dailyAttendance: (date) => request(`/attendance/daily?date=${date}`),
  weeklyAttendance: (week) => request(`/attendance/weekly?week=${week}`),

  applyLeave: (payload) => request("/leave/apply", { method: "POST", body: payload }),
  myLeave: () => request("/leave/my"),
  allLeave: (status) => request(`/leave/all${status ? `?status=${status}` : ""}`),
  reviewLeave: (id, payload) => request(`/leave/${id}/review`, { method: "PUT", body: payload }),

  myPayroll: () => request("/payroll/my"),
  allPayroll: () => request("/payroll/all"),
  updatePayroll: (userId, payload) => request(`/payroll/${userId}`, { method: "PUT", body: payload }),
};

export { getToken };
