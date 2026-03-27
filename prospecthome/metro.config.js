const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Adiciona WASM na lista de assets suportados para o expo-sqlite rodar no navegador (Web)
config.resolver.assetExts.push('wasm');

module.exports = config;
