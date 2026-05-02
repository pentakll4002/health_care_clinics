package com.healthclinics.service;

import com.healthclinics.dto.ThuocDTO;
import com.healthclinics.entity.Thuoc;
import com.healthclinics.entity.DVT;
import com.healthclinics.entity.CachDung;
import com.healthclinics.repository.ThuocRepository;
import com.healthclinics.repository.DVTRepository;
import com.healthclinics.repository.CachDungRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class ThuocService {

    private final ThuocRepository thuocRepository;
    private final DVTRepository dvtRepository;
    private final CachDungRepository cachDungRepository;

    public List<ThuocDTO> getAll() {
        return thuocRepository.findByIsDeletedFalse().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public Page<ThuocDTO> getAll(Pageable pageable) {
        return thuocRepository.findByIsDeletedFalse(pageable)
                .map(this::mapToDTO);
    }

    public ThuocDTO getById(Long id) {
        Thuoc thuoc = thuocRepository.findByIdThuocAndIsDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Thuoc not found"));
        return mapToDTO(thuoc);
    }

    public ThuocDTO getByIdWithDetails(Long id) {
        Thuoc thuoc = thuocRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new RuntimeException("Thuoc not found"));
        return mapToDTO(thuoc);
    }

    public List<ThuocDTO> search(String keyword) {
        return thuocRepository.searchByKeyword(keyword).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<ThuocDTO> getLowStock(Integer minQuantity) {
        return thuocRepository.findBySoLuongTonLessThanEqual(minQuantity).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ThuocDTO create(ThuocDTO dto) {
        // Calculate selling price
        BigDecimal donGiaBan = dto.getDonGiaNhap();
        if (dto.getTyLeGiaBan() != null && dto.getDonGiaNhap() != null) {
            donGiaBan = dto.getDonGiaNhap().multiply(
                    BigDecimal.ONE.add(dto.getTyLeGiaBan().divide(BigDecimal.valueOf(100)))
            );
        }

        Thuoc thuoc = Thuoc.builder()
                .tenThuoc(dto.getTenThuoc())
                .idDvt(dto.getIdDvt())
                .idCachDung(dto.getIdCachDung())
                .thanhPhan(dto.getThanhPhan())
                .xuatXu(dto.getXuatXu())
                .soLuongTon(dto.getSoLuongTon() != null ? dto.getSoLuongTon() : 0)
                .donGiaNhap(dto.getDonGiaNhap())
                .hinhAnh(dto.getHinhAnh())
                .tyLeGiaBan(dto.getTyLeGiaBan())
                .donGiaBan(donGiaBan)
                .isDeleted(false)
                .build();
        
        return mapToDTO(thuocRepository.save(thuoc));
    }

    @Transactional
    public ThuocDTO update(Long id, ThuocDTO dto) {
        Thuoc thuoc = thuocRepository.findByIdThuocAndIsDeletedFalse(id)
                .orElseThrow(() -> new RuntimeException("Thuoc not found"));
        
        thuoc.setTenThuoc(dto.getTenThuoc());
        thuoc.setIdDvt(dto.getIdDvt());
        thuoc.setIdCachDung(dto.getIdCachDung());
        thuoc.setThanhPhan(dto.getThanhPhan());
        thuoc.setXuatXu(dto.getXuatXu());
        thuoc.setSoLuongTon(dto.getSoLuongTon());
        thuoc.setDonGiaNhap(dto.getDonGiaNhap());
        thuoc.setHinhAnh(dto.getHinhAnh());
        thuoc.setTyLeGiaBan(dto.getTyLeGiaBan());
        
        // Recalculate selling price
        if (dto.getTyLeGiaBan() != null && dto.getDonGiaNhap() != null) {
            thuoc.setDonGiaBan(dto.getDonGiaNhap().multiply(
                    BigDecimal.ONE.add(dto.getTyLeGiaBan().divide(BigDecimal.valueOf(100)))
            ));
        }
        
        return mapToDTO(thuocRepository.save(thuoc));
    }

    @Transactional
    public void delete(Long id) {
        Thuoc thuoc = thuocRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Thuoc not found"));
        thuoc.setIsDeleted(true);
        thuocRepository.save(thuoc);
    }

    @Transactional
    public void importFromJson() {
        try {
            java.io.File jsonFile = new java.io.File("c:/DoAnJava/health_clinics/crawl_test_final_with_price.json");
            if (!jsonFile.exists()) {
                jsonFile = new java.io.File("c:/Dự án công ty/crawl/crawl_test_final_with_price.json");
            }
            if (!jsonFile.exists()) {
                throw new RuntimeException("JSON file not found.");
            }

            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(jsonFile);
            JsonNode drugs = root.get("drugs");

            if (drugs != null && drugs.isArray()) {
                List<DVT> allDvts = dvtRepository.findAll();

                // Get default CachDung
                CachDung uong = cachDungRepository.findAll().stream()
                        .filter(c -> c.getMoTaCachDung().equalsIgnoreCase("Uống"))
                        .findFirst()
                        .orElseGet(() -> cachDungRepository.save(CachDung.builder().moTaCachDung("Uống").build()));

                for (JsonNode drug : drugs) {
                    String name = drug.has("name") ? drug.get("name").asText() : "Unknown";
                    String packaging = drug.has("packaging") ? drug.get("packaging").asText() : "Hộp";
                    String priceStr = drug.has("price") ? drug.get("price").asText() : "0";
                    String img = drug.has("img") ? drug.get("img").asText() : "";

                    DVT dvt = allDvts.stream()
                            .filter(d -> d.getTenDvt().equalsIgnoreCase(packaging))
                            .findFirst()
                            .orElse(null);

                    if (dvt == null) {
                        dvt = dvtRepository.save(DVT.builder().tenDvt(packaging).build());
                        allDvts.add(dvt);
                    }

                    BigDecimal price = BigDecimal.ZERO;
                    try {
                        price = new BigDecimal(priceStr);
                    } catch (Exception ignored) {}

                    Long finalDvtId = dvt.getIdDvt();

                    // Check if Thuoc already exists by name
                    boolean exists = thuocRepository.findAll().stream()
                            .anyMatch(t -> t.getTenThuoc().equalsIgnoreCase(name) && t.getIdDvt().equals(finalDvtId));

                    if (!exists) {
                        thuocRepository.save(Thuoc.builder()
                                .tenThuoc(name)
                                .idDvt(dvt.getIdDvt())
                                .idCachDung(uong.getIdCachDung())
                                .donGiaNhap(price.multiply(BigDecimal.valueOf(0.8)))
                                .tyLeGiaBan(BigDecimal.valueOf(25))
                                .donGiaBan(price)
                                .soLuongTon(100)
                                .hinhAnh(img)
                                .isDeleted(false)
                                .build());
                    }
                }
                log.info("Successfully imported Thuoc from JSON");
            }
        } catch (Exception e) {
            log.error("Failed to import from JSON", e);
            throw new RuntimeException("Failed to import from JSON: " + e.getMessage(), e);
        }
    }

    private ThuocDTO mapToDTO(Thuoc thuoc) {
        ThuocDTO dto = ThuocDTO.builder()
                .idThuoc(thuoc.getIdThuoc())
                .tenThuoc(thuoc.getTenThuoc())
                .idDvt(thuoc.getIdDvt())
                .idCachDung(thuoc.getIdCachDung())
                .thanhPhan(thuoc.getThanhPhan())
                .xuatXu(thuoc.getXuatXu())
                .soLuongTon(thuoc.getSoLuongTon())
                .donGiaNhap(thuoc.getDonGiaNhap())
                .hinhAnh(thuoc.getHinhAnh())
                .tyLeGiaBan(thuoc.getTyLeGiaBan())
                .donGiaBan(thuoc.getDonGiaBan())
                .isDeleted(thuoc.getIsDeleted())
                .createdAt(thuoc.getCreatedAt())
                .updatedAt(thuoc.getUpdatedAt())
                .build();
        
        if (thuoc.getDvt() != null) {
            dto.setTenDvt(thuoc.getDvt().getTenDvt());
        }
        if (thuoc.getCachDung() != null) {
            dto.setMoTaCachDung(thuoc.getCachDung().getMoTaCachDung());
        }
        
        return dto;
    }
}
