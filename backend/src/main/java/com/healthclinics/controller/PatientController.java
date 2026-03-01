package com.healthclinics.controller;

import com.healthclinics.dto.ApiResponse;
import com.healthclinics.dto.UserProfileDTO;
import com.healthclinics.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/patient")
@RequiredArgsConstructor
public class PatientController {

    private final AuthService authService;

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
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAppointments() {
        // Dummy data - implement actual service later
        return ResponseEntity.ok(ApiResponse.success(List.of()));
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
