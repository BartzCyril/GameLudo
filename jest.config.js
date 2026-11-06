const nextJest = require('next/jest')

module.exports = nextJest({dir: './'})({testEnvironment: 'node', testPathIgnorePatterns: ['/ludo-config/']})
