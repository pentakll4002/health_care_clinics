import { useCallback, useMemo, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '../utils/axiosInstance';
import { useRolePermissions } from './useRolePermissions';

const QUERY_KEY = ['business-notifications'];

function getTodayLocalISODate() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .split('T')[0];
}

function safeDateString(value) {
  if (!value) return '';
  try {
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString();
  } catch {
    return '';
  }
}

function normalizeId(parts) {
  return parts
    .filter(Boolean)
    .map((p) => String(p))
    .join('|');
}

function getReadStorageKey({ roleCode, userId }) {
  const uid = userId ?? 'anonymous';
  return `business_notifications_read_v1:${uid}:${roleCode || 'unknown'}`;
}

function readReadSet(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed);
  } catch {
    return new Set();
  }
}

function writeReadSet(storageKey, set) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(Array.from(set)));
  } catch {
    // ignore
  }
}

async function fetchPatientNotifications() {
  const response = await axiosInstance.get('/patient/notifications');
  const notifications = response.data?.data || [];
  return notifications.map((n) => {
    const id = normalizeId(['patient', n.type, n.message, safeDateString(n.created_at)]);
    return {
      id,
      title: n.title || 'Thông báo',
      message: n.message || '',
      createdAt: safeDateString(n.created_at),
      action: { to: '/patients/profile' },
    };
  });
}

async function fetchReceptionistNotifications() {
  const [pendingOnlineRes, pendingPaymentRes] = await Promise.all([
    axiosInstance.get('/appointments', {
      params: { page: 1, limit: 1, TrangThaiTiepNhan: 'CHO_XAC_NHAN' },
    }),
    axiosInstance.get('/phieu-kham', {
      params: { page: 1, limit: 1, only_without_invoice: true, only_completed: true },
    }),
  ]);

  const pendingOnline = pendingOnlineRes.data?.totalCount || 0;
  const pendingPayments = pendingPaymentRes.data?.totalCount || 0;

  const notifications = [];

  if (pendingOnline > 0) {
    notifications.push({
      id: normalizeId(['reception', 'pending-online', pendingOnline]),
      title: 'Lịch hẹn online chờ duyệt',
      message: `Có ${pendingOnline} lịch hẹn online đang chờ lễ tân xác nhận`,
      createdAt: '',
      action: { to: '/reception?tab=online' },
    });
  }

  if (pendingPayments > 0) {
    notifications.push({
      id: normalizeId(['reception', 'pending-payment', pendingPayments]),
      title: 'Phiếu khám đã hoàn tất',
      message: `Có ${pendingPayments} phiếu khám đã hoàn tất và cần lập hoá đơn`,
      createdAt: '',
      action: { to: '/invoices' },
    });
  }

  return notifications;
}

async function fetchDoctorNotifications() {
  const today = getTodayLocalISODate();
  const response = await axiosInstance.get('/appointments', {
    params: { page: 1, limit: 1, ngay: today, chua_kham: true },
  });

  const total = response.data?.totalCount || 0;
  if (total <= 0) return [];

  return [
    {
      id: normalizeId(['doctor', 'queue', total, today]),
      title: 'Bệnh nhân chờ khám',
      message: `Có ${total} bệnh nhân đang chờ khám hôm nay`,
      createdAt: '',
      action: { to: '/doctor/queue' },
    },
  ];
}

async function fetchManagerNotifications() {
  const response = await axiosInstance.get('/thuoc', { params: { page: 1, limit: 200 } });
  const drugs = response.data?.data || [];
  const threshold = 10;
  const lowStock = drugs.filter((d) => {
    const stock = Number(d?.SoLuongTon);
    return !Number.isNaN(stock) && stock >= 0 && stock <= threshold;
  });

  if (lowStock.length === 0) return [];

  return [
    {
      id: normalizeId(['manager', 'low-stock', lowStock.length, threshold]),
      title: 'Cảnh báo tồn kho',
      message: `Có ${lowStock.length} thuốc sắp hết (<= ${threshold})`,
      createdAt: '',
      action: { to: '/drugs' },
    },
  ];
}

export function addActivityNotification({ title, message, actionTo }) {
  try {
    const key = 'system_activity_notifications_v1';
    const raw = localStorage.getItem(key);
    const list = raw ? JSON.parse(raw) : [];

    const newNotif = {
      id: `activity|${Date.now()}|${Math.random()}`,
      title: title || 'Hệ thống',
      message: message || '',
      createdAt: new Date().toISOString(),
      action: actionTo ? { to: actionTo } : null,
    };

    const updatedList = [newNotif, ...list].slice(0, 50);
    localStorage.setItem(key, JSON.stringify(updatedList));
    window.dispatchEvent(new CustomEvent('system-activity-updated'));
  } catch (e) {
    console.error(e);
  }
}

async function fetchBusinessNotificationsByRole(roleCode) {
  if (!roleCode) return [];

  const cleanRole = roleCode.startsWith('@') ? roleCode.slice(1) : roleCode;

  let roleNotifs = [];
  if (cleanRole === 'patient') roleNotifs = await fetchPatientNotifications();
  else if (cleanRole === 'receptionists') roleNotifs = await fetchReceptionistNotifications();
  else if (cleanRole === 'doctors') roleNotifs = await fetchDoctorNotifications();
  else if (cleanRole === 'managers') roleNotifs = await fetchManagerNotifications();
  else if (cleanRole === 'admin') {
    const [reception, doctors, manager] = await Promise.all([
      fetchReceptionistNotifications(),
      fetchDoctorNotifications(),
      fetchManagerNotifications(),
    ]);
    roleNotifs = [...reception, ...doctors, ...manager];
  }

  // Load activities from local storage
  let activityNotifs = [];
  try {
    const raw = localStorage.getItem('system_activity_notifications_v1');
    if (raw) {
      activityNotifs = JSON.parse(raw);
    }
  } catch (e) {}

  const combined = [...activityNotifs, ...roleNotifs];

  // Sort by date (descending)
  combined.sort((a, b) => {
    if (!a.createdAt) return 1;
    if (!b.createdAt) return -1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return combined;
}

export function useBusinessNotifications({ refetchIntervalMs = 60000 } = {}) {
  const queryClient = useQueryClient();
  const { roleCode } = useRolePermissions();

  const userId = useMemo(() => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.id || parsed?.user_id || parsed?.ID_User || null;
    } catch {
      return null;
    }
  }, []);

  const storageKey = useMemo(() => getReadStorageKey({ roleCode, userId }), [roleCode, userId]);

  const { data, isLoading, error } = useQuery({
    queryKey: [...QUERY_KEY, roleCode],
    queryFn: () => fetchBusinessNotificationsByRole(roleCode),
    enabled: !!roleCode,
    retry: false,
    refetchInterval: refetchIntervalMs,
  });

  const [updateTrigger, setUpdateTrigger] = useState(0);
  const notifications = data || [];

  const isRead = useCallback(
    (id) => {
      const readSet = readReadSet(storageKey);
      return readSet.has(id);
    },
    [storageKey, updateTrigger],
  );

  const unreadCount = useMemo(() => {
    const readSet = readReadSet(storageKey);
    return notifications.reduce((acc, n) => (readSet.has(n.id) ? acc : acc + 1), 0);
  }, [notifications, storageKey, updateTrigger]);

  const markRead = useCallback(
    (id) => {
      const readSet = readReadSet(storageKey);
      readSet.add(id);
      writeReadSet(storageKey, readSet);
      setUpdateTrigger((prev) => prev + 1);
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, roleCode] });
    },
    [queryClient, roleCode, storageKey],
  );

  const markAllRead = useCallback(() => {
    const readSet = readReadSet(storageKey);
    notifications.forEach((n) => readSet.add(n.id));
    writeReadSet(storageKey, readSet);
    setUpdateTrigger((prev) => prev + 1);
    queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, roleCode] });
  }, [notifications, queryClient, roleCode, storageKey]);

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, roleCode] });
  }, [queryClient, roleCode]);

  // Sync listener for direct updates
  useEffect(() => {
    const handleUpdate = () => {
      setUpdateTrigger((prev) => prev + 1);
      refresh();
    };
    window.addEventListener('system-activity-updated', handleUpdate);
    return () => window.removeEventListener('system-activity-updated', handleUpdate);
  }, [refresh]);

  return {
    roleCode,
    notifications,
    unreadCount,
    isLoading,
    error,
    isRead,
    markRead,
    markAllRead,
    refresh,
  };
}
