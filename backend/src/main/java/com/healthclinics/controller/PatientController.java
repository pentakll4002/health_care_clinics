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

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileDTO>> getProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return ResponseEntity.ok(ApiResponse.success(authService.getUserProfile(email)));
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
