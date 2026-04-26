import Dropdown from './Dropdown';
import SidebarLink from './SidebarLink';
import ButtonToggle from './ButtonToggle';
import { useRolePermissions } from '../hooks/useRolePermissions';
import LogoBenhVien from '../assets/logo-benh-vien.jpg';


import {
  ApplicationSvg,
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
  ChatBubbleLeftRightIcon,
  Cog8ToothIcon,
  CurrencyDollarIcon,
  EnvelopeIcon,
  MapPinIcon,
  MoonIcon,
  PresentationChartLineIcon,
  QuestionMarkCircleIcon,
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
      <div className='flex flex-col mb-6 pt-4 border-t border-grey-transparent'>
        <p className='px-2 mb-2 text-xs font-bold text-blue-500 uppercase tracking-wider'>Chức năng mở rộng</p>
        {availableFeatures.map(f => (
          <SidebarLink key={f.key} to={f.to} icon={f.icon} label={f.label} />
        ))}
      </div>
    );
  };

  if (isAdmin) {
    return (
      <aside className='w-full h-full p-4 overflow-y-auto bg-white border-r border-grey-transparent'>
        <div className="flex items-center justify-center mb-4 mt-2">
          <img src={LogoBenhVien} alt="Logo bệnh viện" className="h-16 object-contain" />
        </div>

        <div className='flex flex-col mb-6'>
          <p className='px-2 mb-2 text-sm font-semibold text-grey-400 text-center'>Quản trị hệ thống</p>
          <SidebarLink to='/' icon={DashboardSvg} label='Dashboard' />
          {can('employees') && <SidebarLink to='/employees' icon={UserGroupIcon} label='Nhân viên' />}
          {can('permissions') && <SidebarLink to='/permissions' icon={ShieldExclamationIcon} label='Phân quyền' />}
          {can('regulations') && <SidebarLink to='/regulations' icon={Cog8ToothIcon} label='Tham số hệ thống' />}
          {can('services') && <SidebarLink to='/services' icon={Cog8ToothIcon} label='Dịch vụ khám' />}
          {can('catalogs') && <SidebarLink to='/catalogs' icon={LeavesSvg} label='Danh mục nền' />}
        </div>

        {renderExtendedFeatures(['employees', 'permissions', 'regulations', 'services', 'catalogs'])}

        <div className='border border-grey-transparent'></div>

        <div className='flex items-center justify-between px-3 py-4 mt-5 border rounded-md border-grey-transparent shadow-1 gap-x-5'>
          <span>
            <MoonIcon className='w-5 h-5' />
          </span>

          <span>Dark Mode</span>

          <ButtonToggle />
        </div>
      </aside>
    );
  }

  if (isDoctorOnly) {
    return (
      <aside className='w-full h-full p-4 overflow-y-auto bg-white border-r border-grey-transparent'>
        <div className="flex items-center justify-center mb-4 mt-2">
          <img src={LogoBenhVien} alt="Logo bệnh viện" className="h-16 object-contain" />
        </div>
        <div className='flex flex-col mb-6'>
          <p className='px-2 mb-2 text-sm font-semibold text-grey-400 text-center'>Bác sĩ</p>
          <SidebarLink to='/doctor/queue' icon={DashboardSvg} label='Trang chủ' />

          <SidebarLink to='/doctor/queue' icon={UserGroupIcon} label='Danh sách chờ khám' />
          <SidebarLink to='/medical-forms' icon={MedicalFormSvg} label='Phiếu khám' />
          <SidebarLink to='/medical-forms' icon={DrugSvg} label='Kê toa thuốc' />
          <SidebarLink to='/medical-forms' icon={PresentationChartLineIcon} label='Lịch sử khám bệnh' />
          <SidebarLink to='/lich-kham-doctor' icon={CalendarDaysIcon} label='Lịch khám đã xác nhận' />

          {can('patients') && (
            <SidebarLink to='/patients' icon={PatientsSvg} label='Bệnh nhân' />
          )}
        </div>

        {renderExtendedFeatures(['doctorQueue', 'medicalForms', 'patients'])}

        <div className='border border-grey-transparent'></div>

        <div className='flex items-center justify-between px-3 py-4 mt-5 border rounded-md border-grey-transparent shadow-1 gap-x-5'>
          <span>
            <MoonIcon className='w-5 h-5' />
          </span>

          <span>Dark Mode</span>

          <ButtonToggle />
        </div>
      </aside>
    );
  }

  if (isManager) {
    return (
      <aside className='w-full h-full p-4 overflow-y-auto bg-white border-r border-grey-transparent'>
        <div className="flex items-center justify-center mb-4 mt-2">
          <img src={LogoBenhVien} alt="Logo bệnh viện" className="h-16 object-contain" />
        </div>
        <div className='flex flex-col mb-6'>
          <p className='px-2 mb-2 text-sm font-semibold text-grey-400 text-center'>Quản lý</p>
          <SidebarLink to='/' icon={DashboardSvg} label='Dashboard' />
          {can('reports') && <SidebarLink to='/reports' icon={PresentationChartLineIcon} label='Thống kê tổng hợp' />}
          {can('reports') && <SidebarLink to='/reports/staff' icon={UserGroupIcon} label='Hiệu suất nhân viên' />}
          {can('patients') && <SidebarLink to='/patients' icon={PatientsSvg} label='Quản lý bệnh nhân' />}
          {can('drugs') && <SidebarLink to='/drugs' icon={DrugSvg} label='Quản lý thuốc' />}
          {can('regulations') && <SidebarLink to='/regulations' icon={Cog8ToothIcon} label='Tham số hệ thống' />}
          {can('services') && <SidebarLink to='/services' icon={Cog8ToothIcon} label='Dịch vụ khám' />}
          {can('catalogs') && <SidebarLink to='/catalogs' icon={LeavesSvg} label='Danh mục nền' />}
        </div>

        {renderExtendedFeatures(['reports', 'patients', 'drugs', 'regulations', 'services', 'catalogs'])}

        <div className='border border-grey-transparent'></div>

        <div className='flex items-center justify-between px-3 py-4 mt-5 border rounded-md border-grey-transparent shadow-1 gap-x-5'>
          <span>
            <MoonIcon className='w-5 h-5' />
          </span>

          <span>Dark Mode</span>

          <ButtonToggle />
        </div>
      </aside>
    );
  }

  if (isReceptionist) {
    return (
      <aside className='w-full h-full p-4 overflow-y-auto bg-white border-r border-grey-transparent'>
        <div className="flex items-center justify-center mb-4 mt-2">
          <img src={LogoBenhVien} alt="Logo bệnh viện" className="h-16 object-contain" />
        </div>
        <div className='flex flex-col mb-6'>
          <p className='px-2 mb-2 text-sm font-semibold text-grey-400 text-center'>Lễ tân – Thu ngân</p>
          <SidebarLink to='/' icon={DashboardSvg} label='Trang chủ' />
          {can('patients') && <SidebarLink to='/patients' icon={PatientsSvg} label='Quản lý bệnh nhân' />}
          {can('reception') && <SidebarLink to='/reception?tab=reception' icon={MapPinIcon} label='Tiếp nhận bệnh nhân' />}
          {can('appointments') && <SidebarLink to='/reception?tab=online' icon={AppointmentsSvg} label='Lịch hẹn online' />}
          {can('patients') && <SidebarLink to='/patients/today' icon={CalendarDaysIcon} label='Danh sách chờ khám' />}
          {can('invoices') && <SidebarLink to='/invoices' icon={CurrencyDollarIcon} label='Thanh toán' />}
          {can('catalogs') && <SidebarLink to='/catalogs' icon={LeavesSvg} label='Danh mục nền' />}
          {can('services') && <SidebarLink to='/services' icon={Cog8ToothIcon} label='Dịch vụ khám' />}
        </div>

        {renderExtendedFeatures(['patients', 'reception', 'appointments', 'invoices', 'catalogs', 'services'])}

        <div className='border border-grey-transparent'></div>

        <div className='flex items-center justify-between px-3 py-4 mt-5 border rounded-md border-grey-transparent shadow-1 gap-x-5'>
          <span>
            <MoonIcon className='w-5 h-5' />
          </span>

          <span>Dark Mode</span>

          <ButtonToggle />
        </div>
      </aside>
    );
  }

  if (isPatient) {
    return (
      <aside className='w-full h-full p-4 overflow-y-auto bg-white border-r border-grey-transparent'>
        <div className="flex items-center justify-center mb-4 mt-2">
          <img src={LogoBenhVien} alt="Logo bệnh viện" className="h-16 object-contain" />
        </div>
        <div className='flex flex-col mb-6'>
          <p className='px-2 mb-2 text-sm font-semibold text-grey-400 text-center'>Cổng Bệnh Nhân</p>
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
        </div>

        <div className='border border-grey-transparent'></div>

        <div className='flex items-center justify-between px-3 py-4 mt-5 border rounded-md border-grey-transparent shadow-1 gap-x-5'>
          <span>
            <MoonIcon className='w-5 h-5' />
          </span>

          <span>Dark Mode</span>

          <ButtonToggle />
        </div>
      </aside>
    );
  }

  return (
    <aside className='w-full h-full p-4 overflow-y-auto bg-white border-r border-grey-transparent'>
      {/* Main Menu */}
      <div className='mb-6'>
        <p className='px-2 mb-2 text-sm font-semibold text-grey-400'>
          Main Menu
        </p>

        {/* Dashboard - Tạm thời ẩn vì chưa có route */}
        {/* <Dropdown
          icon={DashboardSvg}
          label='Dashboard'
          items={[
            { label: 'Admin Dashboard', to: '/admin-dashboard' },
            { label: 'Doctor Dashboard', to: '/doctor-dashboard' },
            { label: 'Patient Dashboard', to: '/patient-dashboard' },
          ]}
        /> */}

        {/* Application - Tạm thời ẩn vì chưa có route */}
        {/* <Dropdown
          icon={ApplicationSvg}
          label='Application'
          items={[
            { label: 'Chat', to: '/admin-dashboard' },
            { label: 'Call', to: '/doctor-dashboard' },
            { label: 'Invoices', to: '/patient-dashboard' },
          ]}
        /> */}
      </div>

      {/* Clinic */}
      <div className='flex flex-col mb-6'>
        <p className='px-2 mb-2 text-sm font-semibold text-grey-400'>Clinic</p>

        {/* Employees */}
        {can('employees') && (
          <SidebarLink to='/employees' icon={UserGroupIcon} label='Employees' />
        )}

        {/* Doctors */}
        {can('doctors') && (
          <SidebarLink to='/doctors' icon={DoctorsSvg} label='Doctors' />
        )}

        {/* Patients */}
        {can('patients') && (
          <SidebarLink to='/patients' icon={PatientsSvg} label='Patients' />
        )}

        {/* Doctor quick links - chỉ hiện cho bác sĩ/admin để gọn UI */}
        {isDoctor && (
          <Dropdown
            icon={DoctorsSvg}
            label='Doctor'
            items={[
              { label: 'Bệnh nhân trong ngày', to: '/patients/today' },
              { label: 'Lịch khám đã xác nhận', to: '/lich-kham-doctor' },
              { label: 'Phiếu khám', to: '/medical-forms' },
            ]}
          />
        )}

        {/* Reception */}
        {can('reception') && (
          <SidebarLink to='/reception' icon={MapPinIcon} label='Reception' />
        )}

        {/* Medical Forms */}
        {can('medicalForms') && (
          <SidebarLink to='/medical-forms' icon={MedicalFormSvg} label='Medical Forms' />
        )}

        {/* Appointments */}
        {can('appointments') && (
          <SidebarLink to='/appointments' icon={AppointmentsSvg} label='Appointments' />
        )}

        {/* Drug Management */}
        {can('drugs') && (
          <SidebarLink to='/drugs' icon={DrugSvg} label='Drug Management' />
        )}

        {/* Invoices */}
        {can('invoices') && (
          <SidebarLink to='/invoices' icon={CurrencyDollarIcon} label='Invoices' />
        )}

        {/* Reports */}
        {can('reports') && (
          <SidebarLink to='/reports' icon={PresentationChartLineIcon} label='Reports' />
        )}

        {/* Regulations */}
        {can('regulations') && (
          <SidebarLink to='/regulations' icon={Cog8ToothIcon} label='Regulations' />
        )}
      </div>

      {/* Patient-specific menu: hiển thị khi role là BỆNH NHÂN hoặc role được phép truy cập patientProfile */}
      {(isPatient || can('patientProfile')) && (
        <div className='flex flex-col mb-6'>
          <p className='px-2 mb-2 text-sm font-semibold text-grey-400'>Bệnh nhân</p>
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
        </div>
      )}

      {/* Doctor-specific menu: hiển thị cho Bác sĩ và Admin */}
      {isDoctor && (
        <div className='flex flex-col mb-6'>
          <p className='px-2 mb-2 text-sm font-semibold text-grey-400'>Bác sĩ</p>
          <SidebarLink to='/doctor/queue' icon={DashboardSvg} label='Trang chủ' />
          <SidebarLink to='/doctor/queue' icon={UserGroupIcon} label='Danh sách chờ khám' />
          <SidebarLink to='/medical-forms' icon={MedicalFormSvg} label='Phiếu khám' />
          <SidebarLink to='/medical-forms' icon={DrugSvg} label='Kê toa thuốc' />
          <SidebarLink to='/medical-forms' icon={PresentationChartLineIcon} label='Lịch sử khám bệnh' />
        </div>
      )}

      

      {/* Support - luôn hiển thị, RoleGuard/backend sẽ chặn nếu role không phù hợp */}
      <div className='flex flex-col mb-6'>
        <p className='px-2 mb-2 text-sm font-semibold text-grey-400'>Support</p>
        {can('patientProfile') && (
          <SidebarLink to='/patients/profile' icon={UserCircleIcon} label='My Profile' />
        )}
        {can('appointments') && (
          <SidebarLink to='/lich-kham' icon={CalendarDaysIcon} label='Lịch khám của tôi' />
        )}
      </div>

      <div className='border border-grey-transparent'></div>

      <div className='flex items-center justify-between px-3 py-4 mt-5 border rounded-md border-grey-transparent shadow-1 gap-x-5'>
        <span>
          <MoonIcon className='w-5 h-5' />
        </span>

        <span>Dark Mode</span>

        <ButtonToggle />
      </div>
    </aside>
  );
};

export default Sidebar;
