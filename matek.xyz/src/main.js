
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
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.strokeStyle = "#00000080";
        ctx.arc(this.x, this.y, 3, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.strokeStyle = "#88888880";
        ctx.arc(this.x, this.y, 2, 0, 2 * Math.PI);
        ctx.arc(this.x, this.y, 4, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.lineWidth = saveLineWidth;
    }
}

class Board {
    gelements = [];
    draw_ctx = null;
    options_ctx = null;
    constructor(container) {
        this.container = container;
        this.draw_ctx = this.container.querySelector("#canvas_draw").getContext("2d");
        this.options_ctx = this.container.querySelector("#canvas_options").getContext("2d");
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
        const c = this.container.querySelector("#canvas_events");
        c.addEventListener(type, func);
    }

    addPoint(p, dragged) {
        this.gelements.push(p);
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
    boards[0].addEventListener('mousedown', function (event) {
        boards[0].addPoint(new Point(event.offsetX, event.offsetY));
        console.log('mousedown');
        console.log(event);
        boards[0].draw();
    });
    boards[0].addEventListener('mouseup', function (event) {
        console.log('mouseup');
        console.log(event);
    });
}
