import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // Budgets, Shader rule 3: no mix-blend-mode or backdrop-filter on or over
    // an animated layer (the CSS side is checked in animated-layers.test.ts).
    files: [
      "src/components/Hero.tsx",
      "src/components/HeroMotion.tsx",
      "src/components/OxideMark.tsx",
      "src/lib/hero-shader.ts",
    ],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "Literal[value=/mix-blend-mode|backdrop-filter|mixBlendMode|backdropFilter/i]",
          message:
            "No mix-blend-mode or backdrop-filter on or over an animated layer (Budgets, Shader rule 3).",
        },
        {
          selector:
            "TemplateElement[value.raw=/mix-blend-mode|backdrop-filter|mixBlendMode|backdropFilter/i]",
          message:
            "No mix-blend-mode or backdrop-filter on or over an animated layer (Budgets, Shader rule 3).",
        },
        {
          selector: "Identifier[name=/^(mixBlendMode|backdropFilter)$/]",
          message:
            "No mix-blend-mode or backdrop-filter on or over an animated layer (Budgets, Shader rule 3).",
        },
      ],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "out-fixtures/**",
    "node_modules/**",
    "next-env.d.ts",
    "test-results/**",
    "playwright-report/**",
    "screenshots/**",
  ]),
]);
