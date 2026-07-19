import React, { useState, useEffect } from 'react';
import {
  getCategories, createCategory, updateCategory, deleteCategory,
  getPropertyTypes, createPropertyType, updatePropertyType, deletePropertyType,
  getStatuses, createStatus, updateStatus, deleteStatus,
  getConditions, createCondition, updateCondition, deleteCondition,
  getAmenities, createAmenity, updateAmenity, deleteAmenity
} from '../../services/adminApi';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

type Tab = 'categories' | 'types' | 'statuses' | 'conditions' | 'amenities';

const AdminMasterDataPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('categories');
  const [categories, setCategories] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [conditions, setConditions] = useState<any[]>([]);
  const [amenities, setAmenities] = useState<any[]>([]);

  // Selected Category ID for Property Types filtering
  const [selectedCategoryId, setSelectedCategoryId] = useState('');

  // Create Form States
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [amenityCategory, setAmenityCategory] = useState('Indoor');
  const [displayOrder, setDisplayOrder] = useState(0);

  // Editing overlay
  const [editingItem, setEditingItem] = useState<any | null>(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadTabContent();
  }, [activeTab, selectedCategoryId]);

  const loadTabContent = async () => {
    setError('');
    try {
      if (activeTab === 'categories') {
        const res = await getCategories({ includeInactive: true });
        setCategories(res.data || []);
      } else if (activeTab === 'types') {
        // First load all categories to populate the category selector
        const catRes = await getCategories({ includeInactive: true });
        const cats = catRes.data || [];
        setCategories(cats);
        if (cats.length > 0 && !selectedCategoryId) {
          setSelectedCategoryId(cats[0].id);
          return;
        }
        if (selectedCategoryId) {
          const res = await getPropertyTypes(selectedCategoryId, { includeInactive: true });
          setTypes(res.data || []);
        }
      } else if (activeTab === 'statuses') {
        const res = await getStatuses({ includeInactive: true });
        setStatuses(res.data || []);
      } else if (activeTab === 'conditions') {
        const res = await getConditions();
        setConditions(res.data || []);
      } else if (activeTab === 'amenities') {
        const res = await getAmenities({ includeInactive: true });
        setAmenities(res.data || []);
      }
    } catch {
      setError(`Failed to load ${activeTab} data.`);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError('');
    setSuccess('');

    try {
      if (activeTab === 'categories') {
        await createCategory({ name, description, imageUrl, displayOrder });
        setSuccess(`Category "${name}" created.`);
      } else if (activeTab === 'types') {
        if (!selectedCategoryId) return;
        await createPropertyType({ categoryId: selectedCategoryId, name, description, displayOrder });
        setSuccess(`Property Type "${name}" created.`);
      } else if (activeTab === 'statuses') {
        await createStatus({ name, displayOrder });
        setSuccess(`Property Status "${name}" created.`);
      } else if (activeTab === 'conditions') {
        await createCondition({ name });
        setSuccess(`Property Condition "${name}" created.`);
      } else if (activeTab === 'amenities') {
        await createAmenity({ name, iconUrl, category: amenityCategory, description, displayOrder });
        setSuccess(`Amenity "${name}" created.`);
      }

      setName('');
      setDescription('');
      setImageUrl('');
      setIconUrl('');
      setDisplayOrder(0);
      loadTabContent();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create item.');
    }
  };

  const handleDelete = async (id: string, itemName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${itemName}"?`)) return;
    setError('');
    setSuccess('');

    try {
      if (activeTab === 'categories') {
        await deleteCategory(id);
      } else if (activeTab === 'types') {
        await deletePropertyType(id);
      } else if (activeTab === 'statuses') {
        await deleteStatus(id);
      } else if (activeTab === 'conditions') {
        await deleteCondition(id);
      } else if (activeTab === 'amenities') {
        await deleteAmenity(id);
      }

      setSuccess(`"${itemName}" deleted successfully.`);
      loadTabContent();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete item.');
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.name.trim()) return;
    setError('');
    setSuccess('');

    try {
      if (activeTab === 'categories') {
        await updateCategory(editingItem.id, editingItem);
      } else if (activeTab === 'types') {
        await updatePropertyType(editingItem.id, editingItem);
      } else if (activeTab === 'statuses') {
        await updateStatus(editingItem.id, editingItem);
      } else if (activeTab === 'conditions') {
        await updateCondition(editingItem.id, editingItem);
      } else if (activeTab === 'amenities') {
        await updateAmenity(editingItem.id, editingItem);
      }

      setSuccess('Item updated successfully.');
      setEditingItem(null);
      loadTabContent();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save changes.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
      <div>
        <h2 style={{ fontSize: '28px', color: 'var(--text-primary)', marginBottom: '5px' }}>Property Master Data</h2>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Configure platform taxonomies, listing statuses, conditions, and amenities.</p>
      </div>

        {error && <div style={{ padding: '12px', background: 'rgba(248,113,113,0.15)', border: '1px solid var(--error)', color: 'var(--error)', borderRadius: '12px' }}>{error}</div>}
        {success && <div style={{ padding: '12px', background: 'rgba(74,222,128,0.15)', border: '1px solid var(--success)', color: 'var(--success)', borderRadius: '12px' }}>{success}</div>}

        {/* Tab Headers */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', gap: '10px' }}>
          {(['categories', 'types', 'statuses', 'conditions', 'amenities'] as Tab[]).map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setEditingItem(null);
              }}
              style={{
                padding: '12px 20px',
                border: 'none',
                background: 'transparent',
                color: activeTab === tab ? 'var(--accent)' : 'var(--text-secondary)',
                fontWeight: '600',
                cursor: 'pointer',
                fontSize: '15px',
                borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
                transition: 'all 0.3s'
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Edit Modal overlay */}
        {editingItem && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100
          }}>
            <form onSubmit={handleSaveEdit} className="glass-card animate-fade-in" style={{ width: '400px' }}>
              <h3 style={{ marginBottom: '20px' }}>Edit {activeTab.toUpperCase()}</h3>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  required
                />
              </div>

              {(activeTab === 'categories' || activeTab === 'types' || activeTab === 'amenities') && (
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-input"
                    value={editingItem.description || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  />
                </div>
              )}

              {activeTab === 'categories' && (
                <div className="form-group">
                  <label className="form-label">Image URL</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingItem.imageUrl || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, imageUrl: e.target.value })}
                  />
                </div>
              )}

              {activeTab === 'amenities' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Icon URL</label>
                    <input
                      type="text"
                      className="form-input"
                      value={editingItem.iconUrl || ''}
                      onChange={(e) => setEditingItem({ ...editingItem, iconUrl: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Amenity Category</label>
                    <select
                      className="form-input"
                      value={editingItem.category}
                      onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                    >
                      <option value="Indoor">Indoor</option>
                      <option value="Outdoor">Outdoor</option>
                      <option value="Community">Community</option>
                    </select>
                  </div>
                </>
              )}

              {activeTab !== 'conditions' && (
                <>
                  <div className="form-group">
                    <label className="form-label">Display Order</label>
                    <input
                      type="number"
                      className="form-input"
                      value={editingItem.displayOrder}
                      onChange={(e) => setEditingItem({ ...editingItem, displayOrder: parseInt(e.target.value, 10) })}
                    />
                  </div>
                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="checkbox"
                      id="edit-active"
                      checked={editingItem.isActive}
                      onChange={(e) => setEditingItem({ ...editingItem, isActive: e.target.checked })}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--accent)' }}
                    />
                    <label htmlFor="edit-active" style={{ cursor: 'pointer' }}>Active Status</label>
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0 20px' }}>Save Changes</button>
                <button type="button" className="btn-primary" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid var(--border)', width: 'auto', padding: '0 20px' }} onClick={() => setEditingItem(null)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Tab Body Content */}
        <div style={{ display: 'flex', gap: '30px' }}>
          
          {/* Create Form Column */}
          <div style={{
            flex: '1 1 35%',
            background: 'rgba(15, 23, 42, 0.45)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '24px',
            boxSizing: 'border-box',
            height: 'fit-content'
          }}>
            <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '20px' }}>
              Add {activeTab.charAt(0).toUpperCase() + activeTab.slice(1, -1)}
            </h3>

            {activeTab === 'types' && (
              <div className="form-group">
                <label className="form-label">Select Parent Category</label>
                <select
                  className="form-input"
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            )}

            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Name</label>
                <input
                  type="text"
                  placeholder="Name"
                  className="form-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {(activeTab === 'categories' || activeTab === 'types' || activeTab === 'amenities') && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Description</label>
                  <textarea
                    placeholder="Describe this item..."
                    className="form-input"
                    style={{ minHeight: '60px', resize: 'vertical' }}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              )}

              {activeTab === 'categories' && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Image URL</label>
                  <input
                    type="text"
                    placeholder="e.g. /uploads/categories/house.png"
                    className="form-input"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>
              )}

              {activeTab === 'amenities' && (
                <>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Icon URL</label>
                    <input
                      type="text"
                      placeholder="e.g. /uploads/amenities/pool.svg"
                      className="form-input"
                      value={iconUrl}
                      onChange={(e) => setIconUrl(e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Amenity Category</label>
                    <select
                      className="form-input"
                      value={amenityCategory}
                      onChange={(e) => setAmenityCategory(e.target.value)}
                    >
                      <option value="Indoor">Indoor</option>
                      <option value="Outdoor">Outdoor</option>
                      <option value="Community">Community</option>
                    </select>
                  </div>
                </>
              )}

              {activeTab !== 'conditions' && (
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Display Order</label>
                  <input
                    type="number"
                    className="form-input"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10))}
                  />
                </div>
              )}

              <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
                Add Item
              </button>
            </form>
          </div>

          {/* List Table Column */}
          <div style={{
            flex: '1 1 65%',
            background: 'rgba(15, 23, 42, 0.45)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '24px',
            boxSizing: 'border-box'
          }}>
            {activeTab === 'types' && (
              <div style={{ marginBottom: '15px' }}>
                <label className="form-label">Filter by Category</label>
                <select
                  className="form-input"
                  style={{ width: '220px', padding: '8px 12px' }}
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)', textAlign: 'left' }}>
                    <th style={{ padding: '12px' }}>Name</th>
                    {activeTab !== 'conditions' && <th style={{ padding: '12px' }}>Slug</th>}
                    {activeTab === 'amenities' && <th style={{ padding: '12px' }}>Section</th>}
                    {activeTab !== 'conditions' && <th style={{ padding: '12px' }}>Order</th>}
                    {activeTab !== 'conditions' && <th style={{ padding: '12px' }}>Status</th>}
                    <th style={{ padding: '12px', width: '120px', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeTab === 'categories' && categories.map(cat => (
                    <tr key={cat.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px' }}><strong>{cat.name}</strong></td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{cat.slug}</td>
                      <td style={{ padding: '12px' }}>{cat.displayOrder}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ color: cat.isActive ? 'var(--success)' : 'var(--error)' }}>
                          {cat.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center' }}>
                        <FiEdit2 onClick={() => setEditingItem(cat)} style={{ color: 'var(--accent)', cursor: 'pointer', fontSize: '15px' }} title="Edit" />
                        <FiTrash2 onClick={() => handleDelete(cat.id, cat.name)} style={{ color: 'var(--error)', cursor: 'pointer', fontSize: '15px' }} title="Delete" />
                      </td>
                    </tr>
                  ))}

                  {activeTab === 'types' && types.map(t => (
                    <tr key={t.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px' }}><strong>{t.name}</strong></td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{t.slug}</td>
                      <td style={{ padding: '12px' }}>{t.displayOrder}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ color: t.isActive ? 'var(--success)' : 'var(--error)' }}>
                          {t.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center' }}>
                        <FiEdit2 onClick={() => setEditingItem(t)} style={{ color: 'var(--accent)', cursor: 'pointer', fontSize: '15px' }} title="Edit" />
                        <FiTrash2 onClick={() => handleDelete(t.id, t.name)} style={{ color: 'var(--error)', cursor: 'pointer', fontSize: '15px' }} title="Delete" />
                      </td>
                    </tr>
                  ))}

                  {activeTab === 'statuses' && statuses.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px' }}><strong>{s.name}</strong></td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>-</td>
                      <td style={{ padding: '12px' }}>{s.displayOrder}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ color: s.isActive ? 'var(--success)' : 'var(--error)' }}>
                          {s.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center' }}>
                        <FiEdit2 onClick={() => setEditingItem(s)} style={{ color: 'var(--accent)', cursor: 'pointer', fontSize: '15px' }} title="Edit" />
                        <FiTrash2 onClick={() => handleDelete(s.id, s.name)} style={{ color: 'var(--error)', cursor: 'pointer', fontSize: '15px' }} title="Delete" />
                      </td>
                    </tr>
                  ))}

                  {activeTab === 'conditions' && conditions.map(c => (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px' }}><strong>{c.name}</strong></td>
                      <td style={{ padding: '12px', textAlign: 'center', display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center' }}>
                        <FiEdit2 onClick={() => setEditingItem(c)} style={{ color: 'var(--accent)', cursor: 'pointer', fontSize: '15px' }} title="Edit" />
                        <FiTrash2 onClick={() => handleDelete(c.id, c.name)} style={{ color: 'var(--error)', cursor: 'pointer', fontSize: '15px' }} title="Delete" />
                      </td>
                    </tr>
                  ))}

                  {activeTab === 'amenities' && amenities.map(a => (
                    <tr key={a.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px' }}><strong>{a.name}</strong></td>
                      <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>{a.slug}</td>
                      <td style={{ padding: '12px' }}>{a.category}</td>
                      <td style={{ padding: '12px' }}>{a.displayOrder}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ color: a.isActive ? 'var(--success)' : 'var(--error)' }}>
                          {a.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center', display: 'flex', gap: '12px', justifyContent: 'center', alignItems: 'center' }}>
                        <FiEdit2 onClick={() => setEditingItem(a)} style={{ color: 'var(--accent)', cursor: 'pointer', fontSize: '15px' }} title="Edit" />
                        <FiTrash2 onClick={() => handleDelete(a.id, a.name)} style={{ color: 'var(--error)', cursor: 'pointer', fontSize: '15px' }} title="Delete" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

export default AdminMasterDataPage;
