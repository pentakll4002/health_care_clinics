package com.healthclinics.controller;

import com.healthclinics.dto.ApiResponse;
import com.healthclinics.dto.HoaDonDTO;
import com.healthclinics.service.HoaDonService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/invoices")
@RequiredArgsConstructor
public class HoaDonController {

    private final HoaDonService hoaDonService;

    @GetMapping
    public ResponseEntity<List<HoaDonDTO>> getAll() {
        return ResponseEntity.ok(hoaDonService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<HoaDonDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(hoaDonService.getById(id));
    }

    @GetMapping("/preview/{phieuKhamId}")
    public ResponseEntity<HoaDonDTO> preview(@PathVariable Long phieuKhamId) {
        return ResponseEntity.ok(hoaDonService.preview(phieuKhamId));
    }

    private final com.healthclinics.repository.UserRepository userRepository;

    @PostMapping
    public ResponseEntity<HoaDonDTO> create(@RequestBody Map<String, Object> body,
                                            @AuthenticationPrincipal UserDetails userDetails) {
        Object pkVal = body.get("phieuKhamId");
        if (pkVal == null) {
            pkVal = body.get("ID_PhieuKham");
        }
        if (pkVal == null) {
            pkVal = body.get("idPhieuKham");
        }
        if (pkVal == null) {
            throw new IllegalArgumentException("phieuKhamId is required");
        }
        Long phieuKhamId = Long.valueOf(pkVal.toString());

        Long nhanVienId = null;
        Object nvVal = body.get("nhanVienId");
        if (nvVal == null) {
            nvVal = body.get("ID_NhanVien");
        }
        if (nvVal == null) {
            nvVal = body.get("idNhanVien");
        }
        if (nvVal != null) {
            nhanVienId = Long.valueOf(nvVal.toString());
        } else if (userDetails != null) {
            java.util.Optional<com.healthclinics.entity.User> uOpt = userRepository.findByEmailWithNhanVien(userDetails.getUsername());
            if (uOpt.isPresent() && uOpt.get().getNhanVien() != null) {
                nhanVienId = uOpt.get().getNhanVien().getIdNhanVien();
            }
        }
        
        return ResponseEntity.ok(hoaDonService.create(phieuKhamId, nhanVienId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        hoaDonService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("HoaDon deleted successfully", null));
    }
}
