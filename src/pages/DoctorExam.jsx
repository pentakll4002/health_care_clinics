import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import Spinner from '../ui/Spinner';
import toast from 'react-hot-toast';
import { useQuery, useMutation } from '@tanstack/react-query';

import { getAppointment } from '../features/appointments/APIAppointments';
import { checkCanCreatePhieuKham, createPhieuKham } from '../features/medicalForm/API_PhieuKham';
import MedicalDetail from '../features/medicalForm/MedicalDetail';

const LayoutDoctorExam = styled.div`
  width: 100%;
  height: 100%;
  padding: 20px;
  background-color: #f5f6f8;
`;

const DoctorExam = () => {
  const { id } = useParams(); // ID_TiepNhan
  const navigate = useNavigate();

  const [phieuKhamId, setPhieuKhamId] = useState(null);

  const { isLoading: isLoadingReception, data: tiepNhan } = useQuery({
    queryKey: ['doctor-reception', id],
    queryFn: () => getAppointment(id),
    enabled: !!id,
    retry: false,
  });

  const existingPhieuKhamId = useMemo(() => {
    const list = tiepNhan?.phieuKhams || tiepNhan?.phieu_khams;
    const first = Array.isArray(list) ? list[0] : null;
    return first?.ID_PhieuKham || null;
  }, [tiepNhan]);

  const checkMutation = useMutation({
    mutationFn: () => checkCanCreatePhieuKham(Number(id)),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createPhieuKham({
        ID_TiepNhan: Number(id),
        CaKham: tiepNhan?.CaTN,
      }),
  });

  useEffect(() => {
    if (!tiepNhan) return;

    // Nếu đã có phiếu khám -> đi thẳng vào khám
    if (existingPhieuKhamId) {
      setPhieuKhamId(existingPhieuKhamId);
      return;
    }

    // Chưa có phiếu khám -> chỉ tạo khi tiếp nhận đang CHO_KHAM hoặc DANG_KHAM
    const trangThai = tiepNhan?.TrangThaiTiepNhan;
    if (trangThai !== 'CHO_KHAM' && trangThai !== 'DANG_KHAM') {
      toast.error('Tiếp nhận này chưa ở trạng thái chờ khám hoặc đã được xử lý.');
      return;
    }

    if (checkMutation.isLoading || createMutation.isLoading) return;

    (async () => {
      try {
        const can = await checkMutation.mutateAsync();
        const isAllowed = can?.canCreate === true || can?.data === true || (can?.canCreate !== false && can?.data !== false);
        if (!isAllowed) {
          toast.error('Không thể tạo phiếu khám cho tiếp nhận này.');
          return;
        }

        const created = await createMutation.mutateAsync();
        const newId = created?.ID_PhieuKham || created?.idPhieuKham || created?.data?.ID_PhieuKham || created?.data?.idPhieuKham;
        if (!newId) {
          toast.error('Tạo phiếu khám thất bại (không nhận được ID).');
          return;
        }

        setPhieuKhamId(newId);
      } catch (e) {
        toast.error(e?.response?.data?.message || 'Lỗi khi tạo phiếu khám');
      }
    })();
  }, [tiepNhan, existingPhieuKhamId]);

  const isBusy =
    isLoadingReception ||
    checkMutation.isLoading ||
    createMutation.isLoading ||
    (!phieuKhamId && !!tiepNhan);

  if (isLoadingReception) return <Spinner />;

  if (!tiepNhan) {
    return (
      <LayoutDoctorExam>
        <div className='mb-4'>
          <button
            className='text-sm text-primary font-semibold'
            onClick={() => navigate('/doctor/queue')}
          >
            ← Quay lại hàng chờ
          </button>
        </div>
        <div className='p-10 text-center text-grey-500'>Không tìm thấy thông tin tiếp nhận</div>
      </LayoutDoctorExam>
    );
  }

  if (isBusy) {
    return (
      <LayoutDoctorExam>
        <div className='mb-4'>
          <button
            className='text-sm text-primary font-semibold'
            onClick={() => navigate('/doctor/queue')}
          >
            ← Quay lại hàng chờ
          </button>
        </div>
        <div className='flex items-center justify-center py-10'>
          <Spinner />
        </div>
      </LayoutDoctorExam>
    );
  }

  if (!phieuKhamId) {
    return (
      <LayoutDoctorExam>
        <div className='mb-4'>
          <button
            className='text-sm text-primary font-semibold'
            onClick={() => navigate('/doctor/queue')}
          >
            ← Quay lại hàng chờ
          </button>
        </div>
        <div className='p-10 text-center text-grey-500'>Không thể mở phiếu khám cho tiếp nhận này</div>
      </LayoutDoctorExam>
    );
  }

  return (
    <LayoutDoctorExam>
      <div className='mb-4'>
        <button
          className='text-sm text-primary font-semibold'
          onClick={() => navigate('/doctor/queue')}
        >
          ← Quay lại hàng chờ
        </button>
      </div>

      <MedicalDetail ID_PhieuKham={phieuKhamId} />
    </LayoutDoctorExam>
  );
};

export default DoctorExam;
