package com.tekion.tekleader.config;

import com.tekion.tekleader.event.AchievementUnlockedEvent;
import com.tekion.tekleader.event.BadgeAwardedEvent;
import com.tekion.tekleader.event.FeedPostCreatedEvent;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.support.serializer.JsonSerializer;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class KafkaConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    private Map<String, Object> producerConfigs() {
        Map<String, Object> props = new HashMap<>();
        props.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        props.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        props.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);
        return props;
    }

    @Bean
    public ProducerFactory<String, BadgeAwardedEvent> badgeAwardedProducerFactory() {
        return new DefaultKafkaProducerFactory<>(producerConfigs());
    }

    @Bean
    public KafkaTemplate<String, BadgeAwardedEvent> badgeAwardedKafkaTemplate() {
        return new KafkaTemplate<>(badgeAwardedProducerFactory());
    }

    @Bean
    public ProducerFactory<String, AchievementUnlockedEvent> achievementProducerFactory() {
        return new DefaultKafkaProducerFactory<>(producerConfigs());
    }

    @Bean
    public KafkaTemplate<String, AchievementUnlockedEvent> achievementKafkaTemplate() {
        return new KafkaTemplate<>(achievementProducerFactory());
    }

    @Bean
    public ProducerFactory<String, FeedPostCreatedEvent> feedPostProducerFactory() {
        return new DefaultKafkaProducerFactory<>(producerConfigs());
    }

    @Bean
    public KafkaTemplate<String, FeedPostCreatedEvent> feedPostKafkaTemplate() {
        return new KafkaTemplate<>(feedPostProducerFactory());
    }
}

