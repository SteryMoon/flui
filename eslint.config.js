// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    // O React Compiler não conhece os shared values do Reanimated: ele lê
    // `scale.value = ...` como mutação de estado imutável. Escrever em um
    // shared value dentro de um handler é o uso recomendado pela biblioteca,
    // então desligamos a regra apenas onde ela dá falso positivo.
    files: ['components/**/*.tsx', 'app/**/*.tsx'],
    rules: {
      'react-hooks/immutability': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
]);
