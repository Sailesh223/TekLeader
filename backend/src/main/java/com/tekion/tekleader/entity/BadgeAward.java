package com.tekion.tekleader.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;

import java.time.LocalDateTime;
import java.util.Map;

@Document(collection = "badge_awards")
@CompoundIndexes({
    @CompoundIndex(name = "manager_badge_month_idx", def = "{'managerId': 1, 'badgeDefinitionId': 1, 'month': 1}", unique = true)
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BadgeAward {

    @Id
    private String id;

    private String managerId;

    private String badgeDefinitionId;

    private String month;

    @CreatedDate
    private LocalDateTime awardedAt;

    private Map<String, Object> metadata;
}

