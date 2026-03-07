package com.tekion.tekleader.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Document(collection = "formula_config")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FormulaConfig {

    @Id
    private String id;

    @Indexed(unique = true)
    private Integer version;

    private BigDecimal utilizationWeight;

    private BigDecimal teamSizeWeight;

    private BigDecimal consistencyWeight;

    private Map<String, Integer> teamSizeMapping;

    private Map<String, Object> classificationThresholds;

    private BigDecimal consistencyPenaltyMultiplier;

    private Boolean active = false;

    @CreatedDate
    private LocalDateTime createdAt;

    private String createdBy;
}

