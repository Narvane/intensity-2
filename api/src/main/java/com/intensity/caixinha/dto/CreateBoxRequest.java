package com.intensity.caixinha.dto;

import com.intensity.caixinha.entity.BoxType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateBoxRequest(
		@NotNull UUID groupId,
		@NotBlank @Size(min = 1, max = 80) String name,
		BoxType type) {
}
