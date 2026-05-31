import Table from '../../ui/Table';
import styled from 'styled-components';
import ModalCenter from '../../ui/ModalCenter';
import { EyeIcon, TrashIcon } from '@heroicons/react/24/outline';
import ReportDetail from './ReportDetail';
import ConfirmDelete from '../../ui/ConfirmDelete';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteReport } from './APIReports';
import toast from 'react-hot-toast';

const Text = styled.span`
  color: #0a1b39;
  font-size: 14px;
  font-weight: 500;
  margin: auto;
`;

const ReportRow = ({ report }) => {
  const {
    idBcdt: ID_BCDT,
    thang: Thang,
    nam: Nam,
    tongDoanhThu: TongDoanhThu,
  } = report;

  const queryClient = useQueryClient();

  const { mutate: deleteReportMutation, isLoading } = useMutation({
    mutationFn: deleteReport,
    onSuccess: () => {
      toast.success('Xoá báo cáo thành công');
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || 'Xoá báo cáo thất bại');
    },
  });

  function handleDelete() {
    deleteReportMutation(ID_BCDT);
  }

  const formatCurrency = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
      amount || 0
    );

  return (
    <Table.Row>
      <Text>{ID_BCDT}</Text>
      <Text>Tháng {Thang}/{Nam}</Text>
      <Text>{formatCurrency(TongDoanhThu)}</Text>

      <div className='flex items-center justify-center gap-2'>
        <ModalCenter>
          <ModalCenter.Open opens={`report-detail-${ID_BCDT}`}>
            <button className='text-white py-1 px-2 bg-primary flex items-center justify-center rounded-lg font-semibold'>
              <EyeIcon className='w-5 h-5' />
            </button>
          </ModalCenter.Open>
          <ModalCenter.Window name={`report-detail-${ID_BCDT}`}>
            <ReportDetail ID_BCDT={ID_BCDT} />
          </ModalCenter.Window>
        </ModalCenter>

        <ModalCenter>
          <ModalCenter.Open opens={`delete-report-${ID_BCDT}`}>
            <button className='text-white py-1 px-2 bg-error-900 flex items-center justify-center rounded-lg font-semibold'>
              <TrashIcon className='w-5 h-5' />
            </button>
          </ModalCenter.Open>
          <ModalCenter.Window name={`delete-report-${ID_BCDT}`}>
            <ConfirmDelete
              resourceName={`Báo cáo tháng ${Thang}/${Nam}`}
              onConfirm={handleDelete}
              disabled={isLoading}
            />
          </ModalCenter.Window>
        </ModalCenter>
      </div>
    </Table.Row>
  );
};

export default ReportRow;

