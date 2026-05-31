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

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/thuoc")
@RequiredArgsConstructor
public class ThuocController {

    private final ThuocService thuocService;

    @GetMapping
    public ResponseEntity<?> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "idThuoc") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false) String keyword) {
        
        // If keyword is provided, use search
        if (keyword != null && !keyword.trim().isEmpty()) {
            List<ThuocDTO> results = thuocService.search(keyword.trim());
            Map<String, Object> response = new HashMap<>();
            response.put("data", results);
            response.put("totalCount", results.size());
            response.put("page", 0);
            response.put("size", results.size());
            response.put("totalPages", 1);
            return ResponseEntity.ok(response);
        }
        
        Sort.Direction dir = direction.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Page<ThuocDTO> result = thuocService.getAll(PageRequest.of(page, size, Sort.by(dir, sortBy)));
        
        Map<String, Object> response = new HashMap<>();
        response.put("data", result.getContent());
        response.put("totalCount", result.getTotalElements());
        response.put("page", result.getNumber());
        response.put("size", result.getSize());
        response.put("totalPages", result.getTotalPages());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ThuocDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(thuocService.getByIdWithDetails(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ThuocDTO>> search(@RequestParam String keyword) {
        return ResponseEntity.ok(thuocService.search(keyword));
    }

    @GetMapping("/packagings")
    public ResponseEntity<List<ThuocDTO>> getPackagings(@RequestParam String name) {
        return ResponseEntity.ok(thuocService.getPackagingsByName(name));
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
