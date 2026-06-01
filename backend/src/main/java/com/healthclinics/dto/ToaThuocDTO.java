package com.healthclinics.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ToaThuocDTO {
    @com.fasterxml.jackson.annotation.JsonAlias({"ID_PhieuKham", "id_phieu_kham", "idPhieuKham"})
    private Long idPhieuKham;

    @com.fasterxml.jackson.annotation.JsonAlias({"ID_Thuoc", "id_thuoc", "idThuoc"})
    private Long idThuoc;
    
    private String tenThuoc;

    @com.fasterxml.jackson.annotation.JsonAlias({"SoLuong", "so_luong", "soLuong"})
    private Integer soLuong;

    @com.fasterxml.jackson.annotation.JsonAlias({"CachDung", "cach_dung", "cachDung"})
    private String cachDung;
    
    private BigDecimal donGiaBanLuocMua;
    private BigDecimal tienThuoc;
    private String tenDvt;
    
    private ThuocDTO thuoc;

    @com.fasterxml.jackson.annotation.JsonProperty("ID_PhieuKham")
    public Long getID_PhieuKham() {
        return idPhieuKham;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("ID_Thuoc")
    public Long getID_Thuoc() {
        return idThuoc;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("TenThuoc")
    public String getTenThuocVal() {
        return tenThuoc;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("SoLuong")
    public Integer getSoLuongVal() {
        return soLuong;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("CachDung")
    public String getCachDungVal() {
        return cachDung;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("DonGiaBan_LuocMua")
    public BigDecimal getDonGiaBan_LuocMua() {
        return donGiaBanLuocMua;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("TienThuoc")
    public BigDecimal getTienThuocVal() {
        return tienThuoc;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("TenDvt")
    public String getTenDvtVal() {
        return tenDvt;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("Thuoc")
    public ThuocDTO getThuocVal() {
        return thuoc;
    }

    @com.fasterxml.jackson.annotation.JsonSetter("ID_Thuoc")
    public void setID_Thuoc(Long idThuoc) {
        this.idThuoc = idThuoc;
    }

    @com.fasterxml.jackson.annotation.JsonSetter("idThuoc")
    public void setIdThuoc(Long idThuoc) {
        this.idThuoc = idThuoc;
    }

    @com.fasterxml.jackson.annotation.JsonSetter("SoLuong")
    public void setSoLuongVal(Integer soLuong) {
        this.soLuong = soLuong;
    }

    @com.fasterxml.jackson.annotation.JsonSetter("soLuong")
    public void setSoLuong(Integer soLuong) {
        this.soLuong = soLuong;
    }

    @com.fasterxml.jackson.annotation.JsonSetter("CachDung")
    public void setCachDungVal(String cachDung) {
        this.cachDung = cachDung;
    }

    @com.fasterxml.jackson.annotation.JsonSetter("cachDung")
    public void setCachDung(String cachDung) {
        this.cachDung = cachDung;
    }
}
