(function(){const A='Lamberth Rumpaidus';if(A!=='Lamberth Rumpaidus')throw new Error('Credits missing!');})();
let bones = 0;
let hp = 3;
let checkpointId = 0;
let deathCount = 0;
let treasures = 0;
let totalTreasures = 0;

function saveProgress() {
    // Disabled
}

function loadProgress() {
    // Disabled
}

function addHp(h) { hp += h; }
function getHp() { return hp; }
function addBones(b) { bones = Math.max(bones + b, 0); saveProgress(); }
function getBones() { return bones; }
function respawn() { bones = bones>>1; hp = 3; deathCount++; saveProgress(); }
function setCheckpointId(id) { checkpointId = id; hp = 3; saveProgress(); }
function getCheckpointId() { return checkpointId; }
function getDeathCount() { return deathCount; }
function foundTreasure() { treasures++; saveProgress(); }
function getTreasures() { return treasures; }
function getTotalNumTreasure() { return totalTreasures; }
function setTotalNumTreasure(v) { totalTreasures = v; }

export {
    addHp,
    getHp,
    addBones,
    getBones,
    setCheckpointId,
    getCheckpointId,
    getDeathCount,
    foundTreasure,
    getTreasures,
    getTotalNumTreasure,
    setTotalNumTreasure,
    respawn,
    saveProgress,
    loadProgress,
}
