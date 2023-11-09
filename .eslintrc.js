/* eslint-env node */
module.exports = {
    extends: [
        "eslint:recommended", "plugin:@typescript-eslint/recommended"
    ],
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    root: false,
    parserOptions: {
        parser: "@typescript-eslint/parser",
        project: "./tsconfig.json",
        tsconfigRootDir: __dirname
    },
    rules: {
        "quotes": [
            "warn", "double"
        ],
        "yoda": "error",
        "semi": [
            "error", "always"
        ],
        "comma-spacing": [
            "error", {
                "before": false,
                "after": true
            }
        ],
        "require-await": "error",
        "@typescript-eslint/no-misused-promises": "error",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-namespace": "off",
        "@typescript-eslint/ban-ts-comment": "off",
        "prefer-const": "off"
    }
};
