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
        return thuocRepository.findUniqueDrugsByIsDeletedFalse(pageable)
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
            org.springframework.core.io.ClassPathResource resource = new org.springframework.core.io.ClassPathResource("crawl_test_final_with_price.json");
            if (!resource.exists()) {
                log.warn("JSON drug seed file not found in classpath. Skipping JSON drug import.");
                return;
            }

            ObjectMapper mapper = new ObjectMapper();
            JsonNode root;
            try (java.io.InputStream inputStream = resource.getInputStream()) {
                root = mapper.readTree(inputStream);
            }
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
                    String img = drug.has("image") ? drug.get("image").asText() : "";

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

                    // Determine origin, ingredients, and image: reuse existing if database already has any packaging of the same drug name
                    List<Thuoc> sameNameDrugs = thuocRepository.findAll().stream()
                            .filter(t -> t.getTenThuoc().equalsIgnoreCase(name))
                            .collect(Collectors.toList());

                    String origin = null;
                    String ingredients = null;
                    String finalImg = (img != null && !img.trim().isEmpty()) ? img : null;

                    for (Thuoc existing : sameNameDrugs) {
                        if (origin == null && existing.getXuatXu() != null && !existing.getXuatXu().trim().isEmpty() && !existing.getXuatXu().equalsIgnoreCase("N/A") && !existing.getXuatXu().equalsIgnoreCase("Unknown")) {
                            origin = existing.getXuatXu();
                        }
                        if (ingredients == null && existing.getThanhPhan() != null && !existing.getThanhPhan().trim().isEmpty() && !existing.getThanhPhan().equalsIgnoreCase("N/A") && !existing.getThanhPhan().equalsIgnoreCase("Unknown")) {
                            ingredients = existing.getThanhPhan();
                        }
                        if (finalImg == null && existing.getHinhAnh() != null && !existing.getHinhAnh().trim().isEmpty()) {
                            finalImg = existing.getHinhAnh();
                        }
                    }

                    // Fallback to random generation if not found in database
                    if (origin == null) {
                        String[] origins = {"Việt Nam", "Pháp", "Mỹ", "Đức", "Nhật Bản", "Thụy Sĩ", "Ấn Độ", "Hàn Quốc", "Anh", "Ý"};
                        origin = origins[new java.util.Random().nextInt(origins.length)];
                    }

                    if (ingredients == null) {
                        String lowerName = name.toLowerCase();
                        if (lowerName.contains("calci") || lowerName.contains("canxi")) {
                            ingredients = "Calci carbonat 500mg, Vitamin D3 200IU";
                        } else if (lowerName.contains("vitamin c")) {
                            ingredients = "Vitamin C (Acid ascorbic) 1000mg";
                        } else if (lowerName.contains("tóc") || lowerName.contains("hair")) {
                            ingredients = "Biotin 5000mcg, Collagen peptide 1000mg, L-Cystine 250mg";
                        } else if (lowerName.contains("ho ") || lowerName.contains("cough") || lowerName.contains("siro")) {
                            ingredients = "Cao lá Thường xuân 35mg, Tinh dầu Tràm 100mg";
                        } else if (lowerName.contains("sâm") || lowerName.contains("ginseng")) {
                            ingredients = "Cao Nhân sâm Triều Tiên 100mg, Vitamin tổng hợp";
                        } else if (lowerName.contains("gan") || lowerName.contains("liver")) {
                            ingredients = "Silymarin 140mg, L-Arginine HCl 200mg, Vitamin B";
                        } else if (lowerName.contains("omega") || lowerName.contains("dầu cá")) {
                            ingredients = "Omega-3 1000mg (EPA 180mg, DHA 120mg)";
                        } else {
                            String[] generalIngredients = {
                                "Paracetamol 500mg, Codein phosphat 30mg",
                                "Amoxicillin trihydrat tương đương Amoxicillin 500mg",
                                "Glucosamin sulfat 1500mg, Chondroitin sulfat 100mg",
                                "Kẽm gluconat 50mg, Vitamin E 400IU",
                                "Sắt fumarat 150mg, Acid folic 0.4mg",
                                "Lactobacillus acidophilus 10^8 CFU, Bifidobacterium 10^8 CFU",
                                "Cao thảo dược tự nhiên, Tinh chất trà xanh, Curcumin 95%"
                            };
                            ingredients = generalIngredients[new java.util.Random().nextInt(generalIngredients.length)];
                        }
                    }

                    List<Thuoc> existingList = sameNameDrugs.stream()
                            .filter(t -> t.getIdDvt().equals(finalDvtId))
                            .collect(Collectors.toList());

                    if (!existingList.isEmpty()) {
                        for (Thuoc existing : existingList) {
                            boolean updated = false;
                            if (finalImg != null && (existing.getHinhAnh() == null || existing.getHinhAnh().trim().isEmpty())) {
                                existing.setHinhAnh(finalImg);
                                updated = true;
                            }
                            if (existing.getXuatXu() == null || existing.getXuatXu().trim().isEmpty() || existing.getXuatXu().equalsIgnoreCase("N/A") || existing.getXuatXu().equalsIgnoreCase("Unknown")) {
                                existing.setXuatXu(origin);
                                updated = true;
                            }
                            if (existing.getThanhPhan() == null || existing.getThanhPhan().trim().isEmpty() || existing.getThanhPhan().equalsIgnoreCase("N/A") || existing.getThanhPhan().equalsIgnoreCase("Unknown")) {
                                existing.setThanhPhan(ingredients);
                                updated = true;
                            }
                            if (updated) {
                                thuocRepository.save(existing);
                            }
                        }
                    } else {
                        thuocRepository.save(Thuoc.builder()
                                .tenThuoc(name)
                                .idDvt(dvt.getIdDvt())
                                .idCachDung(uong.getIdCachDung())
                                .donGiaNhap(price.multiply(BigDecimal.valueOf(0.8)))
                                .tyLeGiaBan(BigDecimal.valueOf(25))
                                .donGiaBan(price)
                                .soLuongTon(100)
                                .hinhAnh(finalImg)
                                .xuatXu(origin)
                                .thanhPhan(ingredients)
                                .isDeleted(false)
                                .build());
                    }
                }

                // Post-import synchronization sweep across all drugs in the database
                List<Thuoc> allDrugs = thuocRepository.findAll();
                java.util.Map<String, List<Thuoc>> groupedByName = allDrugs.stream()
                        .collect(Collectors.groupingBy(t -> t.getTenThuoc().trim().toLowerCase()));

                for (List<Thuoc> group : groupedByName.values()) {
                    if (group.size() <= 1) continue;

                    String masterOrigin = null;
                    String masterIngredients = null;
                    String masterImg = null;

                    // Find the best master metadata values from the group
                    for (Thuoc t : group) {
                        if (masterOrigin == null && t.getXuatXu() != null && !t.getXuatXu().trim().isEmpty() && !t.getXuatXu().equalsIgnoreCase("N/A") && !t.getXuatXu().equalsIgnoreCase("Unknown")) {
                            masterOrigin = t.getXuatXu();
                        }
                        if (masterIngredients == null && t.getThanhPhan() != null && !t.getThanhPhan().trim().isEmpty() && !t.getThanhPhan().equalsIgnoreCase("N/A") && !t.getThanhPhan().equalsIgnoreCase("Unknown")) {
                            masterIngredients = t.getThanhPhan();
                        }
                        if (masterImg == null && t.getHinhAnh() != null && !t.getHinhAnh().trim().isEmpty() && !t.getHinhAnh().contains("placeholder-drug")) {
                            masterImg = t.getHinhAnh();
                        }
                    }

                    // Apply master values to all members of the group
                    for (Thuoc t : group) {
                        boolean updated = false;
                        if (masterOrigin != null && (t.getXuatXu() == null || t.getXuatXu().equalsIgnoreCase("N/A") || t.getXuatXu().equalsIgnoreCase("Unknown") || !t.getXuatXu().equals(masterOrigin))) {
                            t.setXuatXu(masterOrigin);
                            updated = true;
                        }
                        if (masterIngredients != null && (t.getThanhPhan() == null || t.getThanhPhan().equalsIgnoreCase("N/A") || t.getThanhPhan().equalsIgnoreCase("Unknown") || !t.getThanhPhan().equals(masterIngredients))) {
                            t.setThanhPhan(masterIngredients);
                            updated = true;
                        }
                        if (masterImg != null && (t.getHinhAnh() == null || t.getHinhAnh().trim().isEmpty() || t.getHinhAnh().contains("placeholder-drug"))) {
                            t.setHinhAnh(masterImg);
                            updated = true;
                        }
                        if (updated) {
                            thuocRepository.save(t);
                        }
                    }
                }

                log.info("Successfully imported and synchronized Thuoc from JSON");
            }
        } catch (Exception e) {
            log.error("Failed to import from JSON", e);
            throw new RuntimeException("Failed to import from JSON: " + e.getMessage(), e);
        }
    }

    public List<ThuocDTO> getPackagingsByName(String name) {
        java.util.Map<String, Thuoc> uniquePackagings = new java.util.LinkedHashMap<>();
        thuocRepository.findByTenThuocIgnoreCaseAndIsDeletedFalse(name).forEach(t -> {
            String dvtName = t.getDvt() != null ? t.getDvt().getTenDvt().trim().toLowerCase() : "n/a";
            if (!uniquePackagings.containsKey(dvtName)) {
                uniquePackagings.put(dvtName, t);
            }
        });
        return uniquePackagings.values().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
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
