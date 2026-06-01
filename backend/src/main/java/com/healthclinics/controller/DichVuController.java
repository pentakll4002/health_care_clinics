package com.healthclinics.controller;

import com.healthclinics.dto.ApiResponse;
import com.healthclinics.dto.DichVuDTO;
import com.healthclinics.service.DichVuService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/dich-vu")
@RequiredArgsConstructor
public class DichVuController {

    private final DichVuService dichVuService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DichVuDTO>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        if (page == 0 && size == 10) {
            return ResponseEntity.ok(ApiResponse.success(dichVuService.getAll()));
        }
        
        Page<DichVuDTO> result = dichVuService.getAll(PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(result.getContent()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DichVuDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(dichVuService.getById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<DichVuDTO>>> search(@RequestParam String keyword) {
        return ResponseEntity.ok(ApiResponse.success(dichVuService.search(keyword)));
    }

    @PostMapping
    public ResponseEntity<DichVuDTO> create(@RequestBody DichVuDTO dto) {
        return ResponseEntity.ok(dichVuService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DichVuDTO> update(@PathVariable Long id, @RequestBody DichVuDTO dto) {
        return ResponseEntity.ok(dichVuService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        dichVuService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("DichVu deleted successfully", null));
    }
}
