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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class CreateGroupIntegrationTest extends AbstractMockMvcIntegrationTest {

	private static String soloToken;

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Test
	@Order(1)
	void listGroupsProvisionsDefaultSoloGroup() throws Exception {
		register("Carol", "carol@example.com");
		soloToken = loginToken("carol@example.com");

		mockMvc.perform(get("/v1/groups").header("Authorization", "Bearer " + soloToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(1)))
				.andExpect(jsonPath("$[0].memberCount").value(1))
				.andExpect(jsonPath("$[0].members", hasSize(1)))
				.andExpect(jsonPath("$[0].members[0].displayName").value("Carol"));
	}

	@Test
	@Order(2)
	void repeatedListDoesNotDuplicateDefaultGroup() throws Exception {
		mockMvc.perform(get("/v1/groups").header("Authorization", "Bearer " + soloToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(1)));
	}

	@Test
	@Order(3)
	void createGroupAddsAnotherSoloGroup() throws Exception {
		mockMvc.perform(post("/v1/groups").header("Authorization", "Bearer " + soloToken))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.memberCount").value(1))
				.andExpect(jsonPath("$.members[0].displayName").value("Carol"));

		mockMvc.perform(get("/v1/groups").header("Authorization", "Bearer " + soloToken))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(2)));
	}

	@Test
	@Order(4)
	void experienceBoxSessionCannotCreateGroup() throws Exception {
		register("Alice", "alice@example.com");
		register("Bob", "bob@example.com");

		MvcResult joint = mockMvc.perform(post("/v1/auth/group")
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

		String boxToken = objectMapper.readTree(joint.getResponse().getContentAsString()).get("token").asText();

		mockMvc.perform(post("/v1/groups").header("Authorization", "Bearer " + boxToken))
				.andExpect(status().isForbidden())
				.andExpect(jsonPath("$.code").value("FORBIDDEN"));
	}

	private void register(String displayName, String email) throws Exception {
		mockMvc.perform(post("/v1/participants")
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
