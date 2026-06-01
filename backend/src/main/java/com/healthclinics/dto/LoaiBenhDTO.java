package com.healthclinics.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoaiBenhDTO {
    @com.fasterxml.jackson.annotation.JsonAlias({"ID_LoaiBenh", "id_loai_benh", "idLoaiBenh"})
    private Long idLoaiBenh;

    @com.fasterxml.jackson.annotation.JsonAlias({"TenLoaiBenh", "ten_loai_benh", "tenLoaiBenh"})
    private String tenLoaiBenh;
    
    private String trieuChung;
    private String huongDieuTri;
    private String moTa;

    @com.fasterxml.jackson.annotation.JsonProperty("ID_LoaiBenh")
    public Long getID_LoaiBenhVal() {
        return idLoaiBenh;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("TenLoaiBenh")
    public String getTenLoaiBenhVal() {
        return tenLoaiBenh;
    }
}
