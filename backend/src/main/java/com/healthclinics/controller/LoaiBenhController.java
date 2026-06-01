package com.healthclinics.controller;

import com.healthclinics.dto.ApiResponse;
import com.healthclinics.dto.LoaiBenhDTO;
import com.healthclinics.service.LoaiBenhService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/loai-benh")
@RequiredArgsConstructor
public class LoaiBenhController {

    private final LoaiBenhService loaiBenhService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<LoaiBenhDTO>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(loaiBenhService.getAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LoaiBenhDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(loaiBenhService.getById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<LoaiBenhDTO>>> search(@RequestParam String keyword) {
        return ResponseEntity.ok(ApiResponse.success(loaiBenhService.search(keyword)));
    }

    @PostMapping
    public ResponseEntity<LoaiBenhDTO> create(@RequestBody LoaiBenhDTO dto) {
        return ResponseEntity.ok(loaiBenhService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LoaiBenhDTO> update(@PathVariable Long id, @RequestBody LoaiBenhDTO dto) {
        return ResponseEntity.ok(loaiBenhService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        loaiBenhService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("LoaiBenh deleted successfully", null));
    }
}
