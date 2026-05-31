package com.healthclinics.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DanhSachTiepNhanDTO {
    private Long idTiepNhan;
    private Long idBenhNhan;
    private String tenBenhNhan;
    private String dienThoaiBenhNhan;
    private String cccdBenhNhan;
    private LocalDateTime ngayTN;
    private String caTN;
    private Long idNhanVien;
    private String tenNhanVien;
    private Long idLeTanDuyet;
    private String tenLeTanDuyet;
    private Boolean isDeleted;
    private String trangThaiTiepNhan;

    @com.fasterxml.jackson.annotation.JsonProperty("ID_TiepNhan")
    public Long getID_TiepNhan() {
        return idTiepNhan;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("ID_BenhNhan")
    public Long getID_BenhNhan() {
        return idBenhNhan;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("HoTenBN")
    public String getHoTenBN() {
        return tenBenhNhan;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("NgayTN")
    public LocalDateTime getNgayTNVal() {
        return ngayTN;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("CaTN")
    public String getCaTNVal() {
        return caTN;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("ID_NhanVien")
    public Long getID_NhanVien() {
        return idNhanVien;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("ID_LeTanDuyet")
    public Long getID_LeTanDuyet() {
        return idLeTanDuyet;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("TrangThaiTiepNhan")
    public String getTrangThaiTiepNhanVal() {
        return trangThaiTiepNhan;
    }
}
