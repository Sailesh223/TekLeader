package com.tekion.tekleader.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;

@Document(collection = "upload_history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UploadHistory {

    @Id
    private String id;

    @Indexed
    private String month;

    private String filename;

    private String uploadMode;

    private Integer recordsProcessed;

    private Integer recordsCreated;

    private Integer recordsUpdated;

    private Integer recordsSkipped;

    private Integer recordsFailed;

    private String status;

    private String errorReport;

    private String uploadedBy;

    @CreatedDate
    private LocalDateTime uploadedAt;

    private Long processingTimeMs;
}

