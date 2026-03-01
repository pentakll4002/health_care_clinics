package com.healthclinics.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "loai_benh")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoaiBenh {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_LoaiBenh")
    private Long idLoaiBenh;

    @Column(nullable = false)
    @JsonProperty("TenLoaiBenh")
    private String tenLoaiBenh;

    @Column(name = "TrieuChung", columnDefinition = "TEXT")
    @JsonProperty("TrieuChung")
    private String trieuChung;

    @Column(name = "HuongDieuTri", columnDefinition = "TEXT")
    @JsonProperty("HuongDieuTri")
    private String huongDieuTri;

    @Column(name = "MoTa", columnDefinition = "TEXT")
    @JsonProperty("MoTa")
    private String moTa;

    @OneToMany(mappedBy = "loaiBenh", cascade = CascadeType.ALL)
    @JsonIgnore
    private java.util.List<PhieuKham> phieuKhams;
}
