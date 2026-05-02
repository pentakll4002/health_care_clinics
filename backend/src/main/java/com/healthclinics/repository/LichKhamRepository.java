package com.healthclinics.repository;

import com.healthclinics.entity.LichKham;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LichKhamRepository extends JpaRepository<LichKham, Long> {
    
    List<LichKham> findByIdBenhNhanAndIsDeletedFalse(Long idBenhNhan);
    
    Page<LichKham> findByIdBenhNhanAndIsDeletedFalse(Long idBenhNhan, Pageable pageable);
    
    List<LichKham> findByIdBacSiAndIsDeletedFalse(Long idBacSi);
    
    List<LichKham> findByNgayKhamDuKienAndIsDeletedFalse(LocalDate ngayKhamDuKien);
    
    List<LichKham> findByTrangThai(String trangThai);
    
    @Query("SELECT lk FROM LichKham lk WHERE lk.isDeleted = false AND lk.ngayKhamDuKien BETWEEN :startDate AND :endDate")
    List<LichKham> findByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT lk FROM LichKham lk LEFT JOIN FETCH lk.benhNhan WHERE lk.idLichKham = :id")
    LichKham findByIdWithBenhNhan(@Param("id") Long id);

    @Query("SELECT lk FROM LichKham lk LEFT JOIN FETCH lk.benhNhan LEFT JOIN FETCH lk.bacSi WHERE lk.isDeleted = false ORDER BY lk.createdAt DESC")
    List<LichKham> findAllWithRelations();

    @Query("SELECT lk FROM LichKham lk LEFT JOIN FETCH lk.benhNhan LEFT JOIN FETCH lk.bacSi WHERE lk.idBenhNhan = :benhNhanId AND lk.isDeleted = false ORDER BY lk.createdAt DESC")
    List<LichKham> findByBenhNhanWithRelations(@Param("benhNhanId") Long benhNhanId);
}
