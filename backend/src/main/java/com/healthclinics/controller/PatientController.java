package com.healthclinics.controller;

import com.healthclinics.dto.ApiResponse;
import com.healthclinics.dto.LichKhamDTO;
import com.healthclinics.dto.UserProfileDTO;
import com.healthclinics.entity.User;
import com.healthclinics.entity.BenhNhan;
import com.healthclinics.repository.UserRepository;
import com.healthclinics.service.AuthService;
import com.healthclinics.service.LichKhamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/patient")
@RequiredArgsConstructor
public class PatientController {

    private final AuthService authService;
    private final LichKhamService lichKhamService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileDTO>> getProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return ResponseEntity.ok(ApiResponse.success(authService.getUserProfile(email)));
    }

    @PostMapping(value = "/profile", consumes = {"application/json", "multipart/form-data"})
    public ResponseEntity<ApiResponse<UserProfileDTO>> updateProfile(
            @RequestParam(value = "avatar", required = false) org.springframework.web.multipart.MultipartFile avatarFile,
            @RequestParam(value = "DienThoai", required = false) String dienThoai,
            @RequestParam(value = "Email", required = false) String email,
            @RequestParam(value = "DiaChi", required = false) String diaChi,
            @RequestParam(value = "hoTenBN", required = false) String hoTenBN,
            @RequestParam(value = "gioiTinh", required = false) String gioiTinh,
            @RequestParam(value = "name", required = false) String name) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = auth.getName();
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // --- Server-side validation ---
        if (dienThoai == null || dienThoai.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Số điện thoại không được bỏ trống"));
        }
        if (!dienThoai.trim().matches("^(0[3|5|7|8|9])([0-9]{8})$")) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Số điện thoại không hợp lệ (phải gồm 10 chữ số, bắt đầu bằng 03, 05, 07, 08, 09)"));
        }
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Email không được bỏ trống"));
        }
        if (diaChi == null || diaChi.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Địa chỉ không được bỏ trống"));
        }
        
        // Update user name
        if (name != null && !name.isEmpty()) {
            user.setName(name);
        }
        
        // Update BenhNhan fields
        BenhNhan bn = user.getBenhNhan();
        if (bn != null) {
            if (hoTenBN != null && !hoTenBN.isEmpty()) bn.setHoTenBN(hoTenBN);
            bn.setDienThoai(dienThoai.trim());
            bn.setDiaChi(diaChi.trim());
            bn.setEmail(email.trim());
            if (gioiTinh != null) bn.setGioiTinh(gioiTinh);
            
            // Handle avatar file upload
            if (avatarFile != null && !avatarFile.isEmpty()) {
                try {
                    String uploadDir = System.getProperty("user.dir") + "/uploads/avatars/";
                    java.io.File dir = new java.io.File(uploadDir);
                    if (!dir.exists()) dir.mkdirs();
                    
                    String fileName = "patient_" + bn.getIdBenhNhan() + "_" + System.currentTimeMillis() 
                            + getFileExtension(avatarFile.getOriginalFilename());
                    java.nio.file.Path filePath = java.nio.file.Paths.get(uploadDir, fileName);
                    avatarFile.transferTo(filePath.toFile());
                    
                    // Store relative URL for frontend access
                    bn.setAvatar("/uploads/avatars/" + fileName);
                } catch (Exception e) {
                    // Log but don't fail the entire update
                    System.err.println("Avatar upload failed: " + e.getMessage());
                }
            }
        }
        
        userRepository.save(user);
        
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thành công", authService.getUserProfile(userEmail)));
    }
    
    private String getFileExtension(String filename) {
        if (filename == null) return ".jpg";
        int dot = filename.lastIndexOf('.');
        return dot > 0 ? filename.substring(dot) : ".jpg";
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<?>> changePassword(@RequestBody Map<String, String> payload) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        String currentPassword = payload.get("current_password");
        // Frontend sends 'password', backend also supports 'new_password'
        String newPassword = payload.get("password") != null ? payload.get("password") : payload.get("new_password");
        String confirmPassword = payload.get("password_confirmation") != null ? payload.get("password_confirmation") : payload.get("new_password_confirmation");
        
        if (currentPassword == null || currentPassword.isEmpty() || newPassword == null || newPassword.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Vui lòng nhập đầy đủ thông tin"));
        }
        
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Mật khẩu hiện tại không đúng"));
        }
        
        if (newPassword.length() < 8) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Mật khẩu mới phải ít nhất 8 ký tự"));
        }
        
        if (confirmPassword != null && !confirmPassword.isEmpty() && !newPassword.equals(confirmPassword)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Xác nhận mật khẩu không khớp"));
        }
        
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        return ResponseEntity.ok(ApiResponse.success("Đổi mật khẩu thành công", null));
    }

    @GetMapping("/medical-records")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getMedicalRecords() {
        // Dummy data - implement actual service later
        return ResponseEntity.ok(ApiResponse.success(List.of()));
    }

    @GetMapping("/invoices")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getInvoices() {
        // Dummy data - implement actual service later
        return ResponseEntity.ok(ApiResponse.success(List.of()));
    }

    @GetMapping("/appointments")
    public ResponseEntity<ApiResponse<List<LichKhamDTO>>> getAppointments() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByEmailWithBenhNhan(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        if (user.getBenhNhan() == null) {
            return ResponseEntity.ok(ApiResponse.success(List.of()));
        }
        
        List<LichKhamDTO> appointments = lichKhamService.getByBenhNhan(user.getBenhNhan().getIdBenhNhan());
        return ResponseEntity.ok(ApiResponse.success(appointments));
    }
    
    @PostMapping("/appointments")
    public ResponseEntity<ApiResponse<LichKhamDTO>> createAppointment(@RequestBody Map<String, Object> payload) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User user = userRepository.findByEmailWithBenhNhan(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        if (user.getBenhNhan() == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("User is not a patient"));
        }
        
        LichKhamDTO dto = new LichKhamDTO();
        dto.setIdBenhNhan(user.getBenhNhan().getIdBenhNhan());
        
        if (payload.containsKey("NgayTN") && payload.get("NgayTN") != null) {
            String dateStr = payload.get("NgayTN").toString();
            if (dateStr.contains("T")) {
                dateStr = dateStr.split("T")[0];
            }
            dto.setNgayKhamDuKien(LocalDate.parse(dateStr));
        }
        
        if (payload.containsKey("CaTN") && payload.get("CaTN") != null) {
            dto.setCaKham(payload.get("CaTN").toString());
        }
        
        if (payload.containsKey("ID_NhanVien") && payload.get("ID_NhanVien") != null && !payload.get("ID_NhanVien").toString().isEmpty()) {
            dto.setIdBacSi(Long.parseLong(payload.get("ID_NhanVien").toString()));
        }
        
        LichKhamDTO created = lichKhamService.create(dto);
        return ResponseEntity.ok(ApiResponse.success("Đặt lịch thành công", created));
    }
    
    @PatchMapping("/appointments/{id}")
    public ResponseEntity<ApiResponse<LichKhamDTO>> cancelAppointment(@PathVariable Long id) {
        LichKhamDTO canceled = lichKhamService.cancel(id);
        return ResponseEntity.ok(ApiResponse.success("Hủy lịch thành công", canceled));
    }

    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getNotifications() {
        // Dummy data - implement actual service later
        return ResponseEntity.ok(ApiResponse.success(List.of()));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard() {
        // Dummy data - implement actual service later
        return ResponseEntity.ok(ApiResponse.success(Map.of("totalAppointments", 0, "totalInvoices", 0, "upcomingAppointments", 0)));
    }
}
