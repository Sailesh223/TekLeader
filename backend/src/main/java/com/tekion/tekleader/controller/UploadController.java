package com.tekion.tekleader.controller;

import com.tekion.tekleader.dto.UploadResponse;
import com.tekion.tekleader.service.ExcelImportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Upload", description = "Excel file upload and data import APIs")
public class UploadController {
    
    private final ExcelImportService excelImportService;
    
    @PostMapping("/monthly")
    @Operation(summary = "Upload monthly Excel file", 
               description = "Upload and process monthly manager utilization data from Excel file")
    public ResponseEntity<UploadResponse> uploadMonthlyData(
        @RequestParam("file") MultipartFile file,
        @RequestParam("month") String month,
        @RequestParam("mode") String mode
    ) {
        try {
            log.info("Received upload request for month: {}, mode: {}", month, mode);
            
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(
                    UploadResponse.builder()
                        .status("FAILED")
                        .build()
                );
            }
            
            UploadResponse response = excelImportService.processExcelFile(file, month, mode);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error processing upload", e);
            return ResponseEntity.badRequest().body(
                UploadResponse.builder()
                    .status("FAILED")
                    .build()
            );
        }
    }
}

