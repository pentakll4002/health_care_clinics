import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  vi: {
    translation: {
      // General & Common
      "welcome": "Xin chào",
      "search": "Tìm kiếm...",
      "add": "Thêm",
      "edit": "Sửa",
      "delete": "Xoá",
      "actions": "Hành động",
      "save": "Lưu",
      "cancel": "Huỷ",
      "confirm": "Xác nhận",
      "loading": "Đang tải...",
      
      // Roles
      "admin": "Quản trị viên",
      "doctors": "Bác sĩ",
      "receptionists": "Lễ tân",
      "managers": "Quản lý",
      "patient": "Bệnh nhân",

      // Sidebar Groups
      "admin_group": "QUẢN TRỊ",
      "doctors_group": "BÁC SĨ",
      "managers_group": "QUẢN LÝ",
      "receptionists_group": "LỄ TÂN – THU NGÂN",
      "patient_group": "CỔNG BỆNH NHÂN",
      "features_group": "CHỨC NĂNG MỞ RỘNG",

      // Sidebar
      "dashboard": "Dashboard",
      "employees": "Nhân viên",
      "permissions": "Phân quyền",
      "system_params": "Tham số hệ thống",
      "services": "Dịch vụ khám",
      "base_categories": "Danh mục nền",
      "overview_stats": "Thống kê tổng hợp",
      "drug_management": "Quản lý thuốc",
      "patient_reception": "Tiếp nhận bệnh nhân",
      "online_appointments": "Lịch hẹn online",
      "payment": "Thanh toán",
      "patient_management": "Quản lý bệnh nhân",
      "waiting_list": "Danh sách chờ khám",
      "medical_record": "Phiếu khám",
      "home": "Trang chủ",
      "prescribe_drugs": "Kê toa thuốc",
      "medical_history": "Lịch sử khám bệnh",
      "confirmed_appointments": "Lịch khám đã xác nhận",
      "book_appointment": "Đặt lịch khám",
      "appointment_history": "Lịch sử đặt lịch",
      "personal_info": "Thông tin cá nhân",
      "invoices": "Hoá đơn",

      // Header & Settings
      "system_config": "Cấu hình hệ thống",
      "dark_mode": "Giao diện tối",
      "sound_notification": "Âm thanh thông báo",
      "language": "Ngôn ngữ",
      "password_security": "Đổi mật khẩu & Bảo mật",
      "tech_support": "Trung tâm hỗ trợ kỹ thuật",
      "work_schedule_events": "Lịch làm việc & Sự kiện",
      "today": "Hôm nay",
      "notifications": "Thông báo",
      "pending_tasks": "Những việc cần xử lý",
      "mark_all_read": "Đã xem hết",
      "no_pending_tasks": "Không có việc cần xử lý.",
      
      // Services Page
      "services_title": "Dịch vụ khám",
      "services_subtitle": "Quản lý danh mục dịch vụ và đơn giá",
      "add_service": "Thêm dịch vụ",
      "service_name": "Tên dịch vụ",
      "price": "Đơn giá",
      "edit_service": "Sửa dịch vụ",
      "delete_service_confirm": "Bạn có chắc chắn muốn xoá dịch vụ này?",
      
      // Dynamic Data Dictionary for Common Services
      "Khám thường": "Khám thường",
      "Khám chuyên sâu": "Khám chuyên sâu",
      "Tái khám": "Tái khám",
      "Xét nghiệm máu": "Xét nghiệm máu",
      "Xét nghiệm nước tiểu": "Xét nghiệm nước tiểu",
      "Xét nghiệm sinh hóa máu": "Xét nghiệm sinh hóa máu",
      "Siêu âm tổng quát": "Siêu âm tổng quát",
      "Siêu âm tim": "Siêu âm tim",
      "Chụp X-quang phổi": "Chụp X-quang phổi",
      "Nội soi dạ dày": "Nội soi dạ dày",
      "Đo điện tâm đồ (ECG)": "Đo điện tâm đồ (ECG)",
      "Khám mắt": "Khám mắt",
      "Khám tai mũi họng": "Khám tai mũi họng",
      "Khám răng hàm mặt": "Khám răng hàm mặt",
    }
  },
  en: {
    translation: {
      // General & Common
      "welcome": "Welcome",
      "search": "Search...",
      "add": "Add",
      "edit": "Edit",
      "delete": "Delete",
      "actions": "Actions",
      "save": "Save",
      "cancel": "Cancel",
      "confirm": "Confirm",
      "loading": "Loading...",

      // Roles
      "admin": "Administrator",
      "doctors": "Doctor",
      "receptionists": "Receptionist",
      "managers": "Manager",
      "patient": "Patient",

      // Sidebar Groups
      "admin_group": "ADMINISTRATION",
      "doctors_group": "DOCTORS",
      "managers_group": "MANAGERS",
      "receptionists_group": "RECEPTION – BILLING",
      "patient_group": "PATIENT PORTAL",
      "features_group": "EXTENDED FEATURES",

      // Sidebar
      "dashboard": "Dashboard",
      "employees": "Employees",
      "permissions": "Permissions",
      "system_params": "System Parameters",
      "services": "Medical Services",
      "base_categories": "Base Categories",
      "overview_stats": "General Statistics",
      "drug_management": "Drug Management",
      "patient_reception": "Patient Reception",
      "online_appointments": "Online Appointments",
      "payment": "Payments & Billing",
      "patient_management": "Patient Management",
      "waiting_list": "Waiting List",
      "medical_record": "Medical Record",
      "home": "Home",
      "prescribe_drugs": "Prescribe Drugs",
      "medical_history": "Medical History",
      "confirmed_appointments": "Confirmed Appointments",
      "book_appointment": "Book Appointment",
      "appointment_history": "Appointment History",
      "personal_info": "Personal Information",
      "invoices": "Invoices",

      // Header & Settings
      "system_config": "System Settings",
      "dark_mode": "Dark Mode",
      "sound_notification": "Sound Notification",
      "language": "Language",
      "password_security": "Password & Security",
      "tech_support": "Technical Support Center",
      "work_schedule_events": "Schedule & Events",
      "today": "Today",
      "notifications": "Notifications",
      "pending_tasks": "Pending Tasks",
      "mark_all_read": "Mark All Read",
      "no_pending_tasks": "No pending tasks.",

      // Services Page
      "services_title": "Medical Services",
      "services_subtitle": "Manage medical service list and pricing",
      "add_service": "Add Service",
      "service_name": "Service Name",
      "price": "Price",
      "edit_service": "Edit Service",
      "delete_service_confirm": "Are you sure you want to delete this service?",
      
      // Dynamic Data Dictionary for Common Services
      "Khám thường": "Regular Checkup",
      "Khám chuyên sâu": "Specialist Checkup",
      "Tái khám": "Follow-up Checkup",
      "Xét nghiệm máu": "Blood Test",
      "Xét nghiệm nước tiểu": "Urinalysis",
      "Xét nghiệm sinh hóa máu": "Blood Biochemistry Test",
      "Siêu âm tổng quát": "General Ultrasound",
      "Siêu âm tim": "Echocardiogram",
      "Chụp X-quang phổi": "Chest X-ray",
      "Nội soi dạ dày": "Gastroscopy",
      "Đo điện tâm đồ (ECG)": "Electrocardiogram (ECG)",
      "Khám mắt": "Eye Exam",
      "Khám tai mũi họng": "ENT Exam",
      "Khám răng hàm mặt": "Dental Exam",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('app-lang') || 'vi',
    fallbackLng: 'vi',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
