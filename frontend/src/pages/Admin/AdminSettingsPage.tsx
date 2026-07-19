import React, { useState, useEffect } from 'react';
import { getSettings, updateSetting } from '../../services/adminApi';
import { useAppDispatch } from '../../store/hooks';
import { showToast } from '../../store/toastSlice';

const AdminSettingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await getSettings();
      if (res.success && res.data) {
        setSettings(res.data);
      }
    } catch (err: any) {
      dispatch(showToast({
        message: err.response?.data?.message || 'Failed to load system settings.',
        type: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: string) => {
    const currentValue = settings[key] === 'true';
    const newValue = !currentValue;
    
    setSavingKey(key);
    try {
      const res = await updateSetting(key, newValue.toString());
      if (res.success) {
        setSettings(prev => ({ ...prev, [key]: newValue.toString() }));
        dispatch(showToast({ message: `Setting updated: ${key} = ${newValue}`, type: 'success' }));
      }
    } catch (err: any) {
      dispatch(showToast({
        message: err.response?.data?.message || 'Failed to save system setting.',
        type: 'error'
      }));
    } finally {
      setSavingKey(null);
    }
  };

  const autoApprove = settings['AutoApproveRoleRequests'] === 'true';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px' }}>
      <div className="glass-card" style={{ padding: '25px', textAlign: 'left' }}>
        <h3 style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '10px' }}>Platform Configurations</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          Configure global behaviors and business rules for the real estate portal.
        </p>

        {loading ? (
          <div>Loading settings...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '15px',
              background: 'rgba(255,255,255,0.01)',
              border: '1px solid var(--border)',
              borderRadius: '12px'
            }}>
              <div>
                <h4 style={{ fontSize: '14px', margin: '0 0 4px 0', color: 'var(--text-primary)' }}>Auto-Approve Role Requests</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, paddingRight: '20px' }}>
                  If enabled, user requests to upgrade to Seller or Agent will be instantly approved by the system. If disabled, they require manual Administrator review.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <label className="switch" style={{
                  position: 'relative',
                  display: 'inline-block',
                  width: '46px',
                  height: '24px'
                }}>
                  <input
                    type="checkbox"
                    checked={autoApprove}
                    onChange={() => handleToggle('AutoApproveRoleRequests')}
                    disabled={savingKey === 'AutoApproveRoleRequests'}
                    style={{
                      opacity: 0,
                      width: 0,
                      height: 0
                    }}
                  />
                  <span style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: autoApprove ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                    transition: '0.3s',
                    borderRadius: '24px',
                    border: '1px solid var(--border)'
                  }}>
                    <span style={{
                      position: 'absolute',
                      content: '""',
                      height: '16px',
                      width: '16px',
                      left: autoApprove ? '24px' : '4px',
                      bottom: '3px',
                      backgroundColor: '#fff',
                      transition: '0.3s',
                      borderRadius: '50%'
                    }} />
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSettingsPage;
