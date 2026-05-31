import SidebarLink from './SidebarLink';
import ButtonToggle from './ButtonToggle';
import { useRolePermissions } from '../hooks/useRolePermissions';
import LogoBenhVien from '../assets/logo-benh-vien.jpg';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

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
      { key: 'employees', to: '/employees', icon: UserGroupIcon, label: t('employees') },
      { key: 'permissions', to: '/permissions', icon: ShieldExclamationIcon, label: t('permissions') },
      { key: 'catalogs', to: '/catalogs', icon: LeavesSvg, label: t('base_categories') },
      { key: 'regulations', to: '/regulations', icon: Cog8ToothIcon, label: t('system_params') },
      { key: 'services', to: '/services', icon: Cog8ToothIcon, label: t('services') },
      { key: 'reports', to: '/reports', icon: PresentationChartLineIcon, label: t('overview_stats') },
      { key: 'drugs', to: '/drugs', icon: DrugSvg, label: t('drug_management') },
      { key: 'reception', to: '/reception?tab=reception', icon: MapPinIcon, label: t('patient_reception') },
      { key: 'appointments', to: '/reception?tab=online', icon: AppointmentsSvg, label: t('online_appointments') },
      { key: 'invoices', to: '/invoices', icon: CurrencyDollarIcon, label: t('payment') },
      { key: 'patients', to: '/patients', icon: PatientsSvg, label: t('patient_management') },
      { key: 'doctorQueue', to: '/doctor/queue', icon: UserGroupIcon, label: t('waiting_list') },
      { key: 'medicalForms', to: '/medical-forms', icon: MedicalFormSvg, label: t('medical_record') },
    ];

    const availableFeatures = features.filter(f => !excludeKeys.includes(f.key) && can(f.key));
    if (availableFeatures.length === 0) return null;

    return (
      <div className='mt-3 pt-3' style={{ borderTop: '1px solid var(--border-light)' }}>
        <p className='px-4 mb-1.5 text-[10px] font-bold uppercase tracking-widest' style={{ color: 'var(--accent)' }}>
          {t('features_group')}
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
        {t('dark_mode')}
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
        <SidebarSection title={t('admin_group')}>
          <SidebarLink to='/' icon={DashboardSvg} label={t('dashboard')} />
          {can('employees') && <SidebarLink to='/employees' icon={UserGroupIcon} label={t('employees')} />}
          {can('permissions') && <SidebarLink to='/permissions' icon={ShieldExclamationIcon} label={t('permissions')} />}
          {can('regulations') && <SidebarLink to='/regulations' icon={Cog8ToothIcon} label={t('system_params')} />}
          {can('services') && <SidebarLink to='/services' icon={Cog8ToothIcon} label={t('services')} />}
          {can('catalogs') && <SidebarLink to='/catalogs' icon={LeavesSvg} label={t('base_categories')} />}
        </SidebarSection>
        {renderExtendedFeatures(['employees', 'permissions', 'regulations', 'services', 'catalogs'])}
      </SidebarWrapper>
    );
  }

  if (isDoctorOnly) {
    return (
      <SidebarWrapper>
        <SidebarSection title={t('doctors_group')}>
          <SidebarLink to='/doctor/queue' icon={DashboardSvg} label={t('home')} />
          <SidebarLink to='/doctor/queue' icon={UserGroupIcon} label={t('waiting_list')} />
          <SidebarLink to='/medical-forms' icon={MedicalFormSvg} label={t('medical_record')} />
          <SidebarLink to='/medical-forms' icon={DrugSvg} label={t('prescribe_drugs')} />
          <SidebarLink to='/medical-forms' icon={PresentationChartLineIcon} label={t('medical_history')} />
          <SidebarLink to='/lich-kham-doctor' icon={CalendarDaysIcon} label={t('confirmed_appointments')} />
          {can('patients') && <SidebarLink to='/patients' icon={PatientsSvg} label={t('patient')} />}
        </SidebarSection>
        {renderExtendedFeatures(['doctorQueue', 'medicalForms', 'patients'])}
      </SidebarWrapper>
    );
  }

  if (isManager) {
    return (
      <SidebarWrapper>
        <SidebarSection title={t('managers_group')}>
          <SidebarLink to='/' icon={DashboardSvg} label={t('dashboard')} />
          {can('reports') && <SidebarLink to='/reports' icon={PresentationChartLineIcon} label={t('overview_stats')} />}
          {can('reports') && <SidebarLink to='/reports/staff' icon={UserGroupIcon} label={t('employees')} />}
          {can('patients') && <SidebarLink to='/patients' icon={PatientsSvg} label={t('patient_management')} />}
          {can('drugs') && <SidebarLink to='/drugs' icon={DrugSvg} label={t('drug_management')} />}
          {can('regulations') && <SidebarLink to='/regulations' icon={Cog8ToothIcon} label={t('system_params')} />}
          {can('services') && <SidebarLink to='/services' icon={Cog8ToothIcon} label={t('services')} />}
          {can('catalogs') && <SidebarLink to='/catalogs' icon={LeavesSvg} label={t('base_categories')} />}
        </SidebarSection>
        {renderExtendedFeatures(['reports', 'patients', 'drugs', 'regulations', 'services', 'catalogs'])}
      </SidebarWrapper>
    );
  }

  if (isReceptionist) {
    return (
      <SidebarWrapper>
        <SidebarSection title={t('receptionists_group')}>
          <SidebarLink to='/' icon={DashboardSvg} label={t('home')} />
          {can('patients') && <SidebarLink to='/patients' icon={PatientsSvg} label={t('patient_management')} />}
          {can('reception') && <SidebarLink to='/reception?tab=reception' icon={MapPinIcon} label={t('patient_reception')} />}
          {can('appointments') && <SidebarLink to='/reception?tab=online' icon={AppointmentsSvg} label={t('online_appointments')} />}
          {can('patients') && <SidebarLink to='/patients/today' icon={CalendarDaysIcon} label={t('waiting_list')} />}
          {can('invoices') && <SidebarLink to='/invoices' icon={CurrencyDollarIcon} label={t('payment')} />}
          {can('catalogs') && <SidebarLink to='/catalogs' icon={LeavesSvg} label={t('base_categories')} />}
          {can('services') && <SidebarLink to='/services' icon={Cog8ToothIcon} label={t('services')} />}
        </SidebarSection>
        {renderExtendedFeatures(['patients', 'reception', 'appointments', 'invoices', 'catalogs', 'services'])}
      </SidebarWrapper>
    );
  }

  if (isPatient) {
    return (
      <SidebarWrapper>
        <SidebarSection title={t('patient_group')}>
          <SidebarLink to='/patients/profile' icon={UserCircleIcon} label={t('home')} />
          {can('patientAppointments') && (
            <SidebarLink to='/patients/appointments' icon={AppointmentsSvg} label={t('book_appointment')} />
          )}
          {can('patientAppointments') && (
            <SidebarLink to='/patients/appointments' icon={CalendarDaysIcon} label={t('appointment_history')} />
          )}
          {can('patientMedicalRecords') && (
            <SidebarLink to='/patients/medical-records' icon={MedicalFormSvg} label={t('medical_history')} />
          )}
          {can('patientInvoices') && (
            <SidebarLink to='/patients/invoices' icon={CurrencyDollarIcon} label={t('invoices')} />
          )}
          <SidebarLink to='/patients/profile' icon={UserCircleIcon} label={t('personal_info')} />
        </SidebarSection>
      </SidebarWrapper>
    );
  }

  // Default fallback sidebar
  return (
    <SidebarWrapper>
      <SidebarSection title='Menu'>
        {can('employees') && <SidebarLink to='/employees' icon={UserGroupIcon} label={t('employees')} />}
        {can('doctors') && <SidebarLink to='/doctors' icon={DoctorsSvg} label={t('doctors')} />}
        {can('patients') && <SidebarLink to='/patients' icon={PatientsSvg} label={t('patient_management')} />}
        {can('reception') && <SidebarLink to='/reception' icon={MapPinIcon} label={t('patient_reception')} />}
        {can('medicalForms') && <SidebarLink to='/medical-forms' icon={MedicalFormSvg} label={t('medical_record')} />}
        {can('appointments') && <SidebarLink to='/appointments' icon={AppointmentsSvg} label={t('online_appointments')} />}
        {can('drugs') && <SidebarLink to='/drugs' icon={DrugSvg} label={t('drug_management')} />}
        {can('invoices') && <SidebarLink to='/invoices' icon={CurrencyDollarIcon} label={t('payment')} />}
        {can('reports') && <SidebarLink to='/reports' icon={PresentationChartLineIcon} label={t('overview_stats')} />}
        {can('regulations') && <SidebarLink to='/regulations' icon={Cog8ToothIcon} label={t('system_params')} />}
      </SidebarSection>
    </SidebarWrapper>
  );
};

export default Sidebar;
