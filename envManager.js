const fs = require('fs');
const readline = require('readline');
const dotenv = require('dotenv');

const envFilePath = '.env';

// Define required application-specific configuration keys, prompts, and default values
const appConfigSchema = {
  PORT: {
    prompt: 'Enter the port number',
    defaultValue: '3000',
  },
  DATABASE_URL: {
    prompt: 'Enter the database URL',
    defaultValue: 'file:./Doctors24.sqlite',
  },
  // Add more application-specific configuration keys as needed
};

// Load existing environment variables
dotenv.config();

// Function to prompt user for input
const promptUser = (query) => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => rl.question(query, (answer) => {
    rl.close();
    resolve(answer);
  }));
};

// Function to ensure all required application-specific environment variables are set
async function ensureAppEnvVariables() {
  let envUpdated = false;
  const envVars = { ...process.env };

  for (const [key, { prompt, defaultValue }] of Object.entries(appConfigSchema)) {
    if (!envVars[key]) {
      const userInput = await promptUser(`${prompt} (default: ${defaultValue}): `);
      envVars[key] = userInput || defaultValue;
      envUpdated = true;
    }
  }

  if (envUpdated) {
    const appEnvContent = Object.entries(envVars)
      .filter(([key]) => appConfigSchema.hasOwnProperty(key))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    fs.writeFileSync(envFilePath, appEnvContent);
    console.log('✅ .env file has been updated with missing application-specific values.');
  }
}

// Ensure all application-specific environment variables are loaded and complete
const loadAppEnv = async () => {
  await ensureAppEnvVariables();
  dotenv.config(); // Reload to ensure all variables are in process.env
};

module.exports = { ensureAppEnvVariables, loadAppEnv };