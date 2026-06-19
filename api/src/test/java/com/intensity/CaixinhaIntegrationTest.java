package com.intensity;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeAll;
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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class CaixinhaIntegrationTest extends AbstractMockMvcIntegrationTest {

	private static String experienceBoxToken;
	private static String groupId;
	private static String boxId;
	private static boolean experienceAdded;

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@BeforeAll
	void resetCaixinhaTestState() {
		experienceBoxToken = null;
		groupId = null;
		boxId = null;
		experienceAdded = false;
	}

	@Test
	@Order(1)
	void setupExperienceBoxSession() throws Exception {
		ensureExperienceBoxSession();
	}

	@Test
	@Order(2)
	void createBoxInExperienceBoxSession() throws Exception {
		ensureBoxCreated();

		mockMvc.perform(get("/v1/grupos/{groupId}/caixinhas", groupId)
						.header("Authorization", "Bearer " + experienceBoxToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].name").value("Weekend ideas"))
				.andExpect(jsonPath("$[0].type").value("SAIDAS_COM_AMIGOS"));
	}

	@Test
	@Order(3)
	void listBoxesReturnsCreatedBox() throws Exception {
		ensureBoxCreated();

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
		ensureBoxCreated();
		String token = loginToken("alice@example.com");

		mockMvc.perform(get("/v1/grupos").header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(1)));

		mockMvc.perform(get("/v1/grupos/{groupId}/caixinhas", groupId)
						.header("Authorization", "Bearer " + token))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].id", notNullValue()));
	}

	@Test
	@Order(6)
	void addExperienceBeforeDelete() throws Exception {
		ensureExperienceAdded();

		mockMvc.perform(get("/v1/grupos/{groupId}/caixinhas", groupId)
						.header("Authorization", "Bearer " + experienceBoxToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$[0].experienceCount").value(1));
	}

	@Test
	@Order(7)
	void experiencesSessionCannotDeleteBox() throws Exception {
		ensureExperienceAdded();
		String token = loginToken("alice@example.com");

		mockMvc.perform(delete("/v1/caixinhas/{boxId}", boxId).header("Authorization", "Bearer " + token))
				.andExpect(status().isForbidden())
				.andExpect(jsonPath("$.code").value("FORBIDDEN"));
	}

	@Test
	@Order(8)
	void deleteBoxCascadesExperiences() throws Exception {
		ensureExperienceAdded();

		mockMvc.perform(delete("/v1/caixinhas/{boxId}", boxId)
						.header("Authorization", "Bearer " + experienceBoxToken))
				.andExpect(status().isNoContent());

		mockMvc.perform(get("/v1/grupos/{groupId}/caixinhas", groupId)
						.header("Authorization", "Bearer " + experienceBoxToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(0)));

		mockMvc.perform(get("/v1/caixinhas/{boxId}/experiencias", boxId)
						.header("Authorization", "Bearer " + experienceBoxToken))
				.andExpect(status().isNotFound())
				.andExpect(jsonPath("$.code").value("BOX_NOT_FOUND"));
	}

	private void ensureExperienceBoxSession() throws Exception {
		if (experienceBoxToken != null) {
			return;
		}

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

	private void ensureBoxCreated() throws Exception {
		ensureExperienceBoxSession();
		if (boxId != null) {
			return;
		}

		MvcResult result = mockMvc.perform(post("/v1/caixinhas")
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
				.andExpect(jsonPath("$.type").value("SAIDAS_COM_AMIGOS"))
				.andReturn();

		boxId = objectMapper.readTree(result.getResponse().getContentAsString()).get("id").asText();
	}

	private void ensureExperienceAdded() throws Exception {
		ensureBoxCreated();
		if (experienceAdded) {
			return;
		}

		mockMvc.perform(post("/v1/caixinhas/{boxId}/experiencias", boxId)
						.header("Authorization", "Bearer " + experienceBoxToken)
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

		experienceAdded = true;
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
