package com.intensity.common;

import com.intensity.config.JwtService;
import io.jsonwebtoken.Claims;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.UUID;

public record AuthPrincipal(
		UUID participantId,
		AccessMode accessMode,
		UUID groupId,
		List<UUID> participantIds) {

	public static AuthPrincipal fromClaims(Claims claims) {
		AccessMode mode = AccessMode.valueOf(claims.get("accessMode", String.class));

		if (mode == AccessMode.EXPERIENCES) {
			return new AuthPrincipal(
					UUID.fromString(claims.getSubject()),
					mode,
					null,
					List.of());
		}

		UUID groupId = UUID.fromString(claims.get("groupId", String.class));
		@SuppressWarnings("unchecked")
		List<String> rawIds = claims.get("participantIds", List.class);
		List<UUID> participantIds = rawIds.stream().map(UUID::fromString).toList();

		return new AuthPrincipal(participantIds.getFirst(), mode, groupId, participantIds);
	}

	public static AuthPrincipal requireCurrent() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		if (authentication == null || !(authentication.getPrincipal() instanceof AuthPrincipal principal)) {
			throw JwtService.unauthorized();
		}
		return principal;
	}
}
