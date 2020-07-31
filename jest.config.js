module.exports = {
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    //testEnvironment: "jest-environment-jsdom-global",
    moduleFileExtensions: [
        "ts",
        "tsx",
        "js"
    ],
    coveragePathIgnorePatterns: [
        "/node_modules/",
        "/test/"
    ],
    coverageThreshold: {
        "global": {
            "branches": 90,
            "functions": 95,
            "lines": 95,
            "statements": 95
        }
    },
    collectCoverageFrom: [
        "src/*.{js,ts}"
    ]
}
