import { calculateMatchScore } from './utils/resumeParser.js';

async function test() {
  console.log("Testing calculateMatchScore ranking logic...");
  const dummyResume = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
  const skills = ["React", "Node.js", "TypeScript"];
  const job = {
    title: "Full Stack Developer",
    description: "Looking for a React and Node developer with TypeScript experience.",
    skills: ["React", "Node.js", "TypeScript"]
  };

  try {
    const score = await calculateMatchScore(dummyResume, skills, job);
    console.log("Match Score:", score);
    process.exit(0);
  } catch (error) {
    console.error("Test failed:", error);
    process.exit(1);
  }
}

test();
