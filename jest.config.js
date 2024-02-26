/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  // verbose: true,
  setupFiles: ["./tests/__mocks__/chrome.js", "./tests/__mocks__/console.js"],
  moduleNameMapper: {
    "^@background(.*)$": "<rootDir>/src/background$1",
    "^@content_script(.*)$": "<rootDir>/src/content_script$1",
    "^@shared(.*)$": "<rootDir>/src/shared$1",
  },
};
