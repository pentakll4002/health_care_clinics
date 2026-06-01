package com.healthclinics.repository;

import com.healthclinics.entity.PhieuKham;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PhieuKhamRepository extends JpaRepository<PhieuKham, Long> {
    
    @Query("SELECT DISTINCT pk FROM PhieuKham pk " +
           "LEFT JOIN FETCH pk.tiepNhan tn " +
           "LEFT JOIN FETCH tn.benhNhan " +
           "LEFT JOIN FETCH pk.bacSi " +
           "LEFT JOIN FETCH pk.loaiBenh " +
           "LEFT JOIN FETCH pk.dichVu " +
           "WHERE pk.isDeleted = false")
    List<PhieuKham> findByIsDeletedFalse();
    
    @Query(value = "SELECT DISTINCT pk FROM PhieuKham pk " +
           "LEFT JOIN FETCH pk.tiepNhan tn " +
           "LEFT JOIN FETCH tn.benhNhan " +
           "LEFT JOIN FETCH pk.bacSi " +
           "LEFT JOIN FETCH pk.loaiBenh " +
           "LEFT JOIN FETCH pk.dichVu " +
           "WHERE pk.isDeleted = false",
           countQuery = "SELECT count(pk) FROM PhieuKham pk WHERE pk.isDeleted = false")
    Page<PhieuKham> findByIsDeletedFalse(Pageable pageable);
    
    @Query("SELECT DISTINCT pk FROM PhieuKham pk " +
           "LEFT JOIN FETCH pk.tiepNhan tn " +
           "LEFT JOIN FETCH tn.benhNhan " +
           "LEFT JOIN FETCH pk.bacSi " +
           "LEFT JOIN FETCH pk.loaiBenh " +
           "LEFT JOIN FETCH pk.dichVu " +
           "WHERE pk.idTiepNhan = :idTiepNhan AND pk.isDeleted = false")
    List<PhieuKham> findByIdTiepNhan(@Param("idTiepNhan") Long idTiepNhan);
    
    @Query("SELECT DISTINCT pk FROM PhieuKham pk " +
           "LEFT JOIN FETCH pk.tiepNhan tn " +
           "LEFT JOIN FETCH tn.benhNhan " +
           "LEFT JOIN FETCH pk.bacSi " +
           "LEFT JOIN FETCH pk.loaiBenh " +
           "LEFT JOIN FETCH pk.dichVu " +
           "WHERE pk.idBacSi = :idBacSi AND pk.isDeleted = false")
    List<PhieuKham> findByIdBacSi(@Param("idBacSi") Long idBacSi);
    
    @Query("SELECT DISTINCT pk FROM PhieuKham pk " +
           "LEFT JOIN FETCH pk.tiepNhan tn " +
           "LEFT JOIN FETCH tn.benhNhan " +
           "LEFT JOIN FETCH pk.bacSi " +
           "LEFT JOIN FETCH pk.loaiBenh " +
           "LEFT JOIN FETCH pk.dichVu " +
           "WHERE pk.trangThai = :trangThai AND pk.isDeleted = false")
    List<PhieuKham> findByTrangThai(@Param("trangThai") String trangThai);
    
    @Query("SELECT pk FROM PhieuKham pk WHERE pk.isDeleted = false AND pk.createdAt BETWEEN :startDate AND :endDate")
    List<PhieuKham> findByDateRange(@Param("startDate") LocalDateTime startDate, 
                                     @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT pk FROM PhieuKham pk JOIN FETCH pk.toaThuocs WHERE pk.idPhieuKham = :id")
    Optional<PhieuKham> findByIdWithToaThuoc(@Param("id") Long id);
    
    @Query("SELECT pk FROM PhieuKham pk JOIN FETCH pk.ctDichVuPhus WHERE pk.idPhieuKham = :id")
    Optional<PhieuKham> findByIdWithDichVuPhu(@Param("id") Long id);
    
    @Query("SELECT pk FROM PhieuKham pk " +
           "LEFT JOIN FETCH pk.tiepNhan tn " +
           "LEFT JOIN FETCH tn.benhNhan " +
           "LEFT JOIN FETCH pk.bacSi " +
           "LEFT JOIN FETCH pk.loaiBenh " +
           "LEFT JOIN FETCH pk.dichVu " +
           "WHERE pk.idPhieuKham = :id")
    Optional<PhieuKham> findByIdWithDetails(@Param("id") Long id);
}
