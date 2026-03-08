// // import { useState, useEffect, useRef } from "react";

// // // ─────────────────────────────────────────────────────────────────────────────
// // //  CONSTANTS & MOCK FALLBACKS
// // // ─────────────────────────────────────────────────────────────────────────────
// // const MOCK_SCAN = [
// //   {
// //     id: "DEMO-101",
// //     type: "sql-injection",
// //     file: "vulnerable.js",
// //     line: 5,
// //     code: "db.query('SELECT * FROM users WHERE id=' + id)",
// //     forensics: { commit: "a1b2c3d4", author: "dev@example.com", date: "Mon Jan 01 2024", summary: "Add user login endpoint" },
// //     autoFix: "db.query('SELECT * FROM users WHERE id=?', [id])",
// //     severity: "error"
// //   }
// // ];

// // const SEVERITY_MAP = {
// //   "error": "CRITICAL",
// //   "high": "HIGH",
// //   "warning": "MEDIUM",
// //   "info": "LOW",
// // };

// // const SEV_COLOR = {
// //   CRITICAL: "#ff3b3b",
// //   HIGH:     "#ff8c00",
// //   MEDIUM:   "#f5c400",
// //   LOW:      "#00c853",
// // };

// // const BASE = "http://localhost:3001";

// // // ─────────────────────────────────────────────────────────────────────────────
// // //  HELPER COMPONENTS
// // // ─────────────────────────────────────────────────────────────────────────────

// // function SeverityBadge({ level }) {
// //   const sev = SEVERITY_MAP[level?.toLowerCase()] || "MEDIUM";
// //   const col = SEV_COLOR[sev];
// //   return (
// //     <span style={{
// //       background: col + "1a", color: col,
// //       border: `1px solid ${col}44`, borderRadius: 4,
// //       fontSize: 9, fontWeight: 800, padding: "2px 8px", letterSpacing: 1
// //     }}>
// //       {sev}
// //     </span>
// //   );
// // }

// // function StatCard({ label, value, color }) {
// //   return (
// //     <div style={{
// //       background: "#0a0f17", border: `1px solid ${color}22`,
// //       borderRadius: 10, padding: "20px 15px", textAlign: "center",
// //       boxShadow: `0 4px 20px ${color}0a`
// //     }}>
// //       <div style={{ fontSize: 36, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
// //       <div style={{ fontSize: 9, color: "#445a7d", letterSpacing: 1.5, marginTop: 8, textTransform: "uppercase" }}>{label}</div>
// //     </div>
// //   );
// // }

// // // ─────────────────────────────────────────────────────────────────────────────
// // //  VULNERABILITY CARD
// // // ─────────────────────────────────────────────────────────────────────────────

// // function VulnCard({ vuln, onFix, isFixing, isFixed }) {
// //   const [open, setOpen] = useState(false);
// //   const sev = SEVERITY_MAP[vuln.severity?.toLowerCase()] || "MEDIUM";
// //   const col = SEV_COLOR[sev];

// //   return (
// //     <div style={{
// //       background: "#0a0f17",
// //       border: `1px solid ${isFixed ? "#00c85344" : "#1c2436"}`,
// //       borderLeft: `4px solid ${isFixed ? "#00c853" : col}`,
// //       borderRadius: 10, marginBottom: 12, overflow: "hidden",
// //       transition: "all 0.3s ease"
// //     }}>
// //       <div 
// //         onClick={() => setOpen(!open)}
// //         style={{ padding: "16px 20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}
// //       >
// //         <div style={{ flex: 1 }}>
// //           <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
// //             <span style={{ color: "#dde5f0", fontWeight: 700, fontSize: 13 }}>{vuln.type.toUpperCase()}</span>
// //             <SeverityBadge level={vuln.severity} />
// //             {isFixed && <span style={{ color: "#00c853", fontSize: 10, fontWeight: 800 }}>✓ PATCHED</span>}
// //           </div>
// //           <div style={{ color: "#445a7d", fontSize: 11 }}>
// //             {vuln.file} : <span style={{ color: "#7ea8cc" }}>Line {vuln.line}</span>
// //           </div>
// //         </div>
// //         <span style={{ color: "#2e4060" }}>{open ? "▲" : "▼"}</span>
// //       </div>

// //       {open && (
// //         <div style={{ padding: "0 20px 20px", borderTop: "1px solid #141c28", paddingTop: 15 }}>
// //           <div style={{ marginBottom: 15 }}>
// //             <div style={{ fontSize: 9, color: "#2e4060", marginBottom: 5, textTransform: "uppercase" }}>Vulnerable Code</div>
// //             <pre style={{ background: "#1a0a0a", color: "#ff8a8a", padding: 12, borderRadius: 6, fontSize: 11, fontFamily: "monospace" }}>{vuln.code}</pre>
// //           </div>
          
// //           <div style={{ marginBottom: 15 }}>
// //             <div style={{ fontSize: 9, color: "#2e4060", marginBottom: 5, textTransform: "uppercase" }}>Auto-Heal Patch</div>
// //             <pre style={{ background: "#0a1a0f", color: "#7fffd4", padding: 12, borderRadius: 6, fontSize: 11, fontFamily: "monospace" }}>{vuln.autoFix}</pre>
// //           </div>

// //           <div style={{ background: "#0d1420", padding: 12, borderRadius: 6, marginBottom: 20 }}>
// //             <div style={{ fontSize: 9, color: "#2e4060", marginBottom: 8, textTransform: "uppercase" }}>🔬 Forensic Origin (Patient Zero)</div>
// //             <div style={{ fontSize: 10, display: "grid", gridTemplateColumns: "80px 1fr", gap: "5px" }}>
// //               <span style={{ color: "#445a7d" }}>COMMIT:</span><span style={{ color: "#7ea8cc" }}>{vuln.forensics.commit}</span>
// //               <span style={{ color: "#445a7d" }}>AUTHOR:</span><span style={{ color: "#7ea8cc" }}>{vuln.forensics.author}</span>
// //               <span style={{ color: "#445a7d" }}>DATE:</span><span style={{ color: "#7ea8cc" }}>{vuln.forensics.date}</span>
// //             </div>
// //           </div>

// //           {!isFixed && (
// //             <button 
// //               onClick={() => onFix(vuln)}
// //               disabled={isFixing}
// //               style={{
// //                 width: "100%", padding: "12px", borderRadius: 8, border: "none",
// //                 background: isFixing ? "#1c2d45" : "linear-gradient(90deg, #00c853, #00796b)",
// //                 color: "white", fontWeight: 800, cursor: isFixing ? "not-allowed" : "pointer",
// //                 boxShadow: "0 4px 15px rgba(0, 200, 83, 0.2)"
// //               }}
// //             >
// //               {isFixing ? "GENERATING SECURE PULL REQUEST..." : "⚡ APPLY AUTO-FIX & OPEN PR"}
// //             </button>
// //           )}
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

// // // ─────────────────────────────────────────────────────────────────────────────
// // //  MAIN APP
// // // ─────────────────────────────────────────────────────────────────────────────

// // export default function App() {
// //   const [tab, setTab] = useState("scan");
// //   const [scanData, setScanData] = useState([]);
// //   const [loading, setLoading] = useState(false);
// //   const [scanRan, setScanRan] = useState(false);
// //   const [fixingId, setFixingId] = useState(null);
// //   const [fixedIds, setFixedIds] = useState([]);
// //   const [log, setLog] = useState([]);
// //   const fileInputRef = useRef(null);

// //   const addLog = (msg) => {
// //     const ts = new Date().toLocaleTimeString();
// //     setLog(prev => [...prev, `[${ts}] ${msg}`]);
// //   };

// //   // BACKEND CONNECTION TEST
// //   useEffect(() => {
// //     addLog("Initializing CodeGuardian Forensics Engine...");
// //   }, []);

// //   const uploadRepo = async (file) => {
// //     if (!file) return;
// //     setLoading(true);
// //     setScanRan(false);
// //     setScanData([]);
// //     addLog(`📤 Uploading ${file.name} to Dynamic Scanner...`);

// //     const formData = new FormData();
// //     formData.append("repo", file);

// //     try {
// //       const res = await fetch(`${BASE}/api/upload-scan`, {
// //         method: "POST",
// //         body: formData,
// //       });

// //       const data = await res.json();
      
// //       // CRITICAL FIX: Ensure we handle both direct arrays and nested objects
// //       const vulnerabilities = Array.isArray(data) ? data : (data.vulnerabilities || []);
      
// //       setScanData(vulnerabilities);
// //       setScanRan(true);
// //       addLog(`✅ Scan Complete: ${vulnerabilities.length} security issues identified.`);
// //     } catch (err) {
// //       addLog("⚠️ Backend offline. Loading Mock Demo Data for presentation.");
// //       setScanData(MOCK_SCAN);
// //       setScanRan(true);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleFix = async (vuln) => {
// //     setFixingId(vuln.id);
// //     addLog(`⚡ Patching ${vuln.type} in ${vuln.file}...`);
    
// //     // Simulate API delay for PR creation
// //     setTimeout(() => {
// //       setFixedIds(prev => [...prev, vuln.id]);
// //       setFixingId(null);
// //       addLog(`🎉 Pull Request Created: Fix-${vuln.id} merged into main.`);
// //     }, 2000);
// //   };

// //   return (
// //     <div style={{ minHeight: "100vh", background: "#060c14", color: "#c4cfe0", fontFamily: "monospace", paddingBottom: 50 }}>
      
// //       {/* HEADER */}
// //       <header style={{ padding: "20px 40px", borderBottom: "1px solid #111d2e", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#080e18" }}>
// //         <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
// //           <div style={{ padding: 8, background: "#00c853", borderRadius: 8, color: "white", fontWeight: "bold" }}>🛡️</div>
// //           <h1 style={{ fontSize: 18, letterSpacing: 1 }}>CODE<span style={{ color: "#00c853" }}>GUARDIAN</span></h1>
// //         </div>
// //         <div style={{ fontSize: 10, color: "#00c853", border: "1px solid #00c85344", padding: "4px 10px", borderRadius: 20 }}>● BACKEND LIVE</div>
// //       </header>

// //       {/* TABS */}
// //       <nav style={{ display: "flex", justifyContent: "center", gap: 30, marginTop: 20 }}>
// //         {["scan", "log"].map(t => (
// //           <button 
// //             key={t}
// //             onClick={() => setTab(t)}
// //             style={{ 
// //               background: "none", border: "none", color: tab === t ? "#00c853" : "#445a7d", 
// //               cursor: "pointer", fontWeight: "bold", textTransform: "uppercase", fontSize: 12,
// //               borderBottom: tab === t ? "2px solid #00c853" : "none", paddingBottom: 5
// //             }}
// //           >
// //             {t}
// //           </button>
// //         ))}
// //       </nav>

// //       <main style={{ maxWidth: 800, margin: "30px auto", padding: "0 20px" }}>
        
// //         {tab === "scan" && (
// //           <>
// //             {/* UPLOAD BOX */}
// //             <div style={{ background: "#0a0f17", border: "2px dashed #1c2d45", borderRadius: 15, padding: 40, textAlign: "center", marginBottom: 30 }}>
// //               <input type="file" ref={fileInputRef} onChange={(e) => uploadRepo(e.target.files[0])} style={{ display: "none" }} />
// //               <div style={{ fontSize: 40, marginBottom: 15 }}>📦</div>
// //               <h2 style={{ fontSize: 16, marginBottom: 10 }}>Ready for Forensic Analysis?</h2>
// //               <p style={{ fontSize: 11, color: "#445a7d", marginBottom: 25 }}>Upload your repository ZIP to trace vulnerability origins.</p>
// //               <button 
// //                 onClick={() => fileInputRef.current.click()}
// //                 disabled={loading}
// //                 style={{ 
// //                   background: "#00c853", color: "white", border: "none", padding: "12px 30px", 
// //                   borderRadius: 8, fontWeight: "bold", cursor: "pointer" 
// //                 }}
// //               >
// //                 {loading ? "SCANNING ENGINE ACTIVE..." : "SELECT REPOSITORY ZIP"}
// //               </button>
// //             </div>

// //             {/* STATS */}
// //             {scanRan && (
// //               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 15, marginBottom: 30 }}>
// //                 <StatCard label="Total Detected" value={scanData.length} color="#7ea8cc" />
// //                 <StatCard label="Critical/High" value={scanData.filter(v => v.severity === 'error' || v.severity === 'high').length} color="#ff3b3b" />
// //                 <StatCard label="Auto-Patched" value={fixedIds.length} color="#00c853" />
// //               </div>
// //             )}

// //             {/* RESULTS LIST */}
// //             {scanData.map(v => (
// //               <VulnCard key={v.id} vuln={v} onFix={handleFix} isFixing={fixingId === v.id} isFixed={fixedIds.includes(v.id)} />
// //             ))}
// //           </>
// //         )}

// //         {tab === "log" && (
// //           <div style={{ background: "#050a10", padding: 20, borderRadius: 10, border: "1px solid #111d2e", height: 400, overflowY: "auto" }}>
// //             {log.map((entry, i) => (
// //               <div key={i} style={{ fontSize: 11, marginBottom: 8, color: entry.includes("✅") ? "#00c853" : "#7ea8cc" }}>
// //                 {entry}
// //               </div>
// //             ))}
// //             <div style={{ color: "#00c853", animation: "blink 1s infinite" }}>_</div>
// //           </div>
// //         )}
// //       </main>

// //       <footer style={{ textAlign: "center", color: "#2e4060", fontSize: 10, marginTop: 40 }}>
// //         CODEGUARDIAN V1.0 // HACKATHON PROTOTYPE // PORT 3001
// //       </footer>

// //       <style>{`
// //         @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0; } 100% { opacity: 1; } }
// //       `}</style>
// //     </div>
// //   );
// // }




// // import { useState, useEffect } from "react";

// // // ─────────────────────────────────────────────────────────────────────────────
// // //  CONSTANTS & MOCK FALLBACKS
// // // ─────────────────────────────────────────────────────────────────────────────

// // const MOCK_SCAN = [
// //   {
// //     id: "DEMO-101",
// //     type: "sql-injection",
// //     file: "vulnerable.js",
// //     line: 5,
// //     code: "db.query('SELECT * FROM users WHERE id=' + id)",
// //     forensics: { commit: "a1b2c3d4", author: "dev@example.com", date: "Mon Jan 01 2024", summary: "Add user login endpoint" },
// //     autoFix: "db.query('SELECT * FROM users WHERE id=?', [id])",
// //     severity: "error"
// //   }
// // ];

// // const SEVERITY_MAP = {
// //   error: "CRITICAL",
// //   high: "HIGH",
// //   warning: "MEDIUM",
// //   info: "LOW",
// // };

// // const SEV_COLOR = {
// //   CRITICAL: "#ff3b3b",
// //   HIGH: "#ff8c00",
// //   MEDIUM: "#f5c400",
// //   LOW: "#00c853",
// // };

// // const BASE = "http://localhost:3001";

// // // ─────────────────────────────────────────────────────────────────────────────
// // //  HELPER COMPONENTS
// // // ─────────────────────────────────────────────────────────────────────────────

// // function SeverityBadge({ level }) {
// //   const sev = SEVERITY_MAP[level?.toLowerCase()] || "MEDIUM";
// //   const col = SEV_COLOR[sev];

// //   return (
// //     <span style={{
// //       background: col + "1a",
// //       color: col,
// //       border: `1px solid ${col}44`,
// //       borderRadius: 4,
// //       fontSize: 9,
// //       fontWeight: 800,
// //       padding: "2px 8px"
// //     }}>
// //       {sev}
// //     </span>
// //   );
// // }

// // function StatCard({ label, value, color }) {
// //   return (
// //     <div style={{
// //       background: "#0a0f17",
// //       border: `1px solid ${color}22`,
// //       borderRadius: 10,
// //       padding: "20px 15px",
// //       textAlign: "center"
// //     }}>
// //       <div style={{ fontSize: 36, fontWeight: 800, color }}>{value}</div>
// //       <div style={{ fontSize: 9, color: "#445a7d", letterSpacing: 1.5, marginTop: 8 }}>
// //         {label}
// //       </div>
// //     </div>
// //   );
// // }

// // // ─────────────────────────────────────────────────────────────────────────────
// // //  VULNERABILITY CARD
// // // ─────────────────────────────────────────────────────────────────────────────

// // function VulnCard({ vuln }) {

// //   const [open, setOpen] = useState(false);

// //   return (
// //     <div style={{
// //       background: "#0a0f17",
// //       border: "1px solid #1c2436",
// //       borderRadius: 10,
// //       marginBottom: 12
// //     }}>

// //       <div
// //         onClick={() => setOpen(!open)}
// //         style={{
// //           padding: "16px 20px",
// //           cursor: "pointer",
// //           display: "flex",
// //           justifyContent: "space-between"
// //         }}
// //       >

// //         <div>
// //           <span style={{ fontWeight: 700 }}>{vuln.type.toUpperCase()}</span>
// //           {" "}
// //           <SeverityBadge level={vuln.severity} />

// //           <div style={{ fontSize: 11, marginTop: 5 }}>
// //             {vuln.file} : line {vuln.line}
// //           </div>
// //         </div>

// //         <span>{open ? "▲" : "▼"}</span>

// //       </div>

// //       {open && (

// //         <div style={{ padding: "20px" }}>

// //           <div style={{ marginBottom: 10 }}>
// //             <pre style={{ background: "#1a0a0a", color: "#ff8a8a", padding: 10 }}>
// //               {vuln.code}
// //             </pre>
// //           </div>

// //           <div style={{ marginBottom: 10 }}>
// //             <pre style={{ background: "#0a1a0f", color: "#7fffd4", padding: 10 }}>
// //               {vuln.autoFix}
// //             </pre>
// //           </div>

// //           <div style={{ fontSize: 12 }}>
// //             <b>Author:</b> {vuln.forensics.author}
// //           </div>

// //         </div>

// //       )}

// //     </div>
// //   );
// // }

// // // ─────────────────────────────────────────────────────────────────────────────
// // //  MAIN APP
// // // ─────────────────────────────────────────────────────────────────────────────

// // export default function App() {

// //   const [repoUrl, setRepoUrl] = useState("");
// //   const [scanData, setScanData] = useState([]);
// //   const [scanRan, setScanRan] = useState(false);
// //   const [loading, setLoading] = useState(false);
// //   const [log, setLog] = useState([]);
// //   const [prLink, setPrLink] = useState("");

// //   const addLog = (msg) => {
// //     const ts = new Date().toLocaleTimeString();
// //     setLog(prev => [...prev, `[${ts}] ${msg}`]);
// //   };

// //   useEffect(() => {
// //     addLog("Initializing CodeGuardian Engine...");
// //   }, []);

// //   // ───────────────────────────────────────────────────────────────────────────
// //   //  SCAN REPO
// //   // ───────────────────────────────────────────────────────────────────────────

// //   const scanRepo = async () => {

// //     if (!repoUrl) return;

// //     setLoading(true);
// //     setScanData([]);
// //     setScanRan(false);

// //     addLog(`📥 Cloning repository ${repoUrl}`);

// //     try {

// //       const res = await fetch(`${BASE}/api/scan-repo`, {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json"
// //         },
// //         body: JSON.stringify({ repoUrl })
// //       });

// //       const data = await res.json();

// //       const vulnerabilities = data.vulnerabilities || [];

// //       setScanData(vulnerabilities);
// //       setPrLink(data.pullRequest);

// //       setScanRan(true);

// //       addLog(`✅ Scan Complete: ${vulnerabilities.length} vulnerabilities detected.`);

// //       if (data.pullRequest) {
// //         addLog(`🚀 Pull Request created successfully.`);
// //       }

// //     } catch (err) {

// //       addLog("⚠ Backend offline. Loading demo data.");
// //       setScanData(MOCK_SCAN);
// //       setScanRan(true);

// //     }

// //     setLoading(false);

// //   };

// //   // ───────────────────────────────────────────────────────────────────────────
// //   //  UI
// //   // ───────────────────────────────────────────────────────────────────────────

// //   return (

// //     <div style={{ minHeight: "100vh", background: "#060c14", color: "#c4cfe0", fontFamily: "monospace" }}>

// //       <header style={{ padding: "20px 40px", borderBottom: "1px solid #111d2e" }}>
// //         <h1>
// //           CODE<span style={{ color: "#00c853" }}>GUARDIAN</span>
// //         </h1>
// //       </header>

// //       <main style={{ maxWidth: 800, margin: "30px auto" }}>

// //         {/* REPO INPUT */}

// //         <div style={{ marginBottom: 30 }}>

// //           <input
// //             type="text"
// //             placeholder="Enter GitHub Repo URL"
// //             value={repoUrl}
// //             onChange={(e) => setRepoUrl(e.target.value)}
// //             style={{ width: 400, padding: 10, marginRight: 10 }}
// //           />

// //           <button
// //             onClick={scanRepo}
// //             disabled={loading}
// //             style={{
// //               padding: "10px 20px",
// //               background: "#00c853",
// //               border: "none",
// //               color: "white",
// //               cursor: "pointer"
// //             }}
// //           >
// //             {loading ? "SCANNING..." : "SCAN REPOSITORY"}
// //           </button>

// //         </div>

// //         {/* STATS */}

// //         {scanRan && (

// //           <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>

// //             <StatCard
// //               label="TOTAL DETECTED"
// //               value={scanData.length}
// //               color="#7ea8cc"
// //             />

// //             <StatCard
// //               label="CRITICAL/HIGH"
// //               value={scanData.filter(v => v.severity === "error" || v.severity === "high").length}
// //               color="#ff3b3b"
// //             />

// //           </div>

// //         )}

// //         {/* PR LINK */}

// //         {prLink && (

// //           <div style={{ marginBottom: 20 }}>

// //             <h3>Pull Request Created</h3>

// //             <a
// //               href={prLink}
// //               target="_blank"
// //               rel="noopener noreferrer"
// //               style={{ color: "#00c853" }}
// //             >
// //               {prLink}
// //             </a>

// //           </div>

// //         )}

// //         {/* RESULTS */}

// //         {scanData.map(v => (
// //           <VulnCard key={v.id} vuln={v} />
// //         ))}

// //         {/* LOG */}

// //         <div style={{ marginTop: 40 }}>

// //           <h3>System Log</h3>

// //           <div style={{
// //             background: "#050a10",
// //             padding: 20,
// //             height: 200,
// //             overflowY: "auto"
// //           }}>

// //             {log.map((entry, i) => (
// //               <div key={i}>{entry}</div>
// //             ))}

// //           </div>

// //         </div>

// //       </main>

// //     </div>

// //   );

// // }







// // import { useState, useEffect } from "react";

// // /* ================================
// //    CONSTANTS
// // ================================ */

// // const SEVERITY_MAP = {
// //   error: "CRITICAL",
// //   high: "HIGH",
// //   warning: "MEDIUM",
// //   info: "LOW",
// // };

// // const SEV_COLOR = {
// //   CRITICAL: "#ff3b3b",
// //   HIGH: "#ff8c00",
// //   MEDIUM: "#f5c400",
// //   LOW: "#00c853",
// // };

// // const BASE = "http://localhost:3001";

// // /* ================================
// //    HELPER COMPONENTS
// // ================================ */

// // function SeverityBadge({ level }) {

// //   const sev = SEVERITY_MAP[level?.toLowerCase()] || "MEDIUM";
// //   const col = SEV_COLOR[sev];

// //   return (
// //     <span style={{
// //       background: col + "22",
// //       color: col,
// //       border: `1px solid ${col}44`,
// //       borderRadius: 4,
// //       fontSize: 10,
// //       padding: "2px 6px"
// //     }}>
// //       {sev}
// //     </span>
// //   );

// // }

// // function StatCard({ label, value, color }) {

// //   return (
// //     <div style={{
// //       background:"#0a0f17",
// //       border:`1px solid ${color}33`,
// //       borderRadius:10,
// //       padding:20,
// //       textAlign:"center"
// //     }}>
// //       <div style={{fontSize:34,fontWeight:"bold",color}}>
// //         {value}
// //       </div>

// //       <div style={{
// //         fontSize:11,
// //         color:"#445a7d",
// //         marginTop:5,
// //         letterSpacing:1
// //       }}>
// //         {label}
// //       </div>
// //     </div>
// //   );

// // }

// // /* ================================
// //    VULNERABILITY CARD
// // ================================ */

// // function VulnCard({ vuln }) {

// //   const [open,setOpen] = useState(false);

// //   return (

// //     <div style={{
// //       background:"#0a0f17",
// //       border:"1px solid #1c2436",
// //       borderRadius:10,
// //       marginBottom:15
// //     }}>

// //       <div
// //         onClick={()=>setOpen(!open)}
// //         style={{
// //           padding:"16px",
// //           display:"flex",
// //           justifyContent:"space-between",
// //           cursor:"pointer"
// //         }}
// //       >

// //         <div>

// //           <div style={{fontWeight:"bold"}}>
// //             {vuln.type?.toUpperCase()}
// //             {" "}
// //             <SeverityBadge level={vuln.severity}/>
// //           </div>

// //           <div style={{fontSize:12}}>
// //             {vuln.file} : line {vuln.line}
// //           </div>

// //         </div>

// //         <div>{open ? "▲" : "▼"}</div>

// //       </div>

// //       {open && (

// //         <div style={{padding:20}}>

// //           <div style={{marginBottom:10}}>

// //             <div style={{fontSize:11,color:"#888"}}>
// //               Vulnerable Code
// //             </div>

// //             <pre style={{
// //               background:"#1a0a0a",
// //               color:"#ff8a8a",
// //               padding:10,
// //               borderRadius:5
// //             }}>
// //               {vuln.code}
// //             </pre>

// //           </div>

// //           <div>

// //             <div style={{fontSize:11,color:"#888"}}>
// //               Auto Patch
// //             </div>

// //             <pre style={{
// //               background:"#0a1a0f",
// //               color:"#7fffd4",
// //               padding:10,
// //               borderRadius:5
// //             }}>
// //               {vuln.autoFix}
// //             </pre>

// //           </div>

// //         </div>

// //       )}

// //     </div>

// //   );

// // }

// // /* ================================
// //    MAIN APP
// // ================================ */

// // export default function App(){

// //   const [repoUrl,setRepoUrl] = useState("");
// //   const [scanData,setScanData] = useState([]);
// //   const [scanRan,setScanRan] = useState(false);
// //   const [loading,setLoading] = useState(false);
// //   const [log,setLog] = useState([]);
// //   const [prLink,setPrLink] = useState("");

// //   const addLog = (msg)=>{

// //     const ts = new Date().toLocaleTimeString();

// //     setLog(prev => [...prev,`[${ts}] ${msg}`]);

// //   };

// //   useEffect(()=>{

// //     addLog("CodeGuardian initialized");

// //   },[]);

// //   /* ================================
// //      SCAN REPOSITORY
// //   ================================= */

// //   const scanRepo = async()=>{

// //     if(!repoUrl) return;

// //     setLoading(true);
// //     setScanData([]);
// //     setScanRan(false);

// //     addLog(`Cloning ${repoUrl}`);

// //     try{

// //       const res = await fetch(`${BASE}/api/scan-repo`,{

// //         method:"POST",

// //         headers:{
// //           "Content-Type":"application/json"
// //         },

// //         body:JSON.stringify({repoUrl})

// //       });

// //       const data = await res.json();

// //       const vulnerabilities = data.vulnerabilities || [];

// //       setScanData(vulnerabilities);
// //       setPrLink(data.pullRequest || "");
// //       setScanRan(true);

// //       addLog(`${vulnerabilities.length} vulnerabilities detected`);

// //       if(data.pullRequest){

// //         addLog(`Pull request created`);

// //       }

// //     }catch(err){

// //       addLog("Backend connection failed");

// //     }

// //     setLoading(false);

// //   };

// //   /* ================================
// //      UI
// //   ================================= */

// //   return(

// //     <div style={{
// //       minHeight:"100vh",
// //       background:"#060c14",
// //       color:"#c4cfe0",
// //       fontFamily:"monospace",
// //       paddingBottom:50
// //     }}>

// //       {/* HEADER */}

// //       <header style={{
// //         padding:"20px 40px",
// //         borderBottom:"1px solid #111d2e"
// //       }}>

// //         <h1 style={{margin:0}}>
// //           CODE<span style={{color:"#00c853"}}>GUARDIAN</span>
// //         </h1>

// //       </header>

// //       <main style={{
// //         maxWidth:900,
// //         margin:"30px auto",
// //         padding:"0 20px"
// //       }}>

// //         {/* REPO INPUT */}

// //         <div style={{
// //           background:"#0a0f17",
// //           padding:25,
// //           borderRadius:10,
// //           marginBottom:30
// //         }}>

// //           <input
// //             type="text"
// //             placeholder="Enter GitHub Repository URL"
// //             value={repoUrl}
// //             onChange={(e)=>setRepoUrl(e.target.value)}
// //             style={{
// //               width:"70%",
// //               padding:10,
// //               marginRight:10,
// //               borderRadius:6,
// //               border:"1px solid #1c2436",
// //               background:"#060c14",
// //               color:"#c4cfe0"
// //             }}
// //           />

// //           <button
// //             onClick={scanRepo}
// //             disabled={loading}
// //             style={{
// //               padding:"10px 20px",
// //               background:"#00c853",
// //               border:"none",
// //               color:"white",
// //               borderRadius:6,
// //               cursor:"pointer"
// //             }}
// //           >
// //             {loading ? "SCANNING..." : "SCAN REPOSITORY"}
// //           </button>

// //         </div>

// //         {/* STATS */}

// //         {scanRan && (

// //           <div style={{
// //             display:"grid",
// //             gridTemplateColumns:"1fr 1fr",
// //             gap:15,
// //             marginBottom:30
// //           }}>

// //             <StatCard
// //               label="TOTAL DETECTED"
// //               value={scanData.length}
// //               color="#7ea8cc"
// //             />

// //             <StatCard
// //               label="CRITICAL/HIGH"
// //               value={scanData.filter(v => v.severity === "error" || v.severity === "high").length}
// //               color="#ff3b3b"
// //             />

// //           </div>

// //         )}

// //         {/* PR LINK */}

// //         {prLink && (

// //           <div style={{
// //             background:"#0a0f17",
// //             padding:20,
// //             borderRadius:10,
// //             marginBottom:20
// //           }}>

// //             <h3 style={{marginTop:0}}>Pull Request Created</h3>

// //             <a
// //               href={prLink}
// //               target="_blank"
// //               rel="noreferrer"
// //               style={{color:"#00c853"}}
// //             >
// //               {prLink}
// //             </a>

// //           </div>

// //         )}

// //         {/* VULNERABILITIES */}

// //         {scanData.map(v => (
// //           <VulnCard key={v.id} vuln={v}/>
// //         ))}

// //         {/* LOGS */}

// //         <div style={{marginTop:40}}>

// //           <h3>System Log</h3>

// //           <div style={{
// //             background:"#050a10",
// //             padding:20,
// //             height:220,
// //             overflowY:"auto",
// //             borderRadius:10
// //           }}>

// //             {log.map((entry,i)=>(
// //               <div key={i} style={{marginBottom:6}}>
// //                 {entry}
// //               </div>
// //             ))}

// //           </div>

// //         </div>

// //       </main>

// //     </div>

// //   );

// // }

// import { useState, useEffect } from "react";

// /* ================================
//    CONSTANTS
// ================================ */

// const SEVERITY_MAP = {
//   error: "CRITICAL",
//   high: "HIGH",
//   warning: "MEDIUM",
//   info: "LOW",
// };

// const SEV_COLOR = {
//   CRITICAL: "#ff3b3b",
//   HIGH: "#ff8c00",
//   MEDIUM: "#f5c400",
//   LOW: "#00c853",
// };

// const BASE = "http://localhost:3001";

// /* ================================
//    HELPER COMPONENTS
// ================================ */

// function SeverityBadge({ level }) {

//   const sev = SEVERITY_MAP[level?.toLowerCase()] || "MEDIUM";
//   const col = SEV_COLOR[sev];

//   return (
//     <span style={{
//       background: col + "22",
//       color: col,
//       border: `1px solid ${col}44`,
//       borderRadius: 4,
//       fontSize: 10,
//       padding: "2px 6px"
//     }}>
//       {sev}
//     </span>
//   );

// }

// function StatCard({ label, value, color }) {

//   return (
//     <div style={{
//       background:"#0a0f17",
//       border:`1px solid ${color}33`,
//       borderRadius:10,
//       padding:20,
//       textAlign:"center"
//     }}>
//       <div style={{fontSize:34,fontWeight:"bold",color}}>
//         {value}
//       </div>

//       <div style={{
//         fontSize:11,
//         color:"#445a7d",
//         marginTop:5,
//         letterSpacing:1
//       }}>
//         {label}
//       </div>
//     </div>
//   );

// }

// /* ================================
//    VULNERABILITY CARD
// ================================ */

// function VulnCard({ vuln }) {

//   const [open,setOpen] = useState(false);

//   return (

//     <div style={{
//       background:"#0a0f17",
//       border:"1px solid #1c2436",
//       borderRadius:10,
//       marginBottom:15
//     }}>

//       <div
//         onClick={()=>setOpen(!open)}
//         style={{
//           padding:"16px",
//           display:"flex",
//           justifyContent:"space-between",
//           cursor:"pointer"
//         }}
//       >

//         <div>

//           <div style={{fontWeight:"bold"}}>
//             {vuln.type?.toUpperCase()}
//             {" "}
//             <SeverityBadge level={vuln.severity}/>
//           </div>

//           <div style={{fontSize:12}}>
//             {vuln.file} : line {vuln.line}
//           </div>

//         </div>

//         <div>{open ? "▲" : "▼"}</div>

//       </div>

//       {open && (

//         <div style={{padding:20}}>

//           <div style={{marginBottom:10}}>

//             <div style={{fontSize:11,color:"#888"}}>
//               Vulnerable Code
//             </div>

//             <pre style={{
//               background:"#1a0a0a",
//               color:"#ff8a8a",
//               padding:10,
//               borderRadius:5
//             }}>
//               {vuln.code}
//             </pre>

//           </div>

//           <div>

//             <div style={{fontSize:11,color:"#888"}}>
//               Auto Patch
//             </div>

//             <pre style={{
//               background:"#0a1a0f",
//               color:"#7fffd4",
//               padding:10,
//               borderRadius:5
//             }}>
//               {vuln.autoFix}
//             </pre>

//           </div>

//         </div>

//       )}

//     </div>

//   );

// }

// /* ================================
//    MAIN APP
// ================================ */

// export default function App(){

//   const [repoUrl,setRepoUrl] = useState("");
//   const [repoPath,setRepoPath] = useState("");   // ⭐ NEW
//   const [scanData,setScanData] = useState([]);
//   const [scanRan,setScanRan] = useState(false);
//   const [loading,setLoading] = useState(false);
//   const [log,setLog] = useState([]);
//   const [prLink,setPrLink] = useState("");

//   const addLog = (msg)=>{

//     const ts = new Date().toLocaleTimeString();

//     setLog(prev => [...prev,`[${ts}] ${msg}`]);

//   };

//   useEffect(()=>{

//     addLog("CodeGuardian initialized");

//   },[]);

//   /* ================================
//      SCAN REPOSITORY
//   ================================= */

//   const scanRepo = async()=>{

//     if(!repoUrl) return;

//     setLoading(true);
//     setScanData([]);
//     setScanRan(false);

//     addLog(`Cloning ${repoUrl}`);

//     try{

//       const res = await fetch(`${BASE}/api/scan-repo`,{

//         method:"POST",

//         headers:{
//           "Content-Type":"application/json"
//         },

//         body:JSON.stringify({repoUrl})

//       });

//       const data = await res.json();

//       const vulnerabilities = data.vulnerabilities || [];

//       setRepoPath(data.repoPath);      // ⭐ IMPORTANT
//       setScanData(vulnerabilities);
//       setScanRan(true);

//       addLog(`${vulnerabilities.length} vulnerabilities detected`);

//     }catch(err){

//       addLog("Backend connection failed");

//     }

//     setLoading(false);

//   };

//   /* ================================
//      APPLY FIX (CREATE PR)
//   ================================= */

//   const applyFix = async()=>{

//     try{

//       addLog("Applying automatic fixes...");

//       const res = await fetch(`${BASE}/api/apply-fix`,{

//         method:"POST",

//         headers:{
//           "Content-Type":"application/json"
//         },

//         body:JSON.stringify({
//           repoPath,
//           repoUrl,
//           vulnerabilities:scanData
//         })

//       });

//       const data = await res.json();

//       if(data.pullRequest){

//         setPrLink(data.pullRequest);

//         addLog("Pull Request created successfully");

//       }else{

//         addLog("No automatic patches available");

//       }

//     }catch(err){

//       addLog("Patch process failed");

//     }

//   };

//   /* ================================
//      UI
//   ================================= */

//   return(

//     <div style={{
//       minHeight:"100vh",
//       background:"#060c14",
//       color:"#c4cfe0",
//       fontFamily:"monospace",
//       paddingBottom:50
//     }}>

//       <header style={{
//         padding:"20px 40px",
//         borderBottom:"1px solid #111d2e"
//       }}>

//         <h1 style={{margin:0}}>
//           CODE<span style={{color:"#00c853"}}>GUARDIAN</span>
//         </h1>

//       </header>

//       <main style={{
//         maxWidth:900,
//         margin:"30px auto",
//         padding:"0 20px"
//       }}>

//         {/* REPO INPUT */}

//         <div style={{
//           background:"#0a0f17",
//           padding:25,
//           borderRadius:10,
//           marginBottom:30
//         }}>

//           <input
//             type="text"
//             placeholder="Enter GitHub Repository URL"
//             value={repoUrl}
//             onChange={(e)=>setRepoUrl(e.target.value)}
//             style={{
//               width:"70%",
//               padding:10,
//               marginRight:10,
//               borderRadius:6,
//               border:"1px solid #1c2436",
//               background:"#060c14",
//               color:"#c4cfe0"
//             }}
//           />

//           <button
//             onClick={scanRepo}
//             disabled={loading}
//             style={{
//               padding:"10px 20px",
//               background:"#00c853",
//               border:"none",
//               color:"white",
//               borderRadius:6,
//               cursor:"pointer"
//             }}
//           >
//             {loading ? "SCANNING..." : "SCAN REPOSITORY"}
//           </button>

//         </div>

//         {/* STATS */}

//         {scanRan && (

//           <div style={{
//             display:"grid",
//             gridTemplateColumns:"1fr 1fr",
//             gap:15,
//             marginBottom:30
//           }}>

//             <StatCard
//               label="TOTAL DETECTED"
//               value={scanData.length}
//               color="#7ea8cc"
//             />

//             <StatCard
//               label="CRITICAL/HIGH"
//               value={scanData.filter(v => v.severity === "error" || v.severity === "high").length}
//               color="#ff3b3b"
//             />

//           </div>

//         )}

//         {/* APPLY FIX BUTTON */}

//         {scanRan && scanData.length > 0 && (

//           <div style={{marginBottom:25}}>

//             <button
//               onClick={applyFix}
//               style={{
//                 padding:"12px 30px",
//                 background:"#00c853",
//                 border:"none",
//                 color:"white",
//                 borderRadius:6,
//                 cursor:"pointer",
//                 fontWeight:"bold"
//               }}
//             >
//               APPLY AUTO FIX & CREATE PR
//             </button>

//           </div>

//         )}

//         {/* PR LINK */}

//         {prLink && (

//           <div style={{
//             background:"#0a0f17",
//             padding:20,
//             borderRadius:10,
//             marginBottom:20
//           }}>

//             <h3 style={{marginTop:0}}>Pull Request Created</h3>

//             <a
//               href={prLink}
//               target="_blank"
//               rel="noreferrer"
//               style={{color:"#00c853"}}
//             >
//               {prLink}
//             </a>

//           </div>

//         )}

//         {/* VULNERABILITIES */}

//         {scanData.map(v => (
//           <VulnCard key={v.id} vuln={v}/>
//         ))}

//         {/* LOGS */}

//         <div style={{marginTop:40}}>

//           <h3>System Log</h3>

//           <div style={{
//             background:"#050a10",
//             padding:20,
//             height:220,
//             overflowY:"auto",
//             borderRadius:10
//           }}>

//             {log.map((entry,i)=>(
//               <div key={i} style={{marginBottom:6}}>
//                 {entry}
//               </div>
//             ))}

//           </div>

//         </div>

//       </main>

//     </div>

//   );

// }




import React, { useState, useEffect, useRef } from "react";

/* ================================
   ICONS (INLINE SVGS)
================================ */
const Icons = {
  Shield: () => <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Search: ({ size = 18 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  History: ({ size = 14 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>,
  Fingerprint: ({ size = 20 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12a10 10 0 0 1 18-6"/><path d="M5 15a6 6 0 0 1 10-6"/><path d="M8 18a2 2 0 1 1 4 0"/><path d="M12 12a4 4 0 1 1 8 0"/><path d="M12 22V12"/><path d="M17 12a7 7 0 0 1-5 2"/></svg>,
  Terminal: ({ size = 14 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>,
  AlertTriangle: ({ size = 14 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  ChevronDown: ({ size = 18 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>,
  Github: ({ size = 18 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>,
  Zap: ({ size = 40 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  Cpu: ({ size = 20 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="15" x2="23" y2="15"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="15" x2="4" y2="15"/></svg>,
  Activity: ({ size = 12 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  User: ({ size = 14 }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
};

/* ================================
   CONSTANTS (PRESERVED)
================================ */
const SEVERITY_MAP = {
  error: "CRITICAL",
  high: "HIGH",
  warning: "MEDIUM",
  info: "LOW",
};

const SEV_COLOR = {
  CRITICAL: "#f43f5e",
  HIGH: "#f59e0b",
  MEDIUM: "#84cc16",
  LOW: "#06b6d4",
};

const BASE = "http://localhost:3001";

/* ================================
   MOCK DATA
================================ */
const MOCK_TIMELINE_DATA = [3, 2, 1, 5, 4, 2, 2];
const MOCK_TIMELINE_LABELS = ['Mar 01', 'Mar 02', 'Mar 03', 'Mar 04', 'Mar 05', 'Mar 06', 'Mar 07'];

const MOCK_TIMELINE_LIST = [
  { commit: "a3c9b1", author: "Aryan", date: "2024-03-01", count: 3, message: "Initial auth implementation" },
  { commit: "f9b2e4", author: "Aryan", date: "2024-03-03", count: 1, message: "Added session handling" },
  { commit: "7ad91e", author: "Aryan", date: "2024-03-05", count: 4, message: "Fixed API routing" },
];

const MOCK_FORENSICS = {
  commit: "a4f2c3",
  author: "Apurva Vats",
  date: "2024-02-20",
  summary: "Added login endpoint without input sanitization.",
  diff: "@@ -12,4 +12,4 @@\n- const user = await db.query(`SELECT * FROM users WHERE id = ${req.body.id}`);\n+ // Vulnerable code introduced here"
};

/* ================================
   REUSABLE UI COMPONENTS (INLINE STYLED)
================================ */

const Card = ({ children, style = {} }) => (
  <div style={{
    background: "rgba(15, 23, 42, 0.4)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    borderRadius: "16px",
    overflow: "hidden",
    ...style
  }}>
    {children}
  </div>
);

const Badge = ({ children, color }) => (
  <span style={{
    backgroundColor: `${color}20`,
    color: color,
    border: `1px solid ${color}40`,
    padding: "2px 8px",
    borderRadius: "9999px",
    fontSize: "10px",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: "-0.025em"
  }}>
    {children}
  </span>
);

/* ================================
   SUB-COMPONENTS
================================ */

function SimpleAreaChart({ data, labels }) {
  const max = Math.max(...data, 1);
  const width = 1000;
  const height = 200;
  
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - (val / max) * (height - 20) - 10;
    return `${x},${y}`;
  }).join(' ');

  const areaPath = `0,${height} ${points} ${width},${height}`;

  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "100%" }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`M ${areaPath} Z`} fill="url(#grad)" />
        <polyline fill="none" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" points={points} />
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
        {labels.map((l, i) => (
          <span key={i} style={{ fontSize: "10px", color: "#475569", fontFamily: "monospace" }}>{l}</span>
        ))}
      </div>
    </div>
  );
}

function VulnCard({ vuln }) {
  const [open, setOpen] = useState(false);
  const sev = SEVERITY_MAP[vuln.severity?.toLowerCase()] || "MEDIUM";
  const color = SEV_COLOR[sev];

  return (
    <div style={{ marginBottom: open ? "24px" : "16px", transition: "all 0.3s ease" }}>
      <Card style={{ border: open ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid rgba(255, 255, 255, 0.05)" }}>
        <div
          onClick={() => setOpen(!open)}
          style={{ padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", userSelect: "none" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ 
              width: "40px", height: "40px", borderRadius: "12px", 
              display: "flex", alignItems: "center", justifyContent: "center",
              backgroundColor: `${color}15`, color: color 
            }}>
              <Icons.AlertTriangle size={20} />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                <span style={{ fontSize: "14px", fontBold: "bold", color: "white", fontWeight: "700" }}>{vuln.type?.toUpperCase()}</span>
                <Badge color={color}>{sev}</Badge>
              </div>
              <div style={{ fontSize: "11px", color: "#64748b", fontFamily: "monospace" }}>
                {vuln.file} <span style={{ opacity: 0.3, margin: "0 4px" }}>•</span> line {vuln.line}
              </div>
            </div>
          </div>
          <div style={{ color: "#475569", transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s ease" }}>
            <Icons.ChevronDown size={18} />
          </div>
        </div>

        {open && (
          <div style={{ padding: "20px", borderTop: "1px solid rgba(255, 255, 255, 0.05)", backgroundColor: "rgba(0, 0, 0, 0.2)" }}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{ fontSize: "10px", fontWeight: "900", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px", display: "block" }}>Vulnerable Logic</label>
              <pre style={{ padding: "12px", borderRadius: "8px", backgroundColor: "rgba(244, 63, 94, 0.05)", color: "#fda4af", fontSize: "12px", fontFamily: "monospace", border: "1px solid rgba(244, 63, 94, 0.1)", whiteSpace: "pre-wrap" }}>
                {vuln.code}
              </pre>
            </div>
            <div>
              <label style={{ fontSize: "10px", fontWeight: "900", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px", display: "block" }}>AI Fix Recommendation</label>
              <pre style={{ padding: "12px", borderRadius: "8px", backgroundColor: "rgba(16, 185, 129, 0.05)", color: "#6ee7b7", fontSize: "12px", fontFamily: "monospace", border: "1px solid rgba(16, 185, 129, 0.1)", whiteSpace: "pre-wrap" }}>
                {vuln.autoFix}
              </pre>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

/* ================================
   MAIN APP
================================ */

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [repoUrl, setRepoUrl] = useState("");
  const [repoPath, setRepoPath] = useState("");
  const [scanData, setScanData] = useState([]);
  const [scanRan, setScanRan] = useState(false);
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState([]);
  const [prLink, setPrLink] = useState("");
  const logEndRef = useRef(null);

  const addLog = (msg) => {
    const ts = new Date().toLocaleTimeString();
    setLog(prev => [...prev, `[${ts}] ${msg}`]);
  };

  useEffect(() => {
    addLog("Secure Protocol Initiated");
    addLog("Awaiting repository source...");
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [log]);

  const scanRepo = async () => {
    if (!repoUrl) return;
    setLoading(true);
    setScanData([]);
    setScanRan(false);
    addLog(`Cloning external source: ${repoUrl}`);

    try {
      const res = await fetch(`${BASE}/api/scan-repo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl })
      });
      const data = await res.json();
      const vulnerabilities = data.vulnerabilities || [];
      setRepoPath(data.repoPath);
      setScanData(vulnerabilities);
      setScanRan(true);
      addLog(`Analysis complete. ${vulnerabilities.length} threats identified.`);
    } catch (err) {
      addLog("Handshake Failed: Backend unreachable.");
    }
    setLoading(false);
  };

  const applyFix = async () => {
    try {
      addLog("Injecting semantic patches...");
      const res = await fetch(`${BASE}/api/apply-fix`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoPath,
          repoUrl,
          vulnerabilities: scanData
        })
      });
      const data = await res.json();
      if (data.pullRequest) {
        setPrLink(data.pullRequest);
        addLog("Security PR broadcasted successfully.");
      } else {
        addLog("Status: Integrity verified. No patches required.");
      }
    } catch (err) {
      addLog("Encryption Error: Patch deployment failed.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#02040a", color: "#cbd5e1", fontFamily: "sans-serif", paddingBottom: "40px" }}>
      
      {/* HEADER */}
      <header style={{ 
        position: "sticky", top: 0, zIndex: 50, backgroundColor: "rgba(2, 4, 10, 0.8)", 
        backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", 
        padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" 
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ position: "relative" }}>
            <div style={{ backgroundColor: "#06b6d4", padding: "8px", borderRadius: "12px", color: "black" }}>
              <Icons.Shield />
            </div>
          </div>
          <h1 style={{ fontSize: "18px", fontWeight: "900", color: "white", textTransform: "uppercase", letterSpacing: "-0.05em", margin: 0 }}>
            Code<span style={{ color: "#22d3ee" }}>Guardian</span>
          </h1>
        </div>

        <nav style={{ display: "flex", backgroundColor: "rgba(255, 255, 255, 0.05)", padding: "4px", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
          {[
            { id: "home", label: "Scanner", icon: Icons.Search },
            { id: "timeline", label: "Timeline", icon: Icons.History },
            { id: "forensics", label: "Forensics", icon: Icons.Fingerprint }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex", alignItems: "center", gap: "8px", padding: "8px 20px", borderRadius: "12px", 
                fontSize: "11px", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.1em",
                backgroundColor: activeTab === tab.id ? "rgba(255, 255, 255, 0.1)" : "transparent",
                color: activeTab === tab.id ? "white" : "#64748b",
                border: "none", cursor: "pointer", transition: "all 0.3s ease"
              }}
            >
              <tab.icon size={14} />
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          ))}
        </nav>

        <div style={{ fontSize: "10px", fontFamily: "monospace", color: "rgba(6, 182, 212, 0.5)", backgroundColor: "rgba(6, 182, 212, 0.05)", padding: "4px 8px", borderRadius: "4px", border: "1px solid rgba(6, 182, 212, 0.1)" }}>
          SYSTEM_STABLE
        </div>
      </header>

      <main style={{ maxWidth: "1152px", margin: "0 auto", padding: "48px 24px" }}>
        
        {/* SCANNER VIEW */}
        {activeTab === "home" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "32px" }}>
            <div style={{ gridColumn: "span 8", display: "flex", flexDirection: "column", gap: "32px" }}>
              <Card style={{ padding: "32px", border: "1px solid rgba(255, 255, 255, 0.1)" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  <div>
                    <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "white", margin: "0 0 4px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                      <Icons.Cpu /> Neural Scan Engine
                    </h2>
                    <p style={{ color: "#64748b", fontSize: "12px", margin: 0 }}>Enter a GitHub repository URL to initiate deep security inspection.</p>
                  </div>
                  
                  <div style={{ display: "flex", gap: "12px" }}>
                    <div style={{ position: "relative", flexGrow: 1 }}>
                      <div style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#475569" }}>
                        <Icons.Github />
                      </div>
                      <input
                        type="text"
                        placeholder="https://github.com/org/repository"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        style={{
                          width: "100%", backgroundColor: "rgba(0, 0, 0, 0.4)", border: "1px solid rgba(255, 255, 255, 0.05)", 
                          color: "white", padding: "16px 16px 16px 48px", borderRadius: "16px", outline: "none", 
                          fontFamily: "monospace", fontSize: "14px", boxSizing: "border-box"
                        }}
                      />
                    </div>
                    <button
                      onClick={scanRepo}
                      disabled={loading}
                      style={{
                        padding: "0 32px", borderRadius: "16px", fontWeight: "900", fontSize: "11px", letterSpacing: "0.2em", 
                        textTransform: "uppercase", backgroundColor: loading ? "#1e293b" : "#06b6d4", 
                        color: loading ? "#64748b" : "black", cursor: loading ? "not-allowed" : "pointer", 
                        border: "none", transition: "all 0.3s ease", display: "flex", alignItems: "center", justifyContent: "center"
                      }}
                    >
                      {loading ? "INITIALIZING..." : "SCAN SOURCE"}
                    </button>
                  </div>
                </div>
              </Card>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                   <h3 style={{ fontSize: "11px", fontWeight: "900", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.3em", margin: 0 }}>Detection Results</h3>
                   <div style={{ height: "1px", flexGrow: 1, margin: "0 16px", backgroundColor: "rgba(255, 255, 255, 0.05)" }}></div>
                   <span style={{ fontSize: "10px", fontFamily: "monospace", color: "#06b6d4" }}>{scanData.length} entities</span>
                </div>

                {scanData.map(v => (
                  <VulnCard key={v.id} vuln={v}/>
                ))}

                {!scanRan && !loading && (
                  <div style={{ padding: "128px 0", textAlign: "center" }}>
                    <div style={{ display: "inline-flex", padding: "20px", borderRadius: "24px", backgroundColor: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.05)", marginBottom: "24px", color: "#334155" }}>
                       <Icons.Zap size={40} />
                    </div>
                    <p style={{ color: "#64748b", fontSize: "14px", fontStyle: "italic", margin: 0 }}>Ready for deep-code analysis...</p>
                  </div>
                )}
              </div>
            </div>

            <div style={{ gridColumn: "span 4", display: "flex", flexDirection: "column", gap: "24px" }}>
              {scanRan && (
                <Card style={{ padding: "24px", backgroundColor: "transparent", backgroundImage: "linear-gradient(to bottom right, #0f172a, #000)" }}>
                  <h4 style={{ fontSize: "10px", fontWeight: "900", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "24px", margin: 0 }}>Threat Overview</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "8px" }}>
                        <span style={{ color: "#94a3b8" }}>Critical & High</span>
                        <span style={{ color: "#f43f5e", fontWeight: "bold" }}>{scanData.filter(v => v.severity === "error" || v.severity === "high").length}</span>
                      </div>
                      <div style={{ height: "6px", backgroundColor: "rgba(255, 255, 255, 0.05)", borderRadius: "999px", overflow: "hidden" }}>
                        <div style={{ height: "100%", backgroundColor: "#f43f5e", transition: "width 1s ease", width: `${(scanData.filter(v => v.severity === "error" || v.severity === "high").length / Math.max(scanData.length, 1)) * 100}%` }} />
                      </div>
                    </div>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "8px" }}>
                        <span style={{ color: "#94a3b8" }}>Remediable Issues</span>
                        <span style={{ color: "#10b981", fontWeight: "bold" }}>{scanData.filter(v => v.autoFix).length}</span>
                      </div>
                      <div style={{ height: "6px", backgroundColor: "rgba(255, 255, 255, 0.05)", borderRadius: "999px", overflow: "hidden" }}>
                        <div style={{ height: "100%", backgroundColor: "#10b981", transition: "width 1s ease", width: `${(scanData.filter(v => v.autoFix).length / Math.max(scanData.length, 1)) * 100}%` }} />
                      </div>
                    </div>
                  </div>

                  {!prLink ? (
                    <button
                      onClick={applyFix}
                      style={{
                        width: "100%", marginTop: "32px", backgroundColor: "rgba(255, 255, 255, 0.05)", color: "white", 
                        padding: "16px 0", borderRadius: "12px", fontSize: "10px", fontWeight: "900", letterSpacing: "0.1em",
                        textTransform: "uppercase", border: "1px solid rgba(255, 255, 255, 0.05)", cursor: "pointer", transition: "all 0.3s ease"
                      }}
                    >
                      Apply Semantic Fixes
                    </button>
                  ) : (
                    <div style={{ marginTop: "32px", padding: "16px", backgroundColor: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "12px" }}>
                      <div style={{ fontSize: "10px", fontWeight: "bold", color: "#10b981", marginBottom: "8px" }}>PATCH BROADCAST SUCCESSFUL</div>
                      <a href={prLink} target="_blank" rel="noreferrer" style={{ fontSize: "12px", color: "white", textDecoration: "underline", opacity: 0.6, display: "block", overflow: "hidden", textOverflow: "ellipsis" }}>{prLink}</a>
                    </div>
                  )}
                </Card>
              )}

              <Card style={{ backgroundColor: "rgba(0, 0, 0, 0.6)", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
                <div style={{ padding: "12px 16px", backgroundColor: "rgba(255, 255, 255, 0.05)", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "9px", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.3em", color: "#64748b" }}>Live Telemetry</span>
                  <div style={{ display: "flex", gap: "4px" }}>
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "rgba(244, 63, 94, 0.4)" }} />
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "rgba(6, 182, 212, 0.4)" }} />
                  </div>
                </div>
                <div style={{ padding: "16px", height: "256px", overflowY: "auto", fontFamily: "monospace", fontSize: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {log.map((entry, i) => (
                    <div key={i} style={{ display: "flex", gap: "12px", lineHeight: 1.6 }}>
                      <span style={{ color: "#334155", userSelect: "none" }}>[{i}]</span>
                      <span style={{ color: "#94a3b8" }}>{entry}</span>
                    </div>
                  ))}
                  <div ref={logEndRef} />
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* TIMELINE VIEW */}
        {activeTab === "timeline" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
            <Card style={{ padding: "32px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                <div>
                  <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "white", letterSpacing: "-0.025em", margin: "0 0 4px 0" }}>Vulnerability Drift</h2>
                  <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>Temporal mapping of security debt evolution.</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "10px", fontWeight: "900", color: "#06b6d4", backgroundColor: "rgba(6, 182, 212, 0.1)", padding: "6px 12px", borderRadius: "999px", border: "1px solid rgba(6, 182, 212, 0.2)" }}>
                  <Icons.Activity /> REAL-TIME AGGREGATION
                </div>
              </div>

              <div style={{ height: "256px", width: "100%" }}>
                <SimpleAreaChart data={MOCK_TIMELINE_DATA} labels={MOCK_TIMELINE_LABELS} />
              </div>

              <div style={{ marginTop: "32px", borderTop: "1px solid rgba(255, 255, 255, 0.05)", paddingTop: "32px", overflowX: "auto" }}>
                <table style={{ width: "100%", textAlign: "left", fontSize: "11px", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ color: "#64748b", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.1em", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                      <th style={{ paddingBottom: "16px", paddingLeft: "8px" }}>Revision</th>
                      <th style={{ paddingBottom: "16px", paddingLeft: "8px" }}>Contributor</th>
                      <th style={{ paddingBottom: "16px", paddingLeft: "8px", textAlign: "center" }}>Impact Score</th>
                      <th style={{ paddingBottom: "16px", paddingLeft: "8px", textAlign: "right" }}>Introduction Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_TIMELINE_LIST.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.02)", transition: "background 0.3s ease" }}>
                        <td style={{ padding: "16px 8px", color: "#22d3ee", fontFamily: "monospace" }}>#{item.commit}</td>
                        <td style={{ padding: "16px 8px", color: "white", fontWeight: "bold" }}>{item.author}</td>
                        <td style={{ padding: "16px 8px", textAlign: "center" }}>
                          <span style={{ padding: "2px 8px", borderRadius: "999px", backgroundColor: item.count > 3 ? "rgba(244, 63, 94, 0.2)" : "rgba(30, 41, 59, 1)", color: item.count > 3 ? "#f43f5e" : "#94a3b8" }}>
                            {item.count} Detected
                          </span>
                        </td>
                        <td style={{ padding: "16px 8px", textAlign: "right", color: "#64748b" }}>{item.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* FORENSICS VIEW */}
        {activeTab === "forensics" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "32px" }}>
            <div style={{ gridColumn: "span 8", display: "flex", flexDirection: "column", gap: "24px" }}>
              <Card style={{ border: "1px solid rgba(244, 63, 94, 0.2)", position: "relative" }}>
                <div style={{ position: "absolute", top: 0, right: 0, padding: "32px", opacity: 0.05, color: "#f43f5e" }}>
                  <Icons.Fingerprint size={120} />
                </div>
                <div style={{ padding: "32px", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                   <div>
                     <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "white", margin: "0 0 4px 0" }}>Patient Zero Identification</h2>
                     <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>Isolating the origin of vulnerability injection.</p>
                   </div>
                   <Badge color="#f43f5e">BLAME_ACTIVE</Badge>
                </div>
                
                <div style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "32px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
                    <div>
                      <label style={{ fontSize: "10px", fontWeight: "900", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px", display: "block" }}>Origin Hash</label>
                      <div style={{ backgroundColor: "rgba(255, 255, 255, 0.05)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.05)", fontFamily: "monospace", color: "#10b981", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span>{MOCK_FORENSICS.commit}</span>
                        <div style={{ color: "#334155" }}><Icons.Github size={14} /></div>
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: "10px", fontWeight: "900", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px", display: "block" }}>Identified Author</label>
                      <div style={{ backgroundColor: "rgba(255, 255, 255, 0.05)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.05)", color: "white", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span>{MOCK_FORENSICS.author}</span>
                        <div style={{ color: "#334155" }}><Icons.User size={14} /></div>
                      </div>
                    </div>
                  </div>

                  <div style={{ backgroundColor: "rgba(244, 63, 94, 0.1)", border: "1px solid rgba(244, 63, 94, 0.2)", padding: "24px", borderRadius: "16px", position: "relative", overflow: "hidden" }}>
                     <div style={{ position: "absolute", top: 0, left: 0, width: "4px", height: "100%", backgroundColor: "#f43f5e" }} />
                     <h4 style={{ color: "#f43f5e", fontWeight: "900", fontSize: "10px", textTransform: "uppercase", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px", letterSpacing: "0.1em" }}>
                       <Icons.AlertTriangle size={14} /> Intelligence Summary
                     </h4>
                     <p style={{ color: "white", fontSize: "14px", lineHeight: 1.6, margin: 0 }}>
                       "{MOCK_FORENSICS.summary}"
                     </p>
                  </div>

                  <div>
                    <label style={{ fontSize: "10px", fontWeight: "900", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "12px", display: "block" }}>Semantic Differential</label>
                    <pre style={{ backgroundColor: "rgba(0, 0, 0, 0.4)", padding: "20px", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.05)", fontFamily: "monospace", fontSize: "11px", lineHeight: 2, overflowX: "auto" }}>
                      <div style={{ color: "#f43f5e", opacity: 0.8, userSelect: "none" }}>- {MOCK_FORENSICS.diff.split('\n')[1]}</div>
                      <div style={{ color: "#10b981", opacity: 0.8, userSelect: "none" }}>+ {MOCK_FORENSICS.diff.split('\n')[2]}</div>
                    </pre>
                  </div>
                </div>
              </Card>
            </div>

            <div style={{ gridColumn: "span 4" }}>
              <Card style={{ padding: "24px" }}>
                <h3 style={{ color: "white", fontWeight: "bold", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px", margin: "0 0 16px 0" }}>
                  <span style={{ color: "#06b6d4" }}><Icons.Shield /></span> Integrity Score
                </h3>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 0" }}>
                  <div style={{ position: "relative", width: "128px", height: "128px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                      <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" style={{ color: "rgba(255, 255, 255, 0.05)" }} />
                      <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364} strokeDashoffset={100} style={{ color: "#06b6d4", strokeLinecap: "round" }} />
                    </svg>
                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: "32px", fontWeight: "900", color: "white" }}>72</span>
                      <span style={{ fontSize: "10px", fontWeight: "bold", color: "#64748b" }}>SCORE</span>
                    </div>
                  </div>
                </div>
                <div style={{ paddingTop: "16px", borderTop: "1px solid rgba(255, 255, 255, 0.05)", display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                    <span style={{ color: "#64748b" }}>Security Debt</span>
                    <span style={{ color: "white", fontWeight: "bold" }}>14.2h</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
                    <span style={{ color: "#64748b" }}>Vulnerability Density</span>
                    <span style={{ color: "#f43f5e", fontWeight: "bold" }}>High</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

      </main>

      <footer style={{ textAlign: "center", padding: "48px 0", borderTop: "1px solid rgba(255, 255, 255, 0.05)", backgroundColor: "black" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "24px", marginBottom: "16px" }}>
          <div style={{ color: "#334155", cursor: "pointer" }}><Icons.Github size={16} /></div>
          <div style={{ height: "16px", width: "1px", backgroundColor: "rgba(255, 255, 255, 0.1)" }} />
          <div style={{ color: "#334155", cursor: "pointer" }}><Icons.Activity size={16} /></div>
        </div>
        <div style={{ fontSize: "9px", fontFamily: "monospace", tracking: "0.5em", color: "#334155", textTransform: "uppercase", letterSpacing: "0.5em" }}>
          Autonomous Security Infrastructure — v2.0.4 — Build 9128
        </div>
      </footer>
    </div>
  );
}