package com.healthclinics.service;

import com.healthclinics.dto.LichKhamDTO;
import com.healthclinics.entity.BenhNhan;
import com.healthclinics.entity.LichKham;
import com.healthclinics.repository.BenhNhanRepository;
import com.healthclinics.repository.LichKhamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LichKhamService {

    private final LichKhamRepository lichKhamRepository;
    private final BenhNhanRepository benhNhanRepository;

    public List<LichKhamDTO> getAll() {
        return lichKhamRepository.findAllWithRelations().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public Page<LichKhamDTO> getAll(Pageable pageable) {
        Page<LichKham> page = lichKhamRepository.findAll(pageable);
        return page.map(lk -> {
            if (!lk.getIsDeleted()) {
                return mapToDTO(lk);
            }
            return null;
        });
    }

    public List<LichKhamDTO> getByBenhNhan(Long benhNhanId) {
        return lichKhamRepository.findByBenhNhanWithRelations(benhNhanId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<LichKhamDTO> getByDate(LocalDate date) {
        return lichKhamRepository.findByNgayKhamDuKienAndIsDeletedFalse(date).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public LichKhamDTO getById(Long id) {
        LichKham lk = lichKhamRepository.findByIdWithBenhNhan(id);
        if (lk == null) {
            throw new RuntimeException("LichKham not found");
        }
        return mapToDTO(lk);
    }

    @Transactional
    public LichKhamDTO create(LichKhamDTO dto) {
        LichKham lk = LichKham.builder()
                .idBenhNhan(dto.getIdBenhNhan())
                .idBacSi(dto.getIdBacSi())
                .ngayKhamDuKien(dto.getNgayKhamDuKien())
                .caKham(dto.getCaKham())
                .trangThai("ChoXacNhan")
                .ghiChu(dto.getGhiChu())
                .isDeleted(false)
                .build();
        
        LichKham saved = lichKhamRepository.save(lk);
        // Re-fetch with relations for complete data
        LichKham refetched = lichKhamRepository.findByIdWithBenhNhan(saved.getIdLichKham());
        return mapToDTO(refetched != null ? refetched : saved);
    }

    @Transactional
    public LichKhamDTO update(Long id, LichKhamDTO dto) {
        LichKham lk = lichKhamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("LichKham not found"));
        
        if (dto.getIdBacSi() != null) {
            lk.setIdBacSi(dto.getIdBacSi());
        }
        if (dto.getNgayKhamDuKien() != null) {
            lk.setNgayKhamDuKien(dto.getNgayKhamDuKien());
        }
        if (dto.getCaKham() != null) {
            lk.setCaKham(dto.getCaKham());
        }
        if (dto.getTrangThai() != null) {
            lk.setTrangThai(dto.getTrangThai());
        }
        if (dto.getGhiChu() != null) {
            lk.setGhiChu(dto.getGhiChu());
        }
        
        return mapToDTO(lichKhamRepository.save(lk));
    }

    @Transactional
    public LichKhamDTO confirm(Long id) {
        LichKham lk = lichKhamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("LichKham not found"));
        
        lk.setTrangThai("DaXacNhan");
        return mapToDTO(lichKhamRepository.save(lk));
    }

    @Transactional
    public LichKhamDTO confirmWithDoctor(Long id, Long idBacSi) {
        LichKham lk = lichKhamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("LichKham not found"));
        
        lk.setTrangThai("DaXacNhan");
        if (idBacSi != null) {
            lk.setIdBacSi(idBacSi);
        }
        return mapToDTO(lichKhamRepository.save(lk));
    }

    @Transactional
    public LichKhamDTO cancel(Long id) {
        LichKham lk = lichKhamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("LichKham not found"));
        
        lk.setTrangThai("Huy");
        lk.setIsDeleted(true);
        return mapToDTO(lichKhamRepository.save(lk));
    }

    @Transactional
    public void delete(Long id) {
        LichKham lk = lichKhamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("LichKham not found"));
        lk.setIsDeleted(true);
        lichKhamRepository.save(lk);
    }

    private LichKhamDTO mapToDTO(LichKham lk) {
        LichKhamDTO dto = LichKhamDTO.builder()
                .idLichKham(lk.getIdLichKham())
                .idBenhNhan(lk.getIdBenhNhan())
                .idBacSi(lk.getIdBacSi())
                .ngayKhamDuKien(lk.getNgayKhamDuKien())
                .caKham(lk.getCaKham())
                .trangThai(lk.getTrangThai())
                .ghiChu(lk.getGhiChu())
                .isDeleted(lk.getIsDeleted())
                .createdAt(lk.getCreatedAt())
                .updatedAt(lk.getUpdatedAt())
                .build();
        
        if (lk.getBenhNhan() != null) {
            dto.setTenBenhNhan(lk.getBenhNhan().getHoTenBN());
            dto.setDienThoaiBenhNhan(lk.getBenhNhan().getDienThoai());
        }
        if (lk.getBacSi() != null) {
            dto.setTenBacSi(lk.getBacSi().getHoTenNV());
        }
        
        return dto;
    }
}
