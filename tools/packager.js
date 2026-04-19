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
            //toplevel: true,
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
        var html = '';
        html += '<html><title>RUBAKA</title>';
        html += '<meta name="author" content="Lamberth Rumpaidus">';
        html += '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />';
        html += '<link rel="shortcut icon"/>';
        html += '<style>body{touch-action:none;overflow:hidden;background:#000;margin:0px;font-family:sans-serif;}h1{color:#fff;text-align:center;margin-top:30px;}';
        html += 'h2{color:#666;font-style:italic;text-align:center;}';
        html += '.tbtn{display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:bold;color:#000;background:rgba(255,255,255,0.5);border:2px solid #fff;border-radius:50%;opacity:0.5;position:absolute;width:50px;height:50px;user-select:none;}</style>';
        html += '<h1>🔥 RUBAKA 👑</h1><h2>(Press any key to start)</h2><h3 style="color:#666;font-size:14px;text-align:center;position:absolute;bottom:20px;width:100%;margin:0;font-weight:normal;z-index:10;">Game ini dibuat dan dikembangkan oleh Lamberth Rumpaidus</h3><canvas></canvas>';
        html += '<div id="touchui" style="display:none;position:fixed;bottom:0;width:100%;height:100%;z-index:9;user-select:none;">';

        // D-Pad
        html += '<div id="t_u" class="tbtn" style="display:none;bottom:120px;left:70px;font-size:24px;">&#8593;</div>';
        html += '<div id="t_d" class="tbtn" style="display:none;bottom:20px;left:70px;font-size:24px;">&#8595;</div>';
        html += '<div id="t_l" class="tbtn" style="bottom:70px;left:20px;font-size:24px;">&#8592;</div>';
        html += '<div id="t_r" class="tbtn" style="bottom:70px;left:120px;font-size:24px;">&#8594;</div>';

        // Skills
        html += '<div id="t_a" class="tbtn" style="bottom:30px;right:30px;width:70px;height:70px;font-size:16px;">ATTACK</div>';
        html += '<div id="t_j" class="tbtn" style="bottom:120px;right:30px;">JUMP</div>';
        html += '<div id="t_c" class="tbtn" style="display:none;bottom:100px;right:100px;">DASH</div>';
        html += '<div id="t_v" class="tbtn" style="display:none;bottom:40px;right:120px;">FIRE</div>';

        // Top Menu
        html += '<div id="t_topmenu" style="position:absolute;top:0;right:0;width:100px;height:120px;">';
        html += '<div id="t_p" class="tbtn" style="top:70px;right:20px;width:40px;height:40px;font-size:8px;opacity:0;transition:opacity 0.3s;">PAUSE</div>';
        html += '<div id="t_m" class="tbtn" style="top:20px;right:20px;width:40px;height:40px;font-size:8px;opacity:0;transition:opacity 0.3s;">MAP</div>';
        html += '</div>';
        html += '</div>';

        // Cheat Input (hidden by default)
        html += '<div id="cheatMenu" style="display:none;position:absolute;top:140px;right:20px;z-index:100;background:rgba(0,0,0,0.8);padding:10px;border-radius:8px;border:1px solid #fff;">';
        html += '<input type="text" id="cheatInput" placeholder="Kode Cheat..." style="width:120px;padding:8px;font-size:14px;border-radius:4px;border:none;" onkeydown="if(event.key===\'Enter\') window.submitCheat()"/>';
        html += '<div onclick="window.submitCheat()" style="margin-top:8px;padding:8px;background:#fff;color:#000;text-align:center;font-weight:bold;border-radius:4px;cursor:pointer;">OK</div>';
        html += '</div>';

        html += '<script>';
        html += fs.readFileSync(dest.bundle);
        html += '</script>';
        fs.writeFileSync(dest.html, html);
    },

    zip: async () => {
        await zip({
            cwd: dest.base,
            source: 'index.html',
            destination: dest.zip
        });
    },

    stats: () => {
        const buffer = fs.readFileSync(dest.zip);
        const strFormat = buffer.length.toLocaleString('en-US');
        console.log(`===> High Quality Build Size: ${chalk.green(strFormat + ' bytes')} <===`);
    },
}
