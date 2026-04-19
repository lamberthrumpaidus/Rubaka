import { canvas, ctx, retainTransform } from './canvas';
import { updateGameControls } from './controls';
import { TAG_CAMERA } from './tags';

let gameObjects = [];
let gameObjectsByTag = {};
const objectsToRemove = [];
let lastFrameMs = 0;
let startTime = 0;
let startInvoked = false;

let isPaused = false;
function togglePause() { 
    isPaused = !isPaused; 
    window.isPaused = isPaused;
    const cheatMenu = document.getElementById('cheatMenu');
    if (cheatMenu) cheatMenu.style.display = isPaused ? 'block' : 'none';
    
    if (isPaused) {
        setTimeout(() => {
            const cheatInput = document.getElementById('cheatInput');
            if (cheatInput) cheatInput.focus();
        }, 10);
    }
    
    const tp = document.getElementById('t_p');
    const tm = document.getElementById('t_m');
    if (isPaused) {
        if (tp) tp.style.opacity = '0.5';
        if (tm) tm.style.opacity = '0.5';
    } else {
        if (tp) tp.style.opacity = '0';
        if (tm) tm.style.opacity = '0';
    }
}

function tick(currentFrameMs) {
    updateGameControls();
    if (!startInvoked) { requestAnimationFrame(tick); return; }
    
    const dT = Math.min((currentFrameMs - lastFrameMs) * 0.001, 0.018);
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.globalCompositeOperation = 'source-over';
    ctx.shadowBlur = 0;
    
    retainTransform(() => {
        const camera = getObjectsByTag(TAG_CAMERA)[0];
        if (camera) {
            camera.set(ctx);
        }

        if (!isPaused) {
            objectsToRemove.length = 0;
            gameObjects.map((g) => { if (g.update?.(dT)) { objectsToRemove.push(g); } });
            if (objectsToRemove.length) { remove(objectsToRemove); }
        }
        if (camera) {
            gameObjects.map((g) => { if (g.inView(camera.x, camera.y)) { g.render?.(ctx); }});
        } else {
            gameObjects.map((g) => { g.render?.(ctx); });
        }

        if (isPaused) {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#fff';
            ctx.textAlign = 'center';
            ctx.font = 'bold 40px arial';
            ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
        }
        lastFrameMs = currentFrameMs;
    });
    requestAnimationFrame(tick);
}

function add(obj) {
    if (!obj.inView) { obj.inView=()=>1 }
    gameObjects.push(obj);
    gameObjects.sort((a, b) => (a.order || 0) - (b.order || 0));
    obj.tags?.map((tag) => {
        gameObjectsByTag[tag] = (gameObjectsByTag[tag] ?? []);
        gameObjectsByTag[tag].push(obj);
    });
}

function arrayRemove(list, valuesToEvict) {
    return list.filter((g) => !valuesToEvict.includes(g));
}

function remove(objList) {
    gameObjects = arrayRemove(gameObjects, objList);
    objList.map((obj) => {
        obj.tags?.map((tag) => {
            gameObjectsByTag[tag] = arrayRemove(gameObjectsByTag[tag], [obj]);
        });
    });
}

function clear() {
    gameObjects = [];
}

function start() {
    startInvoked = true;
    startTime = Date.now();
}

function getObjectsByTag(tag) {
    return gameObjectsByTag[tag] || [];
}

function getStartTime() {
    return startTime;
}

requestAnimationFrame(tick);

export {
    start,

    add,
    remove,
    clear,
    getStartTime,

    getObjectsByTag,
    togglePause,
};