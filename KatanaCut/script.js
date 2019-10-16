const canvas = document.getElementById("canvas");
let tiles = new Set();
let pressedKeys = new Set();

const ctx = canvas.getContext('2d');
ctx.fillStyle = 'rgba(255, 0, 0, .5)';

const img = new Image();
img.src = "./shuffle.png";

img.onload = function() {
    ctx.drawImage(img, 0, 0);
    for (let x = 0; x < 23; x++) {
        for (let y = 0; y < 13; y++) {
            tiles.add(new Tile(x, y));
        }
    }
};

let selectedTile = undefined;

function norm(pixel1, pixel2) {
    return Math.sqrt(
        (pixel1[0] - pixel2[0]) * (pixel1[0] - pixel2[0])
        + (pixel1[1] - pixel2[1]) * (pixel1[1] - pixel2[1])
        + (pixel1[2] - pixel2[2]) * (pixel1[2] - pixel2[2]));
}

function select(tile) {
    if (selectedTile !== undefined) {
        selectedTile.update();
    }
    selectedTile = tile;
    ctx.fillRect(42 * selectedTile.x + 4, 42 * selectedTile.y + 4, 34, 34);
}

canvas.onclick = function(event) {
    let rect = canvas.getBoundingClientRect();
    let x = ~~((event.clientX - rect.left) / 42);
    let y = ~~((event.clientY - rect.top) / 42);
    let clickedTile = Tile.at(x, y);
    if (clickedTile === selectedTile) {
        selectedTile.update();
        selectedTile = undefined;
    } else {
        select(clickedTile);
    }
};

class Tile {
    constructor(x, y) {
        this.imgData = ctx.getImageData(42 * x, 42 * y, 42, 42);
        /** @type {Number} */
        this.x = x;
        /** @type {Number} */
        this.y = y;
    }

    update() {
        ctx.putImageData(this.imgData, 42 * this.x, 42 * this.y);
    }

    static at(x, y) {
        for (let tile of tiles) {
            if (tile.x === x && tile.y === y) {
                return tile;
            }
        }
    }

    switchWith(other) {
        [this.x, other.x] = [other.x, this.x];
        [this.y, other.y] = [other.y, this.y];
        this.update();
        other.update();
    }

    pixelAt(x, y) {
        const index = 4 * (42 * y + x);
        return (this.imgData.data.slice(index, index+3));
    }

    distanceTo(other, dx, dy) {
        let t = 0;
        for (let i = 0; i < 42; i++) {
            t += norm(this.pixelAt(dx === 0 ? i : 41 * (dx + 1) / 2, dy === 0 ? i : 41 * (dy + 1) / 2),
            other.pixelAt(dx === 0 ? i : 41 * (-dx + 1) / 2, dy === 0 ? i : 41 * (-dy + 1) / 2));
        }
        return t;
    }

    bestMatch(dx, dy) {
        let bestTile = undefined;
        let bestDistance = Infinity;
        for (let tile of tiles) {
            let distance = this.distanceTo(tile, dx, dy);
            if (distance < bestDistance) {
                bestDistance = distance;
                bestTile = tile;
            }
        }
        return bestTile;
    }
}

document.addEventListener("keydown", (event) => {
    pressedKeys.add(event.key);
    let dx, dy;
    if (event.key === "ArrowUp") {
        dx = 0;
        dy = -1;
    } else if (event.key === "ArrowDown") {
        dx = 0;
        dy = 1;
    } else if (event.key === "ArrowLeft") {
        dx = -1;
        dy = 0;
    } else if (event.key === "ArrowRight") {
        dx = 1;
        dy = 0;
    }
    if (dx !== undefined) {
        if (selectedTile !== undefined) {
            if (pressedKeys.has("Shift")) {
                let bestMatch = selectedTile.bestMatch(dx, dy);
                bestMatch.switchWith(Tile.at(selectedTile.x + dx, selectedTile.y + dy));
                select(bestMatch);
            } else {
                select(Tile.at(selectedTile.x + dx, selectedTile.y + dy));
            }
        } else {
            for (let tile of tiles) {
                tile.x += 23 + dx;
                tile.x %= 23;
                tile.y += 13 + dy;
                tile.y %= 13;
                tile.update();
            }
        }
    }
});

document.addEventListener("keyup", (event) => {
    pressedKeys.delete(event.key);
});