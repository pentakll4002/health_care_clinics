package com.healthclinics.service;

import com.healthclinics.config.JwtTokenUtil;
import com.healthclinics.dto.*;
import com.healthclinics.entity.*;
import com.healthclinics.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final BenhNhanRepository benhNhanRepository;
    private final NhanVienRepository nhanVienRepository;
    private final PhanQuyenRepository phanQuyenRepository;
    private final PendingRegisterRepository pendingRegisterRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtil jwtTokenUtil;
    private final AuthenticationManager authenticationManager;
    private final JavaMailSender mailSender;
    private final EmailService emailService;

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        User user = userRepository.findByEmailWithNhanVien(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String role = user.getRole();
        NhanVien nhanVien = user.getNhanVien();
        if (nhanVien != null && nhanVien.getNhomNguoiDung() != null) {
            role = nhanVien.getNhomNguoiDung().getMaNhom();
        }

        String token = jwtTokenUtil.generateToken(user.getEmail(), new HashMap<>());
        
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), role);
    }

    @Transactional
    public ApiResponse<?> register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return ApiResponse.error("Email already exists");
        }

        // Tạo OTP
        String otp = generateOtp();
        
        // Lưu pending register
        PendingRegister pending = PendingRegister.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .otp(otp)
                .otpExpiresAt(LocalDateTime.now().plusMinutes(5))
                .build();
        
        pendingRegisterRepository.save(pending);
        
        // Send OTP email
        emailService.sendOtpEmail(request.getEmail(), otp);
        
        return ApiResponse.success("OTP sent to your email. Please verify to complete registration.", 
                Map.of("email", request.getEmail()));
    }

    @Transactional
    public ApiResponse<?> requestOtp(String email) {
        Optional<PendingRegister> pendingOpt = pendingRegisterRepository.findByEmail(email);
        
        if (pendingOpt.isEmpty()) {
            return ApiResponse.error("No pending registration found for this email");
        }
        
        PendingRegister pending = pendingOpt.get();
        String otp = generateOtp();
        
        pending.setOtp(otp);
        pending.setOtpExpiresAt(LocalDateTime.now().plusMinutes(5));
        pendingRegisterRepository.save(pending);
        
        // Send OTP email
        emailService.sendOtpEmail(email, otp);
        
        return ApiResponse.success("OTP sent to your email", Map.of("email", email));
    }

    @Transactional
    public AuthResponse verifyOtp(String email, String otp) {
        PendingRegister pending = pendingRegisterRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No pending registration found"));

        if (!pending.getOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        if (pending.getOtpExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }

        // Create user
        User user = User.builder()
                .name(pending.getName())
                .email(pending.getEmail())
                .password(pending.getPassword())
                .role("patient")
                .build();
        userRepository.save(user);

        // Create BenhNhan
        BenhNhan benhNhan = BenhNhan.builder()
                .hoTenBN(pending.getName())
                .email(pending.getEmail())
                .userId(user.getId())
                .ngayDK(LocalDateTime.now())
                .isDeleted(false)
                .build();
        benhNhanRepository.save(benhNhan);

        // Delete pending register
        pendingRegisterRepository.deleteByEmail(email);

        // Generate token
        String token = jwtTokenUtil.generateToken(user.getEmail(), new HashMap<>());

        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail(), "patient");
    }

    @Transactional
    public ApiResponse<?> forgotPassword(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            return ApiResponse.error("Email not found");
        }
        
        String otp = generateOtp();
        
        // Store OTP in pending register for verification
        User user = userOpt.get();
        PendingRegister pending = pendingRegisterRepository.findByEmail(email)
                .orElse(PendingRegister.builder()
                        .name(user.getName())
                        .email(email)
                        .password(user.getPassword())
                        .build());
        pending.setOtp(otp);
        pending.setOtpExpiresAt(LocalDateTime.now().plusMinutes(5));
        pendingRegisterRepository.save(pending);
        
        // Send OTP email
        emailService.sendPasswordResetEmail(email, otp);
        
        return ApiResponse.success("OTP sent to your email", Map.of("email", email));
    }

    public ApiResponse<?> sendTestEmail(String toEmail) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("hiroplayga@gmail.com");
            message.setTo(toEmail);
            message.setSubject("Test Email - Health Clinics");
            message.setText("This is a test email to verify SMTP configuration.");
            mailSender.send(message);
            return ApiResponse.success("Test email sent to " + toEmail, null);
        } catch (Exception e) {
            return ApiResponse.error("Failed to send test email: " + e.getMessage());
        }
    }

    @Transactional
    public ApiResponse<?> resetPassword(String email, String otp, String newPassword) {
        PendingRegister pending = pendingRegisterRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No password reset request found"));

        if (!pending.getOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        if (pending.getOtpExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        pendingRegisterRepository.deleteByEmail(email);

        return ApiResponse.success("Password reset successfully", null);
    }

    public UserProfileDTO getUserProfile(String email) {
        User user = userRepository.findByEmailWithAllRelations(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserProfileDTO profile = new UserProfileDTO();
        profile.setId(user.getId());
        profile.setName(user.getName());
        profile.setEmail(user.getEmail());
        profile.setRole(user.getRole());

        BenhNhan benhNhan = user.getBenhNhan();
        if (benhNhan != null) {
            profile.setBenhNhan(mapToBenhNhanDTO(benhNhan));
        }

        NhanVien nhanVien = user.getNhanVien();
        if (nhanVien != null) {
            profile.setNhanVien(mapToNhanVienDTO(nhanVien));
        }

        return profile;
    }

    public List<String> getMyPermissions(String email) {
        return phanQuyenRepository.findPermissionsByUserEmail(email);
    }

    private String generateOtp() {
        Random random = new Random();
        return String.format("%06d", random.nextInt(1000000));
    }

    private BenhNhanDTO mapToBenhNhanDTO(BenhNhan bn) {
        return BenhNhanDTO.builder()
                .idBenhNhan(bn.getIdBenhNhan())
                .hoTenBN(bn.getHoTenBN())
                .ngaySinh(bn.getNgaySinh())
                .gioiTinh(bn.getGioiTinh())
                .cccd(bn.getCccd())
                .dienThoai(bn.getDienThoai())
                .diaChi(bn.getDiaChi())
                .avatar(bn.getAvatar())
                .email(bn.getEmail())
                .isDeleted(bn.getIsDeleted())
                .ngayDK(bn.getNgayDK())
                .userId(bn.getUserId())
                .build();
    }

    private NhanVienDTO mapToNhanVienDTO(NhanVien nv) {
        NhanVienDTO dto = NhanVienDTO.builder()
                .idNhanVien(nv.getIdNhanVien())
                .hoTenNV(nv.getHoTenNV())
                .ngaySinh(nv.getNgaySinh())
                .gioiTinh(nv.getGioiTinh())
                .cccd(nv.getCccd())
                .dienThoai(nv.getDienThoai())
                .diaChi(nv.getDiaChi())
                .email(nv.getEmail())
                .hinhAnh(nv.getHinhAnh())
                .trangThai(nv.getTrangThai())
                .idNhom(nv.getIdNhom())
                .userId(nv.getUserId())
                .build();
        
        if (nv.getNhomNguoiDung() != null) {
            dto.setTenNhom(nv.getNhomNguoiDung().getTenNhom());
            dto.setMaNhom(nv.getNhomNguoiDung().getMaNhom());
        }
        
        return dto;
    }

    public void logout() {
        SecurityContextHolder.clearContext();
    }
}
