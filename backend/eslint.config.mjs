import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';

export default defineConfig([
   js.configs.recommended,

   {
      files: ['**/*.{js,mjs,cjs}'],
      languageOptions: {
         sourceType: 'module', // ✅ FIX: allows import/export
         globals: {
            ...globals.node
         }
      }
   },

   eslintConfigPrettier
]);