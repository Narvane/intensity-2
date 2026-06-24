package com.intensity.config;

import org.junit.jupiter.api.Test;

import java.util.Date;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceTest {

	@Test
	void experienceBoxTokenExpiresBeforeExperiencesToken() {
		JwtProperties properties = new JwtProperties(
				"test-secret-key-must-be-at-least-32-characters-long",
				86400,
				14400);
		JwtService jwtService = new JwtService(properties);

		String experiencesToken = jwtService.createExperiencesToken(UUID.randomUUID(), "Alice");
		String experienceBoxToken = jwtService.createExperienceBoxToken(
				UUID.randomUUID(),
				List.of(UUID.randomUUID()),
				List.of("Alice"));

		Date experiencesExpiration = jwtService.parse(experiencesToken).getExpiration();
		Date experienceBoxExpiration = jwtService.parse(experienceBoxToken).getExpiration();

		assertTrue(experienceBoxExpiration.before(experiencesExpiration));
	}
}
