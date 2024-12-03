
function isReal(o) {
    return o && o !== 'null' && o !== 'undefined';
}
function isRealTrue(o) {
    return isReal(o) && o === true;
}
function isRealFalse(o) {
    return isReal(o) && o === false;
}

class Point {
    x = 0;
    y = 0;
    dragged = false;

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    draw(ctx) {
        let saveLineWidth = ctx.lineWidth;
        ctx.beginPath();
        if (this.dragged) {
            ctx.lineWidth = 1;
            ctx.strokeStyle = "#FFA500FF";
            ctx.arc(this.x, this.y, 3, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.strokeStyle = "#FFA50080";
            ctx.arc(this.x, this.y, 2, 0, 2 * Math.PI);
            ctx.arc(this.x, this.y, 4, 0, 2 * Math.PI);
            ctx.stroke();
        } else {
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#00000080";
            ctx.arc(this.x, this.y, 2, 0, 2 * Math.PI);
            ctx.stroke();
        }
        ctx.lineWidth = saveLineWidth;
    }

    checkOver(event) {
        return (Math.abs(this.x - event.offsetX) < 3
                && Math.abs(this.y - event.offsetY) < 3) ? this : null;
    }
}

class Board {
    gelements = [];
    draw_ctx = null;
    options_ctx = null;
    events_ctx = null;
    draggedElement = null;

    constructor(container) {
        this.container = container;
        this.draw_ctx = this.container.querySelector("#canvas_draw").getContext("2d");
        this.events_ctx = this.container.querySelector("#canvas_events").getContext("2d");
        this.options_ctx = this.container.querySelector("#canvas_options").getContext("2d");

        const ec = this.events_ctx.canvas;
        ec.addEventListener('mousedown', this.mouseDown.bind(this));
        ec.addEventListener('mousemove', this.mouseMove.bind(this));
        ec.addEventListener('mouseup', this.mouseUp.bind(this));
    }

    checkOver(event) {
        for (let i = 0; i < this.gelements.length; ++i) {
            let o = this.gelements[i].checkOver(event);
            if (o !== null) {
                return o;
            }
        }
        return null;
    }

    mouseDown(event) {
        let element = this.checkOver(event);
        if (element !== null) {
            this.draggedElement = element;
            this.draggedElement.dragged = true;
        } else {
            this.draggedElement = this.addPoint(new Point(event.offsetX, event.offsetY));
            this.draggedElement.dragged = true;
        }

        console.log('mousedown');
        console.log(event);
        this.draw();
    }

    mouseMove(event) {
        if (isReal(this.draggedElement) && this.draggedElement.dragged === true) {
            this.draggedElement.x = event.offsetX;
            this.draggedElement.y = event.offsetY;
            this.draw();
        } else {
            let element = this.checkOver(event);
            if (element !== null) {
                this.events_ctx.canvas.style.cursor = "pointer";
            } else {
                this.events_ctx.canvas.style.cursor = "default";
            }
        }
        console.log('mousemove');
        console.log(event);
    }

    mouseUp(event) {
        if (isReal(this.draggedElement) && this.draggedElement.dragged === true) {
            this.draggedElement.dragged = false;
            this.draggedElement = null;
        }
        console.log('mouseup');
        console.log(event);
        this.draw();
    }

    draw_func(ctx) {
        console.log(this.container);
    }

    draw() {
        const ctx = this.draw_ctx;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        this.draw_func(ctx);

        for(let i = 0; i < this.gelements.length; ++i) {
            this.gelements[i].draw(ctx);
        }
    }

    addEventListener(type, func) {
        const c = this.events_ctx.canvas;
        c.addEventListener(type, func);
    }

    addPoint(p, dragged) {
        this.gelements.push(p);
        return p;
    }
}

window.onload = function () {
    let containers = document.getElementsByClassName("container");
    let base_container = document.getElementById('container_1');
    for (let i = 1; i < containers.length; ++i) {
        containers[i].innerHTML = base_container.innerHTML;
    }
    let boards = [];
    for (let i = 0; i < containers.length; ++i) {
        boards.push(new Board(containers[i]))
    }

    boards[0].draw_func = function(ctx)
    {
        ctx.beginPath();
        ctx.strokeStyle = 'blue';
        ctx.arc(95, 50, 40, 0, 2 * Math.PI);
        ctx.stroke();
    };
    boards[0].draw();
    /*boards[0].addEventListener('mousedown', function (event) {
        boards[0].addPoint(new Point(event.offsetX, event.offsetY));
        console.log('mousedown');
        console.log(event);
        boards[0].draw();
    });
    boards[0].addEventListener('mouseup', function (event) {
        console.log('mouseup');
        console.log(event);
    });*/
}
