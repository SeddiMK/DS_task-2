import globals from "globals";
import pluginJs from "@eslint/js";

export default [
  pluginJs.configs.recommended,
  {
    languageOptions: { globals: globals.browser },
  },

  {
    extends: ["airbnb", "prettier"],
    plugins: ["prettier"],
    rules: {
      "prettier/prettier": 0,
    },

    env: {
      browser: true,
      node: true,
    },
    "import/no-extraneous-dependencies": [
      "error",
      {
        devDependencies: false,
        optionalDependencies: false,
        peerDependencies: false,
      },
    ],
  },
];
