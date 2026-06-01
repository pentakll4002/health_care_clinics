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
    @com.fasterxml.jackson.annotation.JsonAlias({"ID_TiepNhan", "idTiepNhan", "id_tiep_nhan"})
    private Long idTiepNhan;

    @com.fasterxml.jackson.annotation.JsonAlias({"ID_BenhNhan", "idBenhNhan", "id_benh_nhan"})
    private Long idBenhNhan;

    private String tenBenhNhan;
    private String dienThoaiBenhNhan;
    private String cccdBenhNhan;

    @com.fasterxml.jackson.annotation.JsonAlias({"NgayTN", "ngayTN", "ngay_tn"})
    private LocalDateTime ngayTN;

    @com.fasterxml.jackson.annotation.JsonAlias({"CaTN", "caTN", "ca_tn"})
    private String caTN;

    @com.fasterxml.jackson.annotation.JsonAlias({"ID_NhanVien", "idNhanVien", "id_nhan_vien"})
    private Long idNhanVien;

    private String tenNhanVien;

    @com.fasterxml.jackson.annotation.JsonAlias({"ID_LeTanDuyet", "idLeTanDuyet", "id_le_tan_duyet"})
    private Long idLeTanDuyet;

    private String tenLeTanDuyet;
    private Boolean isDeleted;

    @com.fasterxml.jackson.annotation.JsonAlias({"TrangThaiTiepNhan", "trangThaiTiepNhan", "trang_thai_tiep_nhan"})
    private String trangThaiTiepNhan;

    private List<PhieuKhamDTO> phieuKhams;

    @com.fasterxml.jackson.annotation.JsonProperty("phieuKhams")
    public List<PhieuKhamDTO> getPhieuKhamsVal() {
        return phieuKhams;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("phieu_khams")
    public List<PhieuKhamDTO> getPhieuKhamsUnderscore() {
        return phieuKhams;
    }

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
