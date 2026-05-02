import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import Button from '../../ui/Button';
import Spinner from '../../ui/Spinner';
import defaultAvatar from '../../assets/default-user.jpg';
import {
  useChangePatientPassword,
  useCreatePatientAppointment,
  useDoctorsForAppointments,
  usePatientAppointments,
  usePatientDashboard,
  usePatientInvoices,
  usePatientMedicalRecords,
  usePatientNotifications,
  usePatientSelfProfile,
  useUpdatePatientSelfProfile,
  useCancelPatientAppointment,
} from './usePatientSelfData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const currencyFormatter = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

function buildAvatarUrl(path) {
  if (!path) return defaultAvatar;
  if (path.startsWith('http')) return path;
  if (path.startsWith('storage/')) return `${API_BASE_URL}/${path}`;
  return `${API_BASE_URL}/storage/${path}`;
}

function formatCurrency(value) {
  if (value === null || value === undefined) return '—';
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) return '—';
  return currencyFormatter.format(numericValue);
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('vi-VN');
}

const inputBaseClass =
  'w-full rounded-md border border-grey-transparent px-3 py-2 text-sm text-grey-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary';

function Field({ label, children, tooltip }) {
  return (
    <label className='flex flex-col gap-1 text-sm font-medium text-grey-700'>
      <span className='flex items-center gap-2'>
        {label}
        {tooltip ? <span className='text-xs font-normal text-grey-500'>{tooltip}</span> : null}
      </span>
      {children}
    </label>
  );
}

const readOnlyHint = 'Thông tin do phòng khám xác minh';

function ReadOnlyInfo({ label, value }) {
  return (
    <div className='flex flex-col gap-1 rounded-md bg-white p-4 shadow-sm'>
      <span className='text-xs font-semibold text-grey-500'>{label}</span>
      <span className='text-base font-semibold text-grey-900'>{value || 'Chưa cập nhật'}</span>
      <span className='text-xs text-grey-400'>{readOnlyHint}</span>
    </div>
  );
}

function PrescriptionList({ items }) {
  if (!items?.length) {
    return <p className='text-sm text-grey-500'>Không có toa thuốc cho lần khám này.</p>;
  }

  return (
    <div className='overflow-hidden rounded-lg border border-grey-transparent'>
      <div className='grid grid-cols-4 bg-grey-50 px-4 py-2 text-xs font-semibold uppercase text-grey-500'>
        <span>Thuốc</span>
        <span className='text-center'>Số lượng</span>
        <span className='text-center'>Đơn giá</span>
        <span className='text-right'>Thành tiền</span>
      </div>
      <div>
        {items.map((item) => (
          <div
            key={`${item.ID_PhieuKham}-${item.ID_Thuoc}-${item.updated_at || item.created_at || ''}`}
            className='grid grid-cols-4 px-4 py-2 text-sm text-grey-800 odd:bg-white even:bg-grey-50'
          >
            <span>{item.thuoc?.TenThuoc || 'Thuốc không xác định'}</span>
            <span className='text-center'>{item.SoLuong}</span>
            <span className='text-center'>{formatCurrency(item.DonGiaBan_LuocMua || item.thuoc?.DonGiaBan)}</span>
            <span className='text-right font-semibold'>{formatCurrency(item.TienThuoc)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MedicalRecordCard({ record }) {
  const tiepNhan = record.tiepNhan;
  const hasInvoice = Boolean(record.hoaDon);

  return (
    <article className='rounded-xl border border-grey-transparent bg-white p-5 shadow-sm'>
      <header className='flex flex-col gap-1 border-b border-grey-transparent pb-4 md:flex-row md:items-center md:justify-between'>
        <div>
          <p className='text-xs font-semibold uppercase text-primary'>Phiếu khám #{record.ID_PhieuKham}</p>
          <h3 className='text-lg font-bold text-grey-900'>{record.loaiBenh?.TenLoaiBenh || 'Chưa chẩn đoán'}</h3>
        </div>
        <div className='text-sm text-grey-600'>
          <p>Ngày tiếp nhận: {formatDate(tiepNhan?.NgayTN)}</p>
          <p>Ca khám: {tiepNhan?.CaTN || '—'}</p>
        </div>
      </header>

      <div className='mt-4 grid gap-3 md:grid-cols-3'>
        <div>
          <p className='text-xs uppercase text-grey-400'>Triệu chứng</p>
          <p className='text-sm text-grey-800'>{record.TrieuChung || 'Chưa cập nhật'}</p>
        </div>
        <div>
          <p className='text-xs uppercase text-grey-400'>Tiền khám</p>
          <p className='text-base font-semibold text-grey-900'>{formatCurrency(record.TienKham)}</p>
        </div>
        <div>
          <p className='text-xs uppercase text-grey-400'>Tổng tiền thuốc</p>
          <p className='text-base font-semibold text-grey-900'>{formatCurrency(record.TongTienThuoc)}</p>
        </div>
      </div>

      <div className='mt-5 space-y-3'>
        <h4 className='text-sm font-semibold text-grey-900'>Toa thuốc đã kê</h4>
        <PrescriptionList items={record.toaThuoc} />
      </div>

      {hasInvoice ? (
        <div className='mt-5 rounded-lg bg-primary/5 p-4 text-sm text-grey-800'>
          <p className='font-semibold text-grey-900'>Hoá đơn liên quan</p>
          <p>Mã hoá đơn: {record.hoaDon?.ID_HoaDon || '—'}</p>
          <p>Ngày hoá đơn: {formatDate(record.hoaDon?.NgayHoaDon)}</p>
          <p>Tổng thanh toán: {formatCurrency(record.hoaDon?.TongTien)}</p>
        </div>
      ) : null}
    </article>
  );
}

export default function PatientSelfProfile({ initialSection = 'all' }) {
  const { data, isLoading } = usePatientSelfProfile();
  const { data: medicalData, isLoading: loadingMedical } = usePatientMedicalRecords();
  const { data: invoicesData, isLoading: loadingInvoices } = usePatientInvoices();
  const { data: appointmentsData, isLoading: loadingAppointments } = usePatientAppointments();
  const { data: notificationsData, isLoading: loadingNotifications } = usePatientNotifications();
  const { data: dashboardData, isLoading: loadingDashboard } = usePatientDashboard();
  const { data: doctorOptionsData, isLoading: loadingDoctors } = useDoctorsForAppointments();

  const updateProfile = useUpdatePatientSelfProfile();
  const changePassword = useChangePatientPassword();
  const createAppointment = useCreatePatientAppointment();
  const cancelAppointment = useCancelPatientAppointment();

  const profileForm = useForm({
    defaultValues: {
      DienThoai: '',
      Email: '',
      DiaChi: '',
    },
  });

  const passwordForm = useForm({
    defaultValues: {
      current_password: '',
      password: '',
      password_confirmation: '',
    },
  });

  const appointmentForm = useForm({
    defaultValues: {
      NgayTN: '',
      CaTN: 'Sáng',
      ID_NhanVien: '',
    },
  });

  const benhNhan = data?.data?.benhNhan || data?.data?.benh_nhan;
  const userInfo = data?.data?.user || data?.data;
  const medicalRecords = medicalData?.data || [];
  const invoices = invoicesData?.data || [];
  const appointments = appointmentsData?.data || [];
  const notifications = notificationsData?.data || [];
  const dashboard = dashboardData || {};
  const doctors = useMemo(() => {
    const items = Array.isArray(doctorOptionsData) ? doctorOptionsData : (doctorOptionsData?.data || []);
    return items.filter((nv) => {
      const nhom = nv?.nhomNguoiDung || nv?.nhom_nguoi_dung || nv;
      const maNhom = nhom?.maNhom || nhom?.MaNhom;
      return maNhom === 'DOCTOR' || maNhom === '@doctors' || maNhom === 'doctors';
    });
  }, [doctorOptionsData]);

  const [avatarPreview, setAvatarPreview] = useState(defaultAvatar);
  const [avatarFile, setAvatarFile] = useState(null);

  const readOnlyItems = useMemo(
    () => [
      { label: 'CCCD', value: benhNhan?.CCCD },
      { label: 'Họ và tên', value: benhNhan?.HoTenBN },
      { label: 'Giới tính', value: benhNhan?.GioiTinh },
      { label: 'Ngày sinh', value: benhNhan?.NgaySinh },
      { label: 'Ngày đăng ký', value: benhNhan?.NgayDK },
      { label: 'Mã bệnh nhân', value: benhNhan?.ID_BenhNhan },
    ],
    [benhNhan],
  );

  useEffect(() => {
    if (benhNhan) {
      profileForm.reset({
        DienThoai: benhNhan.DienThoai || '',
        Email: benhNhan.Email || userInfo?.email || '',
        DiaChi: benhNhan.DiaChi || '',
      });
      setAvatarPreview(buildAvatarUrl(benhNhan.Avatar));
      setAvatarFile(null);
    }
  }, [benhNhan, userInfo, profileForm]);

  const handleProfileSubmit = profileForm.handleSubmit((values) => {
    const formData = new FormData();
    if (values.DienThoai?.trim() || values.DienThoai === '') {
      formData.append('DienThoai', values.DienThoai.trim());
    }
    if (values.Email?.trim() || values.Email === '') {
      formData.append('Email', values.Email.trim());
    }
    if (values.DiaChi?.trim() || values.DiaChi === '') {
      formData.append('DiaChi', values.DiaChi.trim());
    }
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    updateProfile.mutate(formData, {
      onSuccess: () => {
        profileForm.reset(values);
        setAvatarFile(null);
      },
    });
  });

  const handlePasswordSubmit = passwordForm.handleSubmit((values) => {
    changePassword.mutate(values, {
      onSuccess: () => passwordForm.reset(),
    });
  });

  const handleAppointmentSubmit = appointmentForm.handleSubmit((values) => {
    let ngayTN = values.NgayTN;
    if (values.NgayTN) {
      const dateValue = new Date(values.NgayTN);
      ngayTN = Number.isNaN(dateValue.getTime()) ? values.NgayTN : dateValue.toISOString();
    }

    createAppointment.mutate(
      {
        NgayTN: ngayTN,
        CaTN: values.CaTN,
        ID_NhanVien: values.ID_NhanVien,
      },
      {
        onSuccess: () => {
          appointmentForm.reset({
            NgayTN: '',
            CaTN: 'Sáng',
            ID_NhanVien: '',
          });
        },
      },
    );
  });

  const handleCancelAppointment = (id) => {
    cancelAppointment.mutate(id);
  };

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
  };

  if (isLoading) return <Spinner />;

  if (!benhNhan) {
    return (
      <section className='flex min-h-screen items-center justify-center bg-[#f5f6f8] px-6 py-10'>
        <div className='rounded-xl bg-white p-10 text-center text-grey-700 shadow-sm'>
          <p className='text-lg font-semibold'>Chỉ bệnh nhân mới được truy cập trang này.</p>
        </div>
      </section>
    );
  }

  return (
    <section className='min-h-screen bg-[#f5f6f8] px-6 py-10 text-grey-900'>
      <div className='mx-auto flex max-w-6xl flex-col gap-8'>
        {(initialSection === 'all' || initialSection === 'profile') && (
          <header className='rounded-xl bg-white px-8 py-6 shadow-sm'>
            <p className='text-sm font-semibold text-primary'>Hồ sơ bệnh nhân</p>
            <h1 className='text-2xl font-bold text-grey-900'>Xin chào, {benhNhan?.HoTenBN || 'Bệnh nhân'}</h1>
            <p className='text-sm text-grey-500'>
              Bạn có thể xem và quản lý hồ sơ cá nhân, lịch sử khám bệnh và các hoá đơn.
            </p>
          </header>
        )}

        {(initialSection === 'all' || initialSection === 'profile') && (
          <>
            <div className='grid gap-6 lg:grid-cols-3'>
              {readOnlyItems.map((item) => (
                <ReadOnlyInfo key={item.label} label={item.label} value={item.value} />
              ))}
            </div>

            <div className='grid gap-6 lg:grid-cols-2'>
              <div className='rounded-xl bg-white p-6 shadow-sm'>
                <h2 className='text-lg font-semibold'>Thông tin có thể chỉnh sửa</h2>
                <p className='mb-4 text-sm text-grey-500'>
                  Các thay đổi sẽ được cập nhật tức thì cho hồ sơ của bạn.
                </p>
                <form className='flex flex-col gap-4' onSubmit={handleProfileSubmit}>
                  <div className='flex items-center gap-4 rounded-md border border-dashed border-grey-200 p-4'>
                    <img
                      src={avatarPreview || defaultAvatar}
                      alt='avatar'
                      className='h-20 w-20 rounded-full object-cover'
                    />
                    <div className='flex flex-col gap-2'>
                      <p className='text-sm font-medium'>Hình đại diện</p>
                      <p className='text-xs text-grey-500'>PNG hoặc JPG tối đa 2MB</p>
                      <input
                        type='file'
                        accept='image/*'
                        onChange={handleAvatarChange}
                        className='text-xs'
                      />
                    </div>
                  </div>

                  <Field label='Số điện thoại'>
                    <input
                      type='tel'
                      className={inputBaseClass}
                      {...profileForm.register('DienThoai', {
                        minLength: { value: 8, message: 'Số điện thoại tối thiểu 8 ký tự' },
                      })}
                      placeholder='Ví dụ: 0900000000'
                    />
                    {profileForm.formState.errors?.DienThoai && (
                      <span className='text-xs text-red-500'>
                        {profileForm.formState.errors.DienThoai.message}
                      </span>
                    )}
                  </Field>

                  <Field label='Email'>
                    <input
                      type='email'
                      className={inputBaseClass}
                      {...profileForm.register('Email', {
                        required: 'Email không được bỏ trống',
                      })}
                      placeholder='you@example.com'
                    />
                    {profileForm.formState.errors?.Email && (
                      <span className='text-xs text-red-500'>
                        {profileForm.formState.errors.Email.message}
                      </span>
                    )}
                  </Field>

                  <Field label='Địa chỉ'>
                    <textarea
                      rows={3}
                      className={`${inputBaseClass} resize-none`}
                      {...profileForm.register('DiaChi')}
                      placeholder='Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành'
                    />
                  </Field>

                  <Button
                    type='submit'
                    disabled={updateProfile.isPending}
                    className='bg-primary px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-grey-300'
                  >
                    {updateProfile.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </Button>
                </form>
              </div>

              <div className='rounded-xl bg-white p-6 shadow-sm'>
                <h2 className='text-lg font-semibold'>Đổi mật khẩu</h2>
                <p className='mb-4 text-sm text-grey-500'>
                  Vui lòng nhập mật khẩu hiện tại để xác nhận danh tính trước khi đổi.
                </p>
                <form className='flex flex-col gap-4' onSubmit={handlePasswordSubmit}>
                  <Field label='Mật khẩu hiện tại'>
                    <input
                      type='password'
                      className={inputBaseClass}
                      {...passwordForm.register('current_password', {
                        required: 'Không được bỏ trống',
                      })}
                      placeholder='********'
                    />
                    {passwordForm.formState.errors?.current_password && (
                      <span className='text-xs text-red-500'>
                        {passwordForm.formState.errors.current_password.message}
                      </span>
                    )}
                  </Field>

                  <Field label='Mật khẩu mới'>
                    <input
                      type='password'
                      className={inputBaseClass}
                      {...passwordForm.register('password', {
                        required: 'Không được bỏ trống',
                        minLength: { value: 8, message: 'Tối thiểu 8 ký tự' },
                      })}
                      placeholder='********'
                    />
                    {passwordForm.formState.errors?.password && (
                      <span className='text-xs text-red-500'>
                        {passwordForm.formState.errors.password.message}
                      </span>
                    )}
                  </Field>

                  <Field label='Nhập lại mật khẩu mới'>
                    <input
                      type='password'
                      className={inputBaseClass}
                      {...passwordForm.register('password_confirmation', {
                        required: 'Không được bỏ trống',
                        validate: (value) =>
                          value === passwordForm.watch('password') || 'Mật khẩu không trùng khớp',
                      })}
                      placeholder='********'
                    />
                    {passwordForm.formState.errors?.password_confirmation && (
                      <span className='text-xs text-red-500'>
                        {passwordForm.formState.errors.password_confirmation.message}
                      </span>
                    )}
                  </Field>

                  <Button
                    type='submit'
                    disabled={changePassword.isPending}
                    className='bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:bg-grey-300'
                  >
                    {changePassword.isPending ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                  </Button>
                </form>
              </div>
            </div>
          </>
        )}

        {(initialSection === 'all' || initialSection === 'medicalRecords') && (
        <section className='rounded-xl bg-white p-6 shadow-sm'>
          <div className='flex flex-col gap-2 border-b border-grey-transparent pb-4 md:flex-row md:items-center md:justify-between'>
            <div>
              <h2 className='text-lg font-semibold'>Hồ sơ khám bệnh</h2>
              <p className='text-sm text-grey-500'>
                Lịch sử các lần khám bệnh của bạn.
              </p>
            </div>
          </div>
          <div className='mt-6 space-y-4'>
            {loadingMedical ? (
              <div className='flex justify-center py-6'>
                <Spinner />
              </div>
            ) : medicalRecords.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-grey-400 bg-grey-50 rounded-lg">
                <svg className="w-12 h-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className='text-sm'>Bạn chưa có lịch sử khám bệnh nào.</p>
              </div>
            ) : (
              medicalRecords.map((record) => <MedicalRecordCard key={record.ID_PhieuKham} record={record} />)
            )}
          </div>
        </section>
        )}

        {(initialSection === 'all' || initialSection === 'invoices') && (
        <section className='rounded-xl bg-white p-6 shadow-sm'>
          <div className='flex flex-col gap-2 border-b border-grey-transparent pb-4 md:flex-row md:items-center md:justify-between'>
            <div>
              <h2 className='text-lg font-semibold'>Hoá đơn của tôi</h2>
              <p className='text-sm text-grey-500'>Danh sách hoá đơn thanh toán tiền khám và tiền thuốc.</p>
            </div>
          </div>
          {loadingInvoices ? (
            <div className='flex justify-center py-6'>
              <Spinner />
            </div>
          ) : invoices.length === 0 ? (
            <div className="mt-6 flex flex-col items-center justify-center py-10 text-grey-400 bg-grey-50 rounded-lg">
              <svg className="w-12 h-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className='text-sm'>Chưa có hoá đơn nào.</p>
            </div>
          ) : (
            <div className='mt-6 overflow-x-auto rounded-lg border border-grey-transparent'>
              <table className='min-w-full divide-y divide-grey-transparent text-sm'>
                <thead className='bg-grey-50 text-xs uppercase text-grey-500'>
                  <tr>
                    <th className='px-4 py-3 text-left font-semibold'>Mã hoá đơn</th>
                    <th className='px-4 py-3 text-left font-semibold'>Ngày</th>
                    <th className='px-4 py-3 text-left font-semibold'>Phiếu khám</th>
                    <th className='px-4 py-3 text-left font-semibold'>Chẩn đoán</th>
                    <th className='px-4 py-3 text-right font-semibold'>Tiền khám</th>
                    <th className='px-4 py-3 text-right font-semibold'>Tiền thuốc</th>
                    <th className='px-4 py-3 text-right font-semibold'>Tổng</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-grey-transparent bg-white text-grey-900'>
                  {invoices.map((invoice) => (
                    <tr key={invoice.ID_HoaDon}>
                      <td className='px-4 py-3 font-semibold text-primary'>#{invoice.ID_HoaDon}</td>
                      <td className='px-4 py-3'>{formatDate(invoice.NgayHoaDon)}</td>
                      <td className='px-4 py-3'>#{invoice.ID_PhieuKham}</td>
                      <td className='px-4 py-3'>
                        {invoice.phieuKham?.loaiBenh?.TenLoaiBenh || 'Chưa xác định'}
                      </td>
                      <td className='px-4 py-3 text-right'>{formatCurrency(invoice.TienKham)}</td>
                      <td className='px-4 py-3 text-right'>{formatCurrency(invoice.TienThuoc)}</td>
                      <td className='px-4 py-3 text-right font-semibold text-grey-900'>
                        {formatCurrency(invoice.TongTien)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        )}

        {(initialSection === 'all' || initialSection === 'appointments') && (
        <section className='rounded-xl bg-white p-6 shadow-sm'>
          <div className='flex flex-col gap-2 border-b border-grey-transparent pb-4 md:flex-row md:items-center md:justify-between'>
            <div>
              <h2 className='text-lg font-semibold'>Đặt lịch khám</h2>
              <p className='text-sm text-grey-500'>
                Tạo, huỷ và xem các lịch khám của bạn.
              </p>
            </div>
          </div>

          <div className='mt-6 grid gap-6 lg:grid-cols-2'>
            <form className='flex flex-col gap-4 rounded-lg border border-grey-transparent p-4' onSubmit={handleAppointmentSubmit}>
              <p className='text-base font-semibold text-grey-900'>Đặt lịch mới</p>
              <Field label='Ngày & thời gian khám'>
                <input
                  type='datetime-local'
                  className={inputBaseClass}
                  {...appointmentForm.register('NgayTN', {
                    required: 'Vui lòng chọn ngày khám',
                  })}
                />
                {appointmentForm.formState.errors?.NgayTN && (
                  <span className='text-xs text-red-500'>
                    {appointmentForm.formState.errors.NgayTN.message}
                  </span>
                )}
              </Field>

            <Field label='Ca khám (Sáng/Chiều/Tối)'>
                <select className={inputBaseClass} {...appointmentForm.register('CaTN', { required: true })}>
                  <option value='Sáng'>Sáng</option>
                  <option value='Chiều'>Chiều</option>
                  <option value='Tối'>Tối</option>
                </select>
              </Field>

              <Field label='Chọn bác sĩ phụ trách'>
                <select
                  className={inputBaseClass}
                  {...appointmentForm.register('ID_NhanVien', {
                    required: 'Vui lòng chọn bác sĩ',
                  })}
                >
                  <option value=''>Chọn bác sĩ</option>
                  {loadingDoctors ? (
                    <option>Đang tải danh sách bác sĩ...</option>
                  ) : (
                    doctors.map((doctor) => {
                      const id = doctor.idNhanVien || doctor.ID_NhanVien;
                      const name = doctor.hoTenNV || doctor.HoTenNV;
                      return (
                        <option key={id} value={id}>
                          {name}
                        </option>
                      );
                    })
                  )}
                </select>
                {appointmentForm.formState.errors?.ID_NhanVien && (
                  <span className='text-xs text-red-500'>
                    {appointmentForm.formState.errors.ID_NhanVien.message}
                  </span>
                )}
              </Field>

              <Button
                type='submit'
                disabled={createAppointment.isPending}
                className='bg-primary px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-grey-300'
              >
                {createAppointment.isPending ? 'Đang tạo...' : 'Đặt lịch khám'}
              </Button>
            </form>

            <div className='rounded-lg border border-grey-transparent p-4'>
              <p className='text-base font-semibold text-grey-900'>Các lịch đã đặt</p>
              {loadingAppointments ? (
                <div className='flex justify-center py-6'>
                  <Spinner />
                </div>
              ) : appointments.length === 0 ? (
                <div className="mt-4 flex flex-col items-center justify-center py-8 text-grey-400 bg-grey-50 rounded-lg border border-dashed border-grey-200">
                  <svg className="w-10 h-10 mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className='text-sm'>Bạn chưa có lịch khám nào.</p>
                </div>
              ) : (
                <div className='mt-4 space-y-3'>
                  {appointments.map((appointment) => {
                    const appointmentDate = new Date(appointment.ngayKhamDuKien || appointment.NgayTN);
                    const isPast = Number.isNaN(appointmentDate.getTime())
                      ? false
                      : appointmentDate.getTime() < Date.now();
                    const statusText = appointment.trangThai || appointment.TrangThai;
                    const status = (statusText === 'DaXacNhan' || statusText === 'Đã xác nhận')
                      ? 'Đã xác nhận'
                      : (statusText === 'Huy' || statusText === 'Đã hủy') 
                      ? 'Đã huỷ'
                      : isPast
                      ? 'Đang chờ kết quả'
                      : 'Chờ xác nhận';

                    const keyId = appointment.idLichKham || appointment.ID_TiepNhan;
                    const caKham = appointment.caKham || appointment.CaTN;
                    const tenBacSi = appointment.tenBacSi || appointment.nhanVien?.HoTenNV || 'Đang phân công';
                    const dateStr = appointment.ngayKhamDuKien || appointment.NgayTN;

                    return (
                      <div
                        key={keyId}
                        className='rounded-lg border border-grey-transparent bg-grey-50 p-4'
                      >
                        <p className='text-sm font-semibold text-grey-900'>
                          {formatDate(dateStr)} – Ca {caKham}
                        </p>
                        <p className='text-sm text-grey-600'>
                          Bác sĩ: {tenBacSi}
                        </p>
                        <p className='text-xs font-semibold uppercase text-primary'>{status}</p>

                        {(statusText === 'ChoXacNhan' || !statusText) && !isPast && (
                          <Button
                            type='button'
                            onClick={() => handleCancelAppointment(keyId)}
                            disabled={cancelAppointment.isPending}
                            className='mt-3 bg-red-500 px-3 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60'
                          >
                            {cancelAppointment.isPending ? 'Đang huỷ...' : 'Huỷ lịch này'}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        )}

        {(initialSection === 'all' || initialSection === 'notifications') && (
        <section className='rounded-xl bg-white p-6 shadow-sm'>
          <div className='flex flex-col gap-2 border-b border-grey-transparent pb-4 md:flex-row md:items-center md:justify-between'>
            <div>
              <h2 className='text-lg font-semibold'>Thông báo</h2>
              <p className='text-sm text-grey-500'>
                Thông báo về trạng thái lịch khám, kết quả khám và các thông tin khác.
              </p>
            </div>
          </div>

          {loadingNotifications ? (
            <div className='flex justify-center py-6'>
              <Spinner />
            </div>
          ) : notifications.length === 0 ? (
            <div className="mt-6 flex flex-col items-center justify-center py-10 text-grey-400 bg-grey-50 rounded-lg">
              <svg className="w-12 h-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <p className='text-sm'>Chưa có thông báo nào.</p>
            </div>
          ) : (
            <div className='mt-6 space-y-4'>
              {notifications.map((notification, index) => (
                <div
                  key={`${notification.type}-${index}`}
                  className='rounded-lg border border-grey-transparent bg-grey-50 p-4'
                >
                  <p className='text-xs uppercase text-primary'>{notification.title}</p>
                  <p className='text-sm font-semibold text-grey-900'>{notification.message}</p>
                  <p className='text-xs text-grey-500'>
                    {notification.created_at ? formatDate(notification.created_at) : ''}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>

        )}

        {(initialSection === 'all' || initialSection === 'dashboard') && (
        <section className='rounded-xl bg-white p-6 shadow-sm'>
          <div className='flex flex-col gap-2 border-b border-grey-transparent pb-4 md:flex-row md:items-center md:justify-between'>
            <div>
              <h2 className='text-lg font-semibold'>Thống kê cá nhân</h2>
              <p className='text-sm text-grey-500'>
                Tổng hợp thông tin về số lần khám, lịch sử bệnh, bác sĩ đã gặp.
              </p>
            </div>
          </div>

          {loadingDashboard ? (
            <div className='flex justify-center py-6'>
              <Spinner />
            </div>
          ) : (
            <div className='mt-6 space-y-6'>
              <div className='grid gap-4 md:grid-cols-3'>
                <div className='rounded-lg border border-grey-transparent p-4'>
                  <p className='text-xs uppercase text-grey-500'>Số lần khám</p>
                  <p className='text-3xl font-bold text-grey-900'>{dashboard.total_visits || 0}</p>
                </div>
                <div className='rounded-lg border border-grey-transparent p-4'>
                  <p className='text-xs uppercase text-grey-500'>Số loại bệnh đã gặp</p>
                  <p className='text-3xl font-bold text-grey-900'>{dashboard.disease_count || 0}</p>
                </div>
                <div className='rounded-lg border border-grey-transparent p-4'>
                  <p className='text-xs uppercase text-grey-500'>Số bác sĩ từng khám</p>
                  <p className='text-3xl font-bold text-grey-900'>{dashboard.doctor_count || 0}</p>
                </div>
              </div>

              <div className='grid gap-6 lg:grid-cols-2'>
                <div className='rounded-lg border border-grey-transparent p-4'>
                  <p className='text-base font-semibold text-grey-900'>Lịch sử bệnh theo thời gian</p>
                  {(dashboard.disease_timeline || []).length === 0 ? (
                    <p className='mt-3 text-sm text-grey-500'>Chưa có dữ liệu.</p>
                  ) : (
                    <ul className='mt-3 space-y-2 text-sm text-grey-800'>
                      {dashboard.disease_timeline.map((item, idx) => (
                        <li key={`${item.date}-${idx}`} className='flex items-center justify-between'>
                          <span>{item.date}</span>
                          <span className='font-semibold text-primary'>{item.disease}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className='rounded-lg border border-grey-transparent p-4'>
                  <p className='text-base font-semibold text-grey-900'>Bác sĩ từng khám cho bạn</p>
                  {(dashboard.doctors || []).length === 0 ? (
                    <p className='mt-3 text-sm text-grey-500'>Chưa có dữ liệu.</p>
                  ) : (
                    <ul className='mt-3 space-y-2 text-sm text-grey-800'>
                      {dashboard.doctors.map((doctor) => (
                        <li key={doctor.doctor_id} className='flex items-center justify-between'>
                          <span>{doctor.doctor_name}</span>
                          <span className='text-xs font-semibold uppercase text-primary'>
                            {doctor.visits} lần
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
        )}
      </div>
    </section>
  );
}
