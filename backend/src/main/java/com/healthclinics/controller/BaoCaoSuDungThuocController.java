package com.healthclinics.controller;

import com.healthclinics.entity.BaoCaoSuDungThuoc;
import com.healthclinics.repository.BaoCaoSuDungThuocRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/bao-cao-su-dung-thuoc")
@RequiredArgsConstructor
public class BaoCaoSuDungThuocController {

    private final BaoCaoSuDungThuocRepository repository;

    @GetMapping
    public ResponseEntity<?> getAll(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) Integer thang,
            @RequestParam(required = false) Integer nam) {
        
        int springPage = page > 0 ? page - 1 : 0;
        Pageable pageable = PageRequest.of(springPage, limit);
        
        Page<BaoCaoSuDungThuoc> result = repository.findAll(pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("data", result.getContent());
        response.put("totalCount", result.getTotalElements());
        response.put("page", page);
        response.put("size", result.getSize());
        response.put("totalPages", result.getTotalPages());

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<BaoCaoSuDungThuoc> create(@RequestBody BaoCaoSuDungThuoc entity) {
        return ResponseEntity.ok(repository.save(entity));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        repository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
