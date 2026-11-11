# TextSimplifier --- High-Level Design (HLD)

**Project:** TextSimplifier \
**Document Version:** 1.0 \
**Status:** MVP \
**Architecture Style:** Client--server, REST API, external AI service \
**Last Updated:** 2026-11-11

------------------------------------------------------------------------

## 1. Purpose

This document describes the high-level architecture of TextSimplifier:
its major components, responsibilities, interactions, data flow, API
boundary, security considerations, deployment model, and possible future
improvements.

TextSimplifier is an AI-powered web application that converts complex
paragraphs into clearer, easier-to-understand language while preserving
important meaning and context. Users can also specify a preferred
response length.

This HLD describes the architecture documented in the project README.
Recommendations for production hardening and future growth are
identified separately from the current MVP design.

## 2. Scope

### In scope

-   Browser-based text input and result presentation.
-   Selection of a desired response word limit.
-   Frontend-to-backend communication over HTTP.
-   Backend request validation and orchestration.
-   AI generation through OpenRouter.
-   Health-check endpoint.
-   Deployment of the frontend and backend as separate services.

### Out of scope for the current MVP

-   User accounts and authentication.
-   Database or persistent request history.
-   PDF or document upload and extraction.
-   User profiles and saved preferences.
-   Multi-model selection in the user interface.
-   Persistent storage of submitted text or generated output.

## 3. System Context

The user interacts with a static web frontend. The frontend sends the
input text and requested word limit to the Express backend. The backend
validates the request, constructs the AI prompt, and calls the
OpenRouter Chat Completions API using a server-side API key. The backend
returns the generated text to the frontend for display.

``` mermaid
flowchart LR
    U[User] -->|Enters text and word limit| F[Web Frontend]
    F -->|POST /api/generate| B[Express Backend]
    B -->|Prompt and model request| O[OpenRouter API]
    O -->|Generated simplified text| B
    B -->|JSON result| F
    F -->|Displays result| U
```

### External dependencies

  Dependency             Purpose
  ---------------------- ---------------------------------
  OpenRouter API         Provides access to the AI model
  `openai/gpt-4o-mini`   Generates simplified text
  Render                 Hosts the backend service
  Netlify                Hosts the frontend
  Browser                Runs the frontend application

## 4. Architecture Overview

The system uses a simple three-part logical architecture:

1.  **Presentation layer:** HTML, CSS, and browser-side JavaScript.
2.  **Application layer:** Node.js and Express, responsible for
    validation, API routing, prompt construction, and response handling.
3.  **AI integration layer:** OpenRouter API, which provides model
    inference.

There is no application database in the current design. Requests are
processed synchronously, and the result is returned to the requesting
browser.

``` mermaid
flowchart TB
    subgraph Client["Client / Presentation Layer"]
        UI["Frontend UI<br/>index.html + styles.css"]
        JS["Frontend Logic<br/>script.js"]
        UI <--> JS
    end

    subgraph Server["Application Layer — Node.js / Express"]
        ROUTE["HTTP Routes<br/>server.js"]
        AI["AI Response Module<br/>main.js"]
        VALIDATE["Input Validation"]
        PROMPT["Prompt Construction"]
        ROUTE --> VALIDATE
        VALIDATE --> AI
        AI --> PROMPT
    end

    subgraph External["External AI Service"]
        API["OpenRouter Chat Completions API"]
        MODEL["openai/gpt-4o-mini"]
        API --> MODEL
    end

    JS -->|"HTTPS JSON request"| ROUTE
    PROMPT -->|"Authenticated API request"| API
    API -->|"AI completion"| AI
    AI --> ROUTE
    ROUTE -->|"JSON response"| JS
```

## 5. Component Design

### 5.1 Frontend

**Technology:** HTML5, CSS3, JavaScript

**Project location:** `Frontend/`

**Files documented in the repository:**

-   `index.html` --- page structure and user interface.
-   `styles.css` --- layout, visual styling, and responsive
    presentation.
-   `script.js` --- input handling and backend API communication.

**Responsibilities:**

-   Present the text input area.
-   Allow the user to enter or paste complex text.
-   Collect the selected word limit.
-   Validate required client-side fields for usability.
-   Send the request to the backend.
-   Show progress while a request is being processed.
-   Display the simplified result.
-   Present useful error feedback when a request fails.

The frontend must not contain the OpenRouter API key or call the
OpenRouter endpoint directly. It communicates only with the application
backend.

### 5.2 Backend API and Application Server

**Technology:** Node.js and Express.js

**Project location:** `Backend/`

**Files documented in the repository:**

-   `server.js` --- backend server and HTTP route handling.
-   `main.js` --- AI response generation logic.
-   `package.json` --- backend dependencies and scripts.
-   `.env.example` --- example environment configuration.

**Responsibilities:**

-   Start the Express application.
-   Expose the application API endpoints.
-   Accept and validate incoming JSON requests.
-   Pass valid input to the AI generation module.
-   Return the generated result in a consistent JSON response.
-   Handle failures from the AI provider.
-   Expose a health-check route.

### 5.3 AI Integration Module

**Location:** `Backend/main.js`\
**Function:** `generateAIResponse()`

**Provider:** OpenRouter\
**Model:** `openai/gpt-4o-mini`\
**Endpoint:** `https://openrouter.ai/api/v1/chat/completions`

The AI module receives the user's text and desired word limit,
constructs a structured instruction, and sends a request to OpenRouter.

The prompt should instruct the model to:

-   Rewrite complex language in simpler, clearer wording.
-   Preserve the original facts, intent, and important context.
-   Avoid adding claims that are not supported by the input.
-   Respect the requested response length as closely as practical.
-   Return the simplified text in a form suitable for display.

The backend receives the model response and passes the generated text to
the API route for delivery to the frontend.

## 6. Request and Response Flow

### 6.1 Text Simplification Flow

``` mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant Backend as Express Backend
    participant AI as generateAIResponse()
    participant OpenRouter

    User->>Frontend: Enter text and select word limit
    User->>Frontend: Click Generate
    Frontend->>Frontend: Validate required input
    Frontend->>Backend: POST /api/generate
    Backend->>Backend: Validate request body
    Backend->>AI: Pass text and word limit
    AI->>AI: Construct simplification prompt
    AI->>OpenRouter: Send authenticated completion request
    OpenRouter-->>AI: Return generated completion
    AI-->>Backend: Return generated text
    Backend-->>Frontend: JSON response { result }
    Frontend-->>User: Display simplified text
```

### 6.2 Detailed processing steps

1.  The user enters a paragraph in the frontend.
2.  The user selects the desired response word limit.
3.  The frontend sends a JSON request to `POST /api/generate`.
4.  The backend validates the input and word-limit value.
5.  The backend invokes `generateAIResponse()`.
6.  The AI module constructs the prompt and sends it to OpenRouter.
7.  OpenRouter processes the request using the configured model.
8.  The AI module extracts the generated text.
9.  The backend returns the result as JSON.
10. The frontend displays the simplified text.

### 6.3 Health Check Flow

The hosting platform or an operator can request `GET /health` to check
whether the backend server is responding.

``` mermaid
sequenceDiagram
    actor Monitor
    participant Backend as Express Backend
    Monitor->>Backend: GET /health
    Backend-->>Monitor: Health response
```

A successful health check confirms that the backend process can respond
to HTTP requests. It does not necessarily prove that OpenRouter is
reachable or that AI generation is operational.

## 7. API Design

The backend exposes the following documented endpoints.

### 7.1 Generate Simplified Text

  Property       Value
  -------------- -----------------------------------
  Method         `POST`
  Path           `/api/generate`
  Content-Type   `application/json`
  Purpose        Generate simplified text using AI

**Request body:**

``` json
{
  "input": "Your complex paragraph goes here.",
  "wordLimit": 100
}
```

**Successful response:**

``` json
{
  "result": "The simplified text appears here."
}
```

**Error response --- recommended consistent format:**

``` json
{
  "error": "A useful error message."
}
```

The exact error response and HTTP status codes should follow the
implementation in `server.js`. The example above is a recommended API
convention, not a claim about every currently implemented error path.

**Validation requirements:**

-   `input` must be present and contain non-whitespace text.
-   `input` must be a string.
-   `wordLimit` must be a valid positive number within the application's
    configured bounds.
-   Requests exceeding the configured input-size limit should be
    rejected.
-   Invalid requests should not be forwarded to the AI provider.

### 7.2 Health Check

  Property   Value
  ---------- ---------------------------------
  Method     `GET`
  Path       `/health`
  Purpose    Check backend HTTP availability

The endpoint should return a successful status and a small response
indicating that the server is running.

## 8. Data Design

### 8.1 Data Model

The current MVP is stateless and does not use a database.

The request data exists only to complete the current generation
operation:

  Field         Type     Description
  ------------- -------- -------------------------------------
  `input`       String   Original text submitted by the user
  `wordLimit`   Number   Preferred output word limit
  `result`      String   AI-generated simplified text

### 8.2 Data Lifecycle

``` mermaid
flowchart TD
    A[User enters text] --> B[Frontend request]
    B --> C[Backend processes request]
    C --> D[OpenRouter generates output]
    D --> E[Backend returns result]
    E --> F[Frontend displays result]
    F --> G[Request lifecycle ends]
```

No persistent text history or user records are part of the current MVP.
Application logs should avoid storing full user-submitted text or
generated content unless there is a clear operational need and an
appropriate privacy policy.

## 9. Security Design

### 9.1 API Key Protection

-   Store `OPENROUTER_API_KEY` in backend environment variables.
-   Never commit real credentials to Git.
-   Never expose the key in frontend JavaScript or browser responses.
-   Use `.env.example` to document variable names without real secret
    values.

### 9.2 Input Validation

-   Validate the request body on the backend.
-   Reject missing, empty, or incorrectly typed input.
-   Enforce maximum input and output limits.
-   Validate the requested word limit.
-   Treat user input as untrusted data.

### 9.3 Network Security

-   Use HTTPS for deployed frontend-to-backend communication.
-   Configure CORS to allow only the intended frontend origin in
    production.
-   Use request timeouts for external AI calls.
-   Avoid returning internal stack traces or secrets to clients.

### 9.4 Abuse and Reliability Controls

Recommended production hardening:

-   Add rate limiting to the generation endpoint.
-   Limit request body size.
-   Handle provider timeouts and service errors.
-   Avoid automatic repeated AI requests after failures.
-   Monitor request volume and AI usage to control costs.

## 10. Deployment Architecture

The frontend and backend are deployed independently.

``` mermaid
flowchart TB
    USER[User Browser]

    subgraph Hosting["Hosting Providers"]
        NETLIFY["Netlify<br/>Static Frontend"]
        RENDER["Render<br/>Node.js / Express Backend"]
    end

    subgraph AIProvider["External Provider"]
        OPENROUTER["OpenRouter API"]
        GPT["openai/gpt-4o-mini"]
        OPENROUTER --> GPT
    end

    USER -->|"Loads website"| NETLIFY
    NETLIFY -->|"HTTPS API request"| RENDER
    RENDER -->|"API key kept server-side"| OPENROUTER
    OPENROUTER -->|"Generated text"| RENDER
    RENDER -->|"JSON response"| NETLIFY
```

### Frontend Deployment

  Property      Configuration
  ------------- ----------------
  Platform      Netlify
  Source        `Frontend/`
  Type          Static website
  Entry point   `index.html`

The frontend must use the deployed backend URL as its API base URL.

### Backend Deployment

  Property        Configuration
  --------------- -----------------------
  Platform        Render
  Runtime         Node.js
  Source          `Backend/`
  Start command   `npm start`
  Configuration   Environment variables

Environment variables documented by the project:

``` env
OPENROUTER_API_KEY=your-openrouter-api-key
MODEL=openai/gpt-4o-mini
PORT=3000
FRONTEND_URL=http://localhost:5500
```

Production values must be configured in the hosting provider's
environment settings. The production frontend origin should replace the
local development origin in the backend CORS configuration.

## 11. Error Handling

The system should handle failures at each boundary.

  -----------------------------------------------------------------------
  Failure scenario                    Expected behavior
  ----------------------------------- -----------------------------------
  Empty input                         Reject request and ask user to
                                      enter text

  Invalid word limit                  Reject request with a validation
                                      message

  Invalid request body                Return a client error

  Backend unavailable                 Frontend displays a connection
                                      error

  OpenRouter authentication failure   Backend logs a safe diagnostic and
                                      returns a generic error

  OpenRouter rate limit               Return a suitable temporary failure
                                      message

  AI provider timeout                 Stop waiting after the configured
                                      timeout and return an error

  Unexpected AI response              Handle missing or malformed
                                      generated content

  Unexpected backend exception        Return a generic server error
                                      without exposing internals
  -----------------------------------------------------------------------

The frontend should preserve the user's input after a failed request so
that the user can retry without retyping it.

## 12. Non-Functional Requirements

### Performance

-   Keep the frontend lightweight.
-   Avoid unnecessary API calls.
-   Use a reasonable timeout for AI generation.
-   Show a loading state while waiting for the provider.

### Availability

-   The backend should expose a health-check endpoint.
-   The frontend should handle temporary backend or provider outages.
-   AI generation availability depends on the external provider.

### Scalability

The stateless application design allows multiple backend instances to
process independent requests if traffic increases and the hosting
platform supports scaling.

The AI provider remains an external dependency and may impose rate
limits or usage quotas.

### Maintainability

-   Keep HTTP routing separate from AI generation logic.
-   Keep configuration in environment variables.
-   Use consistent API response conventions.
-   Document setup and deployment steps.

### Usability

-   Keep the primary text simplification workflow straightforward.
-   Provide clear input and output areas.
-   Show progress and useful error messages.
-   Support common desktop and mobile browser sizes.

## 13. Scalability and Future Architecture

The current MVP intentionally avoids a database and background job
system. These can be introduced only when product requirements justify
them.

  Future requirement              Possible architectural addition
  ------------------------------- ------------------------------------------
  Save previous results           Database and authenticated user accounts
  Handle long-running jobs        Background queue and worker
  Support multiple AI providers   AI provider abstraction layer
  Usage quotas                    Rate limiter and usage tracking
  Multiple languages              Language-aware prompt configuration
  Document uploads                File storage and text extraction service
  Operational monitoring          Structured logs, metrics, and alerting

These are future options, not components currently required by the MVP.

## 14. Key Architecture Decisions

  -----------------------------------------------------------------------
  Decision                            Rationale
  ----------------------------------- -----------------------------------
  Static frontend                     Simple deployment and low
                                      infrastructure overhead

  Express backend                     Centralizes API handling and AI
                                      integration

  OpenRouter integration              Provides access to the selected AI
                                      model through one API

  GPT-4o-mini                         Configured model for the current
                                      simplification workflow

  No database                         Persistent storage is unnecessary
                                      for the initial use case

  No authentication                   Users can access the core feature
                                      without accounts

  Separate frontend/backend           Allows independent deployment and
  deployments                         configuration
  -----------------------------------------------------------------------

## 15. Risks and Mitigations

  -----------------------------------------------------------------------
  Risk                                Mitigation
  ----------------------------------- -----------------------------------
  AI changes the original meaning     Use explicit preservation
                                      instructions and evaluate outputs

  AI response exceeds requested       Include word-limit instructions and
  length                              validate output where appropriate

  Provider outage                     Show an error and allow manual
                                      retry

  API key exposure                    Keep credentials exclusively in
                                      backend environment variables

  Unexpected AI usage costs           Apply input limits, rate limiting,
                                      and usage monitoring

  Slow generation                     Set timeouts and provide loading
                                      feedback

  Malicious or malformed input        Validate request types and size on
                                      the backend
  -----------------------------------------------------------------------

## 16. Repository Structure

The project structure documented in the README is:

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
└── README.md
```

This HLD can be added at the repository root as `HLD.md`.

## 17. Conclusion

TextSimplifier uses a lightweight client--server architecture to make
AI-powered text simplification accessible through a web interface.

The frontend handles user interaction, the Express backend validates
requests and securely coordinates AI generation, and OpenRouter provides
the model inference capability.

By avoiding authentication, persistent storage, and document-processing
infrastructure in the initial release, the system remains focused on its
primary purpose: helping users understand complex text more easily.

------------------------------------------------------------------------

**Related documentation:** `README.md`\
**Repository:** https://github.com/ShashwatSen/TextSimplifier
