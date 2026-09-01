import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testMatch: ["**/*.test.ts"],
  testTimeout: 30_000,
  forceExit: true,
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: { moduleResolution: "node" } }],
  },
};

export default config;
