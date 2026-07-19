import React, { useState, useEffect } from 'react';
import {
  getCountries, createCountry, updateCountry, deleteCountry,
  getStates, createState, updateState, deleteState,
  getCities, createCity, updateCity, deleteCity,
  getAreas, createArea, updateArea, deleteArea
} from '../../services/adminApi';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

interface LocationItem {
  id: string;
  name: string;
  code?: string;
  isActive: boolean;
}

const AdminLocationsPage: React.FC = () => {
  const [countries, setCountries] = useState<LocationItem[]>([]);
  const [states, setStates] = useState<LocationItem[]>([]);
  const [cities, setCities] = useState<LocationItem[]>([]);
  const [areas, setAreas] = useState<LocationItem[]>([]);

  const [selectedCountryId, setSelectedCountryId] = useState('');
  const [selectedStateId, setSelectedStateId] = useState('');
  const [selectedCityId, setSelectedCityId] = useState('');

  // Input states
  const [newCountryName, setNewCountryName] = useState('');
  const [newCountryCode, setNewCountryCode] = useState('');
  const [newStateName, setNewStateName] = useState('');
  const [newCityName, setNewCityName] = useState('');
  const [newAreaName, setNewAreaName] = useState('');

  // Edit item states
  const [editingItem, setEditingItem] = useState<{ id: string; name: string; code?: string; isActive: boolean; level: 'country' | 'state' | 'city' | 'area' } | null>(null);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadCountries();
  }, []);

  useEffect(() => {
    if (selectedCountryId) {
      loadStates(selectedCountryId);
      setCities([]);
      setAreas([]);
      setSelectedStateId('');
      setSelectedCityId('');
    }
  }, [selectedCountryId]);

  useEffect(() => {
    if (selectedStateId) {
      loadCities(selectedStateId);
      setAreas([]);
      setSelectedCityId('');
    }
  }, [selectedStateId]);

  useEffect(() => {
    if (selectedCityId) {
      loadAreas(selectedCityId);
    }
  }, [selectedCityId]);

  // Load functions
  const loadCountries = async () => {
    try {
      const res = await getCountries({ includeInactive: true });
      setCountries(res.data || []);
    } catch (err: any) {
      setError('Failed to load countries.');
    }
  };

  const loadStates = async (cId: string) => {
    try {
      const res = await getStates(cId, { includeInactive: true });
      setStates(res.data || []);
    } catch {
      setError('Failed to load states.');
    }
  };

  const loadCities = async (sId: string) => {
    try {
      const res = await getCities(sId, { includeInactive: true });
      setCities(res.data || []);
    } catch {
      setError('Failed to load cities.');
    }
  };

  const loadAreas = async (ctId: string) => {
    try {
      const res = await getAreas(ctId, { includeInactive: true });
      setAreas(res.data || []);
    } catch {
      setError('Failed to load areas.');
    }
  };

  // Create handlers
  const handleCreateCountry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCountryName.trim() || !newCountryCode.trim()) return;
    setError('');
    try {
      await createCountry({ name: newCountryName, code: newCountryCode });
      setSuccess(`Country "${newCountryName}" created.`);
      setNewCountryName('');
      setNewCountryCode('');
      loadCountries();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create country.');
    }
  };

  const handleCreateState = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStateName.trim() || !selectedCountryId) return;
    setError('');
    try {
      await createState({ countryId: selectedCountryId, name: newStateName });
      setSuccess(`State "${newStateName}" created.`);
      setNewStateName('');
      loadStates(selectedCountryId);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create state.');
    }
  };

  const handleCreateCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityName.trim() || !selectedStateId) return;
    setError('');
    try {
      await createCity({ stateId: selectedStateId, name: newCityName });
      setSuccess(`City "${newCityName}" created.`);
      setNewCityName('');
      loadCities(selectedStateId);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create city.');
    }
  };

  const handleCreateArea = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAreaName.trim() || !selectedCityId) return;
    setError('');
    try {
      await createArea({ cityId: selectedCityId, name: newAreaName });
      setSuccess(`Area "${newAreaName}" created.`);
      setNewAreaName('');
      loadAreas(selectedCityId);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create area.');
    }
  };

  // Delete handlers
  const handleDelete = async (id: string, name: string, level: 'country' | 'state' | 'city' | 'area') => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This soft-deletes this item and all its child dependencies.`)) return;
    setError('');
    setSuccess('');
    try {
      if (level === 'country') {
        await deleteCountry(id);
        if (selectedCountryId === id) setSelectedCountryId('');
        loadCountries();
      } else if (level === 'state') {
        await deleteState(id);
        if (selectedStateId === id) setSelectedStateId('');
        loadStates(selectedCountryId);
      } else if (level === 'city') {
        await deleteCity(id);
        if (selectedCityId === id) setSelectedCityId('');
        loadCities(selectedStateId);
      } else {
        await deleteArea(id);
        loadAreas(selectedCityId);
      }
      setSuccess(`"${name}" soft-deleted successfully.`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete item.');
    }
  };

  // Edit save handler
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.name.trim()) return;
    setError('');
    setSuccess('');
    try {
      if (editingItem.level === 'country') {
        await updateCountry(editingItem.id, { id: editingItem.id, name: editingItem.name, code: editingItem.code || '', isActive: editingItem.isActive });
        loadCountries();
      } else if (editingItem.level === 'state') {
        await updateState(editingItem.id, { id: editingItem.id, name: editingItem.name, isActive: editingItem.isActive });
        loadStates(selectedCountryId);
      } else if (editingItem.level === 'city') {
        await updateCity(editingItem.id, { id: editingItem.id, name: editingItem.name, isActive: editingItem.isActive });
        loadCities(selectedStateId);
      } else {
        await updateArea(editingItem.id, { id: editingItem.id, name: editingItem.name, isActive: editingItem.isActive });
        loadAreas(selectedCityId);
      }
      setSuccess('Item updated successfully.');
      setEditingItem(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update item.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left' }}>
      <div>
        <h2 style={{ fontSize: '28px', color: 'var(--text-primary)', marginBottom: '5px' }}>Location Management</h2>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>Configure geographical hierarchy tree (Countries → States → Cities → Areas) for properties.</p>
      </div>

        {error && <div style={{ padding: '12px', background: 'rgba(248,113,113,0.15)', border: '1px solid var(--error)', color: 'var(--error)', borderRadius: '12px' }}>{error}</div>}
        {success && <div style={{ padding: '12px', background: 'rgba(74,222,128,0.15)', border: '1px solid var(--success)', color: 'var(--success)', borderRadius: '12px' }}>{success}</div>}

        {/* Edit Modal (Inline Overlay) */}
        {editingItem && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100
          }}>
            <form onSubmit={handleSaveEdit} className="glass-card animate-fade-in" style={{ width: '380px' }}>
              <h3 style={{ marginBottom: '20px' }}>Edit {editingItem.level.toUpperCase()}</h3>
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
              {editingItem.level === 'country' && (
                <div className="form-group">
                  <label className="form-label">ISO Code</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingItem.code || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, code: e.target.value })}
                    required
                  />
                </div>
              )}
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
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0 20px' }}>Save Changes</button>
                <button type="button" className="btn-primary" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid var(--border)', width: 'auto', padding: '0 20px' }} onClick={() => setEditingItem(null)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Side-by-side Cascading Panels */}
        <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', flexGrow: 1, paddingBottom: '15px' }}>
          
          {/* Countries Panel */}
          <div style={{
            flex: '1 0 260px',
            background: 'rgba(15, 23, 42, 0.45)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '18px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
          }}>
            <h3 style={{ fontSize: '16px', color: 'var(--text-primary)', margin: 0 }}>Countries</h3>
            <form onSubmit={handleCreateCountry} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <input type="text" placeholder="Name" className="form-input" style={{ padding: '8px 10px', fontSize: '13px' }} value={newCountryName} onChange={(e) => setNewCountryName(e.target.value)} />
              <input type="text" placeholder="Code (e.g. USA)" className="form-input" style={{ padding: '8px 10px', fontSize: '13px' }} value={newCountryCode} onChange={(e) => setNewCountryCode(e.target.value)} />
              <button type="submit" className="btn-primary" style={{ fontSize: '13px', padding: '8px 0' }}>Add Country</button>
            </form>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '350px' }}>
              {countries.map(c => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCountryId(c.id)}
                  style={{
                    padding: '10px 14px', borderRadius: '10px', cursor: 'pointer',
                    background: selectedCountryId === c.id ? 'var(--accent-light)' : 'rgba(255,255,255,0.02)',
                    border: selectedCountryId === c.id ? '1px solid var(--accent)' : '1px solid var(--border)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}
                >
                  <span style={{ fontSize: '14px', textDecoration: c.isActive ? 'none' : 'line-through', opacity: c.isActive ? 1 : 0.5 }}>
                    {c.name} ({c.code})
                  </span>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <FiEdit2 onClick={(e) => { e.stopPropagation(); setEditingItem({ ...c, level: 'country' }); }} style={{ color: 'var(--accent)', cursor: 'pointer', fontSize: '14px' }} title="Edit Country" />
                    <FiTrash2 onClick={(e) => { e.stopPropagation(); handleDelete(c.id, c.name, 'country'); }} style={{ color: 'var(--error)', cursor: 'pointer', fontSize: '14px' }} title="Delete Country" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* States Panel */}
          <div style={{
            flex: '1 0 260px',
            background: 'rgba(15, 23, 42, 0.45)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '18px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
          }}>
            <h3 style={{ fontSize: '16px', color: 'var(--text-primary)', margin: 0 }}>States</h3>
            {selectedCountryId ? (
              <>
                <form onSubmit={handleCreateState} style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" placeholder="State Name" className="form-input" style={{ padding: '8px 10px', fontSize: '13px', flexGrow: 1 }} value={newStateName} onChange={(e) => setNewStateName(e.target.value)} />
                  <button type="submit" className="btn-primary" style={{ fontSize: '13px', padding: '8px 12px', width: 'auto' }}>Add</button>
                </form>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '350px' }}>
                  {states.map(s => (
                    <div
                      key={s.id}
                      onClick={() => setSelectedStateId(s.id)}
                      style={{
                        padding: '10px 14px', borderRadius: '10px', cursor: 'pointer',
                        background: selectedStateId === s.id ? 'var(--accent-light)' : 'rgba(255,255,255,0.02)',
                        border: selectedStateId === s.id ? '1px solid var(--accent)' : '1px solid var(--border)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}
                    >
                      <span style={{ fontSize: '14px', textDecoration: s.isActive ? 'none' : 'line-through', opacity: s.isActive ? 1 : 0.5 }}>{s.name}</span>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <FiEdit2 onClick={(e) => { e.stopPropagation(); setEditingItem({ ...s, level: 'state' }); }} style={{ color: 'var(--accent)', cursor: 'pointer', fontSize: '14px' }} title="Edit State" />
                        <FiTrash2 onClick={(e) => { e.stopPropagation(); handleDelete(s.id, s.name, 'state'); }} style={{ color: 'var(--error)', cursor: 'pointer', fontSize: '14px' }} title="Delete State" />
                      </div>
                    </div>
                  ))}
                  {states.length === 0 && <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>No states.</span>}
                </div>
              </>
            ) : (
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Select a Country.</span>
            )}
          </div>

          {/* Cities Panel */}
          <div style={{
            flex: '1 0 260px',
            background: 'rgba(15, 23, 42, 0.45)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '18px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
          }}>
            <h3 style={{ fontSize: '16px', color: 'var(--text-primary)', margin: 0 }}>Cities</h3>
            {selectedStateId ? (
              <>
                <form onSubmit={handleCreateCity} style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" placeholder="City Name" className="form-input" style={{ padding: '8px 10px', fontSize: '13px', flexGrow: 1 }} value={newCityName} onChange={(e) => setNewCityName(e.target.value)} />
                  <button type="submit" className="btn-primary" style={{ fontSize: '13px', padding: '8px 12px', width: 'auto' }}>Add</button>
                </form>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '350px' }}>
                  {cities.map(c => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCityId(c.id)}
                      style={{
                        padding: '10px 14px', borderRadius: '10px', cursor: 'pointer',
                        background: selectedCityId === c.id ? 'var(--accent-light)' : 'rgba(255,255,255,0.02)',
                        border: selectedCityId === c.id ? '1px solid var(--accent)' : '1px solid var(--border)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}
                    >
                      <span style={{ fontSize: '14px', textDecoration: c.isActive ? 'none' : 'line-through', opacity: c.isActive ? 1 : 0.5 }}>{c.name}</span>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <FiEdit2 onClick={(e) => { e.stopPropagation(); setEditingItem({ ...c, level: 'city' }); }} style={{ color: 'var(--accent)', cursor: 'pointer', fontSize: '14px' }} title="Edit City" />
                        <FiTrash2 onClick={(e) => { e.stopPropagation(); handleDelete(c.id, c.name, 'city'); }} style={{ color: 'var(--error)', cursor: 'pointer', fontSize: '14px' }} title="Delete City" />
                      </div>
                    </div>
                  ))}
                  {cities.length === 0 && <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>No cities.</span>}
                </div>
              </>
            ) : (
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Select a State.</span>
            )}
          </div>

          {/* Areas Panel */}
          <div style={{
            flex: '1 0 260px',
            background: 'rgba(15, 23, 42, 0.45)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '18px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
          }}>
            <h3 style={{ fontSize: '16px', color: 'var(--text-primary)', margin: 0 }}>Areas</h3>
            {selectedCityId ? (
              <>
                <form onSubmit={handleCreateArea} style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" placeholder="Area Name" className="form-input" style={{ padding: '8px 10px', fontSize: '13px', flexGrow: 1 }} value={newAreaName} onChange={(e) => setNewAreaName(e.target.value)} />
                  <button type="submit" className="btn-primary" style={{ fontSize: '13px', padding: '8px 12px', width: 'auto' }}>Add</button>
                </form>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', maxHeight: '350px' }}>
                  {areas.map(a => (
                    <div
                      key={a.id}
                      style={{
                        padding: '10px 14px', borderRadius: '10px',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}
                    >
                      <span style={{ fontSize: '14px', textDecoration: a.isActive ? 'none' : 'line-through', opacity: a.isActive ? 1 : 0.5 }}>{a.name}</span>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <FiEdit2 onClick={() => setEditingItem({ ...a, level: 'area' })} style={{ color: 'var(--accent)', cursor: 'pointer', fontSize: '14px' }} title="Edit Area" />
                        <FiTrash2 onClick={() => handleDelete(a.id, a.name, 'area')} style={{ color: 'var(--error)', cursor: 'pointer', fontSize: '14px' }} title="Delete Area" />
                      </div>
                    </div>
                  ))}
                  {areas.length === 0 && <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>No areas.</span>}
                </div>
              </>
            ) : (
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Select a City.</span>
            )}
          </div>
        </div>
      </div>
    );
  };

export default AdminLocationsPage;
