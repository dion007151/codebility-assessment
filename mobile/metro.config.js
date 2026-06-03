process.env.EXPO_ROUTER_APP_ROOT = './app';

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = config;

