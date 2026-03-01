import axiosInstance from '../../utils/axiosInstance';

export async function getNhomNguoiDung() {
  const res = await axiosInstance.get('/nhom-nguoi-dung');
  return res.data.data;
}

export async function getNhomNguoiDungByMaNhom(maNhom) {
  const res = await axiosInstance.get(`/nhom-nguoi-dung/ma-nhom/${maNhom}`);
  return res.data;
}
