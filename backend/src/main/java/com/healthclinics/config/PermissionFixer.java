package com.healthclinics.config;

import com.healthclinics.entity.ChucNang;
import com.healthclinics.entity.NhomNguoiDung;
import com.healthclinics.entity.PhanQuyen;
import com.healthclinics.repository.ChucNangRepository;
import com.healthclinics.repository.NhomNguoiDungRepository;
import com.healthclinics.repository.PhanQuyenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class PermissionFixer implements CommandLineRunner {

    private final NhomNguoiDungRepository nhomNguoiDungRepository;
    private final ChucNangRepository chucNangRepository;
    private final PhanQuyenRepository phanQuyenRepository;

    @Override
    public void run(String... args) {
        log.info("Running PermissionFixer to add manage-drugs to doctors...");
        Optional<NhomNguoiDung> doctorGroupOpt = nhomNguoiDungRepository.findByMaNhom("doctors");
        
        // Find ChucNang by checking all and filtering (since there's no findByTenManHinhTuongUong)
        Optional<ChucNang> manageDrugsOpt = chucNangRepository.findAll().stream()
                .filter(c -> "manage-drugs".equals(c.getTenManHinhTuongUong()))
                .findFirst();

        if (doctorGroupOpt.isPresent() && manageDrugsOpt.isPresent()) {
            Long doctorGroupId = doctorGroupOpt.get().getIdNhom();
            Long chucNangId = manageDrugsOpt.get().getIdChucNang();

            boolean exists = phanQuyenRepository.findAll().stream()
                    .anyMatch(pq -> pq.getIdNhom().equals(doctorGroupId) && pq.getIdChucNang().equals(chucNangId));

            if (!exists) {
                phanQuyenRepository.save(PhanQuyen.builder()
                        .idNhom(doctorGroupId)
                        .idChucNang(chucNangId)
                        .build());
                log.info("Successfully added manage-drugs permission to doctors.");
            } else {
                log.info("manage-drugs permission already exists for doctors.");
            }
        }
    }
}
