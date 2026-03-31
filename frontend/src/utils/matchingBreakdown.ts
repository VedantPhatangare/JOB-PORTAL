/**
 * Calculates matching breakdown between candidate skills and job requirements
 */
export interface MatchingBreakdown {
  matchedSkills: string[];
  unmatchedSkills: string[];
  totalJobSkills: number;
  skillMatchPercentage: number;
  details: string;
}

function preprocessText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeSkills(skills: string[]): string[] {
  return skills
    .map(skill => preprocessText(skill))
    .filter(skill => skill.length > 0);
}

function skillExistsInContent(skill: string, content: string): boolean {
  if (!skill || !content) return false;
  const contentWords = content.split(/\s+/);
  return contentWords.some(word => {
    return word === skill || word.startsWith(skill + '.') || word.startsWith(skill + '+');
  });
}

export function calculateMatchingBreakdown(
  candidateSkills: string[] = [],
  jobDetails: { title: string; description: string; skills: string[] }
): MatchingBreakdown {
  try {
    const normalizedCandidateSkills = normalizeSkills(candidateSkills);
    const normalizedJobSkills = normalizeSkills(jobDetails.skills || []);

    const candidateContent = normalizedCandidateSkills.join(' ');

    // Find matched and unmatched skills
    const matchedSkills: string[] = [];
    const unmatchedSkills: string[] = [];

    normalizedJobSkills.forEach((jobSkill) => {
      if (
        normalizedCandidateSkills.some((candSkill) => candSkill === jobSkill) ||
        skillExistsInContent(jobSkill, candidateContent)
      ) {
        matchedSkills.push(jobSkill);
      } else {
        unmatchedSkills.push(jobSkill);
      }
    });

    const skillMatchPercentage = normalizedJobSkills.length > 0 
      ? Math.round((matchedSkills.length / normalizedJobSkills.length) * 100)
      : 0;

    const details = `Matched ${matchedSkills.length} out of ${normalizedJobSkills.length} required skills`;

    return {
      matchedSkills,
      unmatchedSkills,
      totalJobSkills: normalizedJobSkills.length,
      skillMatchPercentage,
      details,
    };
  } catch (error) {
    console.error('Error calculating matching breakdown:', error);
    return {
      matchedSkills: [],
      unmatchedSkills: [],
      totalJobSkills: 0,
      skillMatchPercentage: 0,
      details: 'Error calculating breakdown',
    };
  }
}
