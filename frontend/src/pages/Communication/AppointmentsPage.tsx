import React, { useEffect, useState } from 'react';
import {
  FiCalendar,
  FiClock,
  FiUsers,
  FiCheck,
  FiX,
  FiRefreshCw,
  FiList,
  FiGrid,
} from 'react-icons/fi';
import { appointmentApi } from '../../services/communicationApi';
import type { AppointmentDto } from '../../services/communicationApi';

const STATUS_MAP: Record<number, { label: string; color: string; bg: string }> = {
  0: { label: 'Pending', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  1: { label: 'Approved', color: '#4ade80', bg: 'rgba(74,222,128,0.12)' },
  2: { label: 'Rejected', color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
  3: { label: 'Cancelled', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
  4: { label: 'Completed', color: '#818cf8', bg: 'rgba(129,140,248,0.12)' },
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const AppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<AppointmentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [filterStatus, setFilterStatus] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [calendarDate, setCalendarDate] = useState(new Date());

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const params = filterStatus !== null ? { status: filterStatus } : undefined;
      const { data } = await appointmentApi.getAll(params);
      setAppointments(data);
    } catch { /* noop */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAppointments(); }, [filterStatus]);

  const handleStatusUpdate = async (id: string, status: number) => {
    setActionLoading(id + status);
    try {
      await appointmentApi.updateStatus(id, status);
      fetchAppointments();
    } catch { /* noop */ }
    finally { setActionLoading(null); }
  };

  const formatDate = (dt: string) =>
    new Date(dt).toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
    });

  const formatTime = (dt: string) =>
    new Date(dt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // Calendar helpers
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calendarCells = Array.from({ length: 42 }, (_, i) => {
    const dayNum = i - firstDay + 1;
    return dayNum >= 1 && dayNum <= daysInMonth ? dayNum : null;
  });
  const appointmentsByDay = appointments.reduce((acc, apt) => {
    const d = new Date(apt.scheduledAt);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const key = d.getDate();
      if (!acc[key]) acc[key] = [];
      acc[key].push(apt);
    }
    return acc;
  }, {} as Record<number, AppointmentDto[]>);

  const today = new Date();

  return (
    <div className="p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--heading)', color: 'var(--text-primary)' }}>
            Appointments
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Schedule and manage property visits
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)' }}>
          {(['list', 'calendar'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
              style={{
                background: view === v ? 'rgba(183,94,255,0.2)' : 'transparent',
                color: view === v ? 'var(--accent)' : 'var(--text-secondary)',
                border: 'none', cursor: 'pointer',
              }}
            >
              {v === 'list' ? <FiList size={14} /> : <FiGrid size={14} />}
              {v === 'list' ? 'List' : 'Calendar'}
            </button>
          ))}
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex flex-wrap gap-2">
        {[null, 0, 1, 2, 3, 4].map((s) => (
          <button
            key={String(s)}
            onClick={() => setFilterStatus(s)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={{
              background: filterStatus === s ? 'rgba(183,94,255,0.2)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${filterStatus === s ? 'rgba(183,94,255,0.4)' : 'var(--border)'}`,
              color: filterStatus === s ? 'var(--accent)' : 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            {s === null ? 'All' : STATUS_MAP[s].label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 rounded-full animate-spin"
            style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
        </div>
      ) : (
        <>
          {/* ── List View ── */}
          {view === 'list' && (
            appointments.length === 0 ? (
              <div className="text-center py-16">
                <FiCalendar size={40} style={{ color: 'var(--text-secondary)', margin: '0 auto 12px' }} />
                <p style={{ color: 'var(--text-secondary)' }}>No appointments found</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {appointments.map((apt) => {
                  const s = STATUS_MAP[apt.status] ?? STATUS_MAP[0];
                  return (
                    <div key={apt.id} className="rounded-2xl p-5 flex flex-col gap-3"
                      style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid var(--border)' }}>
                      <div className="flex items-start justify-between flex-wrap gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                              {apt.propertyName || 'Property Visit'}
                            </h3>
                            <span className="px-2 py-0.5 rounded-lg text-xs font-medium"
                              style={{ background: s.bg, color: s.color }}>
                              {s.label}
                            </span>
                          </div>
                          {apt.propertyAddress && (
                            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                              {apt.propertyAddress}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-sm font-medium flex items-center gap-1.5"
                            style={{ color: 'var(--text-primary)' }}>
                            <FiCalendar size={13} style={{ color: 'var(--accent)' }} />
                            {formatDate(apt.scheduledAt)}
                          </span>
                          <span className="text-xs flex items-center gap-1.5"
                            style={{ color: 'var(--text-secondary)' }}>
                            <FiClock size={11} /> {formatTime(apt.scheduledAt)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 flex-wrap text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {apt.buyerName && (
                          <span>Buyer: <strong style={{ color: 'var(--text-primary)' }}>{apt.buyerName}</strong></span>
                        )}
                        <span className="flex items-center gap-1">
                          <FiUsers size={13} /> {apt.numberOfVisitors} visitor{apt.numberOfVisitors > 1 ? 's' : ''}
                        </span>
                        {apt.notes && (
                          <span className="italic">"{apt.notes}"</span>
                        )}
                      </div>

                      {/* Seller Actions for Pending */}
                      {apt.status === 0 && (
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handleStatusUpdate(apt.id, 1)}
                            disabled={actionLoading === apt.id + '1'}
                            className="px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                            style={{ background: 'rgba(74,222,128,0.15)', color: 'var(--success)', border: '1px solid rgba(74,222,128,0.3)', cursor: 'pointer' }}
                          >
                            <FiCheck size={13} /> Approve
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(apt.id, 2)}
                            disabled={actionLoading === apt.id + '2'}
                            className="px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                            style={{ background: 'rgba(248,113,113,0.12)', color: 'var(--error)', border: '1px solid rgba(248,113,113,0.2)', cursor: 'pointer' }}
                          >
                            <FiX size={13} /> Reject
                          </button>
                        </div>
                      )}
                      {apt.status === 1 && (
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => handleStatusUpdate(apt.id, 4)}
                            disabled={actionLoading === apt.id + '4'}
                            className="px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                            style={{ background: 'rgba(129,140,248,0.12)', color: '#818cf8', border: '1px solid rgba(129,140,248,0.2)', cursor: 'pointer' }}
                          >
                            <FiRefreshCw size={13} /> Mark Completed
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(apt.id, 3)}
                            disabled={actionLoading === apt.id + '3'}
                            className="px-4 py-2 rounded-lg text-xs font-semibold"
                            style={{ background: 'rgba(148,163,184,0.1)', color: 'var(--text-secondary)', border: '1px solid var(--border)', cursor: 'pointer' }}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* ── Calendar View ── */}
          {view === 'calendar' && (
            <div className="rounded-2xl overflow-hidden"
              style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid var(--border)' }}>
              {/* Calendar Header */}
              <div className="flex items-center justify-between p-5 border-b"
                style={{ borderColor: 'var(--border)' }}>
                <button
                  onClick={() => setCalendarDate(new Date(year, month - 1))}
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-primary)', cursor: 'pointer' }}
                >
                  ‹
                </button>
                <h2 className="font-bold text-lg" style={{ fontFamily: 'var(--heading)', color: 'var(--text-primary)' }}>
                  {MONTHS[month]} {year}
                </h2>
                <button
                  onClick={() => setCalendarDate(new Date(year, month + 1))}
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-primary)', cursor: 'pointer' }}
                >
                  ›
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 border-b" style={{ borderColor: 'var(--border)' }}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                  <div key={d} className="py-2 text-center text-xs font-semibold"
                    style={{ color: 'var(--text-secondary)' }}>{d}</div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7">
                {calendarCells.map((day, idx) => {
                  const apts = day ? (appointmentsByDay[day] || []) : [];
                  const isToday = day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                  return (
                    <div
                      key={idx}
                      className="min-h-[90px] p-2 border-b border-r flex flex-col gap-1"
                      style={{ borderColor: 'var(--border)', opacity: day ? 1 : 0.3 }}
                    >
                      {day && (
                        <>
                          <span
                            className="text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full"
                            style={{
                              color: isToday ? '#fff' : 'var(--text-secondary)',
                              background: isToday ? 'var(--accent)' : 'transparent',
                            }}
                          >
                            {day}
                          </span>
                          {apts.slice(0, 2).map((apt) => {
                            const s = STATUS_MAP[apt.status];
                            return (
                              <div key={apt.id} className="text-xs px-1.5 py-0.5 rounded-md truncate"
                                style={{ background: s.bg, color: s.color }}>
                                {formatTime(apt.scheduledAt)} {apt.propertyName || ''}
                              </div>
                            );
                          })}
                          {apts.length > 2 && (
                            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                              +{apts.length - 2} more
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AppointmentsPage;
