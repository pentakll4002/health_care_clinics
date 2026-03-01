package com.healthclinics.service;

import com.healthclinics.dto.QuiDinhDTO;
import com.healthclinics.entity.QuiDinh;
import com.healthclinics.repository.QuiDinhRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuiDinhService {

    private final QuiDinhRepository quiDinhRepository;

    public List<QuiDinhDTO> getAll() {
        return quiDinhRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public QuiDinhDTO getByTen(String tenQuyDinh) {
        QuiDinh qd = quiDinhRepository.findByTenQuyDinh(tenQuyDinh)
                .orElseThrow(() -> new RuntimeException("QuiDinh not found"));
        return mapToDTO(qd);
    }

    public BigDecimal getValue(String tenQuyDinh, BigDecimal defaultValue) {
        return quiDinhRepository.findByTenQuyDinh(tenQuyDinh)
                .map(QuiDinh::getGiaTri)
                .orElse(defaultValue);
    }

    @Transactional
    public QuiDinhDTO update(Long id, QuiDinhDTO dto) {
        QuiDinh qd = quiDinhRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("QuiDinh not found"));
        
        // Only update non-null fields
        if (dto.getTenQuyDinh() != null) {
            qd.setTenQuyDinh(dto.getTenQuyDinh());
        }
        if (dto.getGiaTri() != null) {
            qd.setGiaTri(dto.getGiaTri());
        }
        
        return mapToDTO(quiDinhRepository.save(qd));
    }

    private QuiDinhDTO mapToDTO(QuiDinh qd) {
        return QuiDinhDTO.builder()
                .idQuyDinh(qd.getIdQuyDinh())
                .tenQuyDinh(qd.getTenQuyDinh())
                .giaTri(qd.getGiaTri())
                .build();
    }
}
