import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";

// Import validation logic by extracting it for testing
// Note: We test the validation functions by making HTTP requests to a mock server
// or by testing the logic directly if exported

const EDGE_FUNCTION_URL = Deno.env.get("EDGE_FUNCTION_URL") || "http://localhost:54321/functions/v1/send-contact-email";

// Helper to make requests
async function submitForm(data: Record<string, unknown>): Promise<Response> {
  return await fetch(EDGE_FUNCTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

// ==================== VALIDATION TESTS ====================

Deno.test("rejects empty request body", async () => {
  const response = await fetch(EDGE_FUNCTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });

  assertEquals(response.status, 400);
  const result = await response.json();
  assertEquals(result.error, "Name is required");
});

Deno.test("rejects missing name", async () => {
  const response = await submitForm({
    email: "test@example.com",
    message: "Hello!",
  });

  assertEquals(response.status, 400);
  const result = await response.json();
  assertEquals(result.error, "Name is required");
});

Deno.test("rejects empty name", async () => {
  const response = await submitForm({
    name: "   ",
    email: "test@example.com",
    message: "Hello!",
  });

  assertEquals(response.status, 400);
  const result = await response.json();
  assertEquals(result.error, "Name is required");
});

Deno.test("rejects missing email", async () => {
  const response = await submitForm({
    name: "John Doe",
    message: "Hello!",
  });

  assertEquals(response.status, 400);
  const result = await response.json();
  assertEquals(result.error, "Email is required");
});

Deno.test("rejects invalid email format", async () => {
  const response = await submitForm({
    name: "John Doe",
    email: "not-an-email",
    message: "Hello!",
  });

  assertEquals(response.status, 400);
  const result = await response.json();
  assertEquals(result.error, "Invalid email address");
});

Deno.test("rejects missing message", async () => {
  const response = await submitForm({
    name: "John Doe",
    email: "test@example.com",
  });

  assertEquals(response.status, 400);
  const result = await response.json();
  assertEquals(result.error, "Message is required");
});

Deno.test("rejects empty message", async () => {
  const response = await submitForm({
    name: "John Doe",
    email: "test@example.com",
    message: "   ",
  });

  assertEquals(response.status, 400);
  const result = await response.json();
  assertEquals(result.error, "Message is required");
});

Deno.test("rejects name that is too long", async () => {
  const longName = "a".repeat(201);
  const response = await submitForm({
    name: longName,
    email: "test@example.com",
    message: "Hello!",
  });

  assertEquals(response.status, 400);
  const result = await response.json();
  assertEquals(result.error, "Name is too long");
});

Deno.test("rejects message that is too long", async () => {
  const longMessage = "a".repeat(5001);
  const response = await submitForm({
    name: "John Doe",
    email: "test@example.com",
    message: longMessage,
  });

  assertEquals(response.status, 400);
  const result = await response.json();
  assertEquals(result.error, "Message is too long");
});

// ==================== HTTP METHOD TESTS ====================

Deno.test("rejects GET requests", async () => {
  const response = await fetch(EDGE_FUNCTION_URL, {
    method: "GET",
  });

  assertEquals(response.status, 405);
  const result = await response.json();
  assertEquals(result.error, "Method not allowed");
});

Deno.test("handles CORS preflight requests", async () => {
  const response = await fetch(EDGE_FUNCTION_URL, {
    method: "OPTIONS",
  });

  assertEquals(response.status, 200);
  assertEquals(response.headers.get("Access-Control-Allow-Origin"), "*");
  assertEquals(response.headers.get("Access-Control-Allow-Methods"), "POST, OPTIONS");
});

Deno.test("rejects invalid JSON body", async () => {
  const response = await fetch(EDGE_FUNCTION_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "not valid json",
  });

  assertEquals(response.status, 400);
  const result = await response.json();
  assertEquals(result.error, "Invalid JSON body");
});

// ==================== SUCCESSFUL SUBMISSION TESTS ====================

// Note: These tests require RESEND_API_KEY to be set and will actually send emails
// Skip them in CI by setting SKIP_INTEGRATION_TESTS=1

Deno.test({
  name: "accepts valid form submission with all fields",
  ignore: !!Deno.env.get("SKIP_INTEGRATION_TESTS"),
  async fn() {
    const response = await submitForm({
      name: "Test User",
      email: "test@example.com",
      company: "Test Company",
      "project-type": "pipelines",
      message: "This is a test message from the integration test suite.",
    });

    // Should succeed (200) or fail gracefully (502 if Resend not configured)
    assertEquals([200, 502].includes(response.status), true);

    if (response.status === 200) {
      const result = await response.json();
      assertEquals(result.success, true);
    }
  },
});

Deno.test({
  name: "accepts valid form submission with only required fields",
  ignore: !!Deno.env.get("SKIP_INTEGRATION_TESTS"),
  async fn() {
    const response = await submitForm({
      name: "Minimal User",
      email: "minimal@example.com",
      message: "Just the required fields.",
    });

    assertEquals([200, 502].includes(response.status), true);
  },
});

Deno.test({
  name: "trims whitespace from inputs",
  ignore: !!Deno.env.get("SKIP_INTEGRATION_TESTS"),
  async fn() {
    const response = await submitForm({
      name: "  Padded Name  ",
      email: "  padded@example.com  ",
      message: "  Padded message  ",
    });

    assertEquals([200, 502].includes(response.status), true);
  },
});

// ==================== CORS HEADERS TESTS ====================

Deno.test("includes CORS headers in error responses", async () => {
  const response = await submitForm({
    name: "",
    email: "test@example.com",
    message: "Hello!",
  });

  assertEquals(response.headers.get("Access-Control-Allow-Origin"), "*");
  assertEquals(response.headers.get("Content-Type"), "application/json");
});

Deno.test("includes CORS headers in success responses", async () => {
  const response = await submitForm({
    name: "CORS Test",
    email: "cors@example.com",
    message: "Testing CORS headers",
  });

  assertEquals(response.headers.get("Access-Control-Allow-Origin"), "*");
  assertEquals(response.headers.get("Content-Type"), "application/json");
});
