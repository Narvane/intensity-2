package com.intensity.grupo.dto;

import java.time.Instant;
import java.util.UUID;

public record GroupResponse(UUID id, int memberCount, Instant createdAt) {
}
