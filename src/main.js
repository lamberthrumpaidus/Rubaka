/* ALL Create by LamberthRumpaidus */
import { hasProgress, saveProgress, getCheckpointSpawn, getAbilities } from './gamestate';
import { TAG_PLAYER } from './tags';
(function(){const A='Lamberth Rumpaidus';if(A!=='Lamberth Rumpaidus')throw new Error('Credits missing!');})();
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
import { EVENT_ANY_KEY, EVENT_BONE_COLLECT, EVENT_BONE_SPAWN, EVENT_FIREBALL, EVENT_PLAYER_CHECKPOINT, EVENT_PLAYER_HIT, EVENT_PLAYER_RESET, EVENT_SFX_FLAME, EVENT_SET_VOLUME, EVENT_CHEAT_KEBAL, EVENT_CHEAT_SKILLS, EVENT_PLAYER_ABILITY_GRANT, EVENT_CHEAT_REVOKE } from './events';
import { headMeshAsset } from './assets';
import { canvas, renderMesh, scaleInPlace } from './canvas';

const gameMap = Map();
async function initialize(continueGame=false){
    loadProgress(continueGame);
    const progress=p=>window.dispatchEvent(new CustomEvent("rubaka-loading",{detail:p*.85}));
    bus.on("load-progress",progress);
    start();
    const audio=Audio();
    try{await audio.init()}finally{bus.off("load-progress",progress)}
    window.dispatchEvent(new CustomEvent("rubaka-loading",{detail:.9}));
    clear();
    await gameMap.generate();
    [gameMap,Camera(), HUD()].map(add);
    const player=getObjectsByTag(TAG_PLAYER)[0];
    if(continueGame){const spawn=getCheckpointSpawn();if(spawn)player.reset(...spawn);getAbilities().forEach(a=>player.grant(a))}
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


    window.submitCheat = () => {
        const input = document.getElementById('cheatInput');
        if (!input) return;
        const code = input.value.toLowerCase().trim();
        if (code === 'kebal') {
            bus.emit(EVENT_CHEAT_KEBAL);
        } else if (code === 'buka') {
            bus.emit(EVENT_CHEAT_SKILLS);
        } else if (code === 'lam') {
            window.lamCheat = true;
            bus.emit(EVENT_CHEAT_SKILLS);
        } else if (code === 'off') {
            window.lamCheat = false;
            bus.emit(EVENT_CHEAT_REVOKE);
        } else if (code === 'stop') {
            bus.emit(EVENT_CHEAT_REVOKE);
        }
        input.value = '';
        togglePause(); 
    };

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
    saveProgress();
    window.dispatchEvent(new CustomEvent("rubaka-loading",{detail:1}));
}
let launching=false;
window.rubakaHasSave=hasProgress;
window.rubakaStart=async function(continueGame){if(launching)return;launching=true;await initialize(!!continueGame)};
