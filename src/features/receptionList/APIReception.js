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

export async function createReceptionFromLichKham(arg1, arg2) {
  let id = null;
  let nhanVienId = null;

  if (typeof arg1 === 'object' && arg1 !== null) {
    id = arg1.ID_LichKham || arg1.lichKhamId;
    nhanVienId = arg1.ID_NhanVien;
  } else {
    id = arg1;
    nhanVienId = arg2;
  }

  const res = await axiosInstance.post('/appointments/from-lich-kham', {
    ID_LichKham: id,
    lichKhamId: id,
    ID_NhanVien: nhanVienId,
  });
  return res.data;
}
