import { useQuery } from '@tanstack/react-query';
import { getRegulations } from './APIRegulations';

export function useRegulations() {
  const { isLoading, data } = useQuery({
    queryKey: ['regulations'],
    queryFn: getRegulations,
  });

  const formattedData = {};
  if (Array.isArray(data)) {
    data.forEach(item => {
      const ten = item.tenQuyDinh || item.TenQuyDinh;
      const giaTri = item.giaTri || item.GiaTri;
      const id = item.idQuyDinh || item.ID_QuyDinh;
      
      if (id === 1 || ten === 'Số bệnh nhân tối đa trong ngày') formattedData.SoBenhNhanToiDa = giaTri;
      if (id === 2 || ten === 'Giá khám cơ bản') formattedData.TienKham = giaTri;
      if (id === 3 || ten === 'Số thuốc tối đa trong toa' || ten === 'Tỷ lệ đơn giá bán') formattedData.TyLeGiaBan = giaTri;
      if (id === 4 || ten === 'GioLamViec_Sang_BatDau') formattedData.GioLamViec_Sang_BatDau = giaTri;
      if (id === 5 || ten === 'GioLamViec_Sang_KetThuc') formattedData.GioLamViec_Sang_KetThuc = giaTri;
      if (id === 6 || ten === 'GioLamViec_Chieu_BatDau') formattedData.GioLamViec_Chieu_BatDau = giaTri;
      if (id === 7 || ten === 'GioLamViec_Chieu_KetThuc') formattedData.GioLamViec_Chieu_KetThuc = giaTri;
      if (id === 8 || ten === 'GioLamViec_Toi_BatDau') formattedData.GioLamViec_Toi_BatDau = giaTri;
      if (id === 9 || ten === 'GioLamViec_Toi_KetThuc') formattedData.GioLamViec_Toi_KetThuc = giaTri;
    });
  } else if (data && typeof data === 'object') {
    Object.assign(formattedData, data);
  }

  return { isLoading, regulations: formattedData };
}
