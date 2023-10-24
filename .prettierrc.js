/** @type {import("prettier").Options} */
module.exports = {
    arrowParens: "avoid",
    bracketSameLine: false,
    bracketSpacing: true,
    htmlWhitespaceSensitivity: "css",
    jsxSingleQuote: false,
    printWidth: 120,
    semi: true,
    singleQuote: false,
    tabWidth: 4,
    trailingComma: "all",
    useTabs: false,
    plugins: ["prettier-plugin-tailwindcss"],
};
