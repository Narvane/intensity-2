package com.intensity.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "intensity.jwt")
public record JwtProperties(
		String secret,
		long expirationSeconds,
		long experienceBoxExpirationSeconds) {
}
