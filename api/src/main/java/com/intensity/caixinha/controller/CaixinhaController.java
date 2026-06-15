package com.intensity.caixinha.controller;

import com.intensity.caixinha.dto.BoxResponse;
import com.intensity.caixinha.dto.CreateBoxRequest;
import com.intensity.caixinha.service.CaixinhaService;
import com.intensity.common.AuthPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/v1")
public class CaixinhaController {

	private final CaixinhaService caixinhaService;

	public CaixinhaController(CaixinhaService caixinhaService) {
		this.caixinhaService = caixinhaService;
	}

	@GetMapping("/grupos/{groupId}/caixinhas")
	public List<BoxResponse> listGroupBoxes(@PathVariable UUID groupId) {
		return caixinhaService.listByGroup(groupId, AuthPrincipal.requireCurrent());
	}

	@PostMapping("/caixinhas")
	@ResponseStatus(HttpStatus.CREATED)
	public BoxResponse createBox(@Valid @RequestBody CreateBoxRequest request) {
		return caixinhaService.create(request, AuthPrincipal.requireCurrent());
	}

	@DeleteMapping("/caixinhas/{boxId}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteBox(@PathVariable UUID boxId) {
		caixinhaService.delete(boxId, AuthPrincipal.requireCurrent());
	}
}
