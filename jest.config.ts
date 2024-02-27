import { pathsToModuleNameMapper } from "ts-jest";
import { compilerOptions } from "./tsconfig.json";

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  setupFiles: ["./tests/__mocks__/chrome.js", "./tests/__mocks__/console.js"],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: "<rootDir>/src/" }),
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      diagnostics: {
        warnOnly: true,
        pretty: true
      },
      debug: true
    }],
  },
};
