package com.healthclinics.controller;

import com.healthclinics.dto.ApiResponse;
import com.healthclinics.dto.LichKhamDTO;
import com.healthclinics.service.LichKhamService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/lich-kham")
@RequiredArgsConstructor
public class LichKhamController {

    private final LichKhamService lichKhamService;

    @GetMapping
    public ResponseEntity<List<LichKhamDTO>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "idLichKham") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        
        if (page == 0 && size == 10) {
            return ResponseEntity.ok(lichKhamService.getAll());
        }
        
        Sort.Direction dir = direction.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Page<LichKhamDTO> result = lichKhamService.getAll(PageRequest.of(page, size, Sort.by(dir, sortBy)));
        return ResponseEntity.ok(result.getContent());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LichKhamDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(lichKhamService.getById(id));
    }

    @GetMapping("/benh-nhan/{benhNhanId}")
    public ResponseEntity<List<LichKhamDTO>> getByBenhNhan(@PathVariable Long benhNhanId) {
        return ResponseEntity.ok(lichKhamService.getByBenhNhan(benhNhanId));
    }

    @GetMapping("/date")
    public ResponseEntity<List<LichKhamDTO>> getByDate(@RequestParam String date) {
        LocalDate localDate = LocalDate.parse(date);
        return ResponseEntity.ok(lichKhamService.getByDate(localDate));
    }

    @PostMapping
    public ResponseEntity<LichKhamDTO> create(@RequestBody LichKhamDTO dto) {
        return ResponseEntity.ok(lichKhamService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LichKhamDTO> update(@PathVariable Long id, @RequestBody LichKhamDTO dto) {
        return ResponseEntity.ok(lichKhamService.update(id, dto));
    }

    @PostMapping("/{id}/confirm")
    public ResponseEntity<LichKhamDTO> confirm(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        Long idBacSi = null;
        if (body != null && body.containsKey("ID_BacSi") && body.get("ID_BacSi") != null) {
            idBacSi = Long.valueOf(body.get("ID_BacSi").toString());
        }
        if (idBacSi != null) {
            return ResponseEntity.ok(lichKhamService.confirmWithDoctor(id, idBacSi));
        }
        return ResponseEntity.ok(lichKhamService.confirm(id));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<LichKhamDTO> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(lichKhamService.cancel(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        lichKhamService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("LichKham deleted successfully", null));
    }
}
