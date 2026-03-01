package com.healthclinics.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "cach_dung")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CachDung {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_CachDung")
    private Long idCachDung;

    @Column(name = "MoTaCachDung", nullable = false)
    private String moTaCachDung;

    @OneToMany(mappedBy = "cachDung", cascade = CascadeType.ALL)
    @JsonIgnore
    private java.util.List<Thuoc> thuocs;
}
