🛡️ CodeGuardian
Security Vulnerability Scanner with Forensic Analysis & Auto-Patch Pull Requests

CodeGuardian is a DevSecOps security tool that scans GitHub repositories for vulnerabilities, traces their origin using Git forensic analysis, and automatically generates secure patches through Pull Requests.

Unlike traditional security scanners that only detect vulnerabilities, CodeGuardian identifies when and where the vulnerability was introduced in the codebase and helps developers fix it instantly.

🚀 Features
🔍 Automated Vulnerability Detection

CodeGuardian scans repositories using Semgrep static analysis to detect common security vulnerabilities such as:

SQL Injection

Hardcoded Secrets

Cross-Site Scripting (XSS)

Command Injection

Path Traversal

Insecure API Usage

🧠 Security Forensics Engine

CodeGuardian performs Git forensic analysis to determine:

The commit where the vulnerability was introduced

The developer responsible for the change

The timestamp of the commit

The commit message summary

This helps teams understand security debt and vulnerability origins.

🛠 Automatic Patch Generation

For supported vulnerabilities, CodeGuardian generates secure code patches automatically.

Example:

Before

db.query("SELECT * FROM users WHERE id=" + id)

After

db.query("SELECT * FROM users WHERE id=?", [id])
🔁 One-Click Auto Fix & Pull Request

CodeGuardian automates the entire remediation process:

Applies the generated patch

Creates a new Git branch

Commits the fix

Pushes the branch to GitHub

Automatically opens a Pull Request

This allows developers to review and merge fixes quickly.

📊 Security Timeline

CodeGuardian analyzes Git history to generate a security timeline showing how vulnerabilities evolved across commits.

This helps teams understand:

When vulnerabilities appeared

How security debt accumulated

How code changes impacted security

🧠 How It Works
Repository URL
      ↓
Clone Repository
      ↓
Static Security Scan (Semgrep)
      ↓
Detect Vulnerable Lines
      ↓
Git Forensics (git blame)
      ↓
Generate Secure Patch
      ↓
Commit Fix
      ↓
Create Pull Request
🏗 Project Architecture
Frontend (React.js)
       ↓
Node.js Backend (Express)
       ↓
Security Engine (Semgrep)
       ↓
Git Forensics (Git Blame / Git Log)
       ↓
GitHub Integration (Octokit API)
🛠 Tech Stack

React.js

Node.js

Express.js

JavaScript

TypeScript

Semgrep

Git

GitHub API

Octokit

HTML

CSS

⚙️ Installation
1️⃣ Clone the repository
git clone https://github.com/YOUR_USERNAME/CodeGuardian.git
cd CodeGuardian
2️⃣ Install dependencies
npm install
3️⃣ Setup environment variables

Create a .env file:

GITHUB_TOKEN=your_github_token_here
4️⃣ Start the backend
node local-server.js

Server will run on:

http://localhost:3001
5️⃣ Start the frontend
cd codeguardian-ui
npm install
npm start

Frontend will run on:

http://localhost:3000
📷 Example Workflow

1️⃣ Enter GitHub repository URL
2️⃣ CodeGuardian scans for vulnerabilities
3️⃣ Vulnerabilities appear on dashboard
4️⃣ Apply automatic patch
5️⃣ Pull request generated with secure fix

🎯 Problem It Solves

Modern software projects frequently contain hidden security vulnerabilities such as SQL injections, hardcoded secrets, insecure API usage, and command injection. While existing security tools can detect vulnerabilities, they usually only show what is vulnerable without identifying when or where the issue was introduced. Developers must manually investigate the origin of vulnerabilities and create fixes, which slows development workflows and increases security risks. CodeGuardian addresses this by combining vulnerability detection, Git forensic analysis, and automated patch generation into one tool. It scans repositories, traces vulnerabilities to the commit that introduced them, visualizes their evolution through a timeline, and automatically creates secure patches via pull requests. This helps teams detect security issues earlier, understand their origin, and fix them faster with significantly less manual effort.

⚠ Challenges Faced

One of the major challenges was linking detected vulnerabilities to the exact commit that introduced them. While Semgrep could identify vulnerable lines of code, mapping those lines back to commit history required integrating Git forensic commands like git blame. Another challenge was ensuring automatic patches were applied correctly, since matching vulnerable code snippets directly often failed due to formatting differences. This was resolved by applying patches based on line numbers instead of string matching. Additionally, integrating Semgrep with the Node.js backend caused encoding issues on Windows systems due to Python’s default character encoding, which was fixed by forcing UTF-8 encoding in the execution environment.

👨‍💻 Authors

Developed as a DevSecOps security automation project.

⭐ Future Improvements

AI-generated patch suggestions

CI/CD pipeline integration

Security risk scoring

Slack / Email security alerts

Multi-language vulnerability detection

📜 License

MIT License
