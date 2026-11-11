# TextSimplifier --- Low-Level Design (LLD)

**Project:** TextSimplifier \
**Document Version:** 1.0 \
**Status:** MVP \
**Related Document:** `HLD.md` `PRD.md` \ 
**Last Updated:** 2026-11-11

------------------------------------------------------------------------

## 1. Purpose

This document describes the implementation-level design of
TextSimplifier. It defines the responsibilities of individual files and
modules, request validation, API contracts, AI prompt construction,
error handling, configuration, and frontend interaction.

The design is based on the repository structure and technology choices
documented for the project:

-   Frontend: HTML, CSS, JavaScript
-   Backend: Node.js and Express.js
-   AI provider: OpenRouter
-   Configured model: `openai/gpt-4o-mini`
-   Main API: `POST /api/generate`
-   Health endpoint: `GET /health`

Where this document recommends behavior that may not yet exist in the
code, it is labelled as a **recommended implementation**. Verify names
and exact response shapes against the source files when implementing
changes.

## 2. Repository Structure

``` text
TextSimplifier/
│
├── Backend/
│   ├── server.js
│   ├── main.js
│   ├── package.json
│   └── .env.example
│
├── Frontend/
│   ├── index.html
│   ├── styles.css
│   └── script.js
│
├── .gitignore
├── Question.md
├── README.md
├── HLD.md
├── PRD.md
└── LLD.md
```

### File responsibilities

  -----------------------------------------------------------------------
  File                                Responsibility
  ----------------------------------- -----------------------------------
  `Frontend/index.html`               Defines the page structure and UI
                                      elements

  `Frontend/styles.css`               Defines layout, typography, colors,
                                      and responsive behavior

  `Frontend/script.js`                Handles user input, validation, API
                                      calls, and result rendering

  `Backend/server.js`                 Creates the Express server and
                                      defines HTTP endpoints

  `Backend/main.js`                   Builds the AI request and obtains
                                      generated text from OpenRouter

  `Backend/package.json`              Defines backend dependencies and
                                      run scripts

  `Backend/.env.example`              Documents required environment
                                      variables

  `.gitignore`                        Excludes local dependencies,
                                      environment files, and generated
                                      artifacts
  -----------------------------------------------------------------------

## 3. Module-Level Design

### 3.1 Frontend modules

The frontend is a static browser application. Its logic is organized
around three responsibilities.

#### A. User Interface --- `index.html`

The page should contain the following logical elements:

  -----------------------------------------------------------------------
  Element                 Suggested identifier    Purpose
  ----------------------- ----------------------- -----------------------
  Text input              `inputText`             Accepts the original
                                                  complex text

  Word-limit control      `wordLimit`             Captures the preferred
                                                  output length

  Generate button         `generateButton`        Starts simplification

  Loading indicator       `loadingIndicator`      Communicates an
                                                  in-progress request

  Result container        `resultContainer`       Displays generated text

  Result text             `resultText`            Holds the simplified
                                                  output

  Copy button             `copyButton`            Copies the generated
                                                  output

  Error message           `errorMessage`          Displays actionable
                                                  failure feedback
  -----------------------------------------------------------------------

These identifiers are a recommended DOM contract. If the current HTML
uses different IDs, the JavaScript selectors must match the actual
markup.

#### B. Styling --- `styles.css`

Responsibilities:

-   Establish a readable content layout.
-   Visually distinguish input and output sections.
-   Provide clear focus and hover states.
-   Make controls usable on small screens.
-   Keep loading and error messages visually distinguishable.
-   Preserve readable line length and spacing.

#### C. Browser logic --- `script.js`

Recommended logical functions:

  Function                           Responsibility
  ---------------------------------- ---------------------------------------
  `getFormValues()`                  Reads the text and word-limit control
  `validateInput(text, wordLimit)`   Performs client-side validation
  `setLoading(isLoading)`            Updates loading and button states
  `showError(message)`               Displays a user-facing error
  `renderResult(text)`               Displays generated text safely
  `generateText()`                   Calls the backend generation endpoint
  `copyResult()`                     Copies the result to the clipboard

These are suggested function boundaries, not assertions that every
function already exists in the repository.

### 3.2 Backend modules

#### A. HTTP server --- `Backend/server.js`

Responsibilities:

1.  Load environment configuration.
2.  Create the Express application.
3.  Register JSON body parsing middleware.
4.  Configure CORS for the frontend origin.
5.  Register the health-check endpoint.
6.  Register the text-generation endpoint.
7.  Handle unexpected errors.
8.  Start listening on the configured port.

Recommended route responsibilities:

  -----------------------------------------------------------------------
  Route                               Responsibility
  ----------------------------------- -----------------------------------
  `GET /health`                       Confirm that the backend process
                                      responds

  `POST /api/generate`                Validate the request, call the AI
                                      module, and return the result
  -----------------------------------------------------------------------

The HTTP layer should not contain the complete AI prompt or
provider-specific request construction. That responsibility belongs in
`main.js`.

#### B. AI generation module --- `Backend/main.js`

The repository documents a `generateAIResponse()` function.

Its responsibility is to isolate the provider interaction from the
Express route.

Recommended processing:

1.  Receive the original input and word limit.
2.  Validate required arguments or rely on validated route input.
3.  Construct the system and user messages.
4.  Read the API key and model from environment configuration.
5.  Send the request to OpenRouter.
6.  Check the provider response status.
7.  Extract the generated message content.
8.  Reject missing or empty generated content.
9.  Return the generated text to the caller.

The module should not access browser objects, manipulate the DOM, or
return an Express response directly.

## 4. Detailed API Design

### 4.1 `POST /api/generate`

**Purpose:** Generate a simplified version of the submitted text.

**Request headers:**

``` http
Content-Type: application/json
```

**Request body:**

``` json
{
  "input": "The original complex paragraph.",
  "wordLimit": 100
}
```

  ------------------------------------------------------------------------
  Field            Type                          Required Validation
  ---------------- ---------------- --------------------- ----------------
  `input`          String                             Yes Must contain
                                                          non-whitespace
                                                          text

  `wordLimit`      Number                  Yes, if the UI Must be a
                                              requires it positive integer
                                                          within
                                                          configured
                                                          bounds
  ------------------------------------------------------------------------

**Success response:**

``` json
{
  "result": "The simplified paragraph."
}
```

**Recommended error response:**

``` json
{
  "error": "Please enter some text."
}
```

**Recommended HTTP status codes:**

    Status Meaning                   Example
  -------- ------------------------- ---------------------------------------
     `200` Successful generation     AI output returned
     `400` Invalid request           Missing text or invalid word limit
     `413` Request too large         Input exceeds configured body limit
     `429` Rate limit exceeded       Too many requests from a client
     `502` AI provider failure       Provider returns an unusable response
     `504` AI provider timeout       Generation exceeds timeout
     `500` Unexpected server error   Unhandled application failure

The exact status codes and response keys should be kept consistent with
the implementation and frontend error handling.

### 4.2 `GET /health`

**Purpose:** Check whether the backend HTTP process is running.

**Success response example:**

``` json
{
  "status": "ok"
}
```

A successful health response does not guarantee that OpenRouter is
available. If provider availability monitoring is needed, implement a
separate readiness check rather than making every health probe consume
an AI request.

## 5. Backend Request Processing

### 5.1 Route processing sequence

``` mermaid
flowchart TD
    A[POST /api/generate] --> B[Parse JSON body]
    B --> C{Input is a non-empty string?}
    C -- No --> D[Return 400 validation error]
    C -- Yes --> E{Word limit valid?}
    E -- No --> D
    E -- Yes --> F[Call generateAIResponse]
    F --> G[Build prompt]
    G --> H[Call OpenRouter]
    H --> I{Provider response successful?}
    I -- No --> J[Handle provider error]
    I -- Yes --> K[Extract generated content]
    K --> L{Content is usable?}
    L -- No --> J
    L -- Yes --> M[Return JSON result]
```

### 5.2 Recommended route pseudocode

``` js
app.post("/api/generate", async (req, res) => {
  try {
    const { input, wordLimit } = req.body ?? {};

    if (typeof input !== "string" || input.trim().length === 0) {
      return res.status(400).json({
        error: "Please enter some text."
      });
    }

    if (!Number.isInteger(wordLimit) || wordLimit <= 0) {
      return res.status(400).json({
        error: "Please provide a valid word limit."
      });
    }

    const result = await generateAIResponse(
      input.trim(),
      wordLimit
    );

    return res.status(200).json({ result });
  } catch (error) {
    console.error("Text generation failed:", error.message);

    return res.status(502).json({
      error: "Unable to generate simplified text right now."
    });
  }
});
```

This is an implementation template. Add configured maximum input and
word-limit checks before calling the AI provider. Distinguish provider
failures, timeouts, and internal errors if the application needs
different status codes.

## 6. AI Integration Design

### 6.1 Provider configuration

  Setting            Value
  ------------------ -------------------------------------------------
  Provider           OpenRouter
  API endpoint       `https://openrouter.ai/api/v1/chat/completions`
  Model              `openai/gpt-4o-mini`
  Authentication     Bearer token
  API key location   Backend environment variable

The model should be configurable using an environment variable so that
changing models does not require editing frontend code.

### 6.2 Environment variables

Recommended configuration:

``` env
OPENROUTER_API_KEY=your-api-key
MODEL=openai/gpt-4o-mini
PORT=3000
FRONTEND_URL=http://localhost:5500
```

Do not commit a real `.env` file. Keep `.env.example` limited to
placeholder values.

### 6.3 Prompt design

The AI prompt should clearly separate the model's instructions from the
user's input.

**Recommended system instruction:**

``` text
You are a text simplification assistant.

Rewrite the user's text in clear, simple language.

Requirements:
1. Preserve the original meaning and important facts.
2. Use common words and straightforward sentences.
3. Break long or complicated sentences into shorter sentences
   when doing so improves clarity.
4. Do not add facts, examples, or claims that are not supported
   by the original text.
5. Respect the requested word limit as closely as possible.
6. Return only the simplified text.
```

**Recommended user message structure:**

``` text
Simplify the following text.

Preferred word limit: 100 words.

Text:
<user-provided text>
```

The application should treat submitted text as untrusted content. The
prompt should make clear that the text is material to transform, not
instructions that override the simplification task.

### 6.4 OpenRouter request

Recommended request structure:

``` js
const response = await fetch(
  "https://openrouter.ai/api/v1/chat/completions",
  {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.MODEL || "openai/gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: userPrompt
        }
      ]
    })
  }
);
```

The implementation must check `response.ok` before attempting to use the
generated content.

### 6.5 Response extraction

OpenRouter Chat Completions responses commonly expose generated content
at:

``` js
data.choices[0].message.content
```

Recommended checks:

-   The response body is valid JSON.
-   `choices` exists and contains an item.
-   `message.content` exists.
-   The extracted content is a non-empty string.

If any check fails, the backend should return a controlled error instead
of sending `undefined` or malformed output to the frontend.

## 7. Frontend Interaction Design

### 7.1 Generate action

Recommended behavior:

1.  Read the input text and word limit.
2.  Reject empty or invalid values.
3.  Disable the Generate button.
4.  Show the loading indicator.
5.  Send a JSON request to the configured backend URL.
6.  Parse the response.
7.  If successful, render the result.
8.  If unsuccessful, show a useful error.
9.  Restore the button and loading state in all cases.

### 7.2 Frontend pseudocode

``` js
async function generateText() {
  const input = inputText.value.trim();
  const wordLimit = Number(wordLimitInput.value);

  if (!input) {
    showError("Please enter some text.");
    return;
  }

  setLoading(true);
  clearError();

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/generate`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          input,
          wordLimit
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Generation failed.");
    }

    renderResult(data.result);
  } catch (error) {
    showError(error.message || "Unable to connect to the server.");
  } finally {
    setLoading(false);
  }
}
```

`API_BASE_URL` should point to the local backend during development and
the deployed backend in production. Do not place provider credentials in
this file.

### 7.3 Safe result rendering

Generated content must be treated as untrusted text. Prefer:

``` js
resultElement.textContent = result;
```

Avoid inserting generated content with `innerHTML` unless it is
sanitized using a suitable, maintained HTML sanitizer. Plain text is
sufficient for the current product.

### 7.4 Copy action

The Copy button should:

1.  Read the displayed simplified text.
2.  Use the browser Clipboard API where available.
3.  Show a success message when copying succeeds.
4.  Show a fallback error if clipboard access is unavailable or denied.

## 8. Input Validation Rules

Validation should happen on both the frontend and backend. Frontend
validation improves usability; backend validation is authoritative.

  Input          Rule                                Failure behavior
  -------------- ----------------------------------- ----------------------------------
  `input`        Required string                     Return `400`
  `input`        Not whitespace-only                 Return `400`
  `input`        Within configured character limit   Return `400` or `413`
  `wordLimit`    Positive integer                    Return `400`
  `wordLimit`    Within configured allowed range     Return `400`
  Request body   Valid JSON                          Return client error
  AI result      Non-empty string                    Return controlled provider error

Choose and document the actual maximum character count and word-limit
range in one place so frontend and backend validation do not drift.

## 9. Error Handling Design

### 9.1 Error categories

  ------------------------------------------------------------------------------
  Category                       Example                 Handling
  ------------------------------ ----------------------- -----------------------
  Client validation              Empty text              Return `400`

  Request parsing                Malformed JSON          Return `400`

  Request size                   Oversized payload       Return `413`

  Authentication/configuration   Missing or invalid      Log safe diagnostic;
                                 provider key            return generic server
                                                         error

  Provider throttling            OpenRouter rate limit   Return temporary
                                                         failure; avoid rapid
                                                         retries

  Provider failure               Non-success provider    Return controlled
                                 response                gateway error

  Provider timeout               Request exceeds timeout Abort request and
                                                         return timeout error

  Invalid provider output        Missing generated       Return controlled
                                 content                 gateway error

  Unexpected exception           Unhandled code error    Return generic `500`
                                                         response
  ------------------------------------------------------------------------------

### 9.2 Error response convention

Recommended response format:

``` json
{
  "error": "A user-friendly error message."
}
```

Do not return API keys, authorization headers, provider request headers,
stack traces, or internal environment configuration to the browser.

### 9.3 Logging

Recommended server logs should include:

-   Timestamp.
-   Endpoint.
-   HTTP status.
-   Request duration.
-   Error category.
-   Provider status code, where safe.

Avoid logging complete user text, generated content, or secrets by
default.

## 10. Configuration and Environment Separation

Use different configuration values for local development and production.

  -------------------------------------------------------------------------
  Variable                Local example             Production
  ----------------------- ------------------------- -----------------------
  `PORT`                  `3000`                    Hosting platform
                                                    assigned/configured
                                                    port

  `MODEL`                 `openai/gpt-4o-mini`      Configured model

  `OPENROUTER_API_KEY`    Local secret              Render secret
                                                    environment variable

  `FRONTEND_URL`          `http://localhost:5500`   Deployed frontend
                                                    origin
  -------------------------------------------------------------------------

The backend should read the port from `process.env.PORT` and use a safe
local default only for development.

CORS should allow the local frontend origin during development and the
deployed frontend origin in production. Avoid using unrestricted origins
in production.

## 11. Security Requirements

1.  Keep the OpenRouter key exclusively on the backend.
2.  Exclude `.env` from Git.
3.  Validate all client-provided fields on the backend.
4.  Set a maximum JSON request-body size.
5.  Configure production CORS explicitly.
6.  Use HTTPS for deployed services.
7.  Set a timeout on outbound AI requests.
8.  Avoid exposing provider errors directly to users.
9.  Treat model output as plain text.
10. Consider rate limiting to prevent excessive API usage.

## 12. Testing Strategy

### 12.1 Frontend tests

  Test case                         Expected result
  --------------------------------- ------------------------------------------------------
  Submit empty text                 Validation message shown
  Submit whitespace-only text       Validation message shown
  Submit valid text                 Request sent to backend
  Submit while request is running   Duplicate submission prevented
  Successful response               Simplified text displayed
  Failed response                   Error message displayed
  Copy result                       Output copied when clipboard permission is available
  Narrow viewport                   Controls and output remain usable

### 12.2 Backend tests

  Test case                        Expected result
  -------------------------------- -------------------------------
  `GET /health`                    Successful health response
  Missing `input`                  `400` response
  Non-string `input`               `400` response
  Empty `input`                    `400` response
  Invalid `wordLimit`              `400` response
  Oversized input                  Rejected before provider call
  Valid request                    AI module invoked
  Provider returns an error        Controlled error response
  Provider times out               Controlled timeout response
  Provider returns empty content   Controlled error response

### 12.3 AI output quality checks

Evaluate a small set of representative inputs:

-   A long academic paragraph.
-   A paragraph containing technical terms.
-   A paragraph containing multiple long sentences.
-   A short paragraph that should not be unnecessarily expanded.
-   A paragraph containing numbers, dates, or named entities.

Review each result for:

-   Meaning preservation.
-   Readability.
-   Factual consistency with the source.
-   Appropriate simplification.
-   Approximate compliance with the requested word limit.

AI output quality is probabilistic. A successful HTTP response does not
guarantee a correct or faithful simplification.

## 13. Local Development Procedure

### Backend

``` bash
cd Backend
npm install
```

Create a local `.env` file using `.env.example` as a template, then add
the required provider key.

Start the server using the script defined in `Backend/package.json`, for
example:

``` bash
npm start
```

### Frontend

Open `Frontend/index.html` using a local development server, or use the
frontend workflow documented in the repository.

Ensure the frontend API base URL points to the local backend.

### Integration verification

1.  Confirm the backend starts successfully.
2.  Open `/health` and verify the response.
3.  Load the frontend.
4.  Submit a short test paragraph.
5.  Confirm the browser sends a request to `/api/generate`.
6.  Confirm the backend calls OpenRouter.
7.  Confirm the generated result appears in the frontend.
8.  Test empty input and a provider failure path.

## 14. Implementation Priorities

### Required for MVP

-   Working frontend input and result flow.
-   Backend generation endpoint.
-   OpenRouter integration.
-   Backend-only API key.
-   Request validation.
-   Loading and error states.
-   Health-check endpoint.
-   Local and deployed configuration.

### Recommended hardening

-   Request-size limit.
-   Provider timeout and abort handling.
-   Rate limiting.
-   Consistent HTTP error mapping.
-   Safe logging.
-   Explicit production CORS configuration.
-   Automated API tests.

### Future enhancements

-   Adjustable simplification levels.
-   Original-versus-simplified comparison.
-   Difficult-word explanations.
-   Multiple language support.
-   User accounts and saved history, if required.
-   Document upload and text extraction, if required.

## 15. Design Constraints and Assumptions

-   The current MVP does not persist submitted text or generated
    results.
-   The browser communicates with the Express backend, not directly with
    OpenRouter.
-   The backend uses the configured OpenRouter model.
-   Generation is request/response based; no background queue is
    required.
-   The word limit is a generation preference and may not be followed
    exactly by the model.
-   The actual DOM selectors, environment variable names, and error
    response fields must match the implementation in the repository.
-   Any recommended code or validation behavior in this document should
    be reconciled with the existing source before being treated as
    implemented functionality.

## 16. Conclusion

The low-level design keeps TextSimplifier modular while remaining small
enough for an MVP. The frontend manages user interaction, the Express
server owns validation and HTTP behavior, and the AI module isolates
OpenRouter communication.

This separation makes the application easier to test and maintain. It
also keeps provider credentials out of the browser and provides a clear
path for future improvements without requiring a complex architecture at
the current stage.

**Related documents:** `README.md`, `HLD.md`\
**Repository:** https://github.com/ShashwatSen/TextSimplifier
