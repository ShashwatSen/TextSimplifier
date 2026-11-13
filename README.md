# TextSimplifier

**An AI-powered text simplification tool that transforms complex paragraphs into clear, easy-to-understand language while preserving their original meaning.**

## The Problem

While studying and learning new technical concepts, I often encounter lengthy paragraphs, complicated explanations, and unfamiliar terminology that are difficult to understand on the first read. Understanding such content requires repeatedly reading sentences and manually breaking down complex information into simpler language, which consumes valuable time. This is a common challenge for students, beginners, and people learning in a second language. TextSimplifier addresses this problem by providing an easy way to convert complicated text into simpler, more understandable explanations.

## What It Does

TextSimplifier allows users to paste complex text into a simple web interface and select their preferred response length. The application sends the input to an Express.js backend, which securely communicates with an AI model through the OpenRouter API. The AI transforms the original text into simpler language while preserving its important meaning, facts, and context. The generated output is then returned to the frontend and displayed to the user.

## AI Integration

**API:** OpenRouter API

**Model:** `openai/gpt-4o-mini`

**AI Endpoint:** `https://openrouter.ai/api/v1/chat/completions`

**Location:** `Backend/main.js` → `generateAIResponse()` function

**Backend Route:** `POST /api/generate`

**What the AI does:** Simplifies complex text into clear, easy-to-understand language while preserving important information and following the user's selected word limit.

### How AI Integration Works

1. The user enters complex text and selects a response length.
2. The frontend sends the input and word limit to the Express backend.
3. The backend validates the input.
4. The `generateAIResponse()` function sends a structured prompt to OpenRouter.
5. The AI generates simplified text.
6. The backend returns the generated result.
7. The frontend displays the simplified text.

**Security:** The OpenRouter API key is stored in backend environment variables using `process.env.OPENROUTER_API_KEY`. It is never exposed in frontend code.

## What I Intentionally Excluded

- **User Authentication:** No login or registration system because the core functionality does not require individual user accounts.
- **Text History and Database:** No persistent storage because users can simplify text without needing to save previous sessions.
- **Document Uploads:** Limited the initial version to direct text input to keep the application focused on its primary purpose and avoid additional file-processing complexity.

## Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Frontend structure |
| CSS3 | Frontend styling |
| JavaScript | Frontend functionality and API requests |
| Node.js | Backend runtime |
| Express.js | Backend API and request handling |
| OpenRouter | AI API integration |
| GPT-4o-mini | Text simplification |
| Render | Backend deployment |
| Netlify | Frontend deployment |
| Git & GitHub | Version control and source code management |

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Checks backend server availability |
| POST | `/api/generate` | Generates simplified text using AI |

### Request Example

`POST /api/generate`

```json
{
  "input": "Your complex paragraph goes here.",
  "wordLimit": 100
}
```

### Response Example

```json
{
  "result": "Your simplified text appears here."
}
```

## Monthly Cost Calculation

**Model:** `openai/gpt-4o-mini`

**Input token rate:** $0.15 per 1 million tokens

**Output token rate:** $0.60 per 1 million tokens

**Average tokens per API call:**
- Input: ~600 tokens
- Output: ~400 tokens

**Cost per call:**

Input cost:

`(600 / 1,000,000) × $0.15 = $0.000090`

Output cost:

`(400 / 1,000,000) × $0.60 = $0.000240`

Total cost per call:

`$0.000090 + $0.000240 = $0.000330`

**Expected monthly API calls:** 300

**Monthly total:**

`300 × $0.000330 = $0.099`

**Estimated monthly AI cost: $0.10**

*Note: This is an estimate based on the token rates and usage assumptions provided in the assignment. Actual costs may vary depending on current model pricing and token consumption. Hosting costs are not included.*

## Live Deployment

**Frontend:** https://textsimplifiers.netlify.app

**Backend:** https://text-simplifier-api-hzy3.onrender.com

**Backend Health Check:** https://text-simplifier-api-hzy3.onrender.com/health

## Project Structure

```text
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

## Local Setup

### Prerequisites

- Node.js and npm
- An OpenRouter API key

### 1. Clone the Repository

```bash
git clone https://github.com/ShashwatSen/TextSimplifier.git
cd TextSimplifier
```

### 2. Install Backend Dependencies

```bash
cd Backend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file inside the `Backend` directory:

```env
OPENROUTER_API_KEY=your-openrouter-api-key
MODEL=openai/gpt-4o-mini
PORT=3000
FRONTEND_URL=http://localhost:5500
```

Never commit your actual `.env` file or expose your API key.

### 4. Start the Backend

```bash
npm start
```

The backend will run at:

`http://localhost:3000`

### 5. Run the Frontend

Open `Frontend/index.html` using VS Code Live Server or another local static web server.

Make sure the frontend's `BACKEND_URL` in `Frontend/script.js` points to:

```javascript
const BACKEND_URL = "http://localhost:3000";
```

## Future Improvements

- Support for multiple languages.
- Different simplification levels.
- Explanation of difficult words and technical terms.
- Document and PDF text extraction.
- Copy and download simplified content.

---

**Built by [Shashwat Sen](https://github.com/ShashwatSen)**

[GitHub Repository](https://github.com/ShashwatSen/TextSimplifier)
