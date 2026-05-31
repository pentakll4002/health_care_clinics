package com.healthclinics.service;

import com.healthclinics.dto.DanhSachTiepNhanDTO;
import com.healthclinics.dto.LichKhamDTO;
import com.healthclinics.entity.*;
import com.healthclinics.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DanhSachTiepNhanService {

    private final DanhSachTiepNhanRepository danhSachTiepNhanRepository;
    private final BenhNhanRepository benhNhanRepository;
    private final LichKhamRepository lichKhamRepository;

    public List<DanhSachTiepNhanDTO> getAll() {
        return danhSachTiepNhanRepository.findByIsDeletedFalse().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public Page<DanhSachTiepNhanDTO> getAll(Pageable pageable) {
        return danhSachTiepNhanRepository.findByIsDeletedFalse(pageable)
                .map(this::mapToDTO);
    }

    public DanhSachTiepNhanDTO getById(Long id) {
        DanhSachTiepNhan dstn = danhSachTiepNhanRepository.findByIdWithBenhNhan(id);
        if (dstn == null) {
            throw new RuntimeException("DanhSachTiepNhan not found");
        }
        return mapToDTO(dstn);
    }

    public List<DanhSachTiepNhanDTO> getByDate(LocalDateTime date) {
        return danhSachTiepNhanRepository.findByDate(date).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public DanhSachTiepNhanDTO create(DanhSachTiepNhanDTO dto) {
        DanhSachTiepNhan dstn = DanhSachTiepNhan.builder()
                .idBenhNhan(dto.getIdBenhNhan())
                .ngayTN(LocalDateTime.now())
                .caTN(dto.getCaTN())
                .idNhanVien(dto.getIdNhanVien())
                .idLeTanDuyet(dto.getIdLeTanDuyet())
                .isDeleted(false)
                .trangThaiTiepNhan("CHO_KHAM")
                .build();
        
        return mapToDTO(danhSachTiepNhanRepository.save(dstn));
    }

    @Transactional
    public DanhSachTiepNhanDTO createFromLichKham(Long lichKhamId) {
        LichKham lichKham = lichKhamRepository.findByIdWithBenhNhan(lichKhamId);
        if (lichKham == null) {
            throw new RuntimeException("LichKham not found");
        }

        DanhSachTiepNhan dstn = DanhSachTiepNhan.builder()
                .idBenhNhan(lichKham.getIdBenhNhan())
                .ngayTN(LocalDateTime.now())
                .caTN(lichKham.getCaKham())
                .idNhanVien(lichKham.getIdBacSi())
                .isDeleted(false)
                .trangThaiTiepNhan("CHO_KHAM")
                .build();
        
        // Update lich kham status
        lichKham.setTrangThai("da_tiep_nhan");
        lichKhamRepository.save(lichKham);
        
        return mapToDTO(danhSachTiepNhanRepository.save(dstn));
    }

    @Transactional
    public DanhSachTiepNhanDTO update(Long id, DanhSachTiepNhanDTO dto) {
        DanhSachTiepNhan dstn = danhSachTiepNhanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("DanhSachTiepNhan not found"));
        
        dstn.setCaTN(dto.getCaTN());
        dstn.setIdNhanVien(dto.getIdNhanVien());
        dstn.setIdLeTanDuyet(dto.getIdLeTanDuyet());
        dstn.setTrangThaiTiepNhan(dto.getTrangThaiTiepNhan());
        
        return mapToDTO(danhSachTiepNhanRepository.save(dstn));
    }

    @Transactional
    public void delete(Long id) {
        DanhSachTiepNhan dstn = danhSachTiepNhanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("DanhSachTiepNhan not found"));
        dstn.setIsDeleted(true);
        danhSachTiepNhanRepository.save(dstn);
    }

    private DanhSachTiepNhanDTO mapToDTO(DanhSachTiepNhan dstn) {
        DanhSachTiepNhanDTO dto = DanhSachTiepNhanDTO.builder()
                .idTiepNhan(dstn.getIdTiepNhan())
                .idBenhNhan(dstn.getIdBenhNhan())
                .ngayTN(dstn.getNgayTN())
                .caTN(dstn.getCaTN())
                .idNhanVien(dstn.getIdNhanVien())
                .idLeTanDuyet(dstn.getIdLeTanDuyet())
                .isDeleted(dstn.getIsDeleted())
                .trangThaiTiepNhan(dstn.getTrangThaiTiepNhan())
                .build();
        
        if (dstn.getBenhNhan() != null) {
            BenhNhan bn = dstn.getBenhNhan();
            dto.setTenBenhNhan(bn.getHoTenBN());
            dto.setDienThoaiBenhNhan(bn.getDienThoai());
            dto.setCccdBenhNhan(bn.getCccd());
        }
        if (dstn.getNhanVien() != null) {
            dto.setTenNhanVien(dstn.getNhanVien().getHoTenNV());
        }
        if (dstn.getLeTanDuyet() != null) {
            dto.setTenLeTanDuyet(dstn.getLeTanDuyet().getHoTenNV());
        }
        
        return dto;
    }
}
