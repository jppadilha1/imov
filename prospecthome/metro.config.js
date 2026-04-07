const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Adiciona WASM na lista de assets suportados para o expo-sqlite rodar no navegador (Web)
config.resolver.assetExts.push('wasm');

// Filtra arquivos de teste para que o Metro (Bundler) ignore-os
// Isso evita erros de importação de bibliotecas de Node (como 'console') em ambiente nativo
config.resolver.blockList = [
  /\.spec\.tsx?$/,
  /\.test\.tsx?$/,
  /[/\\]__tests__[/\\]/
];

module.exports = config;
