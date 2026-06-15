package com.intensity.grupo.controller;

import com.intensity.common.AuthPrincipal;
import com.intensity.grupo.dto.GroupResponse;
import com.intensity.grupo.service.GrupoQueryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/v1/grupos")
public class GrupoController {

	private final GrupoQueryService grupoQueryService;

	public GrupoController(GrupoQueryService grupoQueryService) {
		this.grupoQueryService = grupoQueryService;
	}

	@GetMapping
	public List<GroupResponse> listGroups() {
		return grupoQueryService.listForPrincipal(AuthPrincipal.requireCurrent());
	}
}
