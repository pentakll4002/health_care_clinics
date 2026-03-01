package com.healthclinics.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "qui_dinh")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuiDinh {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_QuyDinh")
    private Long idQuyDinh;

    @Column(name = "ten_quy_dinh", nullable = false)
    private String tenQuyDinh;

    @Column(name = "gia_tri", precision = 15, scale = 2)
    private BigDecimal giaTri;
}
