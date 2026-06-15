package com.intensity.experiencia.service;

import com.intensity.caixinha.entity.Caixinha;
import com.intensity.caixinha.repository.CaixinhaRepository;
import com.intensity.common.AuthPrincipal;
import com.intensity.common.exception.ApiException;
import com.intensity.experiencia.dto.CreateExperienceRequest;
import com.intensity.experiencia.dto.ExperienceParametersDto;
import com.intensity.experiencia.dto.ExperienceResponse;
import com.intensity.experiencia.entity.Experiencia;
import com.intensity.experiencia.repository.ExperienciaRepository;
import com.intensity.grupo.repository.GrupoParticipanteRepository;
import com.intensity.participante.entity.Participante;
import com.intensity.participante.repository.ParticipanteRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ExperienciaService {

	private final ExperienciaRepository experienciaRepository;
	private final CaixinhaRepository caixinhaRepository;
	private final ParticipanteRepository participanteRepository;
	private final GrupoParticipanteRepository grupoParticipanteRepository;
	private final SealService sealService;
	private final ExperienceVisibilityPolicy visibilityPolicy;

	public ExperienciaService(
			ExperienciaRepository experienciaRepository,
			CaixinhaRepository caixinhaRepository,
			ParticipanteRepository participanteRepository,
			GrupoParticipanteRepository grupoParticipanteRepository,
			SealService sealService,
			ExperienceVisibilityPolicy visibilityPolicy) {
		this.experienciaRepository = experienciaRepository;
		this.caixinhaRepository = caixinhaRepository;
		this.participanteRepository = participanteRepository;
		this.grupoParticipanteRepository = grupoParticipanteRepository;
		this.sealService = sealService;
		this.visibilityPolicy = visibilityPolicy;
	}

	@Transactional(readOnly = true)
	public List<ExperienceResponse> listByBox(UUID boxId, AuthPrincipal principal) {
		Caixinha caixinha = ensureBoxExists(boxId);
		ensureCanAccessBox(caixinha, principal);

		return experienciaRepository.findAllByCaixinha_IdOrderByCreatedAtDesc(boxId).stream()
				.map(experience -> toResponse(experience, principal.participantId(), principal))
				.toList();
	}

	@Transactional
	public ExperienceResponse create(UUID boxId, CreateExperienceRequest request, AuthPrincipal principal) {
		Caixinha caixinha = ensureBoxExists(boxId);
		ensureCanAccessBox(caixinha, principal);

		Participante author = participanteRepository
				.findById(principal.participantId())
				.orElseThrow(() -> new ApiException(
						HttpStatus.UNAUTHORIZED, "INVALID_TOKEN", "Invalid or expired token."));

		String seal = sealService.computeFromDescription(request.description());
		Experiencia experiencia = new Experiencia(
				caixinha,
				author,
				request.description(),
				request.reflection(),
				request.intensity(),
				request.parameters().effort(),
				request.parameters().openness(),
				request.parameters().novelty(),
				seal);

		experienciaRepository.save(experiencia);
		return toResponse(experiencia, principal.participantId(), principal);
	}

	@Transactional
	public ExperienceResponse update(
			UUID experienceId, CreateExperienceRequest request, AuthPrincipal principal) {
		Experiencia experiencia = ensureExperienceExists(experienceId);
		ensureCanAccessBox(experiencia.getCaixinha(), principal);
		ensureAuthor(experiencia, principal.participantId());

		String seal = sealService.computeFromDescription(request.description());
		experiencia.updateContent(
				request.description(),
				request.reflection(),
				request.intensity(),
				request.parameters().effort(),
				request.parameters().openness(),
				request.parameters().novelty(),
				seal);

		return toResponse(experiencia, principal.participantId(), principal);
	}

	@Transactional
	public void delete(UUID experienceId, AuthPrincipal principal) {
		Experiencia experiencia = ensureExperienceExists(experienceId);
		ensureCanAccessBox(experiencia.getCaixinha(), principal);
		ensureAuthor(experiencia, principal.participantId());
		experienciaRepository.delete(experiencia);
	}

	private Caixinha ensureBoxExists(UUID boxId) {
		return caixinhaRepository
				.findById(boxId)
				.orElseThrow(() -> new ApiException(
						HttpStatus.NOT_FOUND, "BOX_NOT_FOUND", "Box not found."));
	}

	private Experiencia ensureExperienceExists(UUID experienceId) {
		return experienciaRepository
				.findById(experienceId)
				.orElseThrow(() -> new ApiException(
						HttpStatus.NOT_FOUND, "EXPERIENCE_NOT_FOUND", "Experience not found."));
	}

	private void ensureCanAccessBox(Caixinha caixinha, AuthPrincipal principal) {
		UUID groupId = caixinha.getGrupo().getId();

		if (principal.accessMode() == com.intensity.common.AccessMode.EXPERIENCE_BOX) {
			if (!groupId.equals(principal.groupId())) {
				throw forbidden();
			}
			return;
		}

		if (!grupoParticipanteRepository.existsById_GrupoIdAndId_ParticipanteId(
				groupId, principal.participantId())) {
			throw forbidden();
		}
	}

	private void ensureAuthor(Experiencia experiencia, UUID participantId) {
		if (!experiencia.getAuthor().getId().equals(participantId)) {
			throw new ApiException(
					HttpStatus.FORBIDDEN,
					"NOT_AUTHOR",
					"Only the author can change this experience.");
		}
	}

	private ExperienceResponse toResponse(
			Experiencia experiencia, UUID viewerId, AuthPrincipal principal) {
		boolean fullAccess = visibilityPolicy.hasFullContent(
				principal, experiencia.getAuthor().getId(), viewerId);
		ExperienceParametersDto parameters = new ExperienceParametersDto(
				experiencia.getEffort(), experiencia.getOpenness(), experiencia.getNovelty());

		return new ExperienceResponse(
				experiencia.getId(),
				experiencia.getCaixinha().getId(),
				experiencia.getAuthor().getId(),
				experiencia.getAuthor().getDisplayName(),
				fullAccess ? experiencia.getDescription() : null,
				fullAccess ? experiencia.getReflection() : null,
				experiencia.getIntensity(),
				parameters,
				experiencia.getSeal(),
				!fullAccess,
				experiencia.getCreatedAt(),
				experiencia.getUpdatedAt());
	}

	private ApiException forbidden() {
		return new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Not allowed for current session.");
	}
}
