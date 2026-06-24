package com.intensity.group.service;

import com.intensity.common.AccessMode;
import com.intensity.common.AuthPrincipal;
import com.intensity.common.exception.ApiException;
import com.intensity.group.dto.GroupMemberResponse;
import com.intensity.group.dto.GroupResponse;
import com.intensity.group.entity.Group;
import com.intensity.group.repository.GroupParticipantRepository;
import com.intensity.group.repository.GroupRepository;
import com.intensity.participant.entity.Participant;
import com.intensity.participant.repository.ParticipantRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
public class GroupQueryService {

	private final GroupRepository groupRepository;
	private final GroupParticipantRepository groupParticipantRepository;
	private final ParticipantRepository participantRepository;
	private final GroupCreationService groupCreationService;

	public GroupQueryService(
			GroupRepository groupRepository,
			GroupParticipantRepository groupParticipantRepository,
			ParticipantRepository participantRepository,
			GroupCreationService groupCreationService) {
		this.groupRepository = groupRepository;
		this.groupParticipantRepository = groupParticipantRepository;
		this.participantRepository = participantRepository;
		this.groupCreationService = groupCreationService;
	}

	@Transactional
	public List<GroupResponse> listForPrincipal(AuthPrincipal principal) {
		if (principal.accessMode() == AccessMode.EXPERIENCE_BOX) {
			return groupRepository
					.findById(principal.groupId())
					.map(group -> List.of(toResponse(group)))
					.orElseThrow(() -> new ApiException(
							HttpStatus.NOT_FOUND, "GROUP_NOT_FOUND", "Group not found."));
		}

		ensureDefaultGroupIfEmpty(principal.participantId());

		return groupParticipantRepository.findGroupIdsByParticipantId(principal.participantId()).stream()
				.map(groupId -> groupRepository
						.findById(groupId)
						.orElseThrow(() -> new ApiException(
								HttpStatus.NOT_FOUND, "GROUP_NOT_FOUND", "Group not found.")))
				.sorted(Comparator.comparing(Group::getCreatedAt).reversed())
				.map(this::toResponse)
				.toList();
	}

	@Transactional
	public GroupResponse createForPrincipal(AuthPrincipal principal) {
		ensureExperiencesMode(principal);
		Group group = groupCreationService.createSoloGroup(principal.participantId());
		return toResponse(group);
	}

	public GroupResponse toResponse(Group group) {
		List<GroupMemberResponse> members = listMembers(group.getId());
		return new GroupResponse(
				group.getId(),
				members.size(),
				group.getCreatedAt(),
				members);
	}

	private List<GroupMemberResponse> listMembers(UUID groupId) {
		List<UUID> participantIds = groupParticipantRepository.findParticipantIdsByGroupId(groupId);
		return participantRepository.findAllById(participantIds).stream()
				.sorted(Comparator.comparing(Participant::getDisplayName, String.CASE_INSENSITIVE_ORDER))
				.map(participant -> new GroupMemberResponse(participant.getId(), participant.getDisplayName()))
				.toList();
	}

	private void ensureDefaultGroupIfEmpty(UUID participantId) {
		if (groupParticipantRepository.findGroupIdsByParticipantId(participantId).isEmpty()) {
			groupCreationService.createSoloGroup(participantId);
		}
	}

	private void ensureExperiencesMode(AuthPrincipal principal) {
		if (principal.accessMode() != AccessMode.EXPERIENCES) {
			throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Not allowed for current session.");
		}
	}
}
