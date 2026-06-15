package com.intensity.grupo.repository;

import com.intensity.grupo.entity.GrupoParticipante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GrupoParticipanteRepository extends JpaRepository<GrupoParticipante, GrupoParticipante.Id> {

	boolean existsById_GrupoIdAndId_ParticipanteId(UUID groupId, UUID participantId);

	@Query("SELECT gp.id.grupoId FROM GrupoParticipante gp WHERE gp.id.participanteId = :participantId")
	List<UUID> findGroupIdsByParticipantId(@Param("participantId") UUID participantId);

	@Query("SELECT COUNT(gp) FROM GrupoParticipante gp WHERE gp.id.grupoId = :groupId")
	long countMembersByGroupId(@Param("groupId") UUID groupId);
}
