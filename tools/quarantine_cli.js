const path = require('path');
const quarantine = require('./quarantine');

const target = process.argv[2];
if (!target) {
    console.error('Caminho não fornecido.');
    process.exit(1);
}

const result = quarantine.quarantineItem(target);
console.log(JSON.stringify(result));
if (!result.success) {
    process.exit(1);
}
