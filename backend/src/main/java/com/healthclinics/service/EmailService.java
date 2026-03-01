package com.healthclinics.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    public void sendOtpEmail(String toEmail, String otp) {
        if (fromEmail == null || fromEmail.isEmpty()) {
            log.warn("Email not configured. OTP for {}: {}", toEmail, otp);
            log.info("To test registration, use OTP: {}", otp);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Mã xác thực đăng ký - Health Clinics");
            message.setText(buildOtpEmailContent(otp));
            mailSender.send(message);
            log.info("OTP email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send OTP email: {}", e.getMessage());
            log.info("OTP for {}: {}", toEmail, otp);
        }
    }

    public void sendPasswordResetEmail(String toEmail, String otp) {
        if (fromEmail == null || fromEmail.isEmpty()) {
            log.warn("Email not configured. Password reset OTP for {}: {}", toEmail, otp);
            log.info("To test password reset, use OTP: {}", otp);
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("Mã đặt lại mật khẩu - Health Clinics");
            message.setText(buildPasswordResetEmailContent(otp));
            mailSender.send(message);
            log.info("Password reset email sent to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send password reset email: {}", e.getMessage());
            log.info("Password reset OTP for {}: {}", toEmail, otp);
        }
    }

    private String buildOtpEmailContent(String otp) {
        return "Kính chào Quý khách,\n\nCảm ơn Quý khách đã đăng ký tài khoản tại Health Clinics.\n\nMã xác thực của Quý khách là: %s\n\nMã này có hiệu lực trong 5 phút.\n\nNếu Quý khách không thực hiện yêu cầu này, vui lòng bỏ qua email này.\n\nTrân trọng,\nĐội ngũ Health Clinics".formatted(otp);
    }

    private String buildPasswordResetEmailContent(String otp) {
        return "Kính chào Quý khách,\n\nChúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của Quý khách.\n\nMã xác thực của Quý khách là: " + otp + "\n\nMã này có hiệu lực trong 5 phút.\n\nNếu Quý khách không thực hiện yêu cầu này, vui lòng bỏ qua email này.\n\nTrân trọng,\nĐội ngũ Health Clinics";
    }
}
