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
        return nhanVienRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<NhanVienDTO> getAll(Pageable pageable) {
        return nhanVienRepository.findAll(pageable)
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
        return nhanVienRepository.searchByKeyword(keyword).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<NhanVienDTO> getByNhom(String maNhom) {
        return nhanVienRepository.findByNhomMaNhom(maNhom).stream()
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
                .trangThai(dto.getTrangThai() != null ? dto.getTrangThai() : "active")
                .idNhom(dto.getIdNhom())
                .userId(user.getId())
                .build();
        
        return mapToDTO(nhanVienRepository.save(nv));
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
        
        return mapToDTO(nhanVienRepository.save(nv));
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
