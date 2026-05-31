package com.healthclinics.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "bao_cao_su_dung_thuoc")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BaoCaoSuDungThuoc {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_BCSDT")
    private Long idBcsdt;

    @Column(name = "Thang")
    private Integer thang;

    @Column(name = "Nam")
    private Integer nam;

    @Column(name = "ID_Thuoc")
    private Long idThuoc;

    @Column(name = "TongSoLuongNhap")
    private Integer tongSoLuongNhap;

    @Column(name = "SoLuongDung")
    private Integer soLuongDung;

    @Column(name = "SoLanDung")
    private Integer soLanDung;

    @com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ID_Thuoc", insertable = false, updatable = false)
    private Thuoc thuoc;
}
