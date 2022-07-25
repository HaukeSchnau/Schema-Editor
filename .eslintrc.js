module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  globals: {
    FileSystemDirectoryHandle: "readonly",
    FileSystemFileHandle: "readonly",
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "airbnb",
    "plugin:prettier/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 13,
    sourceType: "module",
  },
  plugins: ["react", "@typescript-eslint", "prettier", "unused-imports"],
  rules: {
    "no-return-assign": "off",
    "import/prefer-default-export": "off",
    "no-useless-constructor": "off",
    "@typescript-eslint/no-useless-constructor": ["error"],
    "no-empty-function": "off",
    "@typescript-eslint/no-empty-function": ["error"],
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    "import/no-extraneous-dependencies": "off",
    "jsx-a11y/no-autofocus": "off",
    "prefer-template": "off",
    "class-methods-use-this": "off",
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        js: "never",
        jsx: "never",
        ts: "never",
        tsx: "never",
      },
    ],
    "no-restricted-syntax": [
      "error",
      "ForInStatement",
      "LabeledStatement",
      "WithStatement",
    ],
    "react/prop-types": "off",
    "react/jsx-filename-extension": [2, { extensions: [".ts", ".tsx"] }],
    "react/function-component-definition": [
      2,
      {
        namedComponents: "arrow-function",
        unnamedComponents: "arrow-function",
      },
    ],
    "no-param-reassign": "off",
    "jsx-a11y/label-has-associated-control": [
      "error",
      {
        required: {
          some: ["nesting", "id"],
        },
      },
    ],
    "jsx-a11y/label-has-for": [
      "error",
      {
        required: {
          some: ["nesting", "id"],
        },
      },
    ],
    "no-await-in-loop": "off",
    "no-plusplus": "off",
    "no-use-before-define": "off",
    "react/require-default-props": "off",
  },
  settings: {
    "import/resolver": {
      node: {
        extensions: [".ts", ".tsx"],
      },
    },
  },
};
