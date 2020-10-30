const configBase = require('../../jest.config.base.js');

module.exports = {
  ...configBase,
  displayName: {
    name: 'Core',
    color: 'magenta',
  },
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.ts']
};
