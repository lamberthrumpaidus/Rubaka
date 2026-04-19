import * as bus from './bus';
import { start, add, getObjectsByTag, clear, togglePause } from './engine';
import { addBones, addHp, respawn, setCheckpointId, loadProgress } from './gamestate';
import HUD from './hud';
import Map from './map';
import Camera from './camera';
import Bone from './bone';
import Fireball from './fireball';
import FlameSFX from './flame-sfx';
import Audio from './audio';
import ParticleEmit from './particles';
import { EVENT_ANY_KEY, EVENT_BONE_COLLECT, EVENT_BONE_SPAWN, EVENT_FIREBALL, EVENT_PLAYER_CHECKPOINT, EVENT_PLAYER_HIT, EVENT_PLAYER_RESET, EVENT_SFX_FLAME, EVENT_SET_VOLUME } from './events';
import { headMeshAsset } from './assets';
import { canvas, renderMesh, scaleInPlace } from './canvas';
import controlsImage from "./controls-image.png";

const gameMap = Map();
async function initialize() {
    // Loading
    bus.off(EVENT_ANY_KEY, initialize);
    const h1 = document.getElementsByTagName('h1')[0];
    bus.on('load-progress', (p) => {
        h1.innerText=`Loading... (${parseInt(p * 100)}%)`;
    });

    // Adjust UI elements
    document.getElementsByTagName('h2')[0].innerHTML = '&nbsp;';
    h1.innerText='Loading...';
    await new Promise((r) => setTimeout(r, 100));

    // load audio and remove ui after
    console.log("Audio init starting");
    const audio = Audio();
    await audio.init();
    console.log("Audio init FINISHED!");
    document.querySelector('img.ctrl').remove();
    document.getElementsByTagName('h2')[0].remove();
    h1.remove();
    console.log("UI removed!");
    
    // Load the game scene
    loadProgress();
    clear();
    console.log("Generating game map...");
    await gameMap.generate();
    console.log("Game map generated!");
    [gameMap, Camera(), HUD()].map(add);

    // FOR DEVELOPMENT
    // getObjectsByTag(TAG_PLAYER)[0].grant(0);
    // getObjectsByTag(TAG_PLAYER)[0].grant(1);
    // getObjectsByTag(TAG_PLAYER)[0].grant(2);
    // getObjectsByTag(TAG_PLAYER)[0].grant(3);

    // Game events
    bus.on(EVENT_FIREBALL, ([x, y, dir]) => add(Fireball(x, y, dir)));
    bus.on(EVENT_SFX_FLAME, ([x, y, s, t]) => add(FlameSFX(x, y, s, t)));
    bus.on(EVENT_BONE_SPAWN, ([x,y,N,t]) => { 
        ParticleEmit(x, y, 10, '#ccc', 1);
        while(N-->0){ add(Bone(x,y,(Math.random()-0.5)*400,(-Math.random())*300-200,t)); } 
    });
    bus.on(EVENT_BONE_COLLECT, (v) => addBones(v));
    bus.on(EVENT_PLAYER_HIT, (v) => addHp(-v));
    bus.on(EVENT_PLAYER_CHECKPOINT, (v) => setCheckpointId(v));
    bus.on(EVENT_PLAYER_RESET, (v) => respawn());

    window.addEventListener('keydown', (e) => {
        if (e.code === 'KeyP' || e.code === 'Escape') {
            togglePause();
        }
        if (e.key === '+' || e.key === '=') {
            bus.emit(EVENT_SET_VOLUME, 0.1);
        }
        if (e.key === '-' || e.key === '_') {
            bus.emit(EVENT_SET_VOLUME, -0.1);
        }
    });
}

function mainMenu() {
    // Render controls
    const img = document.querySelector('img.ctrl');
    img.src = controlsImage;

    // Floaty head
    add({
        anim: 0,
        update: function(dT) {
            this.anim += 1.5 * dT;
        },
        render: function(ctx) {
            scaleInPlace(2.5,canvas.width/2,160);
            renderMesh(headMeshAsset, canvas.width/2, 146, 0, Math.cos(this.anim) * 0.6, Math.cos(this.anim) * 0.08);
            ctx.setTransform(1,0,0,1,0,0);
        },
    });

    start();
    bus.on(EVENT_ANY_KEY, initialize);
}
mainMenu();
