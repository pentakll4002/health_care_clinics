import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import SignIn from './pages/SignIn/SignIn';
import Register from './pages/Register/Register';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import EmailVerification from './pages/ForgotPassword/EmailVerification';
import ResetPassword from './pages/ForgotPassword/ResetPassword';
import Success from './pages/ForgotPassword/Success';

import LayoutApp from './layouts/LayoutApp';
import Doctors from './pages/Doctors';
import Patients from './pages/Patients';
import PatientsToday from './pages/PatientsToday';
import Patient from './pages/Patient';
import Reception from './pages/Reception';
import Drugs from './pages/Drugs';
import DrugDetail from './pages/DrugDetail';
import MedicalForms from './pages/MedicalForms';
import Invoices from './pages/Invoices';
import Appointments from './pages/Appointments';
import AppointmentProfile from './pages/AppointmentProfile';
import PatientProfilePage from './pages/PatientProfile';
import Reports from './pages/Reports';
import Regulations from './pages/Regulations';
import RoleGuard from './ui/RoleGuard';
import RoleLanding from './pages/RoleLanding';
import Employees from './pages/Employees';
import LichKham from './pages/LichKham';
import LichKhamDoctor from './pages/LichKhamDoctor';
import Permissions from './pages/Permissions';
import Catalogs from './pages/Catalogs';
import PatientAppointments from './pages/PatientAppointments';
import PatientInvoices from './pages/PatientInvoices';
import PatientMedicalRecords from './pages/PatientMedicalRecords';
import ReportsStaff from './pages/ReportsStaff';
import DrugsImport from './pages/DrugsImport';
import DoctorQueue from './pages/DoctorQueue';
import DoctorExam from './pages/DoctorExam';
import Services from './pages/Services';
import InvoicePrintPage from './features/invoices/InvoicePrintPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
    },
  },
});

function RequireAuth({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const token =
    localStorage.getItem('token') || localStorage.getItem('auth_token');

  useEffect(() => {
    if (!token) {
      if (
        location.pathname !== '/sign-in' &&
        location.pathname !== '/sign-up' &&
        !location.pathname.startsWith('/forgot-password')
      ) {
        navigate('/sign-in');
      }
    }
  }, [token, navigate, location]);

  return children;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position='top-right' />
      <BrowserRouter>
        <Routes>
          <Route element={<LayoutApp />}>
            <Route index element={<RoleLanding />} />

            <Route
              path='employees'
              element={
                <RoleGuard route='employees'>
                  <Employees />
                </RoleGuard>
              }
            />

            <Route
              path='permissions'
              element={
                <RoleGuard route='permissions'>
                  <Permissions />
                </RoleGuard>
              }
            />

            <Route
              path='catalogs'
              element={
                <RoleGuard route='catalogs'>
                  <Catalogs />
                </RoleGuard>
              }
            />

            <Route
              path='doctors'
              element={
                <RoleGuard route='doctors'>
                  <Doctors />
                </RoleGuard>
              }
            />

            <Route
              path='patients'
              element={
                <RoleGuard route='patients'>
                  <Patients />
                </RoleGuard>
              }
            />

            <Route
              path='patients/today'
              element={
                <RoleGuard route='patients'>
                  <PatientsToday />
                </RoleGuard>
              }
            />

            <Route
              path='patients/profile'
              element={
                <RoleGuard route='patientProfile'>
                  <PatientProfilePage />
                </RoleGuard>
              }
            />

            <Route
              path='patients/appointments'
              element={
                <RoleGuard route='patientAppointments'>
                  <PatientAppointments />
                </RoleGuard>
              }
            />

            <Route
              path='patients/invoices'
              element={
                <RoleGuard route='patientInvoices'>
                  <PatientInvoices />
                </RoleGuard>
              }
            />

            <Route
              path='patients/medical-records'
              element={
                <RoleGuard route='patientMedicalRecords'>
                  <PatientMedicalRecords />
                </RoleGuard>
              }
            />

            <Route
              path='patients/:ID_BenhNhan'
              element={
                <RoleGuard route='patientDetail'>
                  <Patient />
                </RoleGuard>
              }
            />

            <Route
              path='reception'
              element={
                <RoleGuard route='reception'>
                  <Reception />
                </RoleGuard>
              }
            />

            <Route
              path='drugs'
              element={
                <RoleGuard route='drugs'>
                  <Drugs />
                </RoleGuard>
              }
            />

            <Route
              path='drugs/import'
              element={
                <RoleGuard route='drugs'>
                  <DrugsImport />
                </RoleGuard>
              }
            />

            <Route
              path='drugs/:id'
              element={
                <RoleGuard route='drugs'>
                  <DrugDetail />
                </RoleGuard>
              }
            />

            <Route
              path='medical-forms'
              element={
                <RoleGuard route='medicalForms'>
                  <MedicalForms />
                </RoleGuard>
              }
            />

            <Route
              path='invoices'
              element={
                <RoleGuard route='invoices'>
                  <Invoices />
                </RoleGuard>
              }
            />

            <Route
              path='appointments'
              element={
                <RoleGuard route='appointments'>
                  <Appointments />
                </RoleGuard>
              }
            />

            <Route
              path='appointments/:id'
              element={
                <RoleGuard route='appointments'>
                  <AppointmentProfile />
                </RoleGuard>
              }
            />

            <Route
              path='reports'
              element={
                <RoleGuard route='reports'>
                  <Reports />
                </RoleGuard>
              }
            />

            <Route
              path='reports/staff'
              element={
                <RoleGuard route='reports'>
                  <ReportsStaff />
                </RoleGuard>
              }
            />

            <Route
              path='regulations'
              element={
                <RoleGuard route='regulations'>
                  <Regulations />
                </RoleGuard>
              }
            />

            <Route
              path='services'
              element={
                <RoleGuard route='services'>
                  <Services />
                </RoleGuard>
              }
            />

            <Route
              path='lich-kham'
              element={
                <RoleGuard route='patientProfile'>
                  <LichKham />
                </RoleGuard>
              }
            />

            <Route
              path='lich-kham-doctor'
              element={
                <RoleGuard route='doctors'>
                  <LichKhamDoctor />
                </RoleGuard>
              }
            />

            <Route
              path='doctor/queue'
              element={
                <RoleGuard route='doctorQueue'>
                  <DoctorQueue />
                </RoleGuard>
              }
            />

            <Route
              path='doctor/exam/:id'
              element={
                <RoleGuard route='doctorExam'>
                  <DoctorExam />
                </RoleGuard>
              }
            />
          </Route>

          <Route
            path='/invoices/:id/print'
            element={
              <RoleGuard route='invoices'>
                <InvoicePrintPage />
              </RoleGuard>
            }
          />

          <Route path='/login' element={<Navigate to='/sign-in' replace />} />
          <Route path='/signin' element={<Navigate to='/sign-in' replace />} />
          <Route path='/register' element={<Navigate to='/sign-up' replace />} />
          
          <Route path='/sign-in' element={<SignIn />} />
          <Route path='/sign-up' element={<Register />} />
          <Route path='*' element={<Navigate to='/' replace />} />
          <Route path='/forgot-password'>
            <Route index element={<ForgotPassword />} />
            <Route path='email-verification' element={<EmailVerification />} />
            <Route path='reset' element={<ResetPassword />} />
            <Route path='success' element={<Success />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
