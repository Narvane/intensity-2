package com.intensity.caixinha.service;

import com.intensity.caixinha.dto.BoxResponse;
import com.intensity.caixinha.dto.CreateBoxRequest;
import com.intensity.caixinha.entity.Caixinha;
import com.intensity.caixinha.repository.CaixinhaRepository;
import com.intensity.common.AccessMode;
import com.intensity.common.AuthPrincipal;
import com.intensity.common.exception.ApiException;
import com.intensity.grupo.entity.Grupo;
import com.intensity.experiencia.repository.ExperienciaRepository;
import com.intensity.grupo.repository.GrupoParticipanteRepository;
import com.intensity.grupo.repository.GrupoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class CaixinhaService {

	private final CaixinhaRepository caixinhaRepository;
	private final GrupoRepository grupoRepository;
	private final GrupoParticipanteRepository grupoParticipanteRepository;
	private final ExperienciaRepository experienciaRepository;

	public CaixinhaService(
			CaixinhaRepository caixinhaRepository,
			GrupoRepository grupoRepository,
			GrupoParticipanteRepository grupoParticipanteRepository,
			ExperienciaRepository experienciaRepository) {
		this.caixinhaRepository = caixinhaRepository;
		this.grupoRepository = grupoRepository;
		this.grupoParticipanteRepository = grupoParticipanteRepository;
		this.experienciaRepository = experienciaRepository;
	}

	@Transactional(readOnly = true)
	public List<BoxResponse> listByGroup(UUID groupId, AuthPrincipal principal) {
		ensureCanAccessGroup(groupId, principal);
		ensureGroupExists(groupId);

		return caixinhaRepository.findAllByGrupo_IdOrderByCreatedAtDesc(groupId).stream()
				.map(this::toResponse)
				.toList();
	}

	@Transactional
	public BoxResponse create(CreateBoxRequest request, AuthPrincipal principal) {
		UUID groupId = request.groupId();
		ensureCanCreateBox(groupId, principal);
		Grupo grupo = ensureGroupExists(groupId);

		Caixinha caixinha = new Caixinha(grupo, request.name(), request.type());
		caixinhaRepository.save(caixinha);

		return toResponse(caixinha);
	}

	@Transactional
	public void delete(UUID boxId, AuthPrincipal principal) {
		if (principal.accessMode() != AccessMode.EXPERIENCE_BOX) {
			throw forbidden();
		}

		Caixinha caixinha = caixinhaRepository
				.findById(boxId)
				.orElseThrow(() -> new ApiException(
						HttpStatus.NOT_FOUND, "BOX_NOT_FOUND", "Box not found."));

		if (!caixinha.getGrupo().getId().equals(principal.groupId())) {
			throw forbidden();
		}

		caixinhaRepository.delete(caixinha);
	}

	private Grupo ensureGroupExists(UUID groupId) {
		return grupoRepository
				.findById(groupId)
				.orElseThrow(() -> new ApiException(
						HttpStatus.NOT_FOUND, "GROUP_NOT_FOUND", "Group not found."));
	}

	private void ensureCanAccessGroup(UUID groupId, AuthPrincipal principal) {
		if (principal.accessMode() == AccessMode.EXPERIENCE_BOX) {
			if (!groupId.equals(principal.groupId())) {
				throw forbidden();
			}
			return;
		}

		ensureMember(groupId, principal.participantId());
	}

	private void ensureCanCreateBox(UUID groupId, AuthPrincipal principal) {
		if (principal.accessMode() == AccessMode.EXPERIENCE_BOX) {
			if (!groupId.equals(principal.groupId())) {
				throw forbidden();
			}
			return;
		}

		ensureMember(groupId, principal.participantId());
	}

	private void ensureMember(UUID groupId, UUID participantId) {
		if (!grupoParticipanteRepository.existsById_GrupoIdAndId_ParticipanteId(groupId, participantId)) {
			throw forbidden();
		}
	}

	private BoxResponse toResponse(Caixinha caixinha) {
		long experienceCount = experienciaRepository.countByCaixinha_Id(caixinha.getId());
		return new BoxResponse(
				caixinha.getId(),
				caixinha.getGrupo().getId(),
				caixinha.getName(),
				caixinha.getType(),
				caixinha.getCreatedAt(),
				experienceCount);
	}

	private ApiException forbidden() {
		return new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Not allowed for current session.");
	}
}
