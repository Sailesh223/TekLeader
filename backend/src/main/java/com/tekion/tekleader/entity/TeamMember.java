package com.tekion.tekleader.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;

import java.time.LocalDateTime;

@Document(collection = "team_members")
@CompoundIndexes({
    @CompoundIndex(name = "manager_month_member_idx", def = "{'managerId': 1, 'month': 1, 'canonicalName': 1}", unique = true)
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamMember {

    @Id
    private String id;

    private String managerId;
    
    private String month;
    
    private String preferredFullName;
    
    private String canonicalName;
    
    private String preferredFirstName;
    
    private String preferredLastName;
    
    private String department;
    
    private String functionalHead;
    
    private String directorName;
    
    private String hrbp;
    
    private Integer oneOnOnesParticipated;
    
    private Integer oneOnOnesSetUp;
    
    private Boolean isUtilizing;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}

