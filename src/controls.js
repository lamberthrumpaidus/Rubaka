import * as bus from './bus';
import { EVENT_ANY_KEY } from './events';

const pressed = {};

const GAMEPAD_BUTTON_MAP = {
    0: 'PadSouth',
    1: 'PadEast',
    2: 'PadWest',
    3: 'PadNorth',
    4: 'PadLBumper',
    6: 'PadLTrigger',
    12: 'DPadUp',
    13: 'DPadDown',
    14: 'DPadLeft',
    15: 'DPadRight',
}

function updateGameControls() {
    const gp = getGamePad();
    if (!gp) { return; }
    Object.entries(GAMEPAD_BUTTON_MAP).map(([btn, code]) => mapPadToKey(gp?.buttons[btn], code));
}

// KEYBOARD & MOUSE
onkeydown = (evt) => {
    if (!pressed[evt.code]) {
        pressed[evt.code] = Date.now();
    }
    bus.emit(EVENT_ANY_KEY);
}

onkeyup = (evt) => delete pressed[evt.code];

window.addEventListener('mousedown', (e) => {
    if (e.button === 0 && !pressed['MouseLeft']) {
        pressed['MouseLeft'] = Date.now();
        bus.emit(EVENT_ANY_KEY);
    }
});

window.addEventListener('mouseup', (e) => {
    if (e.button === 0) {
        delete pressed['MouseLeft'];
    }
});

window.addEventListener('touchstart', (e) => {
    const tui = document.getElementById('touchui');
    if (tui && tui.style.display === 'none') {
        tui.style.display = 'block';
    }
}, {passive: false});

window.addEventListener('load', () => {
    function hookTouch(id, keycode) {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('touchstart', (e) => {
            e.preventDefault();
            pressed[keycode] = Date.now();
            bus.emit(EVENT_ANY_KEY);
            window.dispatchEvent(new KeyboardEvent('keydown', { code: keycode, key: keycode }));
        }, {passive: false});
        el.addEventListener('touchend', (e) => {
            e.preventDefault();
            delete pressed[keycode];
            window.dispatchEvent(new KeyboardEvent('keyup', { code: keycode, key: keycode }));
        }, {passive: false});
    }
    hookTouch('t_u', 'ArrowUp');
    hookTouch('t_d', 'ArrowDown');
    hookTouch('t_l', 'ArrowLeft');
    hookTouch('t_r', 'ArrowRight');
    hookTouch('t_a', 'Enter');
    hookTouch('t_j', 'KeyZ');
    hookTouch('t_c', 'KeyC');
    hookTouch('t_v', 'KeyV');
    hookTouch('t_p', 'Escape');
    hookTouch('t_m', 'KeyM');
});

// GAMEPAD
let currentGamePadId = 0;
window.addEventListener('gamepadconnected', (e) => {
    currentGamePadId = e.gamepad.index;
});

function getGamePad() { return navigator.getGamepads()[currentGamePadId]; }
function mapPadToKey(button, keyname) {
    if (!pressed[keyname] && button?.value > 0.5) { onkeydown({ code: keyname }); }
    if (pressed[keyname] && button?.value < 0.5) { onkeyup({ code: keyname }); }
}

let horizontal = () =>
    ((pressed['ArrowLeft'] || pressed['KeyA'] || getGamePad()?.axes[0] < -0.4 || pressed['DPadLeft']) ? -1 : 0) + 
    ((pressed['ArrowRight'] || pressed['KeyD'] || getGamePad()?.axes[0] > 0.4 || pressed['DPadRight']) ? 1 : 0);
let vertical = () => 
    ((pressed['ArrowUp'] || pressed['KeyW']  || getGamePad()?.axes[1] < -0.4 || pressed['DPadUp']) ? 1 : 0) + 
    ((pressed['ArrowDown'] || pressed['KeyS'] || getGamePad()?.axes[1] > 0.4 || pressed['DPadDown']) ? -1 : 0);
let recent = (f) => (Date.now() - pressed[f]) < 100;
let jump = () => recent('KeyZ') || recent('Space') || recent('PadSouth');
let attack = () => recent('KeyX') || recent('Enter') || recent('MouseLeft') || recent('PadWest');
let dash = () => recent('KeyC') || recent('KeyK') || recent('PadEast') || recent('PadLTrigger');
let ignite = () => recent('KeyV') || recent('KeyL') || recent('PadNorth');
let holdingJump = () => pressed['KeyZ'] || pressed['Space'] || pressed['PadSouth'];
let holdingMap = () => pressed['KeyM'] || pressed['KeyN'] || pressed['PadLBumper'];

export {
    updateGameControls,
    horizontal,
    vertical,
    jump,
    attack,
    ignite,
    dash,
    holdingJump,
    holdingMap,
}