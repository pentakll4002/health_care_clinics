export const ROLE_ROUTES = {
  admin: ['employees','doctors','patients','reports','regulations'],
  doctors: ['patients','patientDetail','medicalForms','doctorQueue','doctorExam'],
  receptionists: ['reception','patients','appointments','invoices'],
  managers: ['reports','regulations','drugs','services','catalogs'],
  patient: ['patientProfile'],
};



export const ROUTE_ROLES = {
  employees: ['admin'],
  permissions: ['admin'],
  catalogs: ['admin', 'managers'],
  doctors: ['admin', 'doctors'],
  
  patients: ['admin', 'doctors', 'receptionists'],
  patientDetail: ['admin', 'doctors', 'receptionists'],
  patientProfile: ['patient'],
  
  reception: ['admin', 'receptionists'],
  
  drugs: ['admin', 'managers', 'doctors'],
  
  medicalForms: ['admin', 'doctors'],

  doctorQueue: ['admin', 'doctors'],
  doctorExam: ['admin', 'doctors'],
  
  invoices: ['admin', 'receptionists'],
  
  appointments: ['admin', 'receptionists'],

  patientAppointments: ['patient'],
  patientInvoices: ['patient'],
  patientMedicalRecords: ['patient'],
  
  reports: ['admin', 'managers'],
  
  regulations: ['admin', 'managers'],

  services: ['admin', 'managers'],
};

export const ROUTE_PERMISSIONS = {
  employees: 'manage-employees',
  permissions: 'manage-permissions',
  catalogs: 'configure-system',
  doctors: 'examine-patients',
  patients: 'manage-patients',
  patientDetail: 'manage-patients',
  reception: 'intake-patient',
  drugs: 'manage-drugs',
  medicalForms: 'examine-patients',
  doctorQueue: 'examine-patients',
  doctorExam: 'examine-patients',
  invoices: 'manage-invoices',
  appointments: 'schedule-appointments',
  reports: 'manage-reports',
  regulations: 'configure-system',
  services: 'configure-system',
};

