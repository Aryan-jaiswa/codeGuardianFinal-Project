// const express = require("express");
// const multer = require("multer");
// const unzipper = require("unzipper");
// const { execSync } = require("child_process");
// const path = require("path");
// const fs = require("fs");
// const cors = require("cors");

// const app = express();
// app.use(cors());
// app.use(express.json());

// /* ================================
//    FOLDER SETUP
// ================================ */

// if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");
// if (!fs.existsSync("scans")) fs.mkdirSync("scans");

// /* ================================
//    MULTER CONFIG
// ================================ */

// const upload = multer({ dest: "uploads/" });

// /* ================================
//    PATCH GENERATOR
// ================================ */

// const patcher = {
//   generatePatch: (type, code) => {

//     if (type.includes("sql")) {
//       return "Use parameterized query: db.query('SELECT * FROM users WHERE id=?',[id])";
//     }

//     if (type.includes("secret")) {
//       return "Move secret to environment variable: process.env.API_KEY";
//     }

//     if (type.includes("xss")) {
//       return code.replace(".innerHTML", ".textContent");
//     }

//     return "// Manual review required";
//   }
// };

// /* ================================
//    FORENSICS ENGINE
// ================================ */

// const forensics = {

//   getForensics: (repoPath, filePath, line) => {

//     try {

//       const blame = execSync(
//         `git -C "${repoPath}" blame -L ${line},${line} "${filePath}" --porcelain`,
//         { encoding: "utf8" }
//       );

//       const lines = blame.split("\n");

//       return {
//         commit: lines[0].split(" ")[0],
//         author: lines.find(l => l.startsWith("author "))?.replace("author ", "") || "unknown",
//         date: new Date(
//           (lines.find(l => l.startsWith("author-time "))?.replace("author-time ", "") || Date.now()/1000) * 1000
//         ).toLocaleDateString(),
//         summary: lines.find(l => l.startsWith("summary "))?.replace("summary ", "") || ""
//       };

//     } catch {

//       return {
//         commit: "initial-import",
//         author: "system",
//         date: new Date().toLocaleDateString(),
//         summary: "Imported code"
//       };

//     }

//   }

// };

// /* ================================
//    SEMGREP SCANNER
// ================================ */

// function runSemgrep(scanDir) {

//   try {

//     console.log("🔍 Running Semgrep scan...");

//     const output = execSync(
//         `semgrep --config=auto "${scanDir}" --json`,
//         {
//             encoding: "utf8",
//             maxBuffer: 1024 * 1024 * 50, // 50MB to handle larger JSON outputs
//             env: { 
//                 ...process.env, 
//                 PYTHONUTF8: "1",           // Forces Python to use UTF-8 (Fixes Windows crash)
//                 PYTHONIOENCODING: "UTF-8", // Ensures input/output is UTF-8
//                 LANG: "en_US.UTF-8" 
//             }
//         }
//     );

//     return JSON.parse(output);

//   } catch (err) {

//     console.log("⚠ Semgrep failed:", err.message);

//     return { results: [] };

//   }

// }

// /* ================================
//    UPLOAD + SCAN API
// ================================ */

// app.post("/api/upload-scan", upload.single("repo"), async (req, res) => {

//   try {

//     if (!req.file) {
//       return res.status(400).json({ error: "No ZIP uploaded" });
//     }

//     const zipPath = req.file.path;
//     const scanId = Date.now().toString();
//     const extractPath = path.join(__dirname, "scans", scanId);

//     fs.mkdirSync(extractPath, { recursive: true });

//     console.log("📦 Extracting ZIP...");

//     fs.createReadStream(zipPath)
//       .pipe(unzipper.Extract({ path: extractPath }))

//       .on("close", () => {

//         try {

//           console.log("📂 Repository extracted");

//           /* -------------------------------
//              INIT GIT
//           ------------------------------- */

//           execSync("git init", { cwd: extractPath });
//           execSync(`git config user.email "scan@codeguardian.ai"`, { cwd: extractPath });
//           execSync(`git config user.name "CodeGuardian Scanner"`, { cwd: extractPath });
//           execSync("git add .", { cwd: extractPath });
//           execSync(`git commit -m "initial scan"`, { cwd: extractPath });

//           console.log("🧬 Git initialized");

//           /* -------------------------------
//              RUN SEMGREP
//           ------------------------------- */

//           const semgrepData = runSemgrep(extractPath);

//           const results = (semgrepData.results || []).map(r => {

//             const vulnType = r.check_id.split(".").pop();

//             return {

//               id: `vuln-${scanId}-${index}`,
//               type: vulnType,

//               file: path.relative(extractPath, r.path),

//               line: r.start.line,

//               code: r.extra?.lines?.trim() || "",

//               severity: r.extra?.severity || "unknown",

//               forensics: forensics.getForensics(
//                 extractPath,
//                 r.path,
//                 r.start.line
//               ),

//               autoFix: patcher.generatePatch(
//                 vulnType,
//                 r.extra?.lines || ""
//               )

//             };

//           });

//           console.log(`⚠ ${results.length} vulnerabilities detected`);

//           res.json(results);

//         } catch (err) {

//           console.error("Scan Error:", err);

//           res.status(500).json({
//             error: "Scanning failed"
//           });

//         }

//       })

//       .on("error", (err) => {

//         console.error("Extraction failed:", err);

//         res.status(500).json({
//           error: "Extraction failed"
//         });

//       });

//   } catch (err) {

//     console.error("Server error:", err);

//     res.status(500).json({
//       error: "Internal Server Error"
//     });

//   }

// });

// /* ================================
//    TIMELINE API (Fixes 404 error)
// ================================ */

// app.get("/api/timeline", (req, res) => {

//   try {

//     const scansDir = path.join(__dirname, "scans");

//     if (!fs.existsSync(scansDir)) {
//       return res.json([]);
//     }

//     const folders = fs.readdirSync(scansDir);

//     const timeline = folders.map(folder => {

//       const date = new Date(parseInt(folder));

//       return {
//         commit: folder.slice(-7),
//         author: "CodeGuardian Scanner",
//         date: date.toLocaleDateString(),
//         vulnerabilityCount: Math.floor(Math.random() * 4) + 1
//       };

//     });

//     res.json(timeline.reverse());

//   } catch (err) {

//     console.error("Timeline error:", err);

//     res.status(500).json({ error: "Timeline failed" });

//   }

// });

// /* ================================
//    SERVER START
// ================================ */

// const PORT = 3001;

// app.listen(PORT, () => {

//   console.log("");
//   console.log("🛡️ CodeGuardian Dynamic Scanner Running");
//   console.log(`🚀 Server: http://localhost:${PORT}`);
//   console.log(`📡 Upload Endpoint: /api/upload-scan`);
//   console.log(`📊 Timeline Endpoint: /api/timeline`);
//   console.log("");

// });





// const express = require("express");
// const { execSync } = require("child_process");
// const path = require("path");
// const fs = require("fs");
// const cors = require("cors");

// const app = express();
// app.use(cors());
// app.use(express.json());

// /* ================================
//    FOLDER SETUP
// ================================ */

// if (!fs.existsSync("repos")) fs.mkdirSync("repos");
// if (!fs.existsSync("scans")) fs.mkdirSync("scans");

// /* ================================
//    PATCH GENERATOR
// ================================ */

// const patcher = {
//   generatePatch: (type, code) => {

//     if (type.includes("sql")) {
//       return "Use parameterized query: db.query('SELECT * FROM users WHERE id=?',[id])";
//     }

//     if (type.includes("secret")) {
//       return "Move secret to environment variable: process.env.API_KEY";
//     }

//     if (type.includes("xss")) {
//       return code.replace(".innerHTML", ".textContent");
//     }

//     return "// Manual review required";
//   }
// };

// /* ================================
//    FORENSICS ENGINE
// ================================ */

// const forensics = {

//   getForensics: (repoPath, filePath, line) => {

//     try {

//       const blame = execSync(
//         `git -C "${repoPath}" blame -L ${line},${line} "${filePath}" --porcelain`,
//         { encoding: "utf8" }
//       );

//       const lines = blame.split("\n");

//       return {
//         commit: lines[0].split(" ")[0],
//         author: lines.find(l => l.startsWith("author "))?.replace("author ", "") || "unknown",
//         date: new Date(
//           (lines.find(l => l.startsWith("author-time "))?.replace("author-time ", "") || Date.now()/1000) * 1000
//         ).toLocaleDateString(),
//         summary: lines.find(l => l.startsWith("summary "))?.replace("summary ", "") || ""
//       };

//     } catch {

//       return {
//         commit: "initial-import",
//         author: "system",
//         date: new Date().toLocaleDateString(),
//         summary: "Imported code"
//       };

//     }

//   }

// };

// /* ================================
//    SEMGREP SCANNER
// ================================ */

// function runSemgrep(scanDir) {

//   try {

//     console.log("🔍 Running Semgrep scan...");

//     const output = execSync(
//       `semgrep --config=p/security-audit --config=p/javascript --config=p/nodejs "${scanDir}" --json`,
//       {
//         encoding: "utf8",
//         maxBuffer: 1024 * 1024 * 50,
//         env: {
//           ...process.env,
//           PYTHONUTF8: "1",
//           PYTHONIOENCODING: "UTF-8",
//           LANG: "en_US.UTF-8"
//         }
//       }
//     );

//     return JSON.parse(output);

//   } catch (err) {

//     console.log("⚠ Semgrep failed:", err.message);

//     return { results: [] };

//   }

// }

// /* ================================
//    CLONE REPOSITORY
// ================================ */

// function cloneRepo(repoUrl) {

//   const repoName = repoUrl.split("/").pop().replace(".git","");

//   const repoPath = path.join(__dirname, "repos", `${repoName}-${Date.now()}`);

//   console.log("📥 Cloning repo:", repoUrl);

//   execSync(`git clone ${repoUrl} "${repoPath}"`);

//   return repoPath;
// }

// /* ================================
//    SCAN GITHUB REPO API
// ================================ */

// app.post("/api/scan-repo", async (req, res) => {

//   try {

//     const { repoUrl } = req.body;

//     if (!repoUrl) {
//       return res.status(400).json({ error: "Repository URL required" });
//     }

//     const repoPath = cloneRepo(repoUrl);

//     const semgrepData = runSemgrep(repoPath);

//     const scanId = Date.now();

//     const results = (semgrepData.results || []).map((r, index) => {

//       const vulnType = r.check_id.split(".").pop();

//       return {

//         id: `vuln-${scanId}-${index}-${r.start.line}`,

//         type: vulnType,

//         file: path.relative(repoPath, r.path),

//         line: r.start.line,

//         code: r.extra?.lines?.trim() || "",

//         severity: r.extra?.severity || "unknown",

//         forensics: forensics.getForensics(
//           repoPath,
//           r.path,
//           r.start.line
//         ),

//         autoFix: patcher.generatePatch(
//           vulnType,
//           r.extra?.lines || ""
//         )

//       };

//     });

//     console.log(`⚠ ${results.length} vulnerabilities detected`);

//     res.json(results);

//   } catch (err) {

//     console.error("Scan error:", err);

//     res.status(500).json({
//       error: "Repository scan failed"
//     });

//   }

// });

// /* ================================
//    TIMELINE API
// ================================ */

// app.get("/api/timeline", (req, res) => {

//   try {

//     const scansDir = path.join(__dirname, "repos");

//     if (!fs.existsSync(scansDir)) {
//       return res.json([]);
//     }

//     const folders = fs.readdirSync(scansDir);

//     const timeline = folders.map(folder => {

//       const date = new Date();

//       return {
//         commit: folder.slice(-7),
//         author: "CodeGuardian Scanner",
//         date: date.toLocaleDateString(),
//         vulnerabilityCount: Math.floor(Math.random() * 4) + 1
//       };

//     });

//     res.json(timeline.reverse());

//   } catch (err) {

//     console.error("Timeline error:", err);

//     res.status(500).json({ error: "Timeline failed" });

//   }

// });

// /* ================================
//    SERVER START
// ================================ */

// const PORT = 3001;

// app.listen(PORT, () => {

//   console.log("");
//   console.log("🛡️ CodeGuardian Dynamic Scanner Running");
//   console.log(`🚀 Server: http://localhost:${PORT}`);
//   console.log(`📡 Scan API: POST /api/scan-repo`);
//   console.log(`📊 Timeline API: /api/timeline`);
//   console.log("");

// });




// require("dotenv").config();

// const express = require("express");
// const { execSync } = require("child_process");
// const path = require("path");
// const fs = require("fs");
// const cors = require("cors");
// const simpleGit = require("simple-git");
// const { Octokit } = require("@octokit/rest");

// const app = express();
// app.use(cors());
// app.use(express.json());

// const git = simpleGit();

// /* ================================
//    FOLDER SETUP
// ================================ */

// const reposDir = path.join(__dirname, "repos");

// if (!fs.existsSync(reposDir)) {
//   fs.mkdirSync(reposDir);
// }

// /* ================================
//    PATCH GENERATOR
// ================================ */

// function generatePatch(type, code) {
//   if (!code) return "// No patch available";

//   const c = code.trim();

//   if (type.includes("sql")) {
//     return "db.query('SELECT * FROM users WHERE id=?',[id])";
//   }

//   if (type.includes("secret")) {
//     return "process.env.SECRET_KEY";
//   }

//   if (type.includes("xss")) {
//     return c.replace(".innerHTML", ".textContent");
//   }

//   return "// Manual fix recommended";
// }

// /* ================================
//    FORENSICS ENGINE
// ================================ */

// function getForensics(repoPath, filePath, line) {
//   try {
//     const blame = execSync(
//       `git -C "${repoPath}" blame -L ${line},${line} "${filePath}" --porcelain`,
//       { encoding: "utf8" }
//     );

//     const lines = blame.split("\n");

//     return {
//       commit: lines[0].split(" ")[0],
//       author:
//         lines.find((l) => l.startsWith("author "))?.replace("author ", "") ||
//         "unknown",
//       date: new Date(
//         (lines
//           .find((l) => l.startsWith("author-time "))
//           ?.replace("author-time ", "") || Date.now() / 1000) * 1000
//       ).toLocaleDateString(),
//       summary:
//         lines.find((l) => l.startsWith("summary "))?.replace("summary ", "") ||
//         "",
//     };
//   } catch {
//     return {
//       commit: "initial-import",
//       author: "system",
//       date: new Date().toLocaleDateString(),
//       summary: "Imported code",
//     };
//   }
// }

// /* ================================
//    SEMGREP RUNNER
// ================================ */

// function runSemgrep(scanDir) {
//   try {
//     console.log("🔍 Running Semgrep scan...");

//     const output = execSync(
//       `semgrep --config=p/security-audit --config=p/javascript --config=p/nodejs "${scanDir}" --json`,
//       {
//         encoding: "utf8",
//         maxBuffer: 1024 * 1024 * 50,
//         env: {
//           ...process.env,
//           PYTHONUTF8: "1",
//           PYTHONIOENCODING: "UTF-8",
//           LANG: "en_US.UTF-8",
//         },
//       }
//     );

//     return JSON.parse(output);
//   } catch (err) {
//     console.log("⚠ Semgrep failed:", err.message);
//     return { results: [] };
//   }
// }

// /* ================================
//    CLONE REPOSITORY
// ================================ */

// async function cloneRepo(repoUrl) {
//   const repoName = repoUrl.split("/").pop().replace(".git", "");

//   const repoPath = path.join(reposDir, `${repoName}-${Date.now()}`);

//   console.log("📥 Cloning repository:", repoUrl);

//   await git.clone(repoUrl, repoPath);

//   return repoPath;
// }

// /* ================================
//    APPLY PATCHES
// ================================ */

// function applyPatches(repoPath, vulnerabilities) {
//   vulnerabilities.forEach((v) => {
//     const filePath = path.join(repoPath, v.file);

//     if (fs.existsSync(filePath)) {
//       let content = fs.readFileSync(filePath, "utf8");

//       content = content.replace(v.code, v.autoFix);

//       fs.writeFileSync(filePath, content);
//     }
//   });
// }

// /* ================================
//    CREATE PR
// ================================ */

// async function createPullRequest(repoPath, repoUrl) {
//   const token = process.env.GITHUB_TOKEN;

//   const branchName = "codeguardian-fix";

//   const repoGit = simpleGit(repoPath);

//   await repoGit.checkoutLocalBranch(branchName);

//   await repoGit.add(".");

//   await repoGit.commit("fix: vulnerabilities patched by CodeGuardian");

//   const authRepo = repoUrl.replace("https://", `https://${token}@`);

//   await repoGit.push(authRepo, branchName);

//   const parts = repoUrl.split("/");

//   const owner = parts[3];

//   const repo = parts[4].replace(".git", "");

//   const octokit = new Octokit({ auth: token });

//   const pr = await octokit.pulls.create({
//     owner: owner,
//     repo: repo,
//     title: "CodeGuardian Security Fix",
//     head: branchName,
//     base: "main",
//     body: "Automated vulnerability fixes generated by CodeGuardian",
//   });

//   return pr.data.html_url;
// }

// /* ================================
//    MAIN SCAN API
// ================================ */

// app.post("/api/scan-repo", async (req, res) => {
//   try {
//     const { repoUrl } = req.body;

//     if (!repoUrl) {
//       return res.status(400).json({
//         error: "Repository URL required",
//       });
//     }

//     const repoPath = await cloneRepo(repoUrl);

//     const semgrepData = runSemgrep(repoPath);

//     const scanId = Date.now();

//     const vulnerabilities = (semgrepData.results || []).map((r, index) => {
//       const type = r.check_id.split(".").pop();

//       return {
//         id: `vuln-${scanId}-${index}-${r.start.line}`,
//         type: type,
//         file: path.relative(repoPath, r.path),
//         line: r.start.line,
//         code: r.extra?.lines?.trim() || "",
//         severity: r.extra?.severity || "unknown",

//         forensics: getForensics(repoPath, r.path, r.start.line),

//         autoFix: generatePatch(type, r.extra?.lines || ""),
//       };
//     });

//     console.log(`⚠ ${vulnerabilities.length} vulnerabilities detected`);

//     applyPatches(repoPath, vulnerabilities);

//     const prUrl = await createPullRequest(repoPath, repoUrl);

//     res.json({
//       vulnerabilities,
//       pullRequest: prUrl,
//     });
//   } catch (err) {
//     console.error("Scan error:", err);

//     res.status(500).json({
//       error: "Repository scan failed",
//     });
//   }
// });

// /* ================================
//    SERVER START
// ================================ */

// const PORT = 3001;

// app.listen(PORT, () => {
//   console.log("");
//   console.log("🛡️ CodeGuardian Security Bot Running");
//   console.log(`🚀 Server: http://localhost:${PORT}`);
//   console.log(`📡 API: POST /api/scan-repo`);
//   console.log("");
// });



// require("dotenv").config();

// const express = require("express");
// const { execSync } = require("child_process");
// const path = require("path");
// const fs = require("fs");
// const cors = require("cors");
// const simpleGit = require("simple-git");
// const { Octokit } = require("@octokit/rest");

// const app = express();
// app.use(cors());
// app.use(express.json());

// /* ================================
//    FOLDER SETUP
// ================================ */

// const reposDir = path.join(__dirname, "repos");

// if (!fs.existsSync(reposDir)) {
//   fs.mkdirSync(reposDir);
// }

// /* ================================
//    PATCH GENERATOR
// ================================ */

// function generatePatch(type, code) {
//   if (!code) return "// No patch available";

//   const c = code.trim();

//   if (type.includes("sql")) {
//     return "db.query('SELECT * FROM users WHERE id=?',[id])";
//   }

//   if (type.includes("secret")) {
//     return "process.env.SECRET_KEY";
//   }

//   if (type.includes("xss")) {
//     return c.replace(".innerHTML", ".textContent");
//   }

//   return "// Manual fix recommended";
// }

// /* ================================
//    FORENSICS ENGINE
// ================================ */

// function getForensics(repoPath, filePath, line) {
//   try {
//     const blame = execSync(
//       `git -C "${repoPath}" blame -L ${line},${line} "${filePath}" --porcelain`,
//       { encoding: "utf8" }
//     );

//     const lines = blame.split("\n");

//     return {
//       commit: lines[0].split(" ")[0],
//       author:
//         lines.find((l) => l.startsWith("author "))?.replace("author ", "") ||
//         "unknown",
//       date: new Date(
//         (lines
//           .find((l) => l.startsWith("author-time "))
//           ?.replace("author-time ", "") || Date.now() / 1000) * 1000
//       ).toLocaleDateString(),
//       summary:
//         lines.find((l) => l.startsWith("summary "))?.replace("summary ", "") ||
//         "",
//     };
//   } catch {
//     return {
//       commit: "initial-import",
//       author: "system",
//       date: new Date().toLocaleDateString(),
//       summary: "Imported code",
//     };
//   }
// }

// /* ================================
//    SEMGREP RUNNER
// ================================ */

// function runSemgrep(scanDir) {
//   try {
//     console.log("🔍 Running Semgrep scan...");

//     const output = execSync(
//       `semgrep --config=p/security-audit --config=p/javascript --config=p/nodejs "${scanDir}" --json`,
//       {
//         encoding: "utf8",
//         maxBuffer: 1024 * 1024 * 50,
//         env: {
//           ...process.env,
//           PYTHONUTF8: "1",
//           PYTHONIOENCODING: "UTF-8",
//           LANG: "en_US.UTF-8",
//         },
//       }
//     );

//     return JSON.parse(output);
//   } catch (err) {
//     console.log("⚠ Semgrep failed:", err.message);
//     return { results: [] };
//   }
// }

// /* ================================
//    CLONE REPOSITORY
// ================================ */

// async function cloneRepo(repoUrl) {
//   const repoName = repoUrl.split("/").pop().replace(".git", "");

//   const repoPath = path.join(reposDir, `${repoName}-${Date.now()}`);

//   console.log("📥 Cloning repository:", repoUrl);

//   await simpleGit().clone(repoUrl, repoPath);

//   return repoPath;
// }

// /* ================================
//    APPLY PATCHES
// ================================ */

// function applyPatches(repoPath, vulnerabilities) {
//   vulnerabilities.forEach((v) => {
//     const filePath = path.join(repoPath, v.file);

//     if (fs.existsSync(filePath)) {
//       let content = fs.readFileSync(filePath, "utf8");

//       content = content.replace(v.code.trim(), v.autoFix);

//       fs.writeFileSync(filePath, content);
//     }
//   });
// }

// /* ================================
//    CREATE PULL REQUEST
// ================================ */

// async function createPullRequest(repoPath, repoUrl) {
//   const token = process.env.GITHUB_TOKEN;

//   const branchName = `codeguardian-fix-${Date.now()}`;

//   const repoGit = simpleGit(repoPath);

//   await repoGit.checkoutLocalBranch(branchName);

//   await repoGit.add(".");
//   await repoGit.commit("fix: vulnerabilities patched by CodeGuardian");

//   const authRepo = repoUrl.replace("https://", `https://${token}@`);

//   await repoGit.push(authRepo, branchName);

//   const parts = repoUrl.split("/");

//   const forkOwner = parts[3];
//   const repo = parts[4].replace(".git", "");

//   const octokit = new Octokit({ auth: token });

//   const pr = await octokit.pulls.create({
//     owner: forkOwner,
//     repo: repo,
//     title: "CodeGuardian Security Fix",
//     head: `${forkOwner}:${branchName}`,
//     base: "main",
//     body: "Automated vulnerability fixes generated by CodeGuardian",
//   });

//   return pr.data.html_url;
// }

// /* ================================
//    MAIN SCAN API
// ================================ */

// app.post("/api/scan-repo", async (req, res) => {
//   try {
//     const { repoUrl } = req.body;

//     if (!repoUrl) {
//       return res.status(400).json({
//         error: "Repository URL required",
//       });
//     }

//     const repoPath = await cloneRepo(repoUrl);

//     const semgrepData = runSemgrep(repoPath);

//     const scanId = Date.now();

//     const vulnerabilities = (semgrepData.results || []).map((r, index) => {
//       const type = r.check_id.split(".").pop();

//       return {
//         id: `vuln-${scanId}-${index}-${r.start.line}`,
//         type: type,
//         file: path.relative(repoPath, r.path),
//         line: r.start.line,
//         code: r.extra?.lines?.trim() || "",
//         severity: r.extra?.severity || "unknown",

//         forensics: getForensics(repoPath, r.path, r.start.line),

//         autoFix: generatePatch(type, r.extra?.lines || ""),
//       };
//     });

//     console.log(`⚠ ${vulnerabilities.length} vulnerabilities detected`);

//     applyPatches(repoPath, vulnerabilities);

//     const prUrl = await createPullRequest(repoPath, repoUrl);

//     res.json({
//       vulnerabilities,
//       pullRequest: prUrl,
//     });
//   } catch (err) {
//     console.error("Scan error:", err);

//     res.status(500).json({
//       error: "Repository scan failed",
//     });
//   }
// });

// /* ================================
//    SERVER START
// ================================ */

// const PORT = 3001;

// app.listen(PORT, () => {
//   console.log("");
//   console.log("🛡️ CodeGuardian Security Bot Running");
//   console.log(`🚀 Server: http://localhost:${PORT}`);
//   console.log(`📡 API: POST /api/scan-repo`);
//   console.log("");
// });


// require("dotenv").config();

// const express = require("express");
// const { execSync } = require("child_process");
// const path = require("path");
// const fs = require("fs");
// const cors = require("cors");
// const simpleGit = require("simple-git");
// const { Octokit } = require("@octokit/rest");

// const app = express();
// app.use(cors());
// app.use(express.json());

// const reposDir = path.join(__dirname, "repos");

// if (!fs.existsSync(reposDir)) {
//   fs.mkdirSync(reposDir);
// }

// /* ================================
//    PATCH GENERATOR
// ================================ */

// function generatePatch(type, code) {

//   if (!code) return "// TODO: Manual fix required";

//   const c = code.trim();

//   if (type.includes("sql")) {
//     return "db.query('SELECT * FROM users WHERE id=?',[id])";
//   }

//   if (type.includes("secret")) {
//     return "process.env.SECRET_KEY";
//   }

//   if (type.includes("xss")) {
//     return c.replace(".innerHTML", ".textContent");
//   }

//   if (type.includes("child-process")) {
//     return "// Avoid exec. Use spawn or execFile safely";
//   }

//   if (type.includes("csrf")) {
//     return "app.use(require('csurf')());";
//   }

//   return "// TODO: Manual fix required";

// }

// /* ================================
//    FORENSICS ENGINE
// ================================ */

// function getForensics(repoPath, filePath, line) {

//   try {

//     const blame = execSync(
//       `git -C "${repoPath}" blame -L ${line},${line} "${filePath}" --porcelain`,
//       { encoding: "utf8" }
//     );

//     const lines = blame.split("\n");

//     return {
//       commit: lines[0].split(" ")[0],
//       author: lines.find(l => l.startsWith("author "))?.replace("author ", "") || "unknown",
//       date: new Date(
//         (lines.find(l => l.startsWith("author-time "))?.replace("author-time ", "") || Date.now()/1000) * 1000
//       ).toLocaleDateString(),
//       summary: lines.find(l => l.startsWith("summary "))?.replace("summary ", "") || ""
//     };

//   } catch {

//     return {
//       commit: "initial-import",
//       author: "system",
//       date: new Date().toLocaleDateString(),
//       summary: "Imported code"
//     };

//   }

// }

// /* ================================
//    SEMGREP RUNNER
// ================================ */

// function runSemgrep(scanDir) {

//   try {

//     console.log("🔍 Running Semgrep scan...");

//     const output = execSync(
//       `semgrep --config=auto "${scanDir}" --json`,
//       {
//         encoding: "utf8",
//         maxBuffer: 1024 * 1024 * 100,
//         env: {
//           ...process.env,
//           PYTHONUTF8: "1",
//           PYTHONIOENCODING: "UTF-8",
//           LANG: "en_US.UTF-8"
//         }
//       }
//     );

//     const parsed = JSON.parse(output);

//     console.log("Semgrep findings:", parsed.results.length);

//     return parsed;

//   } catch (err) {

//     console.log("⚠ Semgrep failed:", err.message);
//     return { results: [] };

//   }

// }

// /* ================================
//    CLONE REPOSITORY
// ================================ */

// async function cloneRepo(repoUrl) {

//   const repoName = repoUrl.split("/").pop().replace(".git","");

//   const repoPath = path.join(reposDir, `${repoName}-${Date.now()}`);

//   console.log("📥 Cloning:", repoUrl);

//   await simpleGit().clone(repoUrl, repoPath);

//   return repoPath;

// }

// /* ================================
//    APPLY PATCHES
// ================================ */

// function applyPatches(repoPath, vulnerabilities) {

//   let changes = 0;

//   vulnerabilities.forEach(v => {

//     const filePath = path.join(repoPath, v.file);

//     if (!fs.existsSync(filePath)) return;

//     let content = fs.readFileSync(filePath,"utf8");

//     if (v.code && content.includes(v.code.trim())) {

//       content = content.replace(v.code.trim(), v.autoFix);

//       fs.writeFileSync(filePath, content);

//       changes++;

//     }

//   });

//   console.log("Patched files:", changes);

//   return changes;

// }

// /* ================================
//    CREATE PULL REQUEST
// ================================ */

// async function createPullRequest(repoPath, repoUrl) {

//   const token = process.env.GITHUB_TOKEN;

//   const branchName = `codeguardian-fix-${Date.now()}`;

//   const git = simpleGit(repoPath);

//   await git.checkoutLocalBranch(branchName);

//   await git.add(".");

//   await git.commit("fix: vulnerabilities patched by CodeGuardian");

//   const authRepo = repoUrl.replace("https://",`https://${token}@`);

//   await git.push(authRepo, branchName);

//   const parts = repoUrl.split("/");

//   const owner = parts[3];
//   const repo = parts[4].replace(".git","");

//   const octokit = new Octokit({ auth: token });

//   const pr = await octokit.pulls.create({
//     owner,
//     repo,
//     title:"CodeGuardian Security Fix",
//     head:`${owner}:${branchName}`,
//     base:"main",
//     body:"Automated vulnerability fixes generated by CodeGuardian"
//   });

//   console.log("PR created:", pr.data.html_url);

//   return pr.data.html_url;

// }

// /* ================================
//    SCAN API
// ================================ */

// app.post("/api/scan-repo", async (req,res)=>{

//   try{

//     const { repoUrl } = req.body;

//     if(!repoUrl){
//       return res.status(400).json({error:"Repository URL required"});
//     }

//     const repoPath = await cloneRepo(repoUrl);

//     const semgrepData = runSemgrep(repoPath);

//     const scanId = Date.now();

//     const vulnerabilities = (semgrepData.results || []).map((r,index)=>{

//       const type = r.check_id.split(".").pop();

//       return{
//         id:`vuln-${scanId}-${index}`,
//         type,
//         file:path.relative(repoPath,r.path),
//         line:r.start.line,
//         code:r.extra?.lines?.trim() || "",
//         severity:r.extra?.severity || "unknown",
//         forensics:getForensics(repoPath,r.path,r.start.line),
//         autoFix:generatePatch(type,r.extra?.lines || "")
//       };

//     });

//     console.log(`⚠ ${vulnerabilities.length} vulnerabilities detected`);

//     res.json({
//       repoPath,
//       repoUrl,
//       vulnerabilities
//     });

//   }catch(err){

//     console.error("Scan error:",err);

//     res.status(500).json({error:"Scan failed"});

//   }

// });

// /* ================================
//    PATCH API
// ================================ */

// app.post("/api/apply-fix", async (req,res)=>{

//   try{

//     const { repoPath, repoUrl, vulnerabilities } = req.body;

//     const patched = applyPatches(repoPath, vulnerabilities);

//     if(patched === 0){

//       return res.json({
//         success:false,
//         message:"No patchable vulnerabilities"
//       });

//     }

//     const prUrl = await createPullRequest(repoPath, repoUrl);

//     res.json({
//       success:true,
//       pullRequest:prUrl
//     });

//   }catch(err){

//     console.error("Patch error:",err);

//     res.status(500).json({error:"Patch failed"});

//   }

// });

// /* ================================
//    TIMELINE API
// ================================ */

// app.get("/api/timeline",(req,res)=>{

//   try{

//     const folders = fs.readdirSync(reposDir);

//     const timeline = folders.map(folder=>({

//       commit:folder.slice(-6),
//       author:"CodeGuardian",
//       date:new Date().toLocaleDateString(),
//       vulnerabilityCount:Math.floor(Math.random()*5)+1

//     }));

//     res.json(timeline);

//   }catch(err){

//     res.status(500).json({error:"Timeline fetch failed"});

//   }

// });

// /* ================================
//    SERVER START
// ================================ */

// const PORT = 3001;

// app.listen(PORT,()=>{

//   console.log("");
//   console.log("🛡️ CodeGuardian Security Bot Running");
//   console.log(`🚀 Server: http://localhost:${PORT}`);
//   console.log(`📡 POST /api/scan-repo`);
//   console.log(`📡 POST /api/apply-fix`);
//   console.log(`📊 GET /api/timeline`);
//   console.log("");

// });


// require("dotenv").config();

// const express = require("express");
// const { execSync } = require("child_process");
// const path = require("path");
// const fs = require("fs");
// const cors = require("cors");
// const simpleGit = require("simple-git");
// const { Octokit } = require("@octokit/rest");

// const app = express();
// app.use(cors());
// app.use(express.json());

// const reposDir = path.join(__dirname, "repos");

// if (!fs.existsSync(reposDir)) {
//   fs.mkdirSync(reposDir);
// }

// /* ================================
//    PATCH GENERATOR
// ================================ */

// function generatePatch(type, code) {

//   if (!code) return "// TODO: Manual fix required";

//   const c = code.trim();
//   const t = type.toLowerCase();

//   if (t.includes("sql")) {
//     return "db.query('SELECT * FROM users WHERE id=?',[id])";
//   }

//   if (t.includes("secret")) {
//     return "process.env.SECRET_KEY";
//   }

//   if (t.includes("xss")) {
//     return c.replace(".innerHTML", ".textContent");
//   }

//   if (t.includes("child-process")) {
//     return "// Avoid exec(). Use spawn or execFile safely";
//   }

//   if (t.includes("csrf")) {
//     return "app.use(require('csurf')());";
//   }

//   return "// TODO: Manual fix required";

// }

// /* ================================
//    FORENSICS ENGINE
// ================================ */

// function getForensics(repoPath, filePath, line) {

//   try {

//     const blame = execSync(
//       `git -C "${repoPath}" blame -L ${line},${line} "${filePath}" --porcelain`,
//       { encoding: "utf8" }
//     );

//     const lines = blame.split("\n");

//     return {
//       commit: lines[0].split(" ")[0],
//       author: lines.find(l => l.startsWith("author "))?.replace("author ", "") || "unknown",
//       date: new Date(
//         (lines.find(l => l.startsWith("author-time "))?.replace("author-time ", "") || Date.now()/1000) * 1000
//       ).toLocaleDateString(),
//       summary: lines.find(l => l.startsWith("summary "))?.replace("summary ", "") || ""
//     };

//   } catch {

//     return {
//       commit: "initial-import",
//       author: "system",
//       date: new Date().toLocaleDateString(),
//       summary: "Imported code"
//     };

//   }

// }

// /* ================================
//    SEMGREP RUNNER
// ================================ */

// function runSemgrep(scanDir) {

//   try {

//     console.log("🔍 Running Semgrep scan...");

//     const output = execSync(
//       `semgrep --config=auto "${scanDir}" --json`,
//       {
//         encoding: "utf8",
//         maxBuffer: 1024 * 1024 * 100
//       }
//     );

//     const parsed = JSON.parse(output);

//     console.log("Semgrep findings:", parsed.results.length);

//     return parsed;

//   } catch (err) {

//     console.log("⚠ Semgrep failed:", err.message);

//     return { results: [] };

//   }

// }

// /* ================================
//    CLONE REPOSITORY
// ================================ */

// async function cloneRepo(repoUrl) {

//   repoUrl = repoUrl.trim();

//   const repoName = repoUrl.split("/").pop().replace(".git","");

//   const repoPath = path.join(reposDir, `${repoName}-${Date.now()}`);

//   console.log("📥 Cloning:", repoUrl);

//   await simpleGit().clone(repoUrl, repoPath);

//   return repoPath;

// }

// /* ================================
//    APPLY PATCHES (FIXED)
// ================================ */

// function applyPatches(repoPath, vulnerabilities) {

//   let patched = 0;

//   vulnerabilities.forEach(v => {

//     const filePath = path.join(repoPath, v.file);

//     if (!fs.existsSync(filePath)) return;

//     let lines = fs.readFileSync(filePath, "utf8").split("\n");

//     const index = v.line - 1;

//     if (lines[index]) {

//       lines[index] = v.autoFix;

//       fs.writeFileSync(filePath, lines.join("\n"));

//       patched++;

//     }

//   });

//   console.log("Patched files:", patched);

//   return patched;

// }

// /* ================================
//    CREATE PULL REQUEST
// ================================ */

// async function createPullRequest(repoPath, repoUrl) {

//   const token = process.env.GITHUB_TOKEN;

//   const branchName = `codeguardian-fix-${Date.now()}`;

//   const git = simpleGit(repoPath);

//   await git.checkoutLocalBranch(branchName);

//   await git.add(".");

//   const status = await git.status();

//   if (status.files.length === 0) {
//     console.log("⚠ No changes detected — skipping PR");
//     return null;
//   }

//   await git.commit("fix: vulnerabilities patched by CodeGuardian");

//   const authRepo = repoUrl.replace("https://", `https://${token}@`);

//   await git.push(authRepo, branchName);

//   const parts = repoUrl.split("/");

//   const owner = parts[3];
//   const repo = parts[4].replace(".git","");

//   const octokit = new Octokit({ auth: token });

//   const pr = await octokit.pulls.create({

//     owner,
//     repo,
//     title: "CodeGuardian Security Fix",
//     head: `${owner}:${branchName}`,
//     base: "main",
//     body: "Automated vulnerability fixes generated by CodeGuardian"

//   });

//   console.log("PR created:", pr.data.html_url);

//   return pr.data.html_url;

// }

// /* ================================
//    SCAN API
// ================================ */

// app.post("/api/scan-repo", async (req,res)=>{

//   try{

//     const { repoUrl } = req.body;

//     if(!repoUrl){
//       return res.status(400).json({error:"Repository URL required"});
//     }

//     const repoPath = await cloneRepo(repoUrl);

//     const semgrepData = runSemgrep(repoPath);

//     const scanId = Date.now();

//     const vulnerabilities = (semgrepData.results || []).map((r,index)=>{

//       const type = r.check_id.split(".").pop();

//       return{

//         id:`vuln-${scanId}-${index}`,
//         type,
//         file:path.relative(repoPath,r.path),
//         line:r.start.line,
//         code:r.extra?.lines?.trim() || "",
//         severity:r.extra?.severity || "unknown",

//         forensics:getForensics(repoPath,r.path,r.start.line),

//         autoFix:generatePatch(type,r.extra?.lines || "")

//       };

//     });

//     console.log(`⚠ ${vulnerabilities.length} vulnerabilities detected`);

//     res.json({

//       repoPath,
//       repoUrl,
//       vulnerabilities

//     });

//   }catch(err){

//     console.error("Scan error:",err);

//     res.status(500).json({error:"Scan failed"});

//   }

// });

// /* ================================
//    PATCH API
// ================================ */

// app.post("/api/apply-fix", async (req,res)=>{

//   try{

//     const { repoPath, repoUrl, vulnerabilities } = req.body;

//     const patched = applyPatches(repoPath, vulnerabilities);

//     if(patched === 0){

//       return res.json({
//         success:false,
//         message:"No patchable vulnerabilities"
//       });

//     }

//     const prUrl = await createPullRequest(repoPath, repoUrl);

//     res.json({

//       success:true,
//       pullRequest:prUrl

//     });

//   }catch(err){

//     console.error("Patch error:",err);

//     res.status(500).json({error:"Patch failed"});

//   }

// });

// /* ================================
//    SERVER START
// ================================ */

// const PORT = 3001;

// app.listen(PORT,()=>{

//   console.log("");
//   console.log("🛡️ CodeGuardian Security Bot Running");
//   console.log(`🚀 Server: http://localhost:${PORT}`);
//   console.log(`📡 POST /api/scan-repo`);
//   console.log(`📡 POST /api/apply-fix`);
//   console.log("");

// });



require("dotenv").config();

const express = require("express");
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const simpleGit = require("simple-git");
const { Octokit } = require("@octokit/rest");

const app = express();

app.use(cors());
app.use(express.json());

const reposDir = path.join(__dirname, "repos");

if (!fs.existsSync(reposDir)) {
  fs.mkdirSync(reposDir);
}

/* ================================
   PATCH GENERATOR
================================ */

function generatePatch(type, code) {

  if (!code) return "// TODO: Manual fix required";

  const c = code.trim();
  const t = type.toLowerCase();

  if (t.includes("sql")) {
    return "db.query('SELECT * FROM users WHERE id=?',[id])";
  }

  if (t.includes("secret")) {
    return "process.env.SECRET_KEY";
  }

  if (t.includes("xss")) {
    return c.replace(".innerHTML", ".textContent");
  }

  if (t.includes("child-process")) {
    return "// Avoid exec(). Use execFile() or spawn()";
  }

  if (t.includes("csrf")) {
    return "app.use(require('csurf')());";
  }

  return "// TODO: Manual fix required";

}

/* ================================
   FORENSICS ENGINE
================================ */

function getForensics(repoPath, filePath, line) {

  try {

    const blame = execSync(
      `git -C "${repoPath}" blame -L ${line},${line} "${filePath}" --porcelain`,
      { encoding: "utf8" }
    );

    const lines = blame.split("\n");

    return {
      commit: lines[0].split(" ")[0],
      author: lines.find(l => l.startsWith("author "))?.replace("author ", "") || "unknown",
      date: new Date(
        (lines.find(l => l.startsWith("author-time "))?.replace("author-time ", "") || Date.now()/1000) * 1000
      ).toLocaleDateString(),
      summary: lines.find(l => l.startsWith("summary "))?.replace("summary ", "") || ""
    };

  } catch {

    return {
      commit: "initial-import",
      author: "system",
      date: new Date().toLocaleDateString(),
      summary: "Imported code"
    };

  }

}

/* ================================
   SEMGREP RUNNER
================================ */

function runSemgrep(scanDir) {

  try {

    console.log("🔍 Running Semgrep scan...");

    const output = execSync(

      `semgrep --config=auto --disable-version-check "${scanDir}" --json`,

      {
        encoding: "utf8",
        maxBuffer: 1024 * 1024 * 100,

        env: {
          ...process.env,
          PYTHONUTF8: "1",
          PYTHONIOENCODING: "utf-8",
          LANG: "en_US.UTF-8"
        }

      }

    );

    const parsed = JSON.parse(output);

    console.log("Semgrep findings:", parsed.results.length);

    return parsed;

  } catch (err) {

    console.log("⚠ Semgrep failed:", err.message);

    return { results: [] };

  }

}

/* ================================
   CLONE REPOSITORY
================================ */

async function cloneRepo(repoUrl) {

  repoUrl = repoUrl.trim();

  const repoName = repoUrl.split("/").pop().replace(".git","");

  const repoPath = path.join(reposDir, `${repoName}-${Date.now()}`);

  console.log("📥 Cloning:", repoUrl);

  await simpleGit().clone(repoUrl, repoPath);

  return repoPath;

}

/* ================================
   APPLY PATCHES (LINE BASED)
================================ */

function applyPatches(repoPath, vulnerabilities) {

  let patched = 0;

  vulnerabilities.forEach(v => {

    const filePath = path.join(repoPath, v.file);

    if (!fs.existsSync(filePath)) return;

    let lines = fs.readFileSync(filePath, "utf8").split("\n");

    const index = v.line - 1;

    if (lines[index]) {

      lines[index] = v.autoFix;

      fs.writeFileSync(filePath, lines.join("\n"));

      patched++;

    }

  });

  console.log("Patched files:", patched);

  return patched;

}

/* ================================
   CREATE PULL REQUEST
================================ */

async function createPullRequest(repoPath, repoUrl) {

  const token = process.env.GITHUB_TOKEN;

  const branchName = `codeguardian-fix-${Date.now()}`;

  const git = simpleGit(repoPath);

  await git.checkoutLocalBranch(branchName);

  await git.add(".");

  const status = await git.status();

  if (status.files.length === 0) {

    console.log("⚠ No changes detected. PR skipped.");

    return null;

  }

  await git.commit("fix: vulnerabilities patched by CodeGuardian");

  const authRepo = repoUrl.replace("https://", `https://${token}@`);

  await git.push(authRepo, branchName);

  const parts = repoUrl.split("/");

  const owner = parts[3];
  const repo = parts[4].replace(".git","");

  const octokit = new Octokit({ auth: token });

  const pr = await octokit.pulls.create({

    owner,
    repo,
    title: "CodeGuardian Security Fix",
    head: `${owner}:${branchName}`,
    base: "main",
    body: "Automated vulnerability fixes generated by CodeGuardian"

  });

  console.log("PR created:", pr.data.html_url);

  return pr.data.html_url;

}

/* ================================
   SCAN API
================================ */

app.post("/api/scan-repo", async (req,res)=>{

  try{

    const { repoUrl } = req.body;

    if(!repoUrl){
      return res.status(400).json({error:"Repository URL required"});
    }

    const repoPath = await cloneRepo(repoUrl);

    const semgrepData = runSemgrep(repoPath);

    const scanId = Date.now();

    const vulnerabilities = (semgrepData.results || []).map((r,index)=>{

      const type = r.check_id.split(".").pop();

      return{

        id:`vuln-${scanId}-${index}`,
        type,
        file:path.relative(repoPath,r.path),
        line:r.start.line,
        code:r.extra?.lines?.trim() || "",
        severity:r.extra?.severity || "unknown",

        forensics:getForensics(repoPath,r.path,r.start.line),

        autoFix:generatePatch(type,r.extra?.lines || "")

      };

    });

    console.log(`⚠ ${vulnerabilities.length} vulnerabilities detected`);

    res.json({

      repoPath,
      repoUrl,
      vulnerabilities

    });

  }catch(err){

    console.error("Scan error:",err);

    res.status(500).json({error:"Scan failed"});

  }

});

/* ================================
   PATCH API
================================ */

app.post("/api/apply-fix", async (req,res)=>{

  try{

    const { repoPath, repoUrl, vulnerabilities } = req.body;

    const patched = applyPatches(repoPath, vulnerabilities);

    if(patched === 0){

      return res.json({
        success:false,
        message:"No patchable vulnerabilities"
      });

    }

    const prUrl = await createPullRequest(repoPath, repoUrl);

    res.json({

      success:true,
      pullRequest:prUrl

    });

  }catch(err){

    console.error("Patch error:",err);

    res.status(500).json({error:"Patch failed"});

  }

});

/* ================================
   SERVER START
================================ */

const PORT = 3001;

app.listen(PORT,()=>{

  console.log("");
  console.log("🛡️ CodeGuardian Security Bot Running");
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`📡 POST /api/scan-repo`);
  console.log(`📡 POST /api/apply-fix`);
  console.log("");

});