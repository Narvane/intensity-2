package com.intensity.grupo.service;

import com.intensity.common.AccessMode;
import com.intensity.common.AuthPrincipal;
import com.intensity.common.exception.ApiException;
import com.intensity.grupo.dto.GroupResponse;
import com.intensity.grupo.entity.Grupo;
import com.intensity.grupo.repository.GrupoParticipanteRepository;
import com.intensity.grupo.repository.GrupoRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class GrupoQueryService {

	private final GrupoRepository grupoRepository;
	private final GrupoParticipanteRepository grupoParticipanteRepository;

	public GrupoQueryService(
			GrupoRepository grupoRepository,
			GrupoParticipanteRepository grupoParticipanteRepository) {
		this.grupoRepository = grupoRepository;
		this.grupoParticipanteRepository = grupoParticipanteRepository;
	}

	@Transactional(readOnly = true)
	public List<GroupResponse> listForPrincipal(AuthPrincipal principal) {
		if (principal.accessMode() == AccessMode.EXPERIENCE_BOX) {
			return grupoRepository
					.findById(principal.groupId())
					.map(grupo -> List.of(new GroupResponse(
							grupo.getId(),
							(int) grupoParticipanteRepository.countMembersByGroupId(grupo.getId()),
							grupo.getCreatedAt())))
					.orElseThrow(() -> new ApiException(
							HttpStatus.NOT_FOUND, "GROUP_NOT_FOUND", "Group not found."));
		}

		return grupoParticipanteRepository.findGroupIdsByParticipantId(principal.participantId()).stream()
				.map(groupId -> grupoRepository
						.findById(groupId)
						.orElseThrow(() -> new ApiException(
								HttpStatus.NOT_FOUND, "GROUP_NOT_FOUND", "Group not found.")))
				.sorted(Comparator.comparing(Grupo::getCreatedAt).reversed())
				.map(grupo -> new GroupResponse(
						grupo.getId(),
						(int) grupoParticipanteRepository.countMembersByGroupId(grupo.getId()),
						grupo.getCreatedAt()))
				.toList();
	}
}
