import axiosInstance from '../../utils/axiosInstance';

export async function getRegulations() {
  const response = await axiosInstance.get('/qui-dinh');
  return response.data.data || response.data || {};
}

export async function updateRegulations(data) {
  const response = await axiosInstance.put('/qui-dinh', data);
  return response.data.data || response.data || {};
}


