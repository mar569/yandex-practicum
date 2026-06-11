module.exports = {
  customSyntax: "postcss-scss",
  plugins: ["stylelint-scss"],
  ignoreFiles: ["**/node_modules/**", "dist/**"],
  rules: {
    "at-rule-no-unknown": null,
    "scss/at-rule-no-unknown": true,
  },
};
