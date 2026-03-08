/**
 * guardian/timeline.js
 * * This module extracts the historical timeline of an uploaded repository.
 * It uses the 'git -C' flag to execute commands inside the extracted scan folder.
 */

const { execSync } = require('child_process');

/**
 * Generates a security timeline by analyzing the last 15 commits of a repo.
 * @param {string} repoPath - The absolute path to the unzipped repository.
 * @returns {Array} - Array of timeline objects for the frontend.
 */
function getRepoTimeline(repoPath) {
    try {
        // 1. Execute git log to get the history
        // %h = short hash, %an = author name, %ad = author date (short format)
        // We target the specific repoPath using the -C flag
        const logOutput = execSync(
            `git -C "${repoPath}" log -n 15 --pretty=format:"%h|%an|%ad" --date=short`,
            { encoding: 'utf8' }
        );

        if (!logOutput) {
            return [];
        }

        // 2. Parse the output into a JSON array
        const lines = logOutput.trim().split('\n');
        
        const timeline = lines.map((line, index) => {
            const [hash, author, date] = line.split('|');

            /**
             * HACKATHON LOGIC: Vulnerability Count
             * In a full version, we would run a scan on EVERY commit (which is slow).
             * For the 24h prototype, we simulate the "Security Debt" by generating 
             * a count based on the commit hash (pseudo-random but consistent).
             */
            const simulatedVulnerabilities = (parseInt(hash, 16) % 5) + 1;

            return {
                commit: hash,
                author: author,
                date: date, // e.g., "2024-03-07"
                vulnerabilityCount: simulatedVulnerabilities
            };
        });

        // 3. Return the array (Newest to Oldest)
        // Note: Frontend prefers Oldest -> Newest for the chart, so we reverse it.
        return timeline.reverse();

    } catch (error) {
        console.error("❌ Timeline Engine Error:", error.message);
        
        // Fallback: If the uploaded ZIP isn't a Git repo, return an empty set
        // or a simulated history to prevent the UI from breaking.
        return [
            { commit: "initial", author: "system", date: "2024-01-01", vulnerabilityCount: 0 }
        ];
    }
}

module.exports = { getRepoTimeline };