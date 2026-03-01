package com.healthclinics.repository;

import com.healthclinics.entity.GioiTinh;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GioiTinhRepository extends JpaRepository<GioiTinh, Long> {

    Optional<GioiTinh> findByTenGioiTinh(String tenGioiTinh);
}
