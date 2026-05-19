import SidebarLink from './SidebarLink';
import ButtonToggle from './ButtonToggle';
import { useRolePermissions } from '../hooks/useRolePermissions';
import LogoBenhVien from '../assets/logo-benh-vien.jpg';

import {
  AppointmentsSvg,
  DashboardSvg,
  DoctorsSvg,
  DrugSvg,
  LeavesSvg,
  MedicalFormSvg,
  PatientsSvg,
} from '../constants/Global';

import {
  CalendarDaysIcon,
  Cog8ToothIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  PresentationChartLineIcon,
  ShieldExclamationIcon,
  UserCircleIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  const { roleCode, isLoading, canAccessRoute } = useRolePermissions();
  const can = (routeKey) => !!routeKey && canAccessRoute(routeKey);
  const isDoctor = roleCode === 'doctors' || roleCode === 'admin';
  const isDoctorOnly = roleCode === 'doctors';
  const isPatient = roleCode === 'patient';
  const isReceptionist = roleCode === 'receptionists';
  const isManager = roleCode === 'managers';
  const isAdmin = roleCode === 'admin';

  if (isLoading) return null;

  const renderExtendedFeatures = (excludeKeys) => {
    const features = [
      { key: 'employees', to: '/employees', icon: UserGroupIcon, label: 'Nhân viên' },
      { key: 'permissions', to: '/permissions', icon: ShieldExclamationIcon, label: 'Phân quyền' },
      { key: 'catalogs', to: '/catalogs', icon: LeavesSvg, label: 'Danh mục nền' },
      { key: 'regulations', to: '/regulations', icon: Cog8ToothIcon, label: 'Tham số hệ thống' },
      { key: 'services', to: '/services', icon: Cog8ToothIcon, label: 'Dịch vụ khám' },
      { key: 'reports', to: '/reports', icon: PresentationChartLineIcon, label: 'Thống kê tổng hợp' },
      { key: 'drugs', to: '/drugs', icon: DrugSvg, label: 'Quản lý thuốc' },
      { key: 'reception', to: '/reception?tab=reception', icon: MapPinIcon, label: 'Tiếp nhận bệnh nhân' },
      { key: 'appointments', to: '/reception?tab=online', icon: AppointmentsSvg, label: 'Lịch hẹn online' },
      { key: 'invoices', to: '/invoices', icon: CurrencyDollarIcon, label: 'Thanh toán' },
      { key: 'patients', to: '/patients', icon: PatientsSvg, label: 'Quản lý bệnh nhân' },
      { key: 'doctorQueue', to: '/doctor/queue', icon: UserGroupIcon, label: 'Danh sách chờ khám' },
      { key: 'medicalForms', to: '/medical-forms', icon: MedicalFormSvg, label: 'Phiếu khám' },
    ];

    const availableFeatures = features.filter(f => !excludeKeys.includes(f.key) && can(f.key));
    if (availableFeatures.length === 0) return null;

    return (
      <div className='mt-3 pt-3' style={{ borderTop: '1px solid var(--border-light)' }}>
        <p className='px-4 mb-1.5 text-[10px] font-bold uppercase tracking-widest' style={{ color: 'var(--accent)' }}>
          Chức năng mở rộng
        </p>
        {availableFeatures.map(f => (
          <SidebarLink key={f.key} to={f.to} icon={f.icon} label={f.label} />
        ))}
      </div>
    );
  };

  const SidebarSection = ({ title, children }) => (
    <div className='mb-1'>
      <p className='px-4 mb-1.5 text-[10px] font-bold uppercase tracking-widest' style={{ color: 'var(--text-muted)' }}>
        {title}
      </p>
      {children}
    </div>
  );

  const DarkModeToggle = () => (
    <div
      className='flex items-center justify-between px-4 py-2.5 mx-2 rounded-xl border transition-colors duration-200'
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderColor: 'var(--border-color)',
      }}
    >
      <span className='text-sm font-medium' style={{ color: 'var(--text-primary)' }}>
        Giao diện tối
      </span>
      <ButtonToggle />
    </div>
  );

  const SidebarWrapper = ({ children }) => (
    <aside
      className='w-full h-full flex flex-col overflow-y-auto transition-colors duration-300'
      style={{ backgroundColor: 'var(--bg-sidebar)' }}
    >
      {/* Logo */}
      <div className='flex items-center justify-center py-3 px-4' style={{ borderBottom: '1px solid var(--border-light)' }}>
        <img src={LogoBenhVien} alt='Logo bệnh viện' className='h-10 object-contain' />
      </div>

      {/* Navigation - grows to fill space */}
      <div className='flex-1 overflow-y-auto py-2 px-1'>
        {children}

        {/* Dark Mode Toggle - right after menu items */}
        <div className='mt-4 px-1 pt-3' style={{ borderTop: '1px solid var(--border-light)' }}>
          <DarkModeToggle />
        </div>
      </div>
    </aside>
  );

  if (isAdmin) {
    return (
      <SidebarWrapper>
        <SidebarSection title='Quản trị'>
          <SidebarLink to='/' icon={DashboardSvg} label='Dashboard' />
          {can('employees') && <SidebarLink to='/employees' icon={UserGroupIcon} label='Nhân viên' />}
          {can('permissions') && <SidebarLink to='/permissions' icon={ShieldExclamationIcon} label='Phân quyền' />}
          {can('regulations') && <SidebarLink to='/regulations' icon={Cog8ToothIcon} label='Tham số hệ thống' />}
          {can('services') && <SidebarLink to='/services' icon={Cog8ToothIcon} label='Dịch vụ khám' />}
          {can('catalogs') && <SidebarLink to='/catalogs' icon={LeavesSvg} label='Danh mục nền' />}
        </SidebarSection>
        {renderExtendedFeatures(['employees', 'permissions', 'regulations', 'services', 'catalogs'])}
      </SidebarWrapper>
    );
  }

  if (isDoctorOnly) {
    return (
      <SidebarWrapper>
        <SidebarSection title='Bác sĩ'>
          <SidebarLink to='/doctor/queue' icon={DashboardSvg} label='Trang chủ' />
          <SidebarLink to='/doctor/queue' icon={UserGroupIcon} label='Danh sách chờ khám' />
          <SidebarLink to='/medical-forms' icon={MedicalFormSvg} label='Phiếu khám' />
          <SidebarLink to='/medical-forms' icon={DrugSvg} label='Kê toa thuốc' />
          <SidebarLink to='/medical-forms' icon={PresentationChartLineIcon} label='Lịch sử khám bệnh' />
          <SidebarLink to='/lich-kham-doctor' icon={CalendarDaysIcon} label='Lịch khám đã xác nhận' />
          {can('patients') && <SidebarLink to='/patients' icon={PatientsSvg} label='Bệnh nhân' />}
        </SidebarSection>
        {renderExtendedFeatures(['doctorQueue', 'medicalForms', 'patients'])}
      </SidebarWrapper>
    );
  }

  if (isManager) {
    return (
      <SidebarWrapper>
        <SidebarSection title='Quản lý'>
          <SidebarLink to='/' icon={DashboardSvg} label='Dashboard' />
          {can('reports') && <SidebarLink to='/reports' icon={PresentationChartLineIcon} label='Thống kê tổng hợp' />}
          {can('reports') && <SidebarLink to='/reports/staff' icon={UserGroupIcon} label='Hiệu suất nhân viên' />}
          {can('patients') && <SidebarLink to='/patients' icon={PatientsSvg} label='Quản lý bệnh nhân' />}
          {can('drugs') && <SidebarLink to='/drugs' icon={DrugSvg} label='Quản lý thuốc' />}
          {can('regulations') && <SidebarLink to='/regulations' icon={Cog8ToothIcon} label='Tham số hệ thống' />}
          {can('services') && <SidebarLink to='/services' icon={Cog8ToothIcon} label='Dịch vụ khám' />}
          {can('catalogs') && <SidebarLink to='/catalogs' icon={LeavesSvg} label='Danh mục nền' />}
        </SidebarSection>
        {renderExtendedFeatures(['reports', 'patients', 'drugs', 'regulations', 'services', 'catalogs'])}
      </SidebarWrapper>
    );
  }

  if (isReceptionist) {
    return (
      <SidebarWrapper>
        <SidebarSection title='Lễ tân – Thu ngân'>
          <SidebarLink to='/' icon={DashboardSvg} label='Trang chủ' />
          {can('patients') && <SidebarLink to='/patients' icon={PatientsSvg} label='Quản lý bệnh nhân' />}
          {can('reception') && <SidebarLink to='/reception?tab=reception' icon={MapPinIcon} label='Tiếp nhận bệnh nhân' />}
          {can('appointments') && <SidebarLink to='/reception?tab=online' icon={AppointmentsSvg} label='Lịch hẹn online' />}
          {can('patients') && <SidebarLink to='/patients/today' icon={CalendarDaysIcon} label='Danh sách chờ khám' />}
          {can('invoices') && <SidebarLink to='/invoices' icon={CurrencyDollarIcon} label='Thanh toán' />}
          {can('catalogs') && <SidebarLink to='/catalogs' icon={LeavesSvg} label='Danh mục nền' />}
          {can('services') && <SidebarLink to='/services' icon={Cog8ToothIcon} label='Dịch vụ khám' />}
        </SidebarSection>
        {renderExtendedFeatures(['patients', 'reception', 'appointments', 'invoices', 'catalogs', 'services'])}
      </SidebarWrapper>
    );
  }

  if (isPatient) {
    return (
      <SidebarWrapper>
        <SidebarSection title='Cổng Bệnh Nhân'>
          <SidebarLink to='/patients/profile' icon={UserCircleIcon} label='Trang chủ' />
          {can('patientAppointments') && (
            <SidebarLink to='/patients/appointments' icon={AppointmentsSvg} label='Đặt lịch khám' />
          )}
          {can('patientAppointments') && (
            <SidebarLink to='/patients/appointments' icon={CalendarDaysIcon} label='Lịch sử đặt lịch' />
          )}
          {can('patientMedicalRecords') && (
            <SidebarLink to='/patients/medical-records' icon={MedicalFormSvg} label='Lịch sử khám bệnh' />
          )}
          {can('patientInvoices') && (
            <SidebarLink to='/patients/invoices' icon={CurrencyDollarIcon} label='Hóa đơn' />
          )}
          <SidebarLink to='/patients/profile' icon={UserCircleIcon} label='Thông tin cá nhân' />
        </SidebarSection>
      </SidebarWrapper>
    );
  }

  // Default fallback sidebar
  return (
    <SidebarWrapper>
      <SidebarSection title='Menu'>
        {can('employees') && <SidebarLink to='/employees' icon={UserGroupIcon} label='Employees' />}
        {can('doctors') && <SidebarLink to='/doctors' icon={DoctorsSvg} label='Doctors' />}
        {can('patients') && <SidebarLink to='/patients' icon={PatientsSvg} label='Patients' />}
        {can('reception') && <SidebarLink to='/reception' icon={MapPinIcon} label='Reception' />}
        {can('medicalForms') && <SidebarLink to='/medical-forms' icon={MedicalFormSvg} label='Medical Forms' />}
        {can('appointments') && <SidebarLink to='/appointments' icon={AppointmentsSvg} label='Appointments' />}
        {can('drugs') && <SidebarLink to='/drugs' icon={DrugSvg} label='Drug Management' />}
        {can('invoices') && <SidebarLink to='/invoices' icon={CurrencyDollarIcon} label='Invoices' />}
        {can('reports') && <SidebarLink to='/reports' icon={PresentationChartLineIcon} label='Reports' />}
        {can('regulations') && <SidebarLink to='/regulations' icon={Cog8ToothIcon} label='Regulations' />}
      </SidebarSection>

      {(isPatient || can('patientProfile')) && (
        <SidebarSection title='Bệnh nhân'>
          <SidebarLink to='/patients/profile' icon={UserCircleIcon} label='Trang chủ' />
          {can('patientAppointments') && <SidebarLink to='/patients/appointments' icon={AppointmentsSvg} label='Đặt lịch khám' />}
          {can('patientMedicalRecords') && <SidebarLink to='/patients/medical-records' icon={MedicalFormSvg} label='Lịch sử khám bệnh' />}
          {can('patientInvoices') && <SidebarLink to='/patients/invoices' icon={CurrencyDollarIcon} label='Hóa đơn' />}
        </SidebarSection>
      )}

      {isDoctor && (
        <SidebarSection title='Bác sĩ'>
          <SidebarLink to='/doctor/queue' icon={DashboardSvg} label='Trang chủ' />
          <SidebarLink to='/doctor/queue' icon={UserGroupIcon} label='Danh sách chờ khám' />
          <SidebarLink to='/medical-forms' icon={MedicalFormSvg} label='Phiếu khám' />
        </SidebarSection>
      )}
    </SidebarWrapper>
  );
};

export default Sidebar;
