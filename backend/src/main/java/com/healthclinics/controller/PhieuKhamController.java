package com.healthclinics.controller;

import com.healthclinics.dto.ApiResponse;
import com.healthclinics.dto.CtPhieuKhamDichVuDTO;
import com.healthclinics.dto.PhieuKhamDTO;
import com.healthclinics.dto.ToaThuocDTO;
import com.healthclinics.service.PhieuKhamService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/phieu-kham")
@RequiredArgsConstructor
public class PhieuKhamController {

    private final PhieuKhamService phieuKhamService;

    @GetMapping
    public ResponseEntity<List<PhieuKhamDTO>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "idPhieuKham") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        
        if (page == 0 && size == 10) {
            return ResponseEntity.ok(phieuKhamService.getAll());
        }
        
        Sort.Direction dir = direction.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Page<PhieuKhamDTO> result = phieuKhamService.getAll(PageRequest.of(page, size, Sort.by(dir, sortBy)));
        return ResponseEntity.ok(result.getContent());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PhieuKhamDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(phieuKhamService.getById(id));
    }

    @GetMapping("/tiep-nhan/{idTiepNhan}")
    public ResponseEntity<List<PhieuKhamDTO>> getByTiepNhan(@PathVariable Long idTiepNhan) {
        return ResponseEntity.ok(phieuKhamService.getByTiepNhan(idTiepNhan));
    }

    @GetMapping("/bac-si/{idBacSi}")
    public ResponseEntity<List<PhieuKhamDTO>> getByBacSi(@PathVariable Long idBacSi) {
        return ResponseEntity.ok(phieuKhamService.getByBacSi(idBacSi));
    }

    @GetMapping("/trang-thai/{trangThai}")
    public ResponseEntity<List<PhieuKhamDTO>> getByTrangThai(@PathVariable String trangThai) {
        return ResponseEntity.ok(phieuKhamService.getByTrangThai(trangThai));
    }

    @PostMapping
    public ResponseEntity<PhieuKhamDTO> create(@RequestBody Map<String, Object> body) {
        Object val = body.get("idTiepNhan");
        if (val == null) {
            val = body.get("ID_TiepNhan");
        }
        if (val == null) {
            throw new IllegalArgumentException("idTiepNhan is required");
        }
        Long idTiepNhan = Long.valueOf(val.toString());
        return ResponseEntity.ok(phieuKhamService.create(idTiepNhan));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PhieuKhamDTO> update(@PathVariable Long id, @RequestBody PhieuKhamDTO dto) {
        return ResponseEntity.ok(phieuKhamService.update(id, dto));
    }

    @PostMapping("/{id}/toa-thuoc")
    public ResponseEntity<ToaThuocDTO> addToaThuoc(@PathVariable Long id, @RequestBody ToaThuocDTO dto) {
        return ResponseEntity.ok(phieuKhamService.addToaThuoc(id, dto));
    }

    @PutMapping("/{id}/toa-thuoc/{thuocId}")
    public ResponseEntity<ToaThuocDTO> updateToaThuoc(@PathVariable Long id, @PathVariable Long thuocId, 
                                                        @RequestBody ToaThuocDTO dto) {
        return ResponseEntity.ok(phieuKhamService.addToaThuoc(id, dto));
    }

    @DeleteMapping("/{id}/toa-thuoc/{thuocId}")
    public ResponseEntity<ApiResponse<?>> removeToaThuoc(@PathVariable Long id, @PathVariable Long thuocId) {
        phieuKhamService.removeToaThuoc(id, thuocId);
        return ResponseEntity.ok(ApiResponse.success("ToaThuoc removed successfully", null));
    }

    @PostMapping("/{id}/dich-vu-phu")
    public ResponseEntity<CtPhieuKhamDichVuDTO> addDichVuPhu(@PathVariable Long id, @RequestBody CtPhieuKhamDichVuDTO dto) {
        return ResponseEntity.ok(phieuKhamService.addDichVuPhu(id, dto));
    }

    @PutMapping("/{id}/dich-vu-phu/{dichVuId}")
    public ResponseEntity<CtPhieuKhamDichVuDTO> updateDichVuPhu(@PathVariable Long id, @PathVariable Long dichVuId,
                                                                 @RequestBody CtPhieuKhamDichVuDTO dto) {
        return ResponseEntity.ok(phieuKhamService.addDichVuPhu(id, dto));
    }

    @DeleteMapping("/{id}/dich-vu-phu/{dichVuId}")
    public ResponseEntity<ApiResponse<?>> removeDichVuPhu(@PathVariable Long id, @PathVariable Long dichVuId) {
        phieuKhamService.removeDichVuPhu(id, dichVuId);
        return ResponseEntity.ok(ApiResponse.success("DichVuPhu removed successfully", null));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<PhieuKhamDTO> complete(@PathVariable Long id) {
        return ResponseEntity.ok(phieuKhamService.complete(id));
    }

    @PostMapping("/check-can-create")
    public ResponseEntity<Map<String, Object>> checkCanCreate(@RequestBody Map<String, Object> body) {
        Object rawId = body.get("ID_TiepNhan");
        if (rawId == null) rawId = body.get("idTiepNhan");
        
        Long idTiepNhan = null;
        if (rawId instanceof Number) {
            idTiepNhan = ((Number) rawId).longValue();
        } else if (rawId instanceof String) {
            idTiepNhan = Long.parseLong((String) rawId);
        }
        
        boolean canCreate = false;
        if (idTiepNhan != null) {
            canCreate = phieuKhamService.getByTiepNhan(idTiepNhan).isEmpty();
        }
        
        Map<String, Object> response = new java.util.HashMap<>();
        response.put("success", true);
        response.put("canCreate", canCreate);
        response.put("data", canCreate);
        return ResponseEntity.ok(response);
    }
}
