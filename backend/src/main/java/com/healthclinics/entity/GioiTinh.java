package com.healthclinics.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "gioi_tinh")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GioiTinh {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_gioi_tinh")
    private Long idGioiTinh;

    @Column(name = "ten_gioi_tinh", nullable = false, unique = true)
    private String tenGioiTinh;
}
