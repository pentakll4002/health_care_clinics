package com.healthclinics.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThuocDTO {
    private Long idThuoc;
    private String tenThuoc;
    private Long idDvt;
    private String tenDvt;
    private Long idCachDung;
    private String moTaCachDung;
    private String thanhPhan;
    private String xuatXu;
    private Integer soLuongTon;
    private BigDecimal donGiaNhap;
    private String hinhAnh;
    private BigDecimal tyLeGiaBan;
    private BigDecimal donGiaBan;
    private Boolean isDeleted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @com.fasterxml.jackson.annotation.JsonProperty("ID_Thuoc")
    public Long getID_Thuoc() {
        return idThuoc;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("TenThuoc")
    public String getTenThuocVal() {
        return tenThuoc;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("DonGiaBan")
    public BigDecimal getDonGiaBanVal() {
        return donGiaBan;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("HinhAnh")
    public String getHinhAnhVal() {
        return hinhAnh;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("TenDvt")
    public String getTenDvtVal() {
        return tenDvt;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("TenDVT")
    public String getTenDvtVal2() {
        return tenDvt;
    }
}
