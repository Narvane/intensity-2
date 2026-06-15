package com.intensity.caixinha.repository;

import com.intensity.caixinha.entity.Caixinha;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CaixinhaRepository extends JpaRepository<Caixinha, UUID> {

	List<Caixinha> findAllByGrupo_IdOrderByCreatedAtDesc(UUID groupId);
}
