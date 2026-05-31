package com.healthclinics.repository;

import com.healthclinics.entity.Thuoc;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ThuocRepository extends JpaRepository<Thuoc, Long> {
    
    List<Thuoc> findByIsDeletedFalse();
    
    @Query("SELECT t FROM Thuoc t WHERE t.isDeleted = false AND t.idThuoc = (SELECT MIN(t2.idThuoc) FROM Thuoc t2 WHERE t2.tenThuoc = t.tenThuoc AND t2.isDeleted = false)")
    Page<Thuoc> findUniqueDrugsByIsDeletedFalse(Pageable pageable);
    
    Optional<Thuoc> findByIdThuocAndIsDeletedFalse(Long id);
    
    @Query("SELECT t FROM Thuoc t WHERE t.isDeleted = false AND " +
           "(LOWER(t.tenThuoc) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(t.thanhPhan) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<Thuoc> searchByKeyword(@Param("keyword") String keyword);

    List<Thuoc> findByTenThuocIgnoreCaseAndIsDeletedFalse(String tenThuoc);
    
    @Query("SELECT t FROM Thuoc t WHERE t.isDeleted = false AND t.soLuongTon <= :minQuantity")
    List<Thuoc> findBySoLuongTonLessThanEqual(@Param("minQuantity") Integer minQuantity);
    
    @Query("SELECT t FROM Thuoc t JOIN FETCH t.dvt JOIN FETCH t.cachDung WHERE t.idThuoc = :id")
    Optional<Thuoc> findByIdWithDetails(@Param("id") Long id);
}
