package com.healthclinics.dto;

import lombok.*;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DichVuDTO {
    @JsonProperty("idDichVu")
    @JsonAlias({"ID_DichVu", "idDichVu"})
    private Long idDichVu;

    @JsonProperty("tenDichVu")
    @JsonAlias({"TenDichVu", "tenDichVu"})
    private String tenDichVu;

    @JsonProperty("donGia")
    @JsonAlias({"DonGia", "donGia"})
    private BigDecimal donGia;

    private Boolean isDeleted;
}
