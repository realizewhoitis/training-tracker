const { generate, verify } = require('otplib');
const secret = 'KVKFKRCPNZQUYMLXOVYDSQKJKZDTSRJZ'; // Sample secret

async function run() {
    try {
        const token = await generate({ secret });
        console.log('Generated:', token);

        const v1 = await verify({ secret, token });
        console.log('Verify exact:', v1);

        const v2 = await verify({ secret, token, epochTolerance: 20 });
        console.log('Verify tolerance:', v2);
    } catch (e) {
        console.error(e);
    }
}
run();
