import { InitialOptionsTsJest } from "ts-jest";

export default {
  bail: true,
  clearMocks: true,
  coverageProvider: "v8",
  preset: "ts-jest",
  testMatch: ["**/__tests__/**/*.[jt]s?(x)", "**/?(*.)+(spec|test).[tj]s?(x)"],
  setupFiles: ["<rootDir>/envJest.js"],
} as InitialOptionsTsJest;
