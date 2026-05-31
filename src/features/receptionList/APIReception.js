import axiosInstance from '../../utils/axiosInstance';

export async function getReceptions(params = {}) {
  const res = await axiosInstance.get('/appointments', { params });
  return res.data; // Trả về cả data và totalCount
}

export async function updateReception(id, data) {
  const res = await axiosInstance.put(`/appointments/${id}`, data);
  return res.data;
}

export async function getReceptionsToday(params = {}) {
  const now = new Date();
  const todayLocal = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .split('T')[0]

  const res = await axiosInstance.get('/appointments', {
    params: {
      ...params,
      ngay: todayLocal,
      chua_kham: true,
    },
  });
  return {
    data: res.data.data || [],
    totalCount: res.data.totalCount || 0,
  };
}

export async function createReceptionFromLichKham(ID_LichKham, ID_NhanVien) {
  const res = await axiosInstance.post('/appointments/from-lich-kham', {
    ID_LichKham,
    lichKhamId: ID_LichKham,
    ID_NhanVien,
  });
  return res.data;
}
