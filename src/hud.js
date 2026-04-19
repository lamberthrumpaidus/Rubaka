import * as bus from './bus';
import { boneMeshAsset, headMeshAsset, regionTitles, treasureMeshAsset } from "./assets";
import { canvas, color, renderMesh, renderText, retainTransform, scaleInPlace } from "./canvas";
import { getBones, getDeathCount, getHp, getTotalNumTreasure, getTreasures } from "./gamestate";
import { clamp, copy } from "./utils";
import { EVENT_PLAYER_ABILITY_GRANT, EVENT_PLAYER_CHECKPOINT, EVENT_REGION, EVENT_CHEAT_SKILLS } from './events';
import { getObjectsByTag, getStartTime } from './engine';
import { TAG_MAP, TAG_PLAYER } from './tags';
import { holdingMap } from './controls';

function HUD() {
    let regionTitle;
    let regionTitleTimer;
    let totalTime;
    let fadeIn = 0;
    let unlockedAbilities = {};

    function syncButtons() {
        const t_c = document.getElementById('t_c');
        if (t_c) {
            t_c.style.display = unlockedAbilities[0] ? 'flex' : 'none';
            document.getElementById('t_u').style.display = unlockedAbilities[1] ? 'flex' : 'none';
            document.getElementById('t_d').style.display = unlockedAbilities[1] ? 'flex' : 'none';
            document.getElementById('t_v').style.display = unlockedAbilities[2] ? 'flex' : 'none';
        }
    }
    syncButtons();

    const headMesh = copy(headMeshAsset);
    const boneMesh = copy(boneMeshAsset);
    const treasureMesh = copy(treasureMeshAsset);

    function update(dT) {
        regionTitleTimer -= dT;
        fadeIn += dT;
    }

    function render(ctx) {
        retainTransform(() => {
            // Render minimap
            if (holdingMap()) {
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.fillStyle = 'rgba(0,0,0,0.7)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.setTransform(4, 0, 0, 4, canvas.width / 2 - 252, canvas.height / 2 - 252);
                ctx.drawImage(getObjectsByTag(TAG_MAP)[0].m, 0, 0);
                if (Math.cos(Date.now() / 50) < 0.5) {
                    const player = getObjectsByTag(TAG_PLAYER)[0].playerHitbox;
                    ctx.fillStyle = '#e22';
                    ctx.fillRect(player.x / 100 - 0.5, player.y / 100 - 1.5, 2, 2);
                }
            }

            ctx.setTransform(0.8, 0, 0, 0.8, 0, 0);
            // Render HP
            for (let i = 0; i < 3; i++) {
                if (i >= getHp()) {
                    headMesh[0][0] = headMesh[3][0] = '#555';
                } else {
                    headMesh[0][0] = '#e22';
                    headMesh[3][0] = '#fff';
                }
                renderMesh(headMesh, 50 + i * 55, 72, 0, 0, 0);
            }

            // Render Bone count
            renderMesh(boneMesh, 50, 144, 0, -regionTitleTimer, 0);
            renderText(getBones(), 80, 146, 30);

            // Region Title
            if (regionTitleTimer > 0) {
                ctx.globalAlpha = clamp(regionTitleTimer, 0, 1) * clamp(-regionTitleTimer + totalTime, 0, 1);
                ctx.lineWidth = 18;
                renderText(regionTitle, 36, canvas.height * 1.15, 80);
                ctx.strokeStyle = '#000';
                ctx.strokeText(regionTitle, 36, canvas.height * 1.15);
                renderText(regionTitle, 36, canvas.height * 1.15, 80);
                ctx.globalAlpha = 1;
            }

            // Render Treasure count
            renderText(`${getTreasures()} / ${getTotalNumTreasure()}`, 80, 103, 30);
            scaleInPlace(0.5, 50, 102);
            renderMesh(treasureMesh, 50, 120, 0, 0, 0, '#742');

            const player = getObjectsByTag(TAG_PLAYER)[0];
            if (player && player.getInvincibleTimer && player.getInvincibleTimer() > 0) {
                const timeStr = Math.ceil(player.getInvincibleTimer());
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.textAlign = 'center';
                ctx.fillStyle = '#ffea00';
                ctx.font = 'bold 24px arial';
                ctx.fillText(`KEBAL: ${timeStr}s`, canvas.width / 2, canvas.height - 40);
                ctx.textAlign = 'left';
            }

            // Fade in initial
            if (fadeIn < 2) {
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.fillStyle = `rgba(0,0,0,${1 - fadeIn * fadeIn / 4})`;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        });
    }

    function onRegionChange(regionId) {
        regionTitle = regionTitles[regionId];
        totalTime = 6;
        regionTitleTimer = totalTime;
    }

    function onCheckpoint() {
        regionTitle = 'Checkpoint';
        totalTime = 4;
        regionTitleTimer = totalTime;
    }

    function onGrant(a) {
        unlockedAbilities[a] = true;
        let playTimeSeconds = (Date.now() - getStartTime()) / 1000;
        let playTimeMinutes = parseInt(playTimeSeconds / 60);
        playTimeSeconds -= playTimeMinutes * 60;

        regionTitle = [
            'Twisted Horns - Dash',
            'Iron Claws - Climb walls',
            'Fireball - Fireball',
            'Wingspan - Wingspan',
            `VICTORY! 🦴${getBones()}  ⌛${playTimeMinutes}:${(playTimeSeconds < 10 ? '0' : '')}${playTimeSeconds.toFixed(1)}  💀${getDeathCount()}`
        ][a];
        totalTime = a == 4 ? 30 : 5;
        regionTitleTimer = totalTime;
        syncButtons();
    }

    bus.on(EVENT_REGION, onRegionChange);
    bus.on(EVENT_PLAYER_CHECKPOINT, onCheckpoint);
    bus.on(EVENT_PLAYER_ABILITY_GRANT, onGrant);
    bus.on(EVENT_CHEAT_SKILLS, () => {
        [0, 1, 2, 3].map(a => unlockedAbilities[a] = true);
        syncButtons();
    });

    return {
        update,
        render,
        order: 10000
    }
}

export default HUD;