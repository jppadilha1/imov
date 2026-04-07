module.exports = {
  preset: "jest-expo",
  roots: ["<rootDir>/__tests__"],
  testMatch: ["**/*.spec.ts", "**/*.spec.tsx"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1"
  }
};
