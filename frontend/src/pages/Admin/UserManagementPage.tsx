import React, { useState, useEffect } from 'react';
import { getUsers, updateUserRoles } from '../../services/adminApi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { showToast } from '../../store/toastSlice';
import { FiEdit, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface UserDetails {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  assignedRoles: string[];
  activeRole: string;
}

const UserManagementPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  
  const [users, setUsers] = useState<UserDetails[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Edit Modal State
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [page, searchQuery]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsers({
        pageNumber: page,
        pageSize,
        searchQuery: searchQuery.trim() || undefined
      });
      if (res.success && res.data) {
        setUsers(res.data.items || []);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err: any) {
      dispatch(showToast({
        message: err.response?.data?.message || 'Failed to load user list.',
        type: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (user: UserDetails) => {
    setSelectedUser(user);
    setSelectedRoles([...user.assignedRoles]);
  };

  const handleCloseEdit = () => {
    setSelectedUser(null);
    setSelectedRoles([]);
  };

  const handleRoleCheckboxChange = (roleName: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedRoles(prev => [...prev, roleName]);
    } else {
      // Self-demotion guard on UI level
      if (selectedUser?.id === currentUser?.id && roleName === 'Admin') {
        dispatch(showToast({ message: 'You cannot demote yourself. The Admin role must remain selected.', type: 'error' }));
        return;
      }
      setSelectedRoles(prev => prev.filter(r => r !== roleName));
    }
  };

  const handleSaveRoles = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    if (selectedRoles.length === 0) {
      dispatch(showToast({ message: 'At least one role must be specified.', type: 'error' }));
      return;
    }

    setSaving(true);
    try {
      const res = await updateUserRoles(selectedUser.id, selectedRoles);
      if (res.success) {
        dispatch(showToast({ message: 'User roles updated successfully.', type: 'success' }));
        handleCloseEdit();
        loadUsers();
      }
    } catch (err: any) {
      dispatch(showToast({
        message: err.response?.data?.message || 'Failed to save user roles.',
        type: 'error'
      }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Search Header */}
      <div className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: 'none' }}>
        <h3 style={{ fontSize: '16px', color: 'var(--text-primary)', margin: 0 }}>System User Directory</h3>
        
        <div style={{ position: 'relative', width: '300px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            style={{ paddingLeft: '35px', width: '100%', marginBottom: 0 }}
          />
          <FiSearch style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-secondary)' }} />
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card" style={{ padding: '20px', minHeight: '300px', maxWidth: 'none' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '50px' }}>
            <span>Loading user directory...</span>
          </div>
        ) : users.length === 0 ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '50px', color: 'var(--text-secondary)' }}>
            No users found.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="properties-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  <th style={{ padding: '12px 10px' }}>Name</th>
                  <th style={{ padding: '12px 10px' }}>Email Address</th>
                  <th style={{ padding: '12px 10px' }}>Assigned Roles</th>
                  <th style={{ padding: '12px 10px' }}>Active Workspace Role</th>
                  <th style={{ padding: '12px 10px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-light)', fontSize: '14px' }}>
                    <td style={{ padding: '15px 10px', fontWeight: '500' }}>{u.firstName} {u.lastName}</td>
                    <td style={{ padding: '15px 10px', color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td style={{ padding: '15px 10px' }}>
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        {u.assignedRoles.map(role => (
                          <span key={role} style={{
                            padding: '2px 8px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            backgroundColor: role === 'Admin' ? 'rgba(239,68,68,0.1)' : 'var(--accent-light)',
                            color: role === 'Admin' ? 'rgb(239,68,68)' : 'var(--accent)'
                          }}>
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: '15px 10px', color: 'var(--text-secondary)', fontWeight: '600' }}>
                      {u.activeRole ? `${u.activeRole} Portal` : 'Not Selected'}
                    </td>
                    <td style={{ padding: '15px 10px', textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => handleOpenEdit(u)}
                        style={{
                          width: 'auto',
                          padding: '5px 10px',
                          fontSize: '12px',
                          background: 'rgba(255,255,255,0.05)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <FiEdit /> Manage Roles
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '20px' }}>
            <button
              type="button"
              className="btn-primary"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              style={{ width: 'auto', padding: '6px 12px', display: 'flex', alignItems: 'center' }}
            >
              <FiChevronLeft /> Prev
            </button>
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Page {page} of {totalPages}</span>
            <button
              type="button"
              className="btn-primary"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              style={{ width: 'auto', padding: '6px 12px', display: 'flex', alignItems: 'center' }}
            >
              Next <FiChevronRight />
            </button>
          </div>
        )}
      </div>

      {/* Role Management Modal */}
      {selectedUser && (
        <div style={{
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
        }}>
          <form onSubmit={handleSaveRoles} className="glass-card animate-fade-in" style={{ padding: '25px', width: '400px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', margin: 0 }}>
              Manage User Roles
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
              Assigning roles to <strong>{selectedUser.firstName} {selectedUser.lastName}</strong> ({selectedUser.email}).
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '10px 0' }}>
              {['Buyer', 'Seller', 'Agent', 'Admin'].map((role) => {
                const isChecked = selectedRoles.includes(role);
                const isSelfAdmin = selectedUser.id === currentUser?.id && role === 'Admin';
                
                return (
                  <label key={role} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    cursor: isSelfAdmin ? 'not-allowed' : 'pointer', 
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-light)',
                    background: 'rgba(255,255,255,0.01)'
                  }}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={isSelfAdmin}
                      onChange={(e) => handleRoleCheckboxChange(role, e.target.checked)}
                      style={{ width: '16px', height: '16px', cursor: isSelfAdmin ? 'not-allowed' : 'pointer' }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: '600', fontSize: '14px', color: isSelfAdmin ? 'var(--text-secondary)' : 'var(--text-primary)' }}>
                        {role} {isSelfAdmin && <span style={{ fontSize: '11px', color: 'var(--error)' }}>(Self / Protected)</span>}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                className="btn-primary" 
                style={{ width: 'auto', background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
                onClick={handleCloseEdit}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary" 
                style={{ width: 'auto' }}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Role Changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
