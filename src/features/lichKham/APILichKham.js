import axiosInstance from '../../utils/axiosInstance';

// Lấy danh sách lịch khám của bệnh nhân hiện tại
export async function getLichKhams(params = {}) {
  const res = await axiosInstance.get('/patient/lich-kham', { params });
  return {
    data: res.data.data || res.data,
    totalCount: res.data.totalCount || (Array.isArray(res.data) ? res.data.length : 0),
  };
}

// Đặt lịch khám mới (patient side)
export async function createLichKham(data) {
  // Map frontend field names to backend DTO camelCase
  const payload = {
    ngayKhamDuKien: data.NgayKhamDuKien || data.ngayKhamDuKien,
    caKham: data.CaKham || data.caKham,
    ghiChu: data.GhiChu || data.ghiChu || null,
  };
  // Optional: bác sĩ
  if (data.ID_BacSi || data.idBacSi) {
    payload.idBacSi = Number(data.ID_BacSi || data.idBacSi);
  }
  const res = await axiosInstance.post('/patient/lich-kham', payload);
  return res.data;
}

// Lấy chi tiết lịch khám
export async function getLichKham(id) {
  const res = await axiosInstance.get(`/patient/lich-kham/${id}`);
  return res.data;
}

// Hủy lịch khám
export async function cancelLichKham(id) {
  const res = await axiosInstance.post(`/patient/lich-kham/${id}/cancel`);
  return res.data;
}

// Lấy tất cả lịch khám (cho admin/lễ tân)
export async function getAllLichKhams(params = {}) {
  const res = await axiosInstance.get('/lich-kham', { params });
  // Backend returns List<LichKhamDTO> directly (no wrapper)
  const rawData = res.data;
  if (Array.isArray(rawData)) {
    return {
      data: rawData,
      totalCount: rawData.length,
    };
  }
  return {
    data: rawData.data || [],
    totalCount: rawData.totalCount || 0,
  };
}

// Lấy chi tiết lịch khám (cho admin/lễ tân)
export async function getLichKhamDetail(id) {
  const res = await axiosInstance.get(`/lich-kham/${id}`);
  return res.data;
}

// Cập nhật lịch khám (cho admin/lễ tân)
export async function updateLichKham(id, data) {
  // Map field names to camelCase for backend DTO
  const payload = {};
  if (data.NgayKhamDuKien || data.ngayKhamDuKien) payload.ngayKhamDuKien = data.NgayKhamDuKien || data.ngayKhamDuKien;
  if (data.CaKham || data.caKham) payload.caKham = data.CaKham || data.caKham;
  if (data.TrangThai || data.trangThai) payload.trangThai = data.TrangThai || data.trangThai;
  if (data.GhiChu !== undefined || data.ghiChu !== undefined) payload.ghiChu = data.GhiChu ?? data.ghiChu;
  if (data.ID_BacSi || data.idBacSi) payload.idBacSi = Number(data.ID_BacSi || data.idBacSi);

  const res = await axiosInstance.put(`/lich-kham/${id}`, payload);
  return res.data;
}

// Xác nhận lịch khám (cho admin/lễ tân)
export async function confirmLichKham({ id, ID_BacSi }) {
  const res = await axiosInstance.post(`/lich-kham/${id}/confirm`, {
    ID_BacSi,
  });
  return res.data;
}

// Xóa lịch khám (cho admin/lễ tân)
export async function deleteLichKham(id) {
  const res = await axiosInstance.delete(`/lich-kham/${id}`);
  return res.data;
}
