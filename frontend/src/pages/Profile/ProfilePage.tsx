import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout, updateUser } from '../../store/authSlice';
import { showToast } from '../../store/toastSlice';
import { roleApi } from '../../services/roleApi';
import type { RoleRequestDto } from '../../services/roleApi';
import { createPortal } from 'react-dom';



interface ProfileData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  isVerified: boolean;
  avatarUrl: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  countryId: string | null;
  countryName: string | null;
  stateId: string | null;
  stateName: string | null;
  cityId: string | null;
  cityName: string | null;
  area: string | null;
  zipCode: string | null;
  language: string;
  timezone: string;
  assignedRoles?: string[];
  activeRole?: string;
}

interface Country { id: string; name: string; }
interface State { id: string; name: string; }
interface City { id: string; name: string; }

const ProfilePage: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [area, setArea] = useState('');
  const [language, setLanguage] = useState('en');
  const [timezone, setTimezone] = useState('UTC');

  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  const [countryId, setCountryId] = useState('');
  const [stateId, setStateId] = useState('');
  const [cityId, setCityId] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [roleRequests, setRoleRequests] = useState<RoleRequestDto[]>([]);
  const [requestReason, setRequestReason] = useState('');
  const [requestRole, setRequestRole] = useState<'Seller' | 'Agent' | ''>('');
  const [submittingRequest, setSubmittingRequest] = useState(false);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadCountries();
      loadUserRequests();
    }
  }, [user?.id]);

  const loadUserRequests = async () => {
    try {
      const res = await roleApi.getRoleRequests({ pageNumber: 1, pageSize: 10 });
      setRoleRequests(res.data?.items || []);
    } catch (err) {
      console.error("Failed to load user role requests", err);
    }
  };

  const handleRoleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestRole || !requestReason.trim()) return;

    setError('');
    setSuccess('');
    setSubmittingRequest(true);

    try {
      const res = await roleApi.createRequest(requestRole, requestReason);
      dispatch(showToast({ message: res.message || 'Request submitted successfully!', type: 'success' }));
      setRequestReason('');
      setRequestRole('');
      loadUserRequests();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to submit upgrade request.';
      setError(msg);
      dispatch(showToast({ message: msg, type: 'error' }));
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleCancelRequest = async (id: string) => {
    setError('');
    setSuccess('');
    try {
      const res = await roleApi.cancelRequest(id);
      dispatch(showToast({ message: res.message || 'Request cancelled successfully.', type: 'success' }));
      loadUserRequests();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to cancel request.';
      setError(msg);
      dispatch(showToast({ message: msg, type: 'error' }));
    }
  };

  useEffect(() => {
    if (countryId) {
      loadStates(countryId);
      setStates([]);
      setCities([]);
      setStateId('');
      setCityId('');
    }
  }, [countryId]);

  useEffect(() => {
    if (stateId) {
      loadCities(stateId);
      setCities([]);
      setCityId('');
    }
  }, [stateId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/api/user/profile');
      const data: ProfileData = res.data;
      setProfile(data);
      if (
        user && (
          data.role !== user.role ||
          data.activeRole !== user.activeRole ||
          JSON.stringify(data.assignedRoles) !== JSON.stringify(user.assignedRoles)
        )
      ) {
        dispatch(updateUser({ 
          role: data.role, 
          assignedRoles: data.assignedRoles, 
          activeRole: data.activeRole 
        }));
      }
      setFirstName(data.firstName);
      setLastName(data.lastName);
      setPhone(data.phone || '');
      setGender(data.gender || '');
      setDateOfBirth(data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '');
      setZipCode(data.zipCode || '');
      setArea(data.area || '');
      setLanguage(data.language || 'en');
      setTimezone(data.timezone || 'UTC');
      setCountryId(data.countryId || '');
      setStateId(data.stateId || '');
      setCityId(data.cityId || '');
    } catch (err: any) {
      setError('Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  const loadCountries = async () => {
    try {
      const res = await apiClient.get('/api/v1/locations/countries');
      setCountries(res.data.data || []);
    } catch {
      // Graceful fallback if locations not yet seeded/implemented
    }
  };

  const loadStates = async (cId: string) => {
    try {
      const res = await apiClient.get(`/api/v1/locations/states?countryId=${cId}`);
      setStates(res.data.data || []);
    } catch {}
  };

  const loadCities = async (sId: string) => {
    try {
      const res = await apiClient.get(`/api/v1/locations/cities?stateId=${sId}`);
      setCities(res.data.data || []);
    } catch {}
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const getAvatarUrl = (url: string | null) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const base = apiClient.defaults.baseURL || 'http://localhost:5242';
    return `${base.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccess('');
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await apiClient.post('/api/user/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      dispatch(showToast({ message: 'Avatar uploaded successfully!', type: 'success' }));
      if (profile) {
        setProfile({ ...profile, avatarUrl: res.data.data.avatarUrl });
        dispatch(updateUser({ profilePictureUrl: res.data.data.avatarUrl }));
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Avatar upload failed.';
      setError(msg);
      dispatch(showToast({ message: msg, type: 'error' }));
    } finally {
      setUploading(false);
    }
  };

  const handleAvatarRemove = async () => {
    setError('');
    setSuccess('');
    setUploading(true);

    try {
      await apiClient.delete('/api/user/profile/avatar');
      dispatch(showToast({ message: 'Avatar removed successfully.', type: 'success' }));
      if (profile) {
        setProfile({ ...profile, avatarUrl: null });
        dispatch(updateUser({ profilePictureUrl: undefined }));
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to remove avatar.';
      setError(msg);
      dispatch(showToast({ message: msg, type: 'error' }));
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await apiClient.put('/api/user/profile', {
        userId: user?.id,
        firstName,
        lastName,
        phone,
        gender: gender || null,
        dateOfBirth: dateOfBirth || null,
        countryId: countryId || null,
        stateId: stateId || null,
        cityId: cityId || null,
        area: area || null,
        zipCode: zipCode || null,
        language,
        timezone
      });

      dispatch(showToast({ message: 'Profile details updated successfully!', type: 'success' }));
      dispatch(updateUser({ firstName, lastName, phoneNumber: phone }));
      setIsEditing(false);
      loadProfile();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to update profile.';
      setError(msg);
      dispatch(showToast({ message: msg, type: 'error' }));
    } finally {
      setLoading(false);
    }
  };


  if (!user) {
    return (
      <div className="glass-card">
        <p>Access Denied. Please log in first.</p>
        <button className="btn-primary" style={{ marginTop: '20px' }} onClick={() => navigate('/login')}>
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="glass-card animate-fade-in" style={{ maxWidth: '650px', padding: '30px', margin: '0 auto', textAlign: 'left' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {/* Avatar Area */}
          <div style={{ position: 'relative' }}>
            {profile?.avatarUrl ? (
              <img 
                src={getAvatarUrl(profile.avatarUrl)}
                alt="Avatar" 
                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent)' }}
              />
            ) : (
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-light)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '28px',
                fontWeight: 'bold',
                color: 'var(--accent)',
                border: '2px solid var(--accent)'
              }}>
                {(firstName?.[0] || user.firstName?.[0] || '').toUpperCase()}
              </div>
            )}
            
            <div style={{ marginTop: '8px', display: 'flex', gap: '5px' }}>
              <label style={{ fontSize: '11px', color: 'var(--accent)', cursor: 'pointer', fontWeight: '600' }}>
                {uploading ? '...' : 'Upload'}
                <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} disabled={uploading} />
              </label>
              {profile?.avatarUrl && (
                <span onClick={handleAvatarRemove} style={{ fontSize: '11px', color: 'var(--error)', cursor: 'pointer', fontWeight: '600' }}>
                  Remove
                </span>
              )}
            </div>
          </div>

          <div>
            <h2 style={{ fontSize: '24px', color: 'var(--text-primary)' }}>{firstName} {lastName}</h2>
            <span style={{
              fontSize: '11px',
              fontWeight: 'bold',
              padding: '2px 8px',
              borderRadius: '20px',
              backgroundColor: 'var(--accent-light)',
              color: 'var(--accent)',
              display: 'inline-block',
              marginTop: '4px'
            }}>
              {profile?.role || user.role}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {profile?.role === 'Admin' && (
            <Link to="/admin/roles" style={{ fontSize: '13px', color: 'var(--accent)', textDecoration: 'none', fontWeight: '600' }}>
              Admin Console
            </Link>
          )}
          <span style={{ color: 'var(--border)' }}>|</span>
          <span onClick={handleLogout} style={{ fontSize: '13px', color: 'var(--text-secondary)', cursor: 'pointer', fontWeight: '600' }}>
            Sign Out
          </span>
        </div>
      </div>

      {error && <div style={{ padding: '12px', background: 'rgba(248,113,113,0.15)', border: '1px solid var(--error)', color: 'var(--error)', borderRadius: '12px', marginBottom: '20px' }}>{error}</div>}
      {success && <div style={{ padding: '12px', background: 'rgba(74,222,128,0.15)', border: '1px solid var(--success)', color: 'var(--success)', borderRadius: '12px', marginBottom: '20px' }}>{success}</div>}

      {!isEditing ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>First Name</span>
              <div style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', fontWeight: '600' }}>{profile?.firstName}</div>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Last Name</span>
              <div style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', fontWeight: '600' }}>{profile?.lastName}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Email Address</span>
              <div style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', fontWeight: '600' }}>{profile?.email}</div>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Phone Number</span>
              <div style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', fontWeight: '600' }}>{profile?.phone || 'Not provided'}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Gender</span>
              <div style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', fontWeight: '600' }}>{profile?.gender || 'Not specified'}</div>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Date of Birth</span>
              <div style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', fontWeight: '600' }}>{profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'Not specified'}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Location</span>
              <div style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', fontWeight: '600' }}>
                {[profile?.area, profile?.cityName, profile?.stateName, profile?.countryName].filter(Boolean).join(', ') || 'Not specified'}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Zip Code</span>
              <div style={{ padding: '10px 0', borderBottom: '1px solid var(--border)', fontWeight: '600' }}>{profile?.zipCode || 'Not specified'}</div>
            </div>
          </div>

          <button className="btn-primary" style={{ marginTop: '20px' }} onClick={() => setIsEditing(true)}>
            Edit Profile Details
          </button>

          <div style={{ margin: '30px 0', borderTop: '1px solid var(--border)' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', margin: 0 }}>Portal Workspace Upgrades</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
              Your current unlocked portal workspaces: <strong>{(user?.assignedRoles || [user?.role || 'Buyer']).join(', ')}</strong>
            </p>

            <div style={{ display: 'flex', gap: '10px', marginTop: '5px' }}>
              {!(user?.assignedRoles || [user?.role || 'Buyer']).includes('Seller') && (
                <button 
                  type="button" 
                  className="btn-primary" 
                  style={{ width: 'auto', padding: '10px 15px', fontSize: '13px' }}
                  onClick={() => { setRequestRole('Seller'); setRequestReason(''); }}
                >
                  Become a Seller
                </button>
              )}
              {!(user?.assignedRoles || [user?.role || 'Buyer']).includes('Agent') && (
                <button 
                  type="button" 
                  className="btn-primary" 
                  style={{ width: 'auto', padding: '10px 15px', fontSize: '13px' }}
                  onClick={() => { setRequestRole('Agent'); setRequestReason(''); }}
                >
                  Become an Agent
                </button>
              )}
            </div>

            {requestRole && createPortal(
              <div 
                onClick={() => { setRequestRole(''); setRequestReason(''); }}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'rgba(0,0,0,0.6)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  zIndex: 1000,
                  backdropFilter: 'blur(4px)'
                }}
              >
                <form 
                  onSubmit={handleRoleRequestSubmit} 
                  onClick={(e) => e.stopPropagation()}
                  className="glass-card animate-fade-in" 
                  style={{ padding: '25px', width: '400px', display: 'flex', flexDirection: 'column', gap: '15px' }}
                >
                  <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', margin: 0 }}>Apply for {requestRole} Portal Access</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
                    Please explain why you need to unlock the {requestRole} portal access.
                  </p>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '12px' }}>Reason for Upgrade Request</label>
                    <textarea 
                      className="form-input" 
                      placeholder={`Provide a reason for wanting access to the ${requestRole} portal...`}
                      value={requestReason} 
                      onChange={(e) => setRequestReason(e.target.value)}
                      rows={4} 
                      required 
                      style={{ width: '100%', resize: 'none', marginBottom: 0 }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '10px', justifyContent: 'flex-end' }}>
                    <button 
                      type="button" 
                      className="btn-primary" 
                      style={{ width: 'auto', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                      onClick={() => { setRequestRole(''); setRequestReason(''); }}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary" style={{ width: 'auto' }} disabled={submittingRequest}>
                      {submittingRequest ? 'Submitting...' : 'Submit Request'}
                    </button>
                  </div>
                </form>
              </div>,
              document.body
            )}

            {roleRequests.length > 0 && (
              <div style={{ marginTop: '15px' }}>
                <h4 style={{ fontSize: '14px', margin: '0 0 10px 0', color: 'var(--text-secondary)' }}>Upgrade Requests History</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {roleRequests.map((req) => (
                    <div key={req.id} style={{ padding: '12px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ flex: 1, minWidth: 0, paddingRight: '15px', wordBreak: 'break-word' }}>
                        <div style={{ fontWeight: '600', fontSize: '14px' }}>Upgrade to {req.requestedRole}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>Reason: {req.reason}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>Submitted: {new Date(req.submittedAt).toLocaleDateString()}</div>
                        {req.reviewNotes && (
                          <div style={{ fontSize: '11px', color: 'var(--accent)', marginTop: '4px', fontStyle: 'italic' }}>
                            Feedback: {req.reviewNotes}
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 'bold',
                          padding: '2px 8px',
                          borderRadius: '20px',
                          backgroundColor: req.status === 'Pending' ? 'rgba(234,179,8,0.1)' : req.status === 'Approved' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                          color: req.status === 'Pending' ? 'rgb(234,179,8)' : req.status === 'Approved' ? 'rgb(34,197,94)' : 'rgb(239,68,68)'
                        }}>
                          {req.status}
                        </span>
                        {req.status === 'Pending' && (
                          <button
                            type="button"
                            onClick={() => handleCancelRequest(req.id)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--error)', fontSize: '12px', cursor: 'pointer', fontWeight: '600', padding: 0 }}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">First Name</label>
              <input type="text" className="form-input" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Last Name</label>
              <input type="text" className="form-input" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Phone Number</label>
              <input type="text" className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Gender</label>
              <select className="form-input" value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Date of Birth</label>
              <input type="date" className="form-input" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Zip Code</label>
              <input type="text" className="form-input" value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
            </div>
          </div>

          {/* Location Cascading Selectors */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Country</label>
              <select className="form-input" value={countryId} onChange={(e) => setCountryId(e.target.value)}>
                <option value="">Select Country</option>
                {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">State</label>
              <select className="form-input" value={stateId} onChange={(e) => setStateId(e.target.value)} disabled={!countryId}>
                <option value="">Select State</option>
                {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">City</label>
              <select className="form-input" value={cityId} onChange={(e) => setCityId(e.target.value)} disabled={!stateId}>
                <option value="">Select City</option>
                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div className="form-group" style={{ marginBottom: 0, gridColumn: 'span 2' }}>
              <label className="form-label">Area (Free Text)</label>
              <input type="text" className="form-input" placeholder="e.g. Neighborhood / Street Name" value={area} onChange={(e) => setArea(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Language</label>
              <select className="form-input" value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
            <button type="submit" className="btn-primary" disabled={loading} style={{ width: 'auto', padding: '0 25px' }}>
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
            <button type="button" className="btn-primary" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid var(--border)', width: 'auto', padding: '0 20px' }} onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProfilePage;
