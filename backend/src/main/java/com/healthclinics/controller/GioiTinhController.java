package com.healthclinics.controller;

import com.healthclinics.dto.ApiResponse;
import com.healthclinics.entity.GioiTinh;
import com.healthclinics.repository.GioiTinhRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/gioi-tinh")
@RequiredArgsConstructor
public class GioiTinhController {

    private final GioiTinhRepository gioiTinhRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<GioiTinh>>> getAll() {
        List<GioiTinh> gioiTinhList = gioiTinhRepository.findAll();
        return ResponseEntity.ok(ApiResponse.success(gioiTinhList));
    }
}
