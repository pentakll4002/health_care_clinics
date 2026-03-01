import axiosInstance from '../../utils/axiosInstance';

export async function getGioiTinh() {
  const res = await axiosInstance.get('/gioi-tinh');
  return res.data.data;
}
