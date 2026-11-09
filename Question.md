Question 1 of 1
+10
You are going to design, build, and deploy a software product that solves a real problem you have personally experienced. It must include an AI feature with the API call on your backend — never in the frontend. It must be deployed and accessible at a live URL. You must be able to explain every part of it.
This is not a tutorial. There is no starter repo. The problem, the design, and every decision are yours.
The Three Rules Before You Write a Single Line
Rule 1 — Personal Problem Only
The product must solve a problem you personally experienced. Not a problem you read about. Not a problem from a tutorial. Yours.
You must be able to finish this sentence with a specific story: "I built this because I personally had the problem of ___."
Generic answers score 0:
"I built a productivity app" → 0
"I built an AI assistant" → 0
"I built a note-taking tool" → 0
Specific answers score full marks:
"I kept forgetting to document the changes I made in PRs. My team lead sent every one back. So I built a tool where you paste your git diff and get a full PR description written for you." → full marks
"I waste 15–20 minutes every morning reading 40 Slack threads to write my standup update. I built a tool that summarises them all into a 3-line standup automatically." → full marks
If you are not sure whether your problem is specific enough — ask: would someone reading the README know exactly what frustration you experienced? If yes, it qualifies.
Rule 2 — AI Feature on Backend Only
Your product must include an AI capability (text generation, classification, summarisation, or similar). The API call to the AI model must be in your backend — never in any frontend file.
Automated scan checks every frontend file for:
API key strings (e.g. sk-, sk-or-)
AI endpoint URLs (e.g. openai.com, openrouter.ai)
AI fetch calls in component files
Any match = automatic zero for the AI criterion regardless of everything else.
Rule 3 — Deployed and Documented
Both frontend and backend must be live at real URLs. A sleep page or 404 is treated as undeployed. README must answer four specific questions (covered below in Step 6).
What You Are Building
A frontend product with:
A working UI — user can interact with it and get real output
An AI feature — meaningful AI integration, not a gimmick
A backend — Express server that handles the AI call
A live deployment — both frontend and backend URLs working
A README — four specific questions answered with specificity
A monthly cost calculation — full arithmetic shown
Submission Workflow
Step 1 — Define the Problem
Before writing any code, write one paragraph that answers:
What is the exact problem? (Describe the frustration, the wasted time, the thing that keeps failing.)
Who else has this problem? (Just you? Your team? Developers in general?)
What does success look like? (What can the user do with your product that they couldn't before?)
This paragraph becomes the opening of your README. If you cannot write it clearly before coding, the problem is not defined well enough yet.
Step 2 — Design the AI Feature
Decide what the AI does in your product. It should be the core value — not a decorative add-on.
Ask yourself: if you removed the AI feature, would the product still be useful? If yes — your AI feature is not central enough. If no — you have the right design.
Plan:
What does the user input?
What does the AI transform it into?
What does the user see?
Step 3 — Build the Backend
Create your backend with one or more API routes that handle the AI call.
mkdir my-product && cd my-product
mkdir backend && cd backend
npm init -y
npm install express cors dotenv
Your backend must:
Read the AI API key from process.env only — never hardcoded
Accept the user's input from the frontend
Call the AI API with a well-structured prompt
Return the AI output to the frontend
.env structure:
OPENROUTER_API_KEY=your-key-here
PORT=3000
.env.example (commit this, not .env):
OPENROUTER_API_KEY=your-openrouter-key-here
PORT=3000
Step 4 — Build the Frontend
Build a clean, functional UI. It does not need to be elaborate — it needs to work clearly.
The frontend must:
Accept input from the user
Call your own backend — never the AI API directly
Display the AI output clearly
Handle loading states (show something while waiting for the response)
Handle errors (show something useful if the backend call fails)
No API keys. No AI endpoint URLs. No exceptions.
Step 5 — Test End-to-End Locally
# Terminal 1 — backend
cd backend && npm start


# Terminal 2 — open frontend
# Open frontend/index.html with Live Server, or
cd frontend && npx serve .
Test the complete flow: enter real input → backend receives it → AI API called → response returned → frontend displays it correctly.
Test edge cases: empty input, very long input, backend not running. Does your UI handle these gracefully?
Step 6 — Write the README
Your README must answer all four questions. Vague answers score 0.
Question 1 — The Problem What exact problem does this solve? Include the specific friction — not "productivity" but "I wasted 15 minutes every morning doing X."
Question 2 — AI Integration Which API? Which model (exact name)? In which file and which function does the API call live? (e.g. "OpenRouter API, model openai/gpt-4o-mini, called in backend/server.js inside the generateDescription() function")
Question 3 — What You Intentionally Excluded What features did you decide not to build, and why? This demonstrates engineering judgement — knowing what to leave out is as important as knowing what to build. (e.g. "No user accounts — the tool is session-based because adding auth would take 3x longer to build and the core value doesn't require persistence.")
Question 4 — Monthly Cost Calculation Show the full arithmetic:
Model: openai/gpt-4o-mini
Input token rate: $0.15 per 1M tokens
Output token rate: $0.60 per 1M tokens
Average tokens per call: ~600 input + ~400 output
Cost per call: (600/1,000,000 × $0.15) + (400/1,000,000 × $0.60) = $0.000090 + $0.000240 = $0.000330
Expected monthly calls: 300
Monthly total: 300 × $0.000330 = $0.099 (~$0.10/month)
Final number only (no arithmetic) scores 0.
Step 7 — Deploy the Backend
Deploy to Render:
Push your code to GitHub (make sure .env is in .gitignore — not committed)
Go to render.com → New Web Service
Connect your GitHub repo
Set Root Directory: backend
Set Build Command: npm install
Set Start Command: node server.js
Under Environment Variables → Add OPENROUTER_API_KEY with your real key
Click Deploy
Wait for the deployment to complete (2–4 min). Test by opening https://your-service.onrender.com/health — should return { "status": "ok" }.
Step 8 — Deploy the Frontend
Option A — GitHub Pages (free, simplest for vanilla JS):
Push your frontend files to GitHub
Go to repo → Settings → Pages
Set Source: Deploy from a branch → main → /frontend (or /docs if you rename the folder)
Your site is live at https://your-username.github.io/your-repo
Update the BACKEND_URL in your frontend JS to the Render URL before this step
Option B — Netlify (free, also simple):
Go to netlify.com → Add new site → Deploy manually
Drag your frontend/ folder into the deploy zone
Live in under 60 seconds
Option C — Vercel (free, great for React):
Go to vercel.com → New Project → Import GitHub repo
Set the root to your frontend folder
Deploy
Add both live URLs to your README under Live Deployment.
Step 9 — Commit and Push
git add .
git commit -m "feat: [your product name] — [one line description]"
git push origin main
Step 10 — Open the Pull Request
Raise a PR against your own repo (from a feature branch to main, or as a self-review PR). This is intentional — the PR is your documentation of what you built and the decisions you made.
PR title format:
feat: [Product Name] — [one sentence problem statement]
PR description must include:
The problem in one specific sentence
Live frontend URL
Live backend URL
Confirmation that API key is in .env on the backend only
Step 11 — Record the Video
Create a 3-minute video covering exactly these three things:
Part 1 — Live Demo (~ 90 seconds) Open the deployed frontend URL on screen. Enter real input — not a test string, something genuine. Show the AI response appearing. Then explain in one sentence what problem this just solved for you.
Part 2 — One Piece of Your Own Code (~ 60 seconds) Open any file. Pick one function or block you wrote. Explain what it does AND why you wrote it that way. The why is what earns the marks — not just describing the code.
Part 3 — One Piece of AI-Generated Code (~ 30 seconds) Open a different file or section that was AI-generated. Point to it. Confirm you understand what it does and why it is correct. You do not need to have written it — you need to be able to own it.
Rules:
No slides. Real running code and real deployed URL only.
Camera on throughout.
Do not read from a script.
Upload to Google Drive. Set sharing to Anyone with the link can view.
Step 12 — Submit
Submit two items:
GitHub PR link
Google Drive video link
README Template
# [Product Name]


## The Problem
[One paragraph. Specific friction. The exact situation where the problem occurs. Who else has it.]


## What It Does
[One paragraph. Input → AI transformation → Output. What the user gets that they couldn't get before.]


## AI Integration
**API:** OpenRouter
**Model:** openai/gpt-4o-mini
**Location:** `backend/server.js` → `generateSomething()` function
**What the AI does:** [One sentence describing the transformation]


## What I Intentionally Excluded
[List 2–3 features you chose not to build, each with a specific reason why not.]


## Monthly Cost Calculation
Model: openai/gpt-4o-mini
Input: $0.15 per 1M tokens
Output: $0.60 per 1M tokens
Avg tokens per call: ~600 input + ~400 output
Cost per call: $0.000090 + $0.000240 = $0.000330
Expected calls/month: [your number]
**Monthly total: [your number] × $0.000330 = $[result]**


## Live Deployment
**Frontend:** [URL]
**Backend:** [URL]