package com.healthclinics.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CtPhieuKhamDichVuDTO {
    private Long idCt;

    @com.fasterxml.jackson.annotation.JsonAlias({"ID_PhieuKham", "id_phieu_kham", "idPhieuKham"})
    private Long idPhieuKham;

    @com.fasterxml.jackson.annotation.JsonAlias({"ID_DichVu", "id_dich_vu", "idDichVu"})
    private Long idDichVu;
    
    private String tenDichVu;

    @com.fasterxml.jackson.annotation.JsonAlias({"SoLuong", "so_luong", "soLuong"})
    private Integer soLuong;
    
    private BigDecimal donGiaApDung;
    private BigDecimal thanhTien;
}
