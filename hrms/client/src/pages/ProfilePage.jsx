import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

const EMPTY = {
  first_name: "",
  last_name: "",
  phone: "",
  address: "",
  department: "",
  job_title: "",
  date_of_joining: "",
};

export default function ProfilePage() {
  const { user, isAdmin } = useAuth();
  const params = useParams();
  const targetId = params.id ? Number(params.id) : user.id;

  const [profile, setProfile] = useState(null);
  const [allProfiles, setAllProfiles] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isAdmin && !params.id) {
      api.getAllProfiles().then(({ profiles }) => setAllProfiles(profiles)).catch((e) => setError(e.message));
    } else {
      loadProfile(targetId);
    }
  }, [targetId, isAdmin, params.id]);

  function loadProfile(id) {
    api
      .getProfile(id)
      .then(({ profile }) => {
        setProfile(profile);
        setForm({
          first_name: profile.first_name || "",
          last_name: profile.last_name || "",
          phone: profile.phone || "",
          address: profile.address || "",
          department: profile.department || "",
          job_title: profile.job_title || "",
          date_of_joining: profile.date_of_joining || "",
        });
      })
      .catch((e) => setError(e.message));
  }

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSave(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const { profile: updated } = await api.updateProfile(targetId, form);
      setProfile(updated);
      setEditing(false);
      setSuccess("Profile updated.");
    } catch (err) {
      setError(err.message);
    }
  }

  // Admin viewing the employee list (no specific id in URL)
  if (isAdmin && !params.id && !profile) {
    return (
      <div>
        <h1 className="page-title">Employees</h1>
        {error && <div className="alert alert--error">{error}</div>}
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Department</th>
              <th>Job Title</th>
              <th>Email</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {allProfiles.map((p) => (
              <tr key={p.user_id}>
                <td>{p.employee_id}</td>
                <td>{p.first_name} {p.last_name}</td>
                <td>{p.department || "—"}</td>
                <td>{p.job_title || "—"}</td>
                <td>{p.email}</td>
                <td>
                  <a className="link" href={`/profile/${p.user_id}`}>View / Edit</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!profile) return <div className="page-loading">Loading...</div>;

  return (
    <div>
      <h1 className="page-title">{editing ? "Edit Profile" : "Profile"}</h1>
      {error && <div className="alert alert--error">{error}</div>}
      {success && <div className="alert alert--success">{success}</div>}

      {!editing ? (
        <div className="panel">
          <dl className="detail-list">
            <div><dt>Employee ID</dt><dd>{profile.employee_id}</dd></div>
            <div><dt>Name</dt><dd>{profile.first_name} {profile.last_name}</dd></div>
            <div><dt>Email</dt><dd>{profile.email}</dd></div>
            <div><dt>Phone</dt><dd>{profile.phone || "—"}</dd></div>
            <div><dt>Address</dt><dd>{profile.address || "—"}</dd></div>
            <div><dt>Department</dt><dd>{profile.department || "—"}</dd></div>
            <div><dt>Job Title</dt><dd>{profile.job_title || "—"}</dd></div>
            <div><dt>Date of Joining</dt><dd>{profile.date_of_joining || "—"}</dd></div>
          </dl>
          <button className="btn btn--primary" onClick={() => setEditing(true)}>Edit</button>
        </div>
      ) : (
        <form className="panel" onSubmit={handleSave}>
          <div className="field-row">
            <label className="field">
              <span className="field__label">First name</span>
              <input value={form.first_name} onChange={update("first_name")} />
            </label>
            <label className="field">
              <span className="field__label">Last name</span>
              <input value={form.last_name} onChange={update("last_name")} />
            </label>
          </div>
          <label className="field">
            <span className="field__label">Phone</span>
            <input value={form.phone} onChange={update("phone")} />
          </label>
          <label className="field">
            <span className="field__label">Address</span>
            <input value={form.address} onChange={update("address")} />
          </label>

          {isAdmin && (
            <>
              <div className="field-row">
                <label className="field">
                  <span className="field__label">Department</span>
                  <input value={form.department} onChange={update("department")} />
                </label>
                <label className="field">
                  <span className="field__label">Job Title</span>
                  <input value={form.job_title} onChange={update("job_title")} />
                </label>
              </div>
              <label className="field">
                <span className="field__label">Date of Joining</span>
                <input type="date" value={form.date_of_joining || ""} onChange={update("date_of_joining")} />
              </label>
            </>
          )}

          <div className="btn-row">
            <button className="btn btn--primary" type="submit">Save</button>
            <button className="btn btn--ghost" type="button" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}
