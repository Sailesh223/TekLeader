package com.tekion.tekleader.service;

import com.tekion.tekleader.event.BadgeAwardedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SlackNotificationService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${slack.webhook-url}")
    private String webhookUrl;

    @Value("${slack.channel}")
    private String channel;

    public void sendBadgeAwardNotification(BadgeAwardedEvent event) {
        try {
            String message = buildBlueThemedMessage(event);
            
            Map<String, Object> payload = new HashMap<>();
            payload.put("channel", channel);
            payload.put("username", "TEKLeader Bot");
            payload.put("icon_emoji", ":trophy:");
            payload.put("blocks", buildMessageBlocks(event));
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(payload, headers);
            
            restTemplate.postForEntity(webhookUrl, request, String.class);
            
            log.info("Slack notification sent successfully for badge award to: {}", event.getManagerName());
        } catch (Exception e) {
            log.error("Failed to send Slack notification for badge award", e);
        }
    }

    private String buildBlueThemedMessage(BadgeAwardedEvent event) {
        return String.format(
            "🔵 *Congratulations %s!* 🔵\n\n" +
            "You are now an *Elite Warrior* 🛡️⚔️\n\n" +
            "Badge Awarded: *Premium Badge* 🏆\n" +
            "Awarded By: %s\n" +
            "Remarks: _%s_\n\n" +
            "Keep up the amazing work! 💙",
            event.getManagerName(),
            event.getAwardedBy(),
            event.getReason()
        );
    }

    private Object[] buildMessageBlocks(BadgeAwardedEvent event) {
        return new Object[] {
            Map.of(
                "type", "header",
                "text", Map.of(
                    "type", "plain_text",
                    "text", "🔵 Elite Warrior Badge Awarded! 🔵",
                    "emoji", true
                )
            ),
            Map.of("type", "divider"),
            Map.of(
                "type", "section",
                "text", Map.of(
                    "type", "mrkdwn",
                    "text", String.format(
                        "*Congratulations %s!* :blue_heart:\n\n" +
                        "You have been recognized as an *Elite Warrior* :crossed_swords::shield:\n\n" +
                        "*Badge:* Premium Badge :trophy:\n" +
                        "*Awarded By:* %s\n" +
                        "*Month:* %s\n" +
                        "*Remarks:* _%s_",
                        event.getManagerName(),
                        event.getAwardedBy(),
                        event.getMonth(),
                        event.getReason()
                    )
                )
            ),
            Map.of("type", "divider"),
            Map.of(
                "type", "context",
                "elements", new Object[] {
                    Map.of(
                        "type", "mrkdwn",
                        "text", "🔵 TEKLeader | Elite Warriors Program 🔵"
                    )
                }
            )
        };
    }
}

