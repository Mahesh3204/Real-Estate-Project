import React, { useState, useEffect } from 'react';
import { getPermissions, createPermission, deletePermission } from '../../services/adminApi';
import type { Permission } from '../../services/adminApi';
import { FiTrash2 } from 'react-icons/fi';



const AdminPermissionsPage: React.FC = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [newPermName, setNewPermName] = useState('');
  const [newPermDesc, setNewPermDesc] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadPermissions();
  }, [page, searchTerm]);

  const loadPermissions = async () => {
    try {
      const res = await getPermissions({ pageNumber: page, pageSize: 10, searchTerm });
      setPermissions(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load permissions.');
    }
  };


  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPermName.trim()) return;
    setError('');
    setSuccess('');

    try {
      await createPermission({ name: newPermName, description: newPermDesc });
      setSuccess(`Permission "${newPermName}" registered successfully.`);
      setNewPermName('');
      setNewPermDesc('');
      setPage(1);
      loadPermissions();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create permission.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete permission "${name}"?`)) return;
    setError('');
    setSuccess('');

    try {
      await deletePermission(id);
      setSuccess(`Permission "${name}" deleted successfully.`);
      loadPermissions();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete permission.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
      <div>
        <h2 style={{ fontSize: '28px', color: 'var(--text-primary)', marginBottom: '5px' }}>Permission Management</h2>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Register and configure fine-grained system access capabilities.</p>
      </div>

      {error && <div style={{ padding: '12px', background: 'rgba(248,113,113,0.15)', border: '1px solid var(--error)', color: 'var(--error)', borderRadius: '12px' }}>{error}</div>}
      {success && <div style={{ padding: '12px', background: 'rgba(74,222,128,0.15)', border: '1px solid var(--success)', color: 'var(--success)', borderRadius: '12px' }}>{success}</div>}

      <div style={{ display: 'flex', gap: '30px' }}>

          {/* Create Form */}
          <div style={{
            flex: '1 1 35%',
            background: 'rgba(15, 23, 42, 0.45)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '24px',
            boxSizing: 'border-box',
            height: 'fit-content'
          }}>
            <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '20px' }}>Create Permission</h3>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Permission Name</label>
                <input
                  type="text"
                  placeholder="e.g. category.create"
                  className="form-input"
                  value={newPermName}
                  onChange={(e) => setNewPermName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Description</label>
                <textarea
                  placeholder="Describe this capability..."
                  className="form-input"
                  style={{ minHeight: '80px', resize: 'vertical' }}
                  value={newPermDesc}
                  onChange={(e) => setNewPermDesc(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>Create Permission</button>
            </form>
          </div>

          {/* List Table */}
          <div style={{
            flex: '1 1 65%',
            background: 'rgba(15, 23, 42, 0.45)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '24px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', margin: 0 }}>System Permissions</h3>
              <input
                type="text"
                placeholder="Search permissions..."
                className="form-input"
                style={{ width: '200px', padding: '8px 12px', fontSize: '13px' }}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                    <th style={{ padding: '12px' }}>Name</th>
                    <th style={{ padding: '12px' }}>Description</th>
                    <th style={{ padding: '12px', width: '80px', textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {permissions.map(perm => (
                    <tr key={perm.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s' }}>
                      <td style={{ padding: '12px' }}>
                        <code style={{ background: 'var(--accent-light)', color: 'var(--accent)', padding: '3px 6px', borderRadius: '4px', fontSize: '13px' }}>
                          {perm.name}
                        </code>
                      </td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{perm.description || '-'}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button 
                          onClick={() => handleDelete(perm.id, perm.name)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px' }}
                          title="Delete"
                        >
                          <FiTrash2 style={{ fontSize: '16px' }} />
                        </button>

                      </td>
                    </tr>
                  ))}
                  {permissions.length === 0 && (
                    <tr>
                      <td colSpan={3} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No permissions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'rgba(255,255,255,0.03)',
                    color: 'var(--text-primary)',
                    cursor: page === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  Prev
                </button>
                <span style={{ alignSelf: 'center', color: 'var(--text-secondary)', fontSize: '13px' }}>
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    background: 'rgba(255,255,255,0.03)',
                    color: 'var(--text-primary)',
                    cursor: page === totalPages ? 'not-allowed' : 'pointer'
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

export default AdminPermissionsPage;
