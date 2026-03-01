package com.healthclinics.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "nhom_nguoi_dung")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NhomNguoiDung {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_Nhom")
    private Long idNhom;

    @Column(name = "ten_nhom", nullable = false)
    private String tenNhom;

    @Column(name = "ma_nhom")
    private String maNhom;

    @Column(name = "slug")
    private String slug;

    @OneToMany(mappedBy = "nhomNguoiDung", cascade = CascadeType.ALL)
    @JsonIgnore
    private java.util.List<NhanVien> nhanViens;

    @OneToMany(mappedBy = "nhomNguoiDung", cascade = CascadeType.ALL)
    @JsonIgnore
    private java.util.List<PhanQuyen> phanQuyens;
}
