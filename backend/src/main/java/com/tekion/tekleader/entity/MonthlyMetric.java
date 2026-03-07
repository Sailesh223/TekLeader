package com.tekion.tekleader.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Document(collection = "monthly_metrics")
@CompoundIndexes({
    @CompoundIndex(name = "manager_month_idx", def = "{'managerId': 1, 'month': 1}", unique = true)
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyMetric {

    @Id
    private String id;

    private String managerId;

    private String month;

    private String functionalHead;

    private Integer headcount;

    private Integer oneOnOnes;

    private Integer notUtilising;

    private BigDecimal utilization;

    private BigDecimal teamSizeScore;

    private BigDecimal consistencyScore;

    private BigDecimal finalScore;

    private String classificationBand;

    private Integer rank;

    private Integer rankChange;

    private Integer formulaVersion;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}

