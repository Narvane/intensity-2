package com.intensity;

import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class AuthIntegrationTest extends AbstractMockMvcIntegrationTest {

	@Autowired
	private MockMvc mockMvc;

	@Test
	@Order(1)
	void registerAllowlistedEmailReturnsCreatedWithToken() throws Exception {
		mockMvc.perform(post("/v1/participantes")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "displayName": "Carol",
								  "email": "carol@example.com",
								  "password": "password123"
								}
								"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.token", notNullValue()))
				.andExpect(jsonPath("$.email").value("carol@example.com"));
	}

	@Test
	@Order(2)
	void registerNonAllowlistedEmailReturnsForbidden() throws Exception {
		mockMvc.perform(post("/v1/participantes")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "displayName": "Denied",
								  "email": "denied@example.com",
								  "password": "password123"
								}
								"""))
				.andExpect(status().isForbidden())
				.andExpect(jsonPath("$.code").value("EMAIL_NOT_ALLOWLISTED"));
	}

	@Test
	@Order(3)
	void loginExperiencesReturnsSession() throws Exception {
		register("Alice", "alice@example.com");

		mockMvc.perform(post("/v1/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "email": "alice@example.com",
								  "password": "password123"
								}
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.token", notNullValue()))
				.andExpect(jsonPath("$.accessMode").value("EXPERIENCES"))
				.andExpect(jsonPath("$.displayName").value("Alice"));
	}

	@Test
	@Order(4)
	void loginWithInvalidPasswordReturnsUnauthorized() throws Exception {
		register("Bob", "bob@example.com");

		mockMvc.perform(post("/v1/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "email": "bob@example.com",
								  "password": "wrong-password"
								}
								"""))
				.andExpect(status().isUnauthorized())
				.andExpect(jsonPath("$.code").value("INVALID_CREDENTIALS"));
	}

	@Test
	@Order(5)
	void jointLoginReturnsConflictWhenParticipantsBelongToDifferentGroups() throws Exception {
		mockMvc.perform(post("/v1/auth/grupo")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "credentials": [
								    { "email": "carol@example.com", "password": "password123" }
								  ]
								}
								"""))
				.andExpect(status().isOk());

		mockMvc.perform(post("/v1/auth/grupo")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "credentials": [
								    { "email": "bob@example.com", "password": "password123" }
								  ]
								}
								"""))
				.andExpect(status().isOk());

		mockMvc.perform(post("/v1/auth/grupo")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "credentials": [
								    { "email": "carol@example.com", "password": "password123" },
								    { "email": "bob@example.com", "password": "password123" }
								  ]
								}
								"""))
				.andExpect(status().isConflict())
				.andExpect(jsonPath("$.code").value("GROUP_MEMBERSHIP_CONFLICT"))
				.andExpect(jsonPath("$.message").value("Credentials belong to different groups."));
	}

	@Test
	@Order(6)
	void jointLoginCreatesOrReopensGroup() throws Exception {
		register("Alice", "alice@example.com");
		register("Bob", "bob@example.com");

		String firstResponse = mockMvc.perform(post("/v1/auth/grupo")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "credentials": [
								    { "email": "alice@example.com", "password": "password123" },
								    { "email": "bob@example.com", "password": "password123" }
								  ]
								}
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.groupId", notNullValue()))
				.andExpect(jsonPath("$.members", hasSize(2)))
				.andExpect(jsonPath("$.accessMode").value("EXPERIENCE_BOX"))
				.andReturn()
				.getResponse()
				.getContentAsString();

		String groupId = com.jayway.jsonpath.JsonPath.read(firstResponse, "$.groupId");

		mockMvc.perform(post("/v1/auth/grupo")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "credentials": [
								    { "email": "alice@example.com", "password": "password123" },
								    { "email": "bob@example.com", "password": "password123" }
								  ]
								}
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.groupId").value(groupId));
	}

	private void register(String displayName, String email) throws Exception {
		mockMvc.perform(post("/v1/participantes")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{
						  "displayName": "%s",
						  "email": "%s",
						  "password": "password123"
						}
						""".formatted(displayName, email)));
	}
}
