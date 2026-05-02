package com.healthclinics.repository;

import com.healthclinics.entity.NhanVien;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NhanVienRepository extends JpaRepository<NhanVien, Long> {
    
    List<NhanVien> findByTrangThai(String trangThai);
    
    List<NhanVien> findByIdNhom(Long idNhom);
    
    Optional<NhanVien> findByUserId(Long userId);
    
    Optional<NhanVien> findByEmail(String email);
    
    @Query("SELECT nv FROM NhanVien nv WHERE " +
           "(LOWER(nv.hoTenNV) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "nv.dienThoai LIKE CONCAT('%', :keyword, '%') OR " +
           "nv.cccd LIKE CONCAT('%', :keyword, '%'))")
    List<NhanVien> searchByKeyword(@Param("keyword") String keyword);
    
    @Query("SELECT nv FROM NhanVien nv JOIN nv.nhomNguoiDung nnd WHERE nnd.maNhom = :maNhom")
    List<NhanVien> findByNhomMaNhom(@Param("maNhom") String maNhom);
    
    @EntityGraph(attributePaths = {"nhomNguoiDung"})
    @Query("SELECT nv FROM NhanVien nv WHERE nv.idNhanVien = :id")
    Optional<NhanVien> findByIdWithNhom(@Param("id") Long id);

    @EntityGraph(attributePaths = {"nhomNguoiDung"})
    @Query("SELECT nv FROM NhanVien nv")
    List<NhanVien> findAllWithNhom();

    @EntityGraph(attributePaths = {"nhomNguoiDung"})
    @Query("SELECT nv FROM NhanVien nv")
    Page<NhanVien> findAllWithNhom(Pageable pageable);

    @EntityGraph(attributePaths = {"nhomNguoiDung"})
    @Query("SELECT nv FROM NhanVien nv WHERE " +
           "(LOWER(nv.hoTenNV) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "nv.dienThoai LIKE CONCAT('%', :keyword, '%') OR " +
           "nv.cccd LIKE CONCAT('%', :keyword, '%'))")
    List<NhanVien> searchByKeywordWithNhom(@Param("keyword") String keyword);

    @EntityGraph(attributePaths = {"nhomNguoiDung"})
    @Query("SELECT nv FROM NhanVien nv WHERE nv.nhomNguoiDung.maNhom = :maNhom")
    List<NhanVien> findByNhomMaNhomWithNhom(@Param("maNhom") String maNhom);
}
