// eslint-disable-next-line import/no-anonymous-default-export
export default {
  clearMocks: true,
  coverageProvider: "v8",
  preset: "ts-jest/presets/js-with-ts",
  setupFiles: ["dotenv/config"],
  moduleNameMapper: {
    "~/(.*)": ["<rootDir>/src/$1"]
},
  transform: {
    '^.+\\.m?js$': 'ts-jest',
  },
};
