import { createRequire } from 'module';
const require = createRequire(import.meta.url);
try {
    const picomatch = require('picomatch');
    console.log('picomatch found:', picomatch);
} catch (e) {
    console.error('picomatch NOT found:', e.message);
}
