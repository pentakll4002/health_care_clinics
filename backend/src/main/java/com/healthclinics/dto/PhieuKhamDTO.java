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
public class PhieuKhamDTO {
    @com.fasterxml.jackson.annotation.JsonAlias({"ID_PhieuKham", "id_phieu_kham", "idPhieuKham"})
    private Long idPhieuKham;

    @com.fasterxml.jackson.annotation.JsonAlias({"ID_TiepNhan", "id_tiep_nhan", "idTiepNhan"})
    private Long idTiepNhan;

    @com.fasterxml.jackson.annotation.JsonAlias({"ID_BacSi", "id_bac_si", "idBacSi"})
    private Long idBacSi;
    
    private String tenBacSi;

    @com.fasterxml.jackson.annotation.JsonAlias({"CaKham", "ca_kham", "caKham"})
    private String caKham;

    @com.fasterxml.jackson.annotation.JsonAlias({"TrieuChung", "trieu_chung", "trieuChung"})
    private String trieuChung;

    @com.fasterxml.jackson.annotation.JsonAlias({"ChanDoan", "chan_doan", "chanDoan"})
    private String chanDoan;

    @com.fasterxml.jackson.annotation.JsonAlias({"ID_LoaiBenh", "id_loai_benh", "idLoaiBenh"})
    private Long idLoaiBenh;
    
    private String tenLoaiBenh;

    @com.fasterxml.jackson.annotation.JsonAlias({"ID_DichVu", "id_dich_vu", "idDichVu"})
    private Long idDichVu;
    
    private String tenDichVu;
    
    private BigDecimal tienKham;
    private BigDecimal tongTienThuoc;
    private String trangThai;
    private Boolean isDeleted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Thông tin bệnh nhân từ tiepNhan
    private Long idBenhNhan;
    private String tenBenhNhan;
    private String dienThoaiBenhNhan;
    
    // Danh sách toa thuốc
    private List<ToaThuocDTO> toaThuocs;
    
    // Danh sách dịch vụ phụ
    private List<CtPhieuKhamDichVuDTO> dichVuPhus;

    private DichVuDTO dichVu;
    private LoaiBenhDTO loaiBenh;

    @com.fasterxml.jackson.annotation.JsonProperty("ID_PhieuKham")
    public Long getID_PhieuKham() {
        return idPhieuKham;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("ID_TiepNhan")
    public Long getID_TiepNhan() {
        return idTiepNhan;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("ID_BacSi")
    public Long getID_BacSi() {
        return idBacSi;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("CaKham")
    public String getCaKhamVal() {
        return caKham;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("TienKham")
    public BigDecimal getTienKhamVal() {
        return tienKham;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("TongTienThuoc")
    public BigDecimal getTongTienThuocVal() {
        return tongTienThuoc;
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
        return createdAt;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("TrieuChung")
    public String getTrieuChungVal() {
        return trieuChung;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("ChanDoan")
    public String getChanDoanVal() {
        return chanDoan;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("ID_LoaiBenh")
    public Long getID_LoaiBenh() {
        return idLoaiBenh;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("TenLoaiBenh")
    public String getTenLoaiBenhVal() {
        return tenLoaiBenh;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("ID_DichVu")
    public Long getID_DichVu() {
        return idDichVu;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("TenDichVu")
    public String getTenDichVuVal() {
        return tenDichVu;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("TrangThai")
    public String getTrangThaiVal() {
        return trangThai;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("dichVu")
    public DichVuDTO getDichVuVal() {
        return dichVu;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("loaiBenh")
    public LoaiBenhDTO getLoaiBenhVal() {
        return loaiBenh;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("toaThuoc")
    public List<ToaThuocDTO> getToaThuocVal() {
        return toaThuocs;
    }

    @com.fasterxml.jackson.annotation.JsonSetter("TrieuChung")
    public void setTrieuChungVal(String trieuChung) {
        this.trieuChung = trieuChung;
    }

    @com.fasterxml.jackson.annotation.JsonSetter("trieuChung")
    public void setTrieuChung(String trieuChung) {
        this.trieuChung = trieuChung;
    }

    @com.fasterxml.jackson.annotation.JsonSetter("ChanDoan")
    public void setChanDoanVal(String chanDoan) {
        this.chanDoan = chanDoan;
    }

    @com.fasterxml.jackson.annotation.JsonSetter("chanDoan")
    public void setChanDoan(String chanDoan) {
        this.chanDoan = chanDoan;
    }

    @com.fasterxml.jackson.annotation.JsonSetter("ID_LoaiBenh")
    public void setID_LoaiBenh(Long idLoaiBenh) {
        this.idLoaiBenh = idLoaiBenh;
    }

    @com.fasterxml.jackson.annotation.JsonSetter("idLoaiBenh")
    public void setIdLoaiBenh(Long idLoaiBenh) {
        this.idLoaiBenh = idLoaiBenh;
    }

    @com.fasterxml.jackson.annotation.JsonSetter("ID_DichVu")
    public void setID_DichVu(Long idDichVu) {
        this.idDichVu = idDichVu;
    }

    @com.fasterxml.jackson.annotation.JsonSetter("idDichVu")
    public void setIdDichVu(Long idDichVu) {
        this.idDichVu = idDichVu;
    }
}
