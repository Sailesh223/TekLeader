package com.tekion.tekleader.kafka;

import com.tekion.tekleader.event.BadgeAwardedEvent;
import com.tekion.tekleader.service.SlackNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class BadgeEventConsumer {

    private final SlackNotificationService slackNotificationService;

    @KafkaListener(
        topics = "${kafka.topics.badge-awarded}",
        groupId = "${spring.kafka.consumer.group-id}"
    )
    public void consumeBadgeAwardedEvent(
        @Payload BadgeAwardedEvent event,
        @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
        @Header(KafkaHeaders.OFFSET) long offset
    ) {
        log.info("Received badge awarded event from partition: {} with offset: {} for manager: {}",
            partition, offset, event.getManagerName());
        
        try {
            // Send Slack notification
            slackNotificationService.sendBadgeAwardNotification(event);
            
            log.info("Successfully processed badge awarded event for manager: {}", event.getManagerName());
        } catch (Exception e) {
            log.error("Error processing badge awarded event for manager: {}", event.getManagerName(), e);
            // In production, you might want to implement retry logic or dead letter queue
        }
    }
}

