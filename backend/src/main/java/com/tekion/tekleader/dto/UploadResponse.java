package com.tekion.tekleader.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UploadResponse {
    private String status;
    private String month;
    private String uploadMode;
    private UploadSummary summary;
    private Long processingTimeMs;
    private String uploadId;
    
    @Builder.Default
    private List<UploadError> errors = new ArrayList<>();
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UploadSummary {
        private Integer recordsProcessed;
        private Integer recordsCreated;
        private Integer recordsUpdated;
        private Integer recordsSkipped;
        private Integer recordsFailed;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UploadError {
        private Integer row;
        private String column;
        private String value;
        private String message;
    }
}

