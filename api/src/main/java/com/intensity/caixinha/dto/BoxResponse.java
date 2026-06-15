package com.intensity.caixinha.dto;

import com.intensity.caixinha.entity.BoxType;

import java.time.Instant;
import java.util.UUID;

public record BoxResponse(
		UUID id,
		UUID groupId,
		String name,
		BoxType type,
		Instant createdAt,
		long experienceCount) {
}
