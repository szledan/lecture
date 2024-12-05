function createCookie(name,value,days) {
    if (days) {
        var date = new Date();
        date.setTime(date.getTime()+(days*24*60*60*1000));
        var expires = "; expires="+date.toGMTString();
    }
    else var expires = "";
    document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function eraseCookie(name) {
    createCookie(name,"",-1);
}


function isReal(o) {
    return o && o !== 'null' && o !== 'undefined';
}
function isRealTrue(o) {
    return isReal(o) && o === true;
}
function isRealFalse(o) {
    return isReal(o) && o === false;
}

class GOpts {
    isDark = false;

    constructor() {
        if (GOpts._instance) {
            return GOpts._instance
        }
        GOpts._instance = this;
    }

    static i() { return new GOpts(); }
}

class Point {
    x = 0;
    y = 0;
    dragged = false;

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    toString() {
        return `Pont(${this.x}, ${this.y})`;
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
            ctx.strokeStyle = GOpts.i().isDark ? "#FFFFFF80" : "#00000080";
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

class Line {
    p1 = new Point(0, 0);
    p2 = new Point(1, 1);
    dragged = false;

    constructor(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
    }

    toString() {
        return `Egyenes(${this.p1}, ${this.p2})`;
    }

    draw(ctx) {
        let saveLineWidth = ctx.lineWidth;
        ctx.beginPath();
        if (this.dragged) {
            ctx.lineWidth = 4;
            ctx.strokeStyle = "#FFA50080";
            ctx.moveTo(this.p1.x, this.p1.y);
            ctx.lineTo(this.p2.x, this.p2.y);
            ctx.stroke();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#FFA500FF";
            ctx.moveTo(this.p1.x, this.p1.y);
            ctx.lineTo(this.p2.x, this.p2.y);
            ctx.stroke();
        } else {
            ctx.lineWidth = 3;
            ctx.strokeStyle = GOpts.i().isDark ? "#FFFFFF80" : "#00000080";
            ctx.moveTo(this.p1.x, this.p1.y);
            ctx.lineTo(this.p2.x, this.p2.y);
            ctx.stroke();
            ctx.lineWidth = 1;
            ctx.strokeStyle = GOpts.i().isDark ? "#FFFFFF80" : "#00000080";
            ctx.moveTo(this.p1.x, this.p1.y);
            ctx.lineTo(this.p2.x, this.p2.y);
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
    elements_list = null;

    constructor(container) {
        this.container = container;
        this.draw_ctx = this.container.querySelector("#canvas_draw").getContext("2d");
        this.events_ctx = this.container.querySelector("#canvas_events").getContext("2d");
        this.options_ctx = this.container.querySelector("#canvas_options").getContext("2d");
        this.elements_list = this.container.querySelector("#elements_list");

        const ec = this.events_ctx.canvas;
        ec.addEventListener('mousedown', this.mouseDown.bind(this));
        ec.addEventListener('mousemove', this.mouseMove.bind(this));
        ec.addEventListener('mouseup', this.mouseUp.bind(this));

        const octx = this.options_ctx;
        octx.strokeStyle = "#d3d3d3";
        octx.beginPath();
        octx.roundRect(5, 5, 30, 30, 5);
        octx.stroke();
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
        const div = document.createElement("div");
        const checkBox = document.createElement("input");
        checkBox.type = 'checkbox';
        div.appendChild(checkBox);
        div.appendChild(document.createTextNode(p));
        div.appendChild(document.createElement("br"));
        this.elements_list.appendChild(div);

        this.gelements.push(p);
        return p;
    }

    addLine(p, dragged) {
        const div = document.createElement("div");
        const checkBox = document.createElement("input");
        checkBox.type = 'checkbox';
        div.appendChild(checkBox);
        div.appendChild(document.createTextNode(p));
        div.appendChild(document.createElement("br"));
        this.elements_list.appendChild(div);

        this.gelements.push(p);
        return p;
    }
}

window.onload = function () {
    document.querySelector("#dark-mode-toggle").addEventListener('click', () => {
        document.body.classList.toggle("latex-dark");
        GOpts.i().isDark = !GOpts.i().isDark;
    });
    document.body.classList.toggle("latex-dark");
    GOpts.i().isDark = !GOpts.i().isDark;

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
