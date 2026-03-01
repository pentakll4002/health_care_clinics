import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axiosInstance';

const PROFILE_QUERY_KEY = ['patient-self-profile'];
const MEDICAL_RECORDS_QUERY_KEY = ['patient-medical-records'];
const INVOICES_QUERY_KEY = ['patient-invoices'];
const APPOINTMENTS_QUERY_KEY = ['patient-appointments'];
const NOTIFICATIONS_QUERY_KEY = ['patient-notifications'];
const DASHBOARD_QUERY_KEY = ['patient-dashboard'];
const DOCTORS_QUERY_KEY = ['patient-doctors'];

const fetchPatientProfile = async () => {
  const response = await axiosInstance.get('/patient/profile');
  return response.data;
};

const updatePatientProfileRequest = async (formData) => {
  // PHP/Laravel may not parse multipart/form-data payloads for PATCH/PUT.
  // Use method spoofing with POST to ensure server receives FormData fields.
  if (formData instanceof FormData && !formData.has('_method')) {
    formData.append('_method', 'PATCH');
  }
  const response = await axiosInstance.post('/patient/profile', formData);
  return response.data;
};

const changePasswordRequest = async (payload) => {
  const response = await axiosInstance.post('/patient/change-password', payload);
  return response.data;
};

const fetchMedicalRecords = async () => {
  const response = await axiosInstance.get('/patient/medical-records');
  return response.data.data;
};

const fetchInvoices = async () => {
  const response = await axiosInstance.get('/patient/invoices');
  return response.data.data;
};

const fetchAppointments = async () => {
  const response = await axiosInstance.get('/patient/appointments');
  return response.data.data;
};

const createAppointmentRequest = async (payload) => {
  const response = await axiosInstance.post('/patient/appointments', payload);
  return response.data;
};

const cancelAppointmentRequest = async (appointmentId) => {
  const response = await axiosInstance.patch(`/patient/appointments/${appointmentId}`);
  return response.data;
};

const fetchNotifications = async () => {
  const response = await axiosInstance.get('/patient/notifications');
  return response.data.data;
};

const fetchDashboard = async () => {
  const response = await axiosInstance.get('/patient/dashboard');
  return response.data.data;
};

const fetchDoctors = async () => {
  const response = await axiosInstance.get('/nhanvien', {
    params: {
      limit: 100,
      ma_nhom: '@doctors',
    },
  });
  return response.data;
};

export function usePatientSelfProfile() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: fetchPatientProfile,
    retry: false,
    enabled: true,
  });
}

export function useUpdatePatientSelfProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePatientProfileRequest,
    onSuccess: async () => {
      toast.success('Đã lưu thay đổi hồ sơ');
      await queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
    onError: (error) => {
      const serverErrors = error?.response?.data?.errors;
      let message = error?.response?.data?.message || 'Không thể cập nhật hồ sơ';
      if (serverErrors) {
        const firstKey = Object.keys(serverErrors)[0];
        if (firstKey) {
          message = serverErrors[firstKey][0] || message;
        }
      }
      toast.error(message);
    },
  });
}

export function useChangePatientPassword() {
  return useMutation({
    mutationFn: changePasswordRequest,
    onSuccess: () => {
      toast.success('Đổi mật khẩu thành công');
    },
    onError: (error) => {
      const message =
        error?.response?.data?.errors?.current_password?.[0] ||
        error?.response?.data?.message ||
        'Không thể đổi mật khẩu';
      toast.error(message);
    },
  });
}

export function usePatientMedicalRecords() {
  return useQuery({
    queryKey: MEDICAL_RECORDS_QUERY_KEY,
    queryFn: fetchMedicalRecords,
    retry: false,
    enabled: true,
  });
}

export function usePatientInvoices() {
  return useQuery({
    queryKey: INVOICES_QUERY_KEY,
    queryFn: fetchInvoices,
    retry: false,
    enabled: true,
  });
}

export function usePatientAppointments() {
  return useQuery({
    queryKey: APPOINTMENTS_QUERY_KEY,
    queryFn: fetchAppointments,
    retry: false,
    enabled: true,
  });
}

export function useCreatePatientAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAppointmentRequest,
    onSuccess: async () => {
      toast.success('Đặt lịch khám thành công');
      await queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY });
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.NgayTN?.[0] ||
        'Không thể đặt lịch';
      toast.error(message);
    },
  });
}

export function useCancelPatientAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelAppointmentRequest,
    onSuccess: async () => {
      toast.success('Huỷ lịch thành công');
      await queryClient.invalidateQueries({ queryKey: APPOINTMENTS_QUERY_KEY });
    },
    onError: (error) => {
      const message = error?.response?.data?.message || 'Không thể huỷ lịch';
      toast.error(message);
    },
  });
}

export function usePatientNotifications() {
  return useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: fetchNotifications,
    refetchInterval: 60000,
    retry: false,
    enabled: true,
  });
}

export function usePatientDashboard() {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: fetchDashboard,
    retry: false,
    enabled: true,
  });
}

export function useDoctorsForAppointments() {
  return useQuery({
    queryKey: DOCTORS_QUERY_KEY,
    queryFn: fetchDoctors,
  });
}

