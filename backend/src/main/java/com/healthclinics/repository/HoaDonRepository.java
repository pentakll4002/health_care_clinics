package com.healthclinics.repository;

import com.healthclinics.entity.HoaDon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HoaDonRepository extends JpaRepository<HoaDon, Long> {
    
    @Query("SELECT DISTINCT hd FROM HoaDon hd " +
           "LEFT JOIN FETCH hd.nhanVien nv " +
           "LEFT JOIN FETCH hd.phieuKham pk " +
           "LEFT JOIN FETCH pk.tiepNhan tn " +
           "LEFT JOIN FETCH tn.benhNhan bn")
    List<HoaDon> findAll();

    @Query("SELECT hd FROM HoaDon hd " +
           "LEFT JOIN FETCH hd.nhanVien nv " +
           "LEFT JOIN FETCH hd.phieuKham pk " +
           "LEFT JOIN FETCH pk.tiepNhan tn " +
           "LEFT JOIN FETCH tn.benhNhan bn " +
           "WHERE hd.idPhieuKham = :idPhieuKham")
    Optional<HoaDon> findByIdPhieuKham(@Param("idPhieuKham") Long idPhieuKham);
    
    List<HoaDon> findByNgayHoaDon(LocalDate ngayHoaDon);
    
    List<HoaDon> findByNgayHoaDonBetween(LocalDate startDate, LocalDate endDate);
    
    List<HoaDon> findByIdNhanVien(Long idNhanVien);
    
    @Query("SELECT hd FROM HoaDon hd JOIN FETCH hd.phieuKham pk JOIN FETCH pk.tiepNhan tn JOIN FETCH tn.benhNhan WHERE hd.idHoaDon = :id")
    Optional<HoaDon> findByIdWithDetails(@Param("id") Long id);
}
