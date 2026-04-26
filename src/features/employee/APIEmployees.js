import axiosInstance from '../../utils/axiosInstance';

export async function getEmployees({ page = 1, limit = 7, search = '' }) {
  let data = [];
  if (search) {
    const response = await axiosInstance.get('/nhanvien/search', { params: { keyword: search } });
    data = response.data;
  } else {
    // If not searching, fetch with page 0 limit 10 to trigger the backend's getAll shortcut
    const response = await axiosInstance.get('/nhanvien', { params: { page: 0, limit: 10 } });
    data = response.data;
  }

  // Frontend Pagination
  const startIndex = (page - 1) * limit;
  const paginatedData = data.slice(startIndex, startIndex + limit);

  return {
    data: paginatedData,
    totalCount: data.length,
  };
}

export async function getEmployee(id) {
  const response = await axiosInstance.get(`/nhanvien/${id}`);
  return response.data;
}



















