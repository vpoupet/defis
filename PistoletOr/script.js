segments = [2, 4, 4, 2, 5, 2, 2, 3, 7, 2, 2, 4, 6, 5, 3, 3, 2, 2, 4, 2, 3, 2, 2, 2, 3, 2, 3, 2, 3, 2, 4, 4, 2, 3, 2, 2, 9,
    2, 2, 3, 2, 2, 2, 3, 14, 2, 22, 2, 7, 2, 2, 2, 4, 5, 3, 11, 2, 2, 6, 2, 2, 6, 3, 2, 2, 2, 5, 2, 2, 2, 2, 2, 3, 2,
    2, 2, 4, 2, 2, 4, 4, 2, 4, 2, 7, 4];

let selected_group;

function rotationAngle(g) {
    const rotation = g.transform_list().pop();
    const angle_str = /\(([-0-9]*)\)/.exec(rotation)[1];
    return parseInt(angle_str);
}

function updatePath() {
    let direction = 0; // 0: Nord, 1: Est, 2: Sud, 3: Ouest
    let g = document.getElementById("root-group");
    let path = "";
    while (nextGroup(g) !== undefined) {
        const angle = rotationAngle(g);
        direction += (angle === 90) ? 1 : -1;
        direction = (direction + 4) % 4;
        path += "SONE"[direction];
        g = nextGroup(g);
    }
    document.getElementById("path").innerHTML = path;
}

function nextGroup(g) {
    return g.getElementsByTagName("g")[0];
}

function prevGroup(g) {
    if (g.parentElement.tagName === "g") return g.parentElement;
}

function rotate_group(g) {
    const angle = rotationAngle(g);
    g.pop_transform();
    g.rotate(-angle);
    updatePath();
}

function select(g) {
    if (selected_group !== undefined) selected_group.classList.remove("selected");
    selected_group = g;
    selected_group.classList.add("selected");
}

window.onload = function () {
    const container = document.getElementById("svg-container");
    // Image SVG
    const image = SVG.Image(50, 50).update({
        fill: "#FFFF00",
        // fill_opacity: ".3",
        stroke: "#000000",
        stroke_width: ".1",
        radius: .5,
    });
    container.appendChild(image);

    // Grille
    image.appendChild(SVG.Grid(50, 50).update({
        stroke: "#AAAAAA",
        stroke_width: ".05",
    }).translate(-.5, -.5));

    let g1, g2;
    let rect;

    g1 = SVG.Group().update({id: "root-group"}).translate(25, 25).rotate(-90);
    image.appendChild(g1);
    select(g1);

    for (let i = 0; i < segments.length; i++) {
        const segment_length = segments[i];
        rect = SVG.Rect(-.5, -.5, 1, segment_length, .5, .5);
        rect.addEventListener("click", (e) => select(e.target.parentElement));
        g1.appendChild(rect);
        const angle = i % 2 === 0 ? 90 : -90;
        g2 = SVG.Group().translate(0, segment_length - 1).rotate(angle);
        g1.appendChild(g2);
        g1 = g2;
    }

    updatePath();

    window.addEventListener("keydown", (event) => {
        console.log(event.key);
        let next_group;
        switch (event.key) {
            case "ArrowRight":
                event.preventDefault();
                if (nextGroup(selected_group) !== undefined) select(nextGroup(selected_group));
                break;
            case "ArrowLeft":
                event.preventDefault();
                if (prevGroup(selected_group) !== undefined) select(prevGroup(selected_group));
                break;
            case " ":
                event.preventDefault();
                next_group = nextGroup(selected_group);
                rotate_group(selected_group);
                if (next_group !== undefined) rotate_group(next_group);
        }
    });
};