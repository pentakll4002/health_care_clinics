package com.healthclinics.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NhanVienDTO {
    private Long idNhanVien;
    private String hoTenNV;
    private LocalDate ngaySinh;
    private String gioiTinh;
    private String cccd;
    private String dienThoai;
    private String diaChi;
    private String email;
    private String hinhAnh;
    private String trangThai;
    private Long idNhom;
    private String tenNhom;
    private String maNhom;
    private Long userId;
    private String password;
}
