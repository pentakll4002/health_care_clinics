package com.healthclinics.controller;

import com.healthclinics.dto.ApiResponse;
import com.healthclinics.dto.ThuocDTO;
import com.healthclinics.service.ThuocService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/thuoc")
@RequiredArgsConstructor
public class ThuocController {

    private final ThuocService thuocService;

    @GetMapping
    public ResponseEntity<List<ThuocDTO>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "idThuoc") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        
        if (page == 0 && size == 10) {
            return ResponseEntity.ok(thuocService.getAll());
        }
        
        Sort.Direction dir = direction.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Page<ThuocDTO> result = thuocService.getAll(PageRequest.of(page, size, Sort.by(dir, sortBy)));
        return ResponseEntity.ok(result.getContent());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ThuocDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(thuocService.getByIdWithDetails(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ThuocDTO>> search(@RequestParam String keyword) {
        return ResponseEntity.ok(thuocService.search(keyword));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<ThuocDTO>> getLowStock(@RequestParam(defaultValue = "10") Integer minQuantity) {
        return ResponseEntity.ok(thuocService.getLowStock(minQuantity));
    }

    @PostMapping
    public ResponseEntity<ThuocDTO> create(@RequestBody ThuocDTO dto) {
        return ResponseEntity.ok(thuocService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ThuocDTO> update(@PathVariable Long id, @RequestBody ThuocDTO dto) {
        return ResponseEntity.ok(thuocService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        thuocService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Thuoc deleted successfully", null));
    }

    @PostMapping("/import")
    public ResponseEntity<ApiResponse<?>> importThuoc() {
        thuocService.importFromJson();
        return ResponseEntity.ok(ApiResponse.success("Imported Thuoc successfully", null));
    }
}
