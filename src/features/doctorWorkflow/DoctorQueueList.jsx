import { useMemo } from 'react';
import styled from 'styled-components';
import DoctorQueueItem from './DoctorQueueItem';

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  width: 100%;
`;

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

const DoctorQueueList = ({ receptions = [], keyword = '', onRefresh }) => {
  const filtered = useMemo(() => {
    const k = normalizeText(keyword);
    if (!k) return receptions;

    return receptions.filter((tiepNhan) => {
      const benhNhan = tiepNhan.benhNhan || tiepNhan.benh_nhan || {
        HoTenBN: tiepNhan.HoTenBN || tiepNhan.tenBenhNhan,
        ID_BenhNhan: tiepNhan.ID_BenhNhan || tiepNhan.idBenhNhan,
        DienThoai: tiepNhan.dienThoaiBenhNhan || tiepNhan.DienThoai || tiepNhan.dienThoai,
        CCCD: tiepNhan.cccdBenhNhan || tiepNhan.CCCD
      };
      const haystack = [
        tiepNhan.ID_TiepNhan,
        benhNhan?.ID_BenhNhan,
        benhNhan?.HoTenBN,
        benhNhan?.DienThoai,
      ]
        .map((x) => normalizeText(x))
        .join(' ');
      return haystack.includes(k);
    });
  }, [receptions, keyword]);

  if (!filtered || filtered.length === 0) {
    return (
      <div className='flex items-center justify-center p-10 text-grey-500'>
        <p>Không có bệnh nhân nào đang chờ khám</p>
      </div>
    );
  }

  return (
    <GridContainer>
      {filtered.map((tiepNhan) => (
        <DoctorQueueItem key={tiepNhan.ID_TiepNhan} tiepNhan={tiepNhan} onRefresh={onRefresh} />
      ))}
    </GridContainer>
  );
};

export default DoctorQueueList;
