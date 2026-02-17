import { execSync } from "node:child_process";

const previousSha = process.env.VERCEL_GIT_PREVIOUS_SHA;
const currentSha = process.env.VERCEL_GIT_COMMIT_SHA;

const frontendOrSharedPatterns = [
  /^frontend\//,
  /^shared\//,
  /^specs\/001-full-stack-web\/contracts\/openapi\.yaml$/,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^tsconfig\.json$/,
  /^vercel\.json$/,
];

function shouldTriggerFrontendBuild(changedFiles) {
  return changedFiles.some((file) =>
    frontendOrSharedPatterns.some((pattern) => pattern.test(file)),
  );
}

if (!previousSha || !currentSha) {
  console.log("Missing Vercel git SHAs, running frontend build by default.");
  process.exit(1);
}

if (previousSha === currentSha) {
  console.log("No commit diff detected, skipping frontend build.");
  process.exit(0);
}

try {
  const diffOutput = execSync(
    `git diff --name-only ${previousSha} ${currentSha}`,
    {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  const changedFiles = diffOutput
    .split("\n")
    .map((file) => file.trim())
    .filter(Boolean);

  if (changedFiles.length === 0) {
    console.log("No changed files detected, skipping frontend build.");
    process.exit(0);
  }

  if (shouldTriggerFrontendBuild(changedFiles)) {
    console.log("Frontend or shared files changed, running frontend build.");
    process.exit(1);
  }

  console.log(
    "Only backend/non-frontend files changed, skipping frontend build.",
  );
  process.exit(0);
} catch (error) {
  console.log(
    "Unable to compute changed files, running frontend build by default.",
  );
  console.log(String(error));
  process.exit(1);
}
