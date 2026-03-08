// /**
//  * guardian/patcher.js
//  * This module generates "Auto-Heal" patches for identified vulnerabilities.
//  * It uses pattern matching and templates to transform risky code into secure code.
//  */

// /**
//  * Generates a secured version of a vulnerable code string.
//  * @param {string} type - The vulnerability type (e.g., 'sql-injection', 'xss').
//  * @param {string} code - The raw vulnerable line of code.
//  * @returns {string} - The patched/secured code.
//  */
// function generatePatch(type, code) {
//     if (!code) return "// No code provided for patching";

//     // Clean the input code (remove leading/trailing whitespace)
//     const originalCode = code.trim();

//     switch (type.toLowerCase()) {
//         case "sql-injection":
//         case "sql_injection":
//             /**
//              * Transformation:
//              * From: db.query("SELECT * FROM users WHERE id=" + id)
//              * To:   db.query("SELECT * FROM users WHERE id=?", [id])
//              */
//             // Matches concatenation with + or template literals ${}
//             if (originalCode.includes("+") || originalCode.includes("${")) {
//                 // Regex to find the part after the equals sign or in the template
//                 return originalCode
//                     .replace(/=\s*['"`]?\s*\+.*$/, " = ?, [id])") // Handles "id=" + id
//                     .replace(/\$\{.*?\}/g, "?") + ", [id]";       // Handles `${id}`
//             }
//             return "// SQL Injection: Parameterization recommended";

//         case "hardcoded-secret":
//         case "hardcoded_secret":
//             /**
//              * Transformation:
//              * From: const API_KEY = "sk-prod-12345";
//              * To:   const API_KEY = process.env.API_KEY;
//              */
//             const secretRegex = /(const|let|var|export)\s+(\w+)\s*=\s*['"].*?['"]/;
//             if (secretRegex.test(originalCode)) {
//                 return originalCode.replace(/=\s*['"].*?['"]/, "= process.env.$2");
//             }
//             return "process.env.SECRET_KEY; // Move hardcoded secret to Environment Variables";

//         case "xss":
//         case "cross-site-scripting":
//             /**
//              * Transformation:
//              * From: element.innerHTML = userInput;
//              * To:   element.textContent = userInput;
//              */
//             if (originalCode.includes(".innerHTML")) {
//                 return originalCode.replace(".innerHTML", ".textContent");
//             }
//             return "sanitize(" + originalCode + "); // Wrap in sanitization function";

//         case "path-traversal":
//             /**
//              * Transformation:
//              * From: fs.readFile('./uploads/' + name)
//              * To:   fs.readFile(path.join('./uploads', path.basename(name)))
//              */
//             if (originalCode.includes("+")) {
//                 return "const path = require('path');\n" + 
//                        originalCode.replace(/\+\s*(\w+)/, "+ path.basename($1)");
//             }
//             return "// Path Traversal: Use path.basename() to sanitize file paths";

//         default:
//             return `// Manual fix suggested for ${type}\n${originalCode}`;
//     }
// }

// module.exports = { generatePatch };
/**
 * guardian/patcher.js
 * Generates "Auto-Heal" patches for detected vulnerabilities.
 * Uses pattern-based transformations to convert risky code into safer code.
 */

// /**
//  * Generates a secured version of vulnerable code.
//  * @param {string} type - vulnerability type
//  * @param {string} code - vulnerable line of code
//  * @returns {string} patched code
//  */
// function generatePatch(type, code) {

//     if (!code) return "// No code provided for patching";

//     const originalCode = code.trim();

//     switch (type.toLowerCase()) {

//         /* ===============================
//            SQL INJECTION
//         =============================== */

//         case "sql-injection":
//         case "sql_injection":

//             /*
//             Example:
//             FROM:
//             db.query("SELECT * FROM users WHERE id=" + id)

//             TO:
//             db.query("SELECT * FROM users WHERE id=?", [id])
//             */

//             if (originalCode.includes("+")) {

//                 const variableMatch = originalCode.match(/\+\s*(\w+)/);

//                 const variable = variableMatch ? variableMatch[1] : "value";

//                 return originalCode
//                     .replace(/\+\s*\w+/, "?")
//                     .replace(/\)$/, `, [${variable}])`);
//             }

//             return "// SQL Injection risk — use parameterized queries";


//         /* ===============================
//            HARDCODED SECRET
//         =============================== */

//         case "hardcoded-secret":
//         case "hardcoded_secret":

//             /*
//             FROM:
//             const API_KEY = "sk-prod-123";

//             TO:
//             const API_KEY = process.env.API_KEY
//             */

//             const secretMatch = originalCode.match(/(const|let|var)\s+(\w+)\s*=/);

//             if (secretMatch) {

//                 const variableName = secretMatch[2];

//                 return `${secretMatch[1]} ${variableName} = process.env.${variableName};`;
//             }

//             return "process.env.SECRET_KEY; // Move secret to environment variables";


//         /* ===============================
//            XSS
//         =============================== */

//         case "xss":
//         case "cross-site-scripting":

//             /*
//             FROM:
//             element.innerHTML = userInput

//             TO:
//             element.textContent = userInput
//             */

//             if (originalCode.includes(".innerHTML")) {

//                 return originalCode.replace(".innerHTML", ".textContent");
//             }

//             return `sanitize(${originalCode}); // sanitize user input`;


//         /* ===============================
//            PATH TRAVERSAL
//         =============================== */

//         case "path-traversal":

//             /*
//             FROM:
//             fs.readFile("./uploads/" + name)

//             TO:
//             fs.readFile(path.join("./uploads", path.basename(name)))
//             */

//             if (originalCode.includes("+")) {

//                 const variableMatch = originalCode.match(/\+\s*(\w+)/);

//                 const variable = variableMatch ? variableMatch[1] : "file";

//                 return `const path = require("path");\n` +
//                        originalCode.replace(/\+\s*\w+/, `+ path.basename(${variable})`);
//             }

//             return "// Path traversal risk — sanitize file paths using path.basename()";


//         /* ===============================
//            COMMAND INJECTION
//         =============================== */

//         case "detect-child-process":

//             /*
//             FROM:
//             exec("ls " + userInput)

//             TO:
//             execFile("ls", [userInput])
//             */

//             if (originalCode.includes("exec(")) {

//                 return originalCode
//                     .replace("exec(", "execFile(")
//                     .replace(/\+\s*(\w+)/, ", [$1]");
//             }

//             return "// Avoid exec() — use execFile() instead";


//         /* ===============================
//            DEFAULT
//         =============================== */

//         default:

//             return `// Manual fix suggested for ${type}\n${originalCode}`;
//     }

// }

// module.exports = { generatePatch };



function generatePatch(type, code) {

  if (!code) return "// Manual fix required";

  const originalCode = code.trim();
  const t = type.toLowerCase();

  /* SQL INJECTION */

  if (t.includes("sql") || t.includes("sqli")) {

    if (originalCode.includes("+")) {

      const variableMatch = originalCode.match(/\+\s*(\w+)/);

      const variable = variableMatch ? variableMatch[1] : "value";

      return originalCode
        .replace(/\+\s*\w+/, "?")
        .replace(/\)$/, `, [${variable}])`);
    }

    return "// Use parameterized SQL queries";

  }

  /* HARDCODED SECRET */

  if (t.includes("secret")) {

    const secretMatch = originalCode.match(/(const|let|var)\s+(\w+)\s*=/);

    if (secretMatch) {

      const variableName = secretMatch[2];

      return `${secretMatch[1]} ${variableName} = process.env.${variableName};`;
    }

    return "process.env.SECRET_KEY;";
  }

  /* XSS */

  if (t.includes("xss")) {

    if (originalCode.includes(".innerHTML")) {

      return originalCode.replace(".innerHTML", ".textContent");
    }

    return `sanitize(${originalCode});`;
  }

  /* CHILD PROCESS */

  if (t.includes("child-process")) {

    if (originalCode.includes("exec(")) {

      return originalCode
        .replace("exec(", "execFile(")
        .replace(/\+\s*(\w+)/, ", [$1]");
    }

    return "// Avoid exec() use execFile()";
  }

  /* CSRF */

  if (t.includes("csrf")) {

    return "app.use(require('csurf')());";
  }

  /* DEFAULT */

  return `// Manual fix required for ${type}\n${originalCode}`;

}

module.exports = { generatePatch };