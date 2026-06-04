// Small helper to run the Express app on a chosen PORT without relying on shell-specific syntax.
// Usage: node runPort.js 5001
const portArg = process.argv[2];
const portEnv = process.env.PORT;
const port = portArg || portEnv || '5000';
process.env.PORT = port;
console.log(`Starting backend with PORT=${process.env.PORT}`);
require('./index.js');
