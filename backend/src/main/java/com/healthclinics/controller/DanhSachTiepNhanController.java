package com.healthclinics.controller;

import com.healthclinics.dto.ApiResponse;
import com.healthclinics.dto.DanhSachTiepNhanDTO;
import com.healthclinics.service.DanhSachTiepNhanService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/appointments")
@RequiredArgsConstructor
public class DanhSachTiepNhanController {

    private final DanhSachTiepNhanService danhSachTiepNhanService;

    @GetMapping
    public ResponseEntity<List<DanhSachTiepNhanDTO>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "idTiepNhan") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        
        if (page == 0 && size == 10) {
            return ResponseEntity.ok(danhSachTiepNhanService.getAll());
        }
        
        Sort.Direction dir = direction.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Page<DanhSachTiepNhanDTO> result = danhSachTiepNhanService.getAll(PageRequest.of(page, size, Sort.by(dir, sortBy)));
        return ResponseEntity.ok(result.getContent());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DanhSachTiepNhanDTO> getById(@PathVariable Long id) {
        return ResponseEntity.ok(danhSachTiepNhanService.getById(id));
    }

    @GetMapping("/date")
    public ResponseEntity<List<DanhSachTiepNhanDTO>> getByDate(@RequestParam String date) {
        LocalDateTime dateTime = LocalDateTime.parse(date + "T00:00:00");
        return ResponseEntity.ok(danhSachTiepNhanService.getByDate(dateTime));
    }

    @PostMapping
    public ResponseEntity<DanhSachTiepNhanDTO> create(@RequestBody DanhSachTiepNhanDTO dto) {
        return ResponseEntity.ok(danhSachTiepNhanService.create(dto));
    }

    @PostMapping("/from-lich-kham")
    public ResponseEntity<DanhSachTiepNhanDTO> createFromLichKham(@RequestBody Map<String, Object> body) {
        // Extract lichKhamId safely from any payload structure
        Object raw = body.get("lichKhamId");
        if (raw == null) raw = body.get("ID_LichKham");
        Long lichKhamId = null;
        if (raw instanceof Number) {
            lichKhamId = ((Number) raw).longValue();
        } else if (raw instanceof String) {
            lichKhamId = Long.parseLong((String) raw);
        } else if (raw instanceof Map) {
            // Handle nested object case: { lichKhamId: { ID_LichKham: 123 } }
            Map<?, ?> nested = (Map<?, ?>) raw;
            Object nestedId = nested.get("ID_LichKham");
            if (nestedId == null) nestedId = nested.get("lichKhamId");
            if (nestedId instanceof Number) lichKhamId = ((Number) nestedId).longValue();
            else if (nestedId instanceof String) lichKhamId = Long.parseLong((String) nestedId);
        }
        if (lichKhamId == null) {
            throw new IllegalArgumentException("lichKhamId is required. Received body: " + body);
        }
        return ResponseEntity.ok(danhSachTiepNhanService.createFromLichKham(lichKhamId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DanhSachTiepNhanDTO> update(@PathVariable Long id, @RequestBody DanhSachTiepNhanDTO dto) {
        return ResponseEntity.ok(danhSachTiepNhanService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable Long id) {
        danhSachTiepNhanService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("DanhSachTiepNhan deleted successfully", null));
    }
}
