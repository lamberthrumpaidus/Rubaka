const fs = require('fs');
const path = require('path');
const zip = require('bestzip');
const chalk = require('chalk');
const { minify } = require('uglify-js');
const { Packer } = require('roadroller');

const dest = {
    base: path.resolve('./'),
    bundle: path.resolve('./dist/build.js'),
    html: path.resolve('./index.html'),
    zip: path.resolve('./build.zip'),
};

module.exports = {
    minify: () => {
        const originalBundle = fs.readFileSync(dest.bundle).toString().replaceAll('const ', 'let ');
        fs.writeFileSync(dest.bundle, minify(originalBundle, {
            
        }).code);
    },

    optimize: async () => {
        const inputs = [{
            data: fs.readFileSync(dest.bundle).toString(),
            type: 'js',
            action: 'eval',
        }];
        const packer = new Packer(inputs, {});
        await packer.optimize(2, async (info) => {
            await new Promise(resolve => setImmediate(resolve))
            console.warn(`${info.pass} => ${(info.passRatio * 100).toFixed(1)}%`);
        });
        const { firstLine, secondLine } = packer.makeDecoder();
        fs.writeFileSync(dest.bundle, firstLine + secondLine);
    },

    html: () => {
        const shell=fs.readFileSync(path.resolve('./rubaka-shell.html'),'utf8');
        const bundle=fs.readFileSync(dest.bundle,'utf8');
        fs.writeFileSync(dest.html,shell.replace('/* RUBAKA_GAME_BUNDLE */',()=>bundle));
    },
    zip: async () => {
        await zip({
            cwd: dest.base,
            source: ['index.html','rubaka-experience.css','rubaka-experience.js','app-logo.svg','assets/rubaka-menu-logo.svg','assets/lr-credit-logo-v2.png'],
            destination: dest.zip
        });
    },

    stats: () => {
        const buffer = fs.readFileSync(dest.zip);
        const strFormat = buffer.length.toLocaleString('en-US');
        console.log(`===> High Quality Build Size: ${chalk.green(strFormat + ' bytes')} <===`);
    },
}
