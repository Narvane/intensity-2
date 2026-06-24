package com.intensity.group.controller;

import com.intensity.common.AuthPrincipal;
import com.intensity.group.dto.GroupResponse;
import com.intensity.group.service.GroupQueryService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/v1/groups")
public class GroupController {

	private final GroupQueryService groupQueryService;

	public GroupController(GroupQueryService groupQueryService) {
		this.groupQueryService = groupQueryService;
	}

	@GetMapping
	public List<GroupResponse> listGroups() {
		return groupQueryService.listForPrincipal(AuthPrincipal.requireCurrent());
	}

	@PostMapping
	@ResponseStatus(HttpStatus.CREATED)
	public GroupResponse createGroup() {
		return groupQueryService.createForPrincipal(AuthPrincipal.requireCurrent());
	}
}
