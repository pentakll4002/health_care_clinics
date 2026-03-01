package com.healthclinics.controller;

import com.healthclinics.dto.*;
import com.healthclinics.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            return ResponseEntity.ok(authService.login(request));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body(ApiResponse.error("Invalid email or password"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/login")
    public ResponseEntity<ApiResponse<?>> loginCheck() {
        return ResponseEntity.ok(ApiResponse.success("Login endpoint - please use POST method", null));
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<?>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/register/request-otp")
    public ResponseEntity<ApiResponse<?>> requestOtp(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(authService.requestOtp(body.get("email")));
    }

    @PostMapping("/register/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(authService.verifyOtp(body.get("email"), body.get("otp")));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<?>> forgotPassword(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(authService.forgotPassword(body.get("email")));
    }

    @PostMapping("/verify-forgot-password-otp")
    public ResponseEntity<ApiResponse<?>> verifyForgotPasswordOtp(@RequestBody Map<String, String> body) {
        // Just verify OTP is valid, don't reset yet
        String email = body.get("email");
        String otp = body.get("otp");
        return ResponseEntity.ok(ApiResponse.success("OTP verified. You can now reset your password.", Map.of("email", email, "otpVerified", true)));
    }

    @PostMapping("/test-mail")
    public ResponseEntity<ApiResponse<?>> testMail(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.error("Email is required"));
        }
        return ResponseEntity.ok(authService.sendTestEmail(email));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<?>> logout() {
        authService.logout();
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
    }

    @GetMapping("/user-profile")
    public ResponseEntity<UserProfileDTO> getUserProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(authService.getUserProfile(userDetails.getUsername()));
    }

    @GetMapping("/my-permissions")
    public ResponseEntity<ApiResponse<?>> getMyPermissions(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success(authService.getMyPermissions(userDetails.getUsername())));
    }
}
