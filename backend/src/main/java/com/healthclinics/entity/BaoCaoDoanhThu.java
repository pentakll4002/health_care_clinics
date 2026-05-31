package com.healthclinics.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "bao_cao_doanh_thu")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BaoCaoDoanhThu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_BCDT")
    private Long idBcdt;

    @Column(name = "Thang")
    private Integer thang;

    @Column(name = "Nam")
    private Integer nam;

    @Column(name = "TongDoanhThu", precision = 15, scale = 2)
    private BigDecimal tongDoanhThu;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @OneToMany(mappedBy = "baoCaoDoanhThu", cascade = CascadeType.ALL)
    private java.util.List<ChiTietBaoCaoDoanhThu> chiTiets;
}
