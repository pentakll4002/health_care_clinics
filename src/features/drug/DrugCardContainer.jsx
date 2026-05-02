import styled from 'styled-components';
import DrugCard from './DrugCard';
import LoadMore from '../../ui/LoadMore';
import { useDrugs } from './useDrugs';
import Spinner from '../../ui/Spinner';

const ContainerGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
`;

const DrugCardContainer = ({ searchKeyword = '' }) => {
  const { isLoading, drugs, hasMore, loadMore } = useDrugs({ keyword: searchKeyword });

  if (isLoading) return <Spinner />;
  
  if (drugs.length === 0) {
    return (
      <div className='text-center py-10 text-grey-500'>
        {searchKeyword ? `Không tìm thấy thuốc nào với từ khóa "${searchKeyword}"` : 'Không có thuốc nào'}
      </div>
    );
  }

  return (
    <>
      <ContainerGrid>
        {drugs.map((drug) => (
          <DrugCard key={drug.idThuoc} drug={drug} />
        ))}
      </ContainerGrid>

      {!hasMore ? (
        <span />
      ) : (
        <LoadMore onClick={loadMore} disabled={!hasMore} />
      )}
    </>
  );
};

export default DrugCardContainer;

