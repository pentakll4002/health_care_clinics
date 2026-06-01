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
public class BenhNhanDTO {
    private Long idBenhNhan;
    private String hoTenBN;
    private LocalDate ngaySinh;
    private String gioiTinh;
    private String cccd;
    private String dienThoai;
    private String diaChi;
    private String avatar;
    private String email;
    private Boolean isDeleted;
    private LocalDateTime ngayDK;
    private Long userId;

    @com.fasterxml.jackson.annotation.JsonProperty("ID_BenhNhan")
    public Long getID_BenhNhan() {
        return idBenhNhan;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("HoTenBN")
    public String getHoTenBN() {
        return hoTenBN;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("NgaySinh")
    public LocalDate getNgaySinhVal() {
        return ngaySinh;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("GioiTinh")
    public String getGioiTinhVal() {
        return gioiTinh;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("CCCD")
    public String getCCCDVal() {
        return cccd;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("DienThoai")
    public String getDienThoaiVal() {
        return dienThoai;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("DiaChi")
    public String getDiaChiVal() {
        return diaChi;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("NgayDK")
    public LocalDateTime getNgayDKVal() {
        return ngayDK;
    }
}
