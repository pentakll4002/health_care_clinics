package com.healthclinics.controller;

import com.healthclinics.dto.ApiResponse;
import com.healthclinics.dto.PhanQuyenDTO;
import com.healthclinics.service.PhanQuyenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/phan-quyen")
@RequiredArgsConstructor
public class PhanQuyenController {

    private final PhanQuyenService phanQuyenService;

    @GetMapping
    public ResponseEntity<List<PhanQuyenDTO>> getAll() {
        return ResponseEntity.ok(phanQuyenService.getAll());
    }

    @GetMapping("/nhom/{idNhom}")
    public ResponseEntity<List<PhanQuyenDTO>> getByNhom(@PathVariable Long idNhom) {
        return ResponseEntity.ok(phanQuyenService.getByNhom(idNhom));
    }

    @GetMapping("/chuc-nang/{idChucNang}")
    public ResponseEntity<List<PhanQuyenDTO>> getByChucNang(@PathVariable Long idChucNang) {
        return ResponseEntity.ok(phanQuyenService.getByChucNang(idChucNang));
    }

    @PostMapping
    public ResponseEntity<PhanQuyenDTO> create(@RequestBody Map<String, Object> body) {
        Object nhomVal = body.get("idNhom");
        if (nhomVal == null) {
            nhomVal = body.get("ID_Nhom");
        }
        if (nhomVal == null) {
            nhomVal = body.get("id_nhom");
        }
        if (nhomVal == null) {
            throw new IllegalArgumentException("idNhom is required");
        }
        Long idNhom = Long.valueOf(nhomVal.toString());

        Object cnVal = body.get("idChucNang");
        if (cnVal == null) {
            cnVal = body.get("ID_ChucNang");
        }
        if (cnVal == null) {
            cnVal = body.get("id_chuc_nang");
        }
        if (cnVal == null) {
            throw new IllegalArgumentException("idChucNang is required");
        }
        Long idChucNang = Long.valueOf(cnVal.toString());

        return ResponseEntity.ok(phanQuyenService.create(idNhom, idChucNang));
    }

    @PostMapping("/nhom/{idNhom}/assign-multiple")
    public ResponseEntity<ApiResponse<?>> assignMultiple(@PathVariable Long idNhom, 
                                                          @RequestBody Map<String, List<Long>> body) {
        List<Long> idChucNangs = body.get("idChucNangs");
        phanQuyenService.assignMultiple(idNhom, idChucNangs);
        return ResponseEntity.ok(ApiResponse.success("PhanQuyen assigned successfully", null));
    }

    @DeleteMapping("/{idNhom}/{idChucNang}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long idNhom, @PathVariable Long idChucNang) {
        phanQuyenService.delete(idNhom, idChucNang);
        return ResponseEntity.ok(ApiResponse.success("PhanQuyen deleted successfully", null));
    }
}
