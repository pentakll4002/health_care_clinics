package com.healthclinics.controller;

import com.healthclinics.dto.ApiResponse;
import com.healthclinics.dto.NhomNguoiDungDTO;
import com.healthclinics.service.NhomNguoiDungService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/nhom-nguoi-dung")
@RequiredArgsConstructor
public class NhomNguoiDungController {

    private final NhomNguoiDungService nhomNguoiDungService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<NhomNguoiDungDTO>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(nhomNguoiDungService.getAll()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<NhomNguoiDungDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(nhomNguoiDungService.getById(id));
    }

    @GetMapping("/ma-nhom/{maNhom}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<NhomNguoiDungDTO> getByMaNhom(@PathVariable String maNhom) {
        return ResponseEntity.ok(nhomNguoiDungService.getByMaNhom(maNhom));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<NhomNguoiDungDTO> create(@RequestBody NhomNguoiDungDTO dto) {
        return ResponseEntity.ok(nhomNguoiDungService.create(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<NhomNguoiDungDTO> update(@PathVariable Long id, @RequestBody NhomNguoiDungDTO dto) {
        return ResponseEntity.ok(nhomNguoiDungService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        nhomNguoiDungService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("NhomNguoiDung deleted successfully", null));
    }
}
