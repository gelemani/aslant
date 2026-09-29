import { defineConfig, globalIgnores } from 'eslint/config'
import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // R3F idiom (brief 7.6): passes are plain classes that own their uniforms, held in useRef.
  // The React Compiler rules below are warnings for the WebGL layer only; errors everywhere else.
  {
    files: ['src/webgl/**/*.{ts,tsx}'],
    rules: {
      'react-hooks/immutability': 'warn',
      'react-hooks/refs': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'docs/**']),
])

export default eslintConfig
