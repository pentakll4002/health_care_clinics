package com.healthclinics.repository;

import com.healthclinics.entity.NhomNguoiDung;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface NhomNguoiDungRepository extends JpaRepository<NhomNguoiDung, Long> {
    
    Optional<NhomNguoiDung> findByMaNhom(String maNhom);
    
    Optional<NhomNguoiDung> findBySlug(String slug);
    
    boolean existsByMaNhom(String maNhom);
}
