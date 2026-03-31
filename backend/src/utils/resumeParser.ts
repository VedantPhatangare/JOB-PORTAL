import stringSimilarity from 'string-similarity';

/**
 * Preprocesses text for better comparison: lowercase, remove special characters, remove extra whitespace.
 */
function preprocessText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalizes skills array for comparison
 */
function normalizeSkills(skills: string[]): string[] {
  return skills
    .map(skill => preprocessText(skill))
    .filter(skill => skill.length > 0);
}

/**
 * Checks if a skill word exists as a complete word in the content (word-boundary matching)
 * Prevents "Java" from matching "JavaScript"
 */
function skillExistsInContent(skill: string, content: string): boolean {
  if (!skill || !content) return false;
  
  // Split content into words and compare with normalized skill
  const contentWords = content.split(/\s+/);
  return contentWords.some(word => {
    // Direct match or partial word match (e.g., "node" matches "node.js")
    return word === skill || word.startsWith(skill + '.') || word.startsWith(skill + '+');
  });
}

/**
 * Calculates a match score (0-100) based on candidate skills
 * and job requirements (title, description, skills).
 * 
 * Scoring logic:
 * - 70% weight: Skill matches (exact word-boundary matching)
 * - 30% weight: Content similarity (description, title, etc.)
 * 
 * Note: PDF parsing was removed to ensure maximum backend stability 
 * and avoid native dependency crashes on Windows environments.
 */
export async function calculateMatchScore(
  resumeUrl: string, // Kept for signature compatibility
  candidateSkills: string[] = [],
  jobDetails: { title: string; description: string; skills: string[] }
): Promise<number> {
  try {
    // Normalize candidate skills
    const normalizedCandidateSkills = normalizeSkills(candidateSkills);
    const normalizedJobSkills = normalizeSkills(jobDetails.skills);

    // If no job skills specified, fall back to content-based similarity
    if (normalizedJobSkills.length === 0) {
      const candidateContent = preprocessText(candidateSkills.join(' '));
      const jobRequirement = preprocessText(`${jobDetails.title} ${jobDetails.description}`);
      
      if (!candidateContent || !jobRequirement) return 0;
      
      const similarity = stringSimilarity.compareTwoStrings(candidateContent, jobRequirement);
      return Math.round(similarity * 100);
    }

    // If no candidate skills, return low score
    if (normalizedCandidateSkills.length === 0) {
      return 0;
    }

    // Create searchable content from candidate skills
    const candidateContent = normalizedCandidateSkills.join(' ');

    // Count exact skill matches (word-boundary matching)
    const matchedSkills = normalizedJobSkills.filter(jobSkill => 
      normalizedCandidateSkills.some(candSkill => candSkill === jobSkill) ||
      skillExistsInContent(jobSkill, candidateContent)
    );

    // Calculate skill match percentage (70% weight)
    const skillMatchPercentage = (matchedSkills.length / normalizedJobSkills.length) * 100;

    // Also check description/title for additional context (30% weight)
    const descriptionContent = preprocessText(
      `${jobDetails.title} ${jobDetails.description}`
    );
    const candidateDescContent = preprocessText(candidateSkills.join(' '));
    
    const descriptionSimilarity = stringSimilarity.compareTwoStrings(
      candidateDescContent,
      descriptionContent
    ) * 100;

    // Weighted average: 70% skill match, 30% content similarity
    const finalScore = Math.round((skillMatchPercentage * 0.7) + (descriptionSimilarity * 0.3));

    return Math.min(100, Math.max(0, finalScore));
  } catch (error) {
    console.error('Error calculating match score:', error);
    return 0;
  }
}
