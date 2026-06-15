package com.intensity.caixinha.entity;

import com.intensity.grupo.entity.Grupo;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "caixinha")
public class Caixinha {

	@Id
	private UUID id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "grupo_id", nullable = false)
	private Grupo grupo;

	@Column(nullable = false, length = 80)
	private String name;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 40)
	private BoxType type;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	protected Caixinha() {
	}

	public Caixinha(Grupo grupo, String name, BoxType type) {
		this.id = UUID.randomUUID();
		this.grupo = grupo;
		this.name = name.trim();
		this.type = type == null ? BoxType.SAIDAS_COM_AMIGOS : type;
		this.createdAt = Instant.now();
	}

	public UUID getId() {
		return id;
	}

	public Grupo getGrupo() {
		return grupo;
	}

	public String getName() {
		return name;
	}

	public BoxType getType() {
		return type;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}
}
