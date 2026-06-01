package com.healthclinics.service;

import com.healthclinics.dto.HoaDonDTO;
import com.healthclinics.dto.PhieuKhamDTO;
import com.healthclinics.entity.*;
import com.healthclinics.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class HoaDonService {

    private final HoaDonRepository hoaDonRepository;
    private final PhieuKhamRepository phieuKhamRepository;
    private final ToaThuocRepository toaThuocRepository;
    private final CtPhieuKhamDichVuRepository ctPhieuKhamDichVuRepository;

    public List<HoaDonDTO> getAll() {
        return hoaDonRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public HoaDonDTO getById(Long id) {
        HoaDon hd = hoaDonRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new RuntimeException("HoaDon not found"));
        return mapToDTO(hd);
    }

    public HoaDonDTO getByPhieuKham(Long phieuKhamId) {
        HoaDon hd = hoaDonRepository.findByIdPhieuKham(phieuKhamId)
                .orElseThrow(() -> new RuntimeException("HoaDon not found"));
        return mapToDTO(hd);
    }

    public HoaDonDTO preview(Long phieuKhamId) {
        PhieuKham pk = phieuKhamRepository.findByIdWithDetails(phieuKhamId)
                .orElseThrow(() -> new RuntimeException("PhieuKham not found"));

        BigDecimal tienThuoc = calculateTienThuoc(phieuKhamId);
        BigDecimal tienDichVu = calculateTienDichVu(phieuKhamId);
        BigDecimal tongTien = pk.getTienKham()
                .add(tienThuoc)
                .add(tienDichVu);

        return HoaDonDTO.builder()
                .idPhieuKham(phieuKhamId)
                .tienKham(pk.getTienKham())
                .tienThuoc(tienThuoc)
                .tienDichVu(tienDichVu)
                .tongTien(tongTien)
                .idBenhNhan(pk.getTiepNhan() != null ? pk.getTiepNhan().getIdBenhNhan() : null)
                .tenBenhNhan(pk.getTiepNhan() != null && pk.getTiepNhan().getBenhNhan() != null 
                        ? pk.getTiepNhan().getBenhNhan().getHoTenBN() : null)
                .build();
    }

    @Transactional
    public HoaDonDTO create(Long phieuKhamId, Long nhanVienId) {
        if (hoaDonRepository.findByIdPhieuKham(phieuKhamId).isPresent()) {
            throw new RuntimeException("HoaDon already exists for this PhieuKham");
        }

        PhieuKham pk = phieuKhamRepository.findById(phieuKhamId)
                .orElseThrow(() -> new RuntimeException("PhieuKham not found"));

        BigDecimal tienThuoc = calculateTienThuoc(phieuKhamId);
        BigDecimal tienDichVu = calculateTienDichVu(phieuKhamId);
        BigDecimal tongTien = pk.getTienKham()
                .add(tienThuoc)
                .add(tienDichVu);

        HoaDon hd = HoaDon.builder()
                .idPhieuKham(phieuKhamId)
                .idNhanVien(nhanVienId)
                .ngayHoaDon(LocalDate.now())
                .tienKham(pk.getTienKham())
                .tienThuoc(tienThuoc)
                .tienDichVu(tienDichVu)
                .tongTien(tongTien)
                .build();
        
        return mapToDTO(hoaDonRepository.save(hd));
    }

    @Transactional
    public void delete(Long id) {
        hoaDonRepository.deleteById(id);
    }

    private BigDecimal calculateTienThuoc(Long phieuKhamId) {
        List<ToaThuoc> toaThuocs = toaThuocRepository.findByIdPhieuKham(phieuKhamId);
        return toaThuocs.stream()
                .map(ToaThuoc::getTienThuoc)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateTienDichVu(Long phieuKhamId) {
        List<CtPhieuKhamDichVu> dichVus = ctPhieuKhamDichVuRepository
                .findByIdPhieuKhamAndIsDeletedFalse(phieuKhamId);
        return dichVus.stream()
                .map(CtPhieuKhamDichVu::getThanhTien)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private HoaDonDTO mapToDTO(HoaDon hd) {
        HoaDonDTO dto = HoaDonDTO.builder()
                .idHoaDon(hd.getIdHoaDon())
                .idPhieuKham(hd.getIdPhieuKham())
                .idNhanVien(hd.getIdNhanVien())
                .ngayHoaDon(hd.getNgayHoaDon())
                .tienKham(hd.getTienKham())
                .tienThuoc(hd.getTienThuoc())
                .tienDichVu(hd.getTienDichVu())
                .tongTien(hd.getTongTien())
                .build();
        
        if (hd.getNhanVien() != null) {
            dto.setTenNhanVien(hd.getNhanVien().getHoTenNV());
        }
        if (hd.getPhieuKham() != null && hd.getPhieuKham().getTiepNhan() != null) {
            DanhSachTiepNhan tn = hd.getPhieuKham().getTiepNhan();
            dto.setIdBenhNhan(tn.getIdBenhNhan());
            if (tn.getBenhNhan() != null) {
                dto.setTenBenhNhan(tn.getBenhNhan().getHoTenBN());
            }
        }
        
        return dto;
    }
}
