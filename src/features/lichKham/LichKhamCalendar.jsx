import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useLichKhams } from './useLichKhams';
import Spinner from '../../ui/Spinner';

const CalendarWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 4px;
  background-color: #fff;
  border-radius: 6px;
  border: 1px solid #e7e8eb;
  padding: 12px;
`;

const DayCell = styled.button`
  min-height: 64px;
  padding: 4px;
  border-radius: 6px;
  border: 1px solid transparent;
  background-color: ${(props) => (props.isToday ? '#eff6ff' : 'transparent')};
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  transition: all 0.15s ease-in-out;

  &:hover {
    border-color: #3b82f6;
    background-color: #eff6ff;
  }
`;

const DayNumber = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #111827;
`;

const Badge = styled.span`
  margin-top: 4px;
  font-size: 10px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 999px;
  background-color: #e5e7eb;
  color: #374151;
`;

const WeekdayHeader = styled.div`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: #6b7280;
  text-align: center;
`;

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function formatDateKey(date) {
  return date.toISOString().split('T')[0];
}

function LichKhamCalendar({ onSelectDate }) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const { isLoading, lichKhams } = useLichKhams();

  const groupedByDate = useMemo(() => {
    const map = {};
    (lichKhams || []).forEach((lk) => {
      const ngayKham = lk.ngayKhamDuKien || lk.NgayKhamDuKien;
      const key = ngayKham?.split('T')[0] || ngayKham;
      if (!key) return;
      if (!map[key]) map[key] = [];
      map[key].push(lk);
    });
    return map;
  }, [lichKhams]);

  const todayKey = formatDateKey(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startWeekday = (monthStart.getDay() + 6) % 7; // convert Sunday=0 to Monday=0
  const daysInMonth = monthEnd.getDate();

  const weeks = [];
  let currentDay = 1 - startWeekday;
  while (currentDay <= daysInMonth) {
    const week = [];
    for (let i = 0; i < 7; i++) {
      week.push(currentDay);
      currentDay++;
    }
    weeks.push(week);
  }

  if (isLoading) return <Spinner />;

  const handlePrevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
    );
  };

  const monthLabel = currentMonth.toLocaleDateString('vi-VN', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-base font-semibold text-grey-900'>
          Lịch tháng của tôi
        </h3>
        <div className='flex items-center gap-2'>
          <button
            type='button'
            onClick={handlePrevMonth}
            className='px-2 py-1 text-sm border rounded-md border-grey-transparent hover:bg-grey-100'
          >
            Tháng trước
          </button>
          <span className='text-sm font-medium text-grey-800 min-w-[140px] text-center'>
            {monthLabel}
          </span>
          <button
            type='button'
            onClick={handleNextMonth}
            className='px-2 py-1 text-sm border rounded-md border-grey-transparent hover:bg-grey-100'
          >
            Tháng sau
          </button>
        </div>
      </div>

      <div className='grid grid-cols-7 gap-1 mb-2'>
        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d) => (
          <WeekdayHeader key={d}>{d}</WeekdayHeader>
        ))}
      </div>

      <CalendarWrapper>
        {weeks.map((week, wi) =>
          week.map((day, di) => {
            if (day < 1 || day > daysInMonth) {
              return <div key={`${wi}-${di}`} />;
            }
            const cellDate = new Date(
              currentMonth.getFullYear(),
              currentMonth.getMonth(),
              day,
            );
            const key = formatDateKey(cellDate);
            const list = groupedByDate[key] || [];
            const waitingCount = list.filter(
              (lk) => (lk.trangThai || lk.TrangThai) === 'ChoXacNhan',
            ).length;
            const confirmedCount = list.filter(
              (lk) => (lk.trangThai || lk.TrangThai) === 'DaXacNhan',
            ).length;
            const isToday = key === todayKey;

            return (
              <DayCell
                key={`${wi}-${di}`}
                isToday={isToday}
                onClick={() => onSelectDate && onSelectDate(key)}
              >
                <DayNumber>{day}</DayNumber>
                {list.length > 0 && (
                  <div className='mt-1 space-y-0.5'>
                    {waitingCount > 0 && (
                      <Badge>{waitingCount} chờ xác nhận</Badge>
                    )}
                    {confirmedCount > 0 && (
                      <Badge>{confirmedCount} đã xác nhận</Badge>
                    )}
                  </div>
                )}
              </DayCell>
            );
          }),
        )}
      </CalendarWrapper>
    </div>
  );
}

export default LichKhamCalendar;