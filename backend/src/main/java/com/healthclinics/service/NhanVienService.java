package com.healthclinics.service;

import com.healthclinics.dto.NhanVienDTO;
import com.healthclinics.entity.NhanVien;
import com.healthclinics.entity.User;
import com.healthclinics.repository.NhanVienRepository;
import com.healthclinics.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NhanVienService {

    private final NhanVienRepository nhanVienRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<NhanVienDTO> getAll() {
        return nhanVienRepository.findAllWithNhom().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<NhanVienDTO> getAll(Pageable pageable) {
        return nhanVienRepository.findAllWithNhom(pageable)
                .map(this::mapToDTO);
    }

    @Transactional(readOnly = true)
    public NhanVienDTO getById(Long id) {
        NhanVien nv = nhanVienRepository.findByIdWithNhom(id)
                .orElseThrow(() -> new RuntimeException("NhanVien not found"));
        return mapToDTO(nv);
    }

    @Transactional(readOnly = true)
    public List<NhanVienDTO> search(String keyword) {
        return nhanVienRepository.searchByKeywordWithNhom(keyword).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<NhanVienDTO> getByNhom(String maNhom) {
        return nhanVienRepository.findByNhomMaNhomWithNhom(maNhom).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public NhanVienDTO create(NhanVienDTO dto) {
        // Create user account
        String rawPassword = (dto.getPassword() != null && !dto.getPassword().trim().isEmpty()) 
                ? dto.getPassword() 
                : "123456";

        User user = User.builder()
                .name(dto.getHoTenNV())
                .email(dto.getEmail())
                .password(passwordEncoder.encode(rawPassword)) // Use provided password or default
                .role("staff") // Base role, actual permissions come from Nhom
                .build();
        userRepository.save(user);

        NhanVien nv = NhanVien.builder()
                .hoTenNV(dto.getHoTenNV())
                .ngaySinh(dto.getNgaySinh())
                .gioiTinh(dto.getGioiTinh())
                .cccd(dto.getCccd())
                .dienThoai(dto.getDienThoai())
                .diaChi(dto.getDiaChi())
                .email(dto.getEmail())
                .hinhAnh(dto.getHinhAnh())
                .trangThai(dto.getTrangThai() != null ? dto.getTrangThai() : "Đang làm việc")
                .idNhom(dto.getIdNhom())
                .userId(user.getId())
                .build();
        
        NhanVien saved = nhanVienRepository.save(nv);
        // Re-fetch with nhom to return complete data
        return mapToDTO(nhanVienRepository.findByIdWithNhom(saved.getIdNhanVien()).orElse(saved));
    }

    @Transactional
    public NhanVienDTO update(Long id, NhanVienDTO dto) {
        NhanVien nv = nhanVienRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("NhanVien not found"));
        
        nv.setHoTenNV(dto.getHoTenNV());
        nv.setNgaySinh(dto.getNgaySinh());
        nv.setGioiTinh(dto.getGioiTinh());
        nv.setCccd(dto.getCccd());
        nv.setDienThoai(dto.getDienThoai());
        nv.setDiaChi(dto.getDiaChi());
        nv.setEmail(dto.getEmail());
        nv.setHinhAnh(dto.getHinhAnh());
        nv.setTrangThai(dto.getTrangThai());
        nv.setIdNhom(dto.getIdNhom());
        
        NhanVien saved = nhanVienRepository.save(nv);
        // Re-fetch with nhom to return complete data
        return mapToDTO(nhanVienRepository.findByIdWithNhom(saved.getIdNhanVien()).orElse(saved));
    }

    @Transactional
    public void delete(Long id) {
        nhanVienRepository.deleteById(id);
    }

    private NhanVienDTO mapToDTO(NhanVien nv) {
        NhanVienDTO dto = NhanVienDTO.builder()
                .idNhanVien(nv.getIdNhanVien())
                .hoTenNV(nv.getHoTenNV())
                .ngaySinh(nv.getNgaySinh())
                .gioiTinh(nv.getGioiTinh())
                .cccd(nv.getCccd())
                .dienThoai(nv.getDienThoai())
                .diaChi(nv.getDiaChi())
                .email(nv.getEmail())
                .hinhAnh(nv.getHinhAnh())
                .trangThai(nv.getTrangThai())
                .idNhom(nv.getIdNhom())
                .userId(nv.getUserId())
                .build();
        
        if (nv.getNhomNguoiDung() != null) {
            dto.setTenNhom(nv.getNhomNguoiDung().getTenNhom());
            dto.setMaNhom(nv.getNhomNguoiDung().getMaNhom());
        }
        
        return dto;
    }
}
