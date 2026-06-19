package com.intensity;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import com.intensity.caixinha.repository.CaixinhaRepository;
import com.intensity.grupo.repository.GrupoRepository;

import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class GrupoIntegrationTest extends AbstractMockMvcIntegrationTest {

	private static String experienceBoxToken;
	private static String aliceToken;
	private static String bobToken;
	private static String groupId;
	private static String boxId;

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private GrupoRepository grupoRepository;

	@Autowired
	private CaixinhaRepository caixinhaRepository;

	@Test
	@Order(1)
	void setupGroupWithBoxAndExperience() throws Exception {
		register("Alice", "alice@example.com");
		register("Bob", "bob@example.com");

		MvcResult joint = mockMvc.perform(post("/v1/auth/grupo")
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

		JsonNode jointBody = objectMapper.readTree(joint.getResponse().getContentAsString());
		experienceBoxToken = jointBody.get("token").asText();
		groupId = jointBody.get("groupId").asText();

		aliceToken = loginToken("alice@example.com");
		bobToken = loginToken("bob@example.com");

		MvcResult box = mockMvc.perform(post("/v1/caixinhas")
						.header("Authorization", "Bearer " + aliceToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "groupId": "%s",
								  "name": "Ideas",
								  "type": "SAIDAS_COM_AMIGOS"
								}
								""".formatted(groupId)))
				.andExpect(status().isCreated())
				.andReturn();

		boxId = objectMapper.readTree(box.getResponse().getContentAsString()).get("id").asText();

		mockMvc.perform(post("/v1/caixinhas/{boxId}/experiencias", boxId)
						.header("Authorization", "Bearer " + aliceToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "description": "Sunset picnic",
								  "reflection": "Slow evenings together.",
								  "intensity": 2,
								  "parameters": { "effort": 2, "openness": 3, "novelty": 2 }
								}
								"""))
				.andExpect(status().isCreated());
	}

	@Test
	@Order(2)
	void memberLeavesButGroupAndExperiencesRemain() throws Exception {
		mockMvc.perform(delete("/v1/grupos/{groupId}/membros", groupId)
						.header("Authorization", "Bearer " + aliceToken))
				.andExpect(status().isNoContent());

		mockMvc.perform(get("/v1/grupos/{groupId}/caixinhas", groupId)
						.header("Authorization", "Bearer " + aliceToken))
				.andExpect(status().isForbidden());

		mockMvc.perform(get("/v1/grupos/{groupId}/caixinhas", groupId)
						.header("Authorization", "Bearer " + bobToken))
				.andExpect(status().isOk());

		mockMvc.perform(get("/v1/caixinhas/{boxId}/experiencias", boxId)
						.header("Authorization", "Bearer " + bobToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(1)));
	}

	@Test
	@Order(3)
	void formerMemberCannotLeaveAgain() throws Exception {
		mockMvc.perform(delete("/v1/grupos/{groupId}/membros", groupId)
						.header("Authorization", "Bearer " + aliceToken))
				.andExpect(status().isForbidden())
				.andExpect(jsonPath("$.code").value("FORBIDDEN"));
	}

	@Test
	@Order(4)
	void lastMemberLeavingDeletesGroupCascade() throws Exception {
		mockMvc.perform(delete("/v1/grupos/{groupId}/membros", groupId)
						.header("Authorization", "Bearer " + bobToken))
				.andExpect(status().isNoContent());

		mockMvc.perform(get("/v1/grupos/{groupId}/caixinhas", groupId)
						.header("Authorization", "Bearer " + bobToken))
				.andExpect(status().isForbidden())
				.andExpect(jsonPath("$.code").value("FORBIDDEN"));

		register("Carol", "carol@example.com");
		String carolToken = loginToken("carol@example.com");
		mockMvc.perform(delete("/v1/grupos/{groupId}/membros", groupId)
						.header("Authorization", "Bearer " + carolToken));

		assertFalse(grupoRepository.findById(UUID.fromString(groupId)).isPresent());
		assertFalse(caixinhaRepository.findById(UUID.fromString(boxId)).isPresent());
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
