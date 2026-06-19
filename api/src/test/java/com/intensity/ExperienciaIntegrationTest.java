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

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class ExperienciaIntegrationTest extends AbstractMockMvcIntegrationTest {

	private static String aliceToken;
	private static String bobToken;
	private static String groupId;
	private static String boxId;
	private static String experienceId;
	private static String aliceSeal;

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Test
	@Order(1)
	void setupGroupAndBox() throws Exception {
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
	}

	@Test
	@Order(2)
	void createExperienceReturnsSeal() throws Exception {
		MvcResult result = mockMvc.perform(post("/v1/caixinhas/{boxId}/experiencias", boxId)
						.header("Authorization", "Bearer " + aliceToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "description": "Sunset picnic in the park",
								  "reflection": "We all need slow evenings together.",
								  "intensity": 2,
								  "parameters": { "effort": 2, "openness": 3, "novelty": 2 }
								}
								"""))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.seal", notNullValue()))
				.andExpect(jsonPath("$.summaryOnly").value(false))
				.andExpect(jsonPath("$.description").value("Sunset picnic in the park"))
				.andReturn();

		JsonNode body = objectMapper.readTree(result.getResponse().getContentAsString());
		experienceId = body.get("id").asText();
		aliceSeal = body.get("seal").asText();
	}

	@Test
	@Order(3)
	void otherMemberSeesSummaryOnly() throws Exception {
		mockMvc.perform(get("/v1/caixinhas/{boxId}/experiencias", boxId)
						.header("Authorization", "Bearer " + bobToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(1)))
				.andExpect(jsonPath("$[0].summaryOnly").value(true))
				.andExpect(jsonPath("$[0].description").doesNotExist())
				.andExpect(jsonPath("$[0].reflection").doesNotExist())
				.andExpect(jsonPath("$[0].seal").value(aliceSeal));
	}

	@Test
	@Order(4)
	void authorCanUpdateExperienceAndSealRecalculatesOnDescriptionChange() throws Exception {
		MvcResult descriptionUpdate = mockMvc.perform(put("/v1/experiencias/{experienceId}", experienceId)
						.header("Authorization", "Bearer " + aliceToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "description": "Sunset picnic by the lake",
								  "reflection": "We all need slow evenings together.",
								  "intensity": 3,
								  "parameters": { "effort": 2, "openness": 3, "novelty": 3 }
								}
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.intensity").value(3))
				.andExpect(jsonPath("$.seal", notNullValue()))
				.andReturn();

		String updatedSeal = objectMapper
				.readTree(descriptionUpdate.getResponse().getContentAsString())
				.get("seal")
				.asText();
		org.junit.jupiter.api.Assertions.assertNotEquals(aliceSeal, updatedSeal);

		mockMvc.perform(put("/v1/experiencias/{experienceId}", experienceId)
						.header("Authorization", "Bearer " + aliceToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "description": "Sunset picnic by the lake",
								  "reflection": "Updated reflection only.",
								  "intensity": 3,
								  "parameters": { "effort": 2, "openness": 3, "novelty": 3 }
								}
								"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.seal").value(updatedSeal));
	}

	@Test
	@Order(5)
	void nonAuthorCannotUpdateExperience() throws Exception {
		mockMvc.perform(put("/v1/experiencias/{experienceId}", experienceId)
						.header("Authorization", "Bearer " + bobToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "description": "Bob tries to rewrite Alice",
								  "reflection": "Not allowed",
								  "intensity": 2,
								  "parameters": { "effort": 2, "openness": 2, "novelty": 2 }
								}
								"""))
				.andExpect(status().isForbidden())
				.andExpect(jsonPath("$.code").value("NOT_AUTHOR"));
	}

	@Test
	@Order(6)
	void nonAuthorCannotDeleteExperience() throws Exception {
		mockMvc.perform(delete("/v1/experiencias/{experienceId}", experienceId)
						.header("Authorization", "Bearer " + bobToken))
				.andExpect(status().isForbidden())
				.andExpect(jsonPath("$.code").value("NOT_AUTHOR"));
	}

	@Test
	@Order(7)
	void authorCanDeleteExperience() throws Exception {
		mockMvc.perform(delete("/v1/experiencias/{experienceId}", experienceId)
						.header("Authorization", "Bearer " + aliceToken))
				.andExpect(status().isNoContent());

		mockMvc.perform(get("/v1/caixinhas/{boxId}/experiencias", boxId)
						.header("Authorization", "Bearer " + aliceToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(0)));
	}

	@Test
	@Order(8)
	void invalidIntensityReturns422() throws Exception {
		mockMvc.perform(post("/v1/caixinhas/{boxId}/experiencias", boxId)
						.header("Authorization", "Bearer " + aliceToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "description": "Too intense",
								  "reflection": "Nope",
								  "intensity": 6,
								  "parameters": { "effort": 2, "openness": 2, "novelty": 2 }
								}
								"""))
				.andExpect(status().isUnprocessableEntity());
	}

	@Test
	@Order(9)
	void experienceBoxSessionSeesFullPoolForDraw() throws Exception {
		mockMvc.perform(post("/v1/caixinhas/{boxId}/experiencias", boxId)
						.header("Authorization", "Bearer " + aliceToken)
						.contentType(MediaType.APPLICATION_JSON)
						.content("""
								{
								  "description": "Draw pool entry",
								  "reflection": "For shared moment",
								  "intensity": 3,
								  "parameters": { "effort": 3, "openness": 3, "novelty": 3 }
								}
								"""))
				.andExpect(status().isCreated());

		String experienceBoxToken = jointLoginToken();

		mockMvc.perform(get("/v1/caixinhas/{boxId}/experiencias", boxId)
						.header("Authorization", "Bearer " + experienceBoxToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].description").value("Draw pool entry"))
				.andExpect(jsonPath("$[0].summaryOnly").value(false));
	}

	private String jointLoginToken() throws Exception {
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

		return objectMapper.readTree(result.getResponse().getContentAsString()).get("token").asText();
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
