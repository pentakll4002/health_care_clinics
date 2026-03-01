package com.healthclinics.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "dvt")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DVT {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID_DVT")
    private Long idDvt;

    @Column(name = "TenDVT", nullable = false)
    private String tenDvt;

    @OneToMany(mappedBy = "dvt", cascade = CascadeType.ALL)
    @JsonIgnore
    private java.util.List<Thuoc> thuocs;
}
