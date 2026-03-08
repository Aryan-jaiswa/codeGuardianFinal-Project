/**
 * guardian/forensics.js
 * This module performs "Patient Zero" identification.
 * It traces a specific line of code back to its originating commit.
 */

const { execSync } = require('child_process');

/**
 * Extracts Git metadata for a specific line in a file.
 * @param {string} repoPath - Path to the root of the scanned repository.
 * @param {string} filePath - Path to the specific file (relative to repo root).
 * @param {number} line - The line number identified by the scanner.
 * @returns {Object} - The "Birth Certificate" of the vulnerability.
 */
function getForensics(repoPath, filePath, line) {
    try {
        // We use --porcelain for easy parsing. 
        // It provides a standard format regardless of local git configurations.
        const blameOutput = execSync(
            `git -C "${repoPath}" blame -L ${line},${line} --porcelain "${filePath}"`,
            { encoding: 'utf8' }
        ).toString();

        return parseBlame(blameOutput);
    } catch (error) {
        // If the file isn't in a git repo or git isn't initialized, return fallback data.
        return {
            commit: "N/A (Untracked)",
            author: "System/Unknown",
            date: new Date().toLocaleDateString(),
            summary: "Code introduced outside of version control tracking."
        };
    }
}

/**
 * Parses the raw output of 'git blame --porcelain'
 * @param {string} raw - The raw string output from git.
 */
function parseBlame(raw) {
    const lines = raw.split('\n');
    
    // Line 0 is always: <commit-hash> <original-line> <final-line> <count>
    const commitHash = lines[0].split(' ')[0].substring(0, 8);
    
    // We look for specific headers in the porcelain output
    let author = "Unknown";
    let timestamp = Math.floor(Date.now() / 1000);
    let summary = "No commit message found";

    lines.forEach(line => {
        if (line.startsWith('author ')) author = line.replace('author ', '');
        if (line.startsWith('author-time ')) timestamp = parseInt(line.replace('author-time ', ''));
        if (line.startsWith('summary ')) summary = line.replace('summary ', '');
    });

    return {
        commit: commitHash,
        author: author,
        date: new Date(timestamp * 1000).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        }),
        summary: summary
    };
}

module.exports = { getForensics };