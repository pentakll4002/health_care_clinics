package com.healthclinics.controller;

import com.healthclinics.dto.ApiResponse;
import com.healthclinics.dto.NhanVienDTO;
import com.healthclinics.service.NhanVienService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/nhanvien")
@RequiredArgsConstructor
public class NhanVienController {

    private final NhanVienService nhanVienService;

    @GetMapping
    public ResponseEntity<List<NhanVienDTO>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "idNhanVien") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false) String ma_nhom) {
        
        if (ma_nhom != null && !ma_nhom.isEmpty()) {
            return ResponseEntity.ok(nhanVienService.getByNhom(ma_nhom));
        }
        
        if (page == 0 && limit == 10) {
            return ResponseEntity.ok(nhanVienService.getAll());
        }
        
        Sort.Direction dir = direction.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Page<NhanVienDTO> result = nhanVienService.getAll(PageRequest.of(page, limit, Sort.by(dir, sortBy)));
        return ResponseEntity.ok(result.getContent());
    }

    @GetMapping("/{id}")
    public ResponseEntity<NhanVienDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(nhanVienService.getById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<NhanVienDTO>> search(@RequestParam String keyword) {
        return ResponseEntity.ok(nhanVienService.search(keyword));
    }

    @GetMapping("/nhom/{maNhom}")
    public ResponseEntity<List<NhanVienDTO>> getByNhom(@PathVariable String maNhom) {
        return ResponseEntity.ok(nhanVienService.getByNhom(maNhom));
    }

    @PostMapping
    public ResponseEntity<NhanVienDTO> create(@RequestBody NhanVienDTO dto) {
        return ResponseEntity.ok(nhanVienService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NhanVienDTO> update(@PathVariable Long id, @RequestBody NhanVienDTO dto) {
        return ResponseEntity.ok(nhanVienService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        nhanVienService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("NhanVien deleted successfully", null));
    }
}
