package com.intensity;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class CaixinhaIntegrationTest {

	private static String experienceBoxToken;
	private static String groupId;

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Test
	@Order(1)
	void setupExperienceBoxSession() throws Exception {
		register("Alice", "alice@example.com");
		register("Bob", "bob@example.com");

		MvcResult result = mockMvc.perform(post("/v1/auth/grupo")
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
				.andReturn();

		JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString());
		experienceBoxToken = body.get("token").asText();
		groupId = body.get("groupId").asText();
	}

	@Test
	@Order(2)
	void createBoxInExperienceBoxSession() throws Exception {
		mockMvc.perform(post("/v1/caixinhas")
						.header("Authorization", "Bearer " + experienceBoxToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "groupId": "%s",
								  "name": "Weekend ideas",
								  "type": "SAIDAS_COM_AMIGOS"
								}
								""".formatted(groupId)))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.name").value("Weekend ideas"))
				.andExpect(jsonPath("$.type").value("SAIDAS_COM_AMIGOS"));
	}

	@Test
	@Order(3)
	void listBoxesReturnsCreatedBox() throws Exception {
		mockMvc.perform(get("/v1/grupos/{groupId}/caixinhas", groupId)
						.header("Authorization", "Bearer " + experienceBoxToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(1)))
				.andExpect(jsonPath("$[0].name").value("Weekend ideas"));
	}

	@Test
	@Order(4)
	void listGroupsRequiresAuthentication() throws Exception {
		mockMvc.perform(get("/v1/grupos")).andExpect(status().isUnauthorized());
	}

	@Test
	@Order(5)
	void experiencesSessionCanListBoxesAfterMembership() throws Exception {
		String token = loginToken("alice@example.com");

		mockMvc.perform(get("/v1/grupos").header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(1)));

		mockMvc.perform(get("/v1/grupos/{groupId}/caixinhas", groupId)
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].id", notNullValue()));
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

	private String loginToken(String email) throws Exception {
		MvcResult result = mockMvc.perform(post("/v1/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "email": "%s",
								  "password": "password123"
								}
								""".formatted(email)))
				.andExpect(status().isOk())
				.andReturn();

		return objectMapper.readTree(result.getResponse().getContentAsString()).get("token").asText();
	}
}
