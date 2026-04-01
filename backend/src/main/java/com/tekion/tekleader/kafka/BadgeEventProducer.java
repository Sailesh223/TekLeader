package com.tekion.tekleader.kafka;

import com.tekion.tekleader.event.BadgeAwardedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;

import java.util.concurrent.CompletableFuture;

@Component
@RequiredArgsConstructor
@Slf4j
public class BadgeEventProducer {

    private final KafkaTemplate<String, BadgeAwardedEvent> kafkaTemplate;

    @Value("${kafka.topics.badge-awarded}")
    private String badgeAwardedTopic;

    public void sendBadgeAwardedEvent(BadgeAwardedEvent event) {
        log.info("Sending badge awarded event for manager: {} - Badge: {}", 
            event.getManagerName(), event.getBadgeName());
        
        CompletableFuture<SendResult<String, BadgeAwardedEvent>> future = 
            kafkaTemplate.send(badgeAwardedTopic, event.getManagerId(), event);
        
        future.whenComplete((result, ex) -> {
            if (ex == null) {
                log.info("Successfully sent badge event for manager: {} to topic: {} with offset: {}",
                    event.getManagerName(), 
                    badgeAwardedTopic,
                    result.getRecordMetadata().offset());
            } else {
                log.error("Failed to send badge event for manager: {}", event.getManagerName(), ex);
            }
        });
    }
}

