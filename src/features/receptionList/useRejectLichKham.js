import { useMutation, useQueryClient } from '@tanstack/react-query';
import { rejectLichKham } from '../lichKham/APILichKham';
import toast from 'react-hot-toast';

export function useRejectLichKham() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectLichKham,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allLichKhams'] });
      toast.success('Đã từ chối/hủy lịch hẹn online!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Từ chối lịch hẹn thất bại');
    },
  });
}
