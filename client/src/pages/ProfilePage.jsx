// client/src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { apiService } from '../services/api.js';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [department, setDepartment] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [salary, setSalary] = useState('');
  
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const data = await apiService.getProfile(user.id);
      setProfile(data);
      setPhone(data.phone || '');
      setAddress(data.address || '');
      setDepartment(data.department || '');
      setJobTitle(data.jobTitle || '');
      setSalary(data.salary || '');
    } catch (err) {
      console.error('Failed to load profile details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const isAdmin = user?.role === 'admin';
      const updatedData = isAdmin
        ? { phone, address, department, jobTitle, salary: parseFloat(salary) }
        : { phone, address }; // Employees can only edit phone/address
        
      const result = await apiService.updateProfile(user.id, updatedData);
      setProfile(result);
      
      // Update global user state in AuthContext too
      setUser(result);
      
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Failed to save profile: ' + err.message);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(val || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20 text-primary font-bold">
        <span className="material-symbols-outlined animate-spin text-4xl">sync</span>
      </div>
    );
  }

  const basicSalary = profile?.salary || 8450;
  const allowances = basicSalary * 0.12;
  const deductions = basicSalary * 0.08;
  const netSalary = basicSalary + allowances - deductions;

  return (
    <main className="p-8 max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-12 gap-gutter">
        
        {/* Left Column (Details Snap) */}
        <section className="col-span-12 lg:col-span-4 space-y-gutter">
          <div className="glass p-8 rounded-lg text-center flex flex-col items-center border border-white/30">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg mb-6">
              <img className="w-full h-full object-cover" src={profile?.avatar} alt={profile?.name} />
            </div>
            
            <h2 className="font-bold text-headline-md text-on-background">{profile?.name}</h2>
            <p className="text-label-md text-on-surface-variant font-medium mt-1 uppercase tracking-wider">
              {profile?.jobTitle}
            </p>
            <div className="mt-4 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-label-sm font-bold border border-primary/20 capitalize">
              {profile?.role} Mode
            </div>

            <div className="w-full border-t border-white/20 my-6"></div>

            <div className="w-full text-left space-y-4 text-body-md font-medium text-on-surface-variant">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px] text-outline">mail</span>
                <span className="truncate">{profile?.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px] text-outline">call</span>
                <span>{profile?.phone || 'Not provided'}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[20px] text-outline">location_on</span>
                <span className="truncate">{profile?.address || 'Not provided'}</span>
              </div>
            </div>
          </div>

          {/* Quick Documents Card */}
          <div className="glass p-8 rounded-lg border border-white/30">
            <h3 className="font-headline-md text-headline-md mb-6">Employee Documents</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/30 border border-white/20 hover:bg-white/50 transition-all">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[24px] text-primary">picture_as_pdf</span>
                  <div>
                    <div className="font-bold text-body-md text-on-background">Resume.pdf</div>
                    <div className="text-label-sm text-outline">1.2 MB</div>
                  </div>
                </div>
                <button className="p-2 text-outline hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">download</span>
                </button>
              </div>

              <div className="flex items-center justify-between p-4 rounded-2xl bg-white/30 border border-white/20 hover:bg-white/50 transition-all">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[24px] text-primary">picture_as_pdf</span>
                  <div>
                    <div className="font-bold text-body-md text-on-background">Employment_Contract.pdf</div>
                    <div className="text-label-sm text-outline">2.4 MB</div>
                  </div>
                </div>
                <button className="p-2 text-outline hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[20px]">download</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column (Edit Form) */}
        <section className="col-span-12 lg:col-span-8 space-y-gutter">
          <div className="glass p-8 rounded-lg border border-white/30">
            <h3 className="font-headline-md text-headline-md mb-6 text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-[24px]">manage_accounts</span>
              Edit Profile Details
            </h3>

            {message && (
              <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-2xl text-primary text-body-md font-medium">
                {message}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
              {/* Personal Details */}
              <div className="space-y-4">
                <h4 className="text-label-md text-outline uppercase font-bold tracking-wider">Personal Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-2 font-medium">Full Name</label>
                    <input
                      type="text"
                      disabled
                      value={profile?.name}
                      className="w-full bg-white/10 border border-white/20 rounded-2xl py-3 px-4 text-body-md outline-none cursor-not-allowed opacity-70"
                    />
                  </div>
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-2 font-medium">Email Address</label>
                    <input
                      type="email"
                      disabled
                      value={profile?.email}
                      className="w-full bg-white/10 border border-white/20 rounded-2xl py-3 px-4 text-body-md outline-none cursor-not-allowed opacity-70"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-2 font-medium">Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="w-full bg-white/20 border border-white/30 focus:border-primary rounded-2xl py-3 px-4 text-body-md outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-2 font-medium">Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="123 Street Rd, City, State"
                      className="w-full bg-white/20 border border-white/30 focus:border-primary rounded-2xl py-3 px-4 text-body-md outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Job Details */}
              <div className="space-y-4 pt-6 border-t border-white/10">
                <h4 className="text-label-md text-outline uppercase font-bold tracking-wider">Employment Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-2 font-medium">Employee ID</label>
                    <input
                      type="text"
                      disabled
                      value={profile?.employeeId}
                      className="w-full bg-white/10 border border-white/20 rounded-2xl py-3 px-4 text-body-md outline-none cursor-not-allowed opacity-70"
                    />
                  </div>
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-2 font-medium">Department</label>
                    <input
                      type="text"
                      disabled={user?.role !== 'admin'}
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className={`w-full border rounded-2xl py-3 px-4 text-body-md outline-none transition-all ${
                        user?.role === 'admin' 
                          ? 'bg-white/20 border-white/30 focus:border-primary' 
                          : 'bg-white/10 border-white/20 cursor-not-allowed opacity-70'
                      }`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-2 font-medium">Job Title</label>
                    <input
                      type="text"
                      disabled={user?.role !== 'admin'}
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className={`w-full border rounded-2xl py-3 px-4 text-body-md outline-none transition-all ${
                        user?.role === 'admin' 
                          ? 'bg-white/20 border-white/30 focus:border-primary' 
                          : 'bg-white/10 border-white/20 cursor-not-allowed opacity-70'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-2 font-medium">Current Status</label>
                    <input
                      type="text"
                      disabled
                      value={profile?.status}
                      className="w-full bg-white/10 border border-white/20 rounded-2xl py-3 px-4 text-body-md outline-none cursor-not-allowed opacity-70 capitalize"
                    />
                  </div>
                </div>
              </div>

              {/* Salary Snapshot */}
              <div className="space-y-4 pt-6 border-t border-white/10">
                <h4 className="text-label-md text-outline uppercase font-bold tracking-wider">Compensation Snapshot</h4>
                
                {user?.role === 'admin' ? (
                  <div>
                    <label className="block text-label-md text-on-surface-variant mb-2 font-medium">Base Salary (Admin Edit)</label>
                    <input
                      type="number"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      className="w-full bg-white/20 border border-white/30 focus:border-primary rounded-2xl py-3 px-4 text-body-md outline-none transition-all"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter text-center">
                    <div className="p-4 bg-white/20 border border-white/20 rounded-2xl">
                      <div className="text-[10px] text-outline font-bold uppercase tracking-wide">Base Salary</div>
                      <div className="font-bold text-body-md text-primary mt-1">{formatCurrency(basicSalary)}</div>
                    </div>
                    <div className="p-4 bg-white/20 border border-white/20 rounded-2xl">
                      <div className="text-[10px] text-outline font-bold uppercase tracking-wide">Allowances</div>
                      <div className="font-bold text-body-md text-green-600 mt-1">{formatCurrency(allowances)}</div>
                    </div>
                    <div className="p-4 bg-white/20 border border-white/20 rounded-2xl">
                      <div className="text-[10px] text-outline font-bold uppercase tracking-wide">Deductions</div>
                      <div className="font-bold text-body-md text-red-600 mt-1">{formatCurrency(deductions)}</div>
                    </div>
                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl">
                      <div className="text-[10px] text-outline font-bold uppercase tracking-wide">Net Monthly</div>
                      <div className="font-bold text-body-md text-primary mt-1">{formatCurrency(netSalary)}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  className="px-8 py-3.5 ios-gradient-primary text-white rounded-full font-label-md text-label-md shadow-lg shadow-primary/20 hover:brightness-110 transition-all font-bold active:scale-95"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </section>

      </div>
    </main>
  );
}
