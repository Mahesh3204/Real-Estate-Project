import React, { useState, useEffect } from 'react';
import { 
   getRoles, 
   createRole, 
   deleteRole, 
   getPermissions, 
   assignPermissionsToRole, 
   removePermissionsFromRole 
} from '../../services/adminApi';
import { FiTrash2 } from 'react-icons/fi';


interface Role {
  id: string;
  name: string;
  permissions: string[];
}

interface Permission {
  id: string;
  name: string;
  description: string;
}

const AdminRolesPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [newRoleName, setNewRoleName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const rolesRes = await getRoles({ pageNumber: 1, pageSize: 50 });
      const permissionsRes = await getPermissions({ pageNumber: 1, pageSize: 100 });
      setRoles(rolesRes.data || []);
      setAllPermissions(permissionsRes.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load roles and permissions.');
    }
  };


  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    setError('');
    setSuccess('');

    try {
      await createRole({ name: newRoleName });
      setSuccess(`Role "${newRoleName}" created successfully.`);
      setNewRoleName('');
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Failed to create role.');
    }
  };

  const handleDeleteRole = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete the role "${name}"?`)) return;
    setError('');
    setSuccess('');

    try {
      await deleteRole(id);
      setSuccess(`Role "${name}" deleted.`);
      if (selectedRole?.id === id) setSelectedRole(null);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete role. It may be assigned to users.');
    }
  };

  const handleTogglePermission = async (role: Role, permissionName: string, isAssigned: boolean) => {
    setError('');
    setSuccess('');

    try {
      if (isAssigned) {
        // Remove permission
        await removePermissionsFromRole(role.id, [permissionName]);
      } else {
        // Assign permission
        await assignPermissionsToRole(role.id, [permissionName]);
      }

      // Update local state
      const updatedRoles = roles.map(r => {
        if (r.id === role.id) {
          const newPermissions = isAssigned 
            ? r.permissions.filter(p => p !== permissionName)
            : [...r.permissions, permissionName];
          const updated = { ...r, permissions: newPermissions };
          if (selectedRole?.id === role.id) setSelectedRole(updated);
          return updated;
        }
        return r;
      });
      setRoles(updatedRoles);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update role permissions.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
      <div>
        <h2 style={{ fontSize: '28px', color: 'var(--text-primary)', marginBottom: '5px' }}>Role Management</h2>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Configure platform user roles and assign access control permissions.</p>
      </div>

        {error && <div style={{ padding: '12px', background: 'rgba(248,113,113,0.15)', border: '1px solid var(--error)', color: 'var(--error)', borderRadius: '12px' }}>{error}</div>}
        {success && <div style={{ padding: '12px', background: 'rgba(74,222,128,0.15)', border: '1px solid var(--success)', color: 'var(--success)', borderRadius: '12px' }}>{success}</div>}

        <div style={{ display: 'flex', gap: '30px', flexGrow: 1 }}>
          {/* Roles list */}
          <div style={{
            flex: '1 1 40%',
            background: 'rgba(15, 23, 42, 0.45)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '24px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <h3 style={{ fontSize: '18px', color: 'var(--text-primary)' }}>Roles</h3>
            
            <form onSubmit={handleCreateRole} style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="New Role Name (e.g. Agent)"
                className="form-input"
                style={{ flexGrow: 1 }}
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
              />
              <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0 20px' }}>Create</button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '400px' }}>
              {roles.map(role => (
                <div 
                  key={role.id}
                  onClick={() => setSelectedRole(role)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: selectedRole?.id === role.id ? 'var(--accent-light)' : 'rgba(255,255,255,0.03)',
                    border: selectedRole?.id === role.id ? '1px solid var(--accent)' : '1px solid var(--border)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div>
                    <strong style={{ display: 'block', color: 'var(--text-primary)' }}>{role.name}</strong>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{role.permissions.length} permissions</span>
                  </div>
                  {role.name !== 'Admin' && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteRole(role.id, role.name);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--error)',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '6px'
                      }}
                      title="Delete"
                    >
                      <FiTrash2 style={{ fontSize: '16px' }} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Permissions Matrix */}
          <div style={{
            flex: '1 1 60%',
            background: 'rgba(15, 23, 42, 0.45)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '24px',
            boxSizing: 'border-box'
          }}>
            {selectedRole ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '5px' }}>
                    Permissions for: <span style={{ color: 'var(--accent)' }}>{selectedRole.name}</span>
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
                    {selectedRole.name === 'Admin' 
                      ? 'Administrators automatically bypass permission checks and hold full system access.' 
                      : 'Toggle permissions to assign or remove privileges for this role.'}
                  </p>
                </div>

                {selectedRole.name !== 'Admin' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '420px', paddingRight: '5px' }}>
                    {allPermissions.map(permission => {
                      const isAssigned = selectedRole.permissions.includes(permission.name);
                      return (
                        <div 
                          key={permission.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            padding: '12px 16px',
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid var(--border)',
                            borderRadius: '12px'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isAssigned}
                            id={`perm-${permission.id}`}
                            onChange={() => handleTogglePermission(selectedRole, permission.name, isAssigned)}
                            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent)' }}
                          />
                          <label htmlFor={`perm-${permission.id}`} style={{ cursor: 'pointer', flexGrow: 1 }}>
                            <strong style={{ display: 'block', color: 'var(--text-primary)', fontSize: '14px' }}>{permission.name}</strong>
                            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{permission.description}</span>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                Select a role from the list to view and manage its permissions.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

export default AdminRolesPage;
