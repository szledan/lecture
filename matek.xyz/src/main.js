/* (C) Szilárd Ledán, szledan@gmail.com */

function createCookie(name, value, days) {
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    var expires = "; expires=" + date.toGMTString();
  }
  else var expires = "";
  document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function eraseCookie(name) {
  createCookie(name, "", -1);
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

function addListElemToMap(m, k, v) {
  if (m.has(k)) { m.get(k).push(v); } else { m.set(k, [v]); }
}

function nameGenerator(count, length, offset) {
  let n = "";
  while (count >= length) {
    n = String.fromCharCode(offset + count % length) + n;
    count = count / length - 1;
  }
  n = String.fromCharCode(offset + count % length) + n;
  return n;
}

class GOpts {
  isDark = false;
  activeContainer = null;

  constructor() {
    if (GOpts._instance) {
      return GOpts._instance
    }
    GOpts._instance = this;
  }

  static i() { return new GOpts(); }
}

class TypeObject {
  tname = "";
  constructor(tname) {
    this.tname = tname;
  }
}

const Types = Object.freeze({
  NONE: new TypeObject("Ismeretlen"),
  POINT: new TypeObject("Pont"),
  LINE: new TypeObject("Egyenes"),
  SEGMENT: new TypeObject("Szakasz"),
});

class Element {
  static HIT_RANGE = 5;
  static pointCode = 0;
  static lineCode = 0;

  etype = Types.NONE;
  ename = "";

  show = true;
  dragged = false;
  selected = false;

  listeners = new Map();

  constructor(etype, ename) {
    this.etype = etype;
    if (ename) {
      this.ename = ename;
    } else {
      switch (etype) {
        case Types.POINT: this.ename = nameGenerator(Element.pointCode++, 26, 65); break;
        case Types.LINE: this.ename = nameGenerator(Element.lineCode++, 26, 97); break;
        case Types.SEGMENT: this.ename = nameGenerator(Element.lineCode++, 26, 97); break;
      }
    }
  }

  addCallback(mode, callback) {
    addListElemToMap(this.listeners, mode, callback);
  }

  onMove() {
    this.listeners.get("move").forEach((e) => { e(this); });
  }
}

class Point extends Element {
  x = 0;
  y = 0;

  constructor(x, y) {
    super(Types.POINT);
    this.x = x;
    this.y = y;
  }

  create(args, math, scope) {
    let p = new Point(args[0], args[1]);
    return p;
  }

  toString() {
    return `(${this.x}, ${this.y})`;
  }

  draw(ctx) {
    if (!this.show) {
      return;
    }

    let saveLineWidth = ctx.lineWidth;
    ctx.beginPath();
    if (this.selected) {
      ctx.lineWidth = 1;
      ctx.strokeStyle = "#FFFF00FF";
      ctx.arc(this.x, this.y, 3, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.strokeStyle = "#FFFF0080";
      ctx.arc(this.x, this.y, 2, 0, 2 * Math.PI);
      ctx.arc(this.x, this.y, 4, 0, 2 * Math.PI);
      ctx.stroke();
    } else if (this.dragged) {
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
    return (this.show
      && Math.abs(this.x - event.offsetX) < Element.HIT_RANGE
      && Math.abs(this.y - event.offsetY) < Element.HIT_RANGE) ? this : null;
  }
}

class Line extends Element {
  p1 = null;
  p2 = null;
  x1 = 0.0;
  y1 = 0.0;
  x2 = 1.0;
  y2 = 1.0;

  constructor(p1, p2) {
    super(Types.LINE);
    this.p1 = p1;
    this.p2 = p2;
  }

  toString() {
    return `(${this.p1.ename}, ${this.p2.ename})`;
  }

  recalcLine() {
    let w = 10000;
    let h = 10000;
    let dx = this.p2.x - this.p1.x;
    let dy = this.p2.y - this.p1.y;
    if (Math.abs(dx) < 1e-9) {
      this.x1 = this.p1.x;
      this.y1 = 0;
      this.x2 = this.x1;
      this.y2 = h;
    } else {
      let m = dy / dx;
      this.x1 = 0;
      this.y1 = m * (0 - this.p1.x) + this.p1.y;
      this.x2 = w;
      this.y2 = m * (h - this.p1.x) + this.p1.y;
    }
  }

  draw(ctx) {
    if (!this.show) {
      return;
    }

    this.recalcLine();

    let saveLineWidth = ctx.lineWidth;
    ctx.beginPath();
    if (this.dragged) {
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#FFA50080";
      ctx.moveTo(this.x1, this.y1);
      ctx.lineTo(this.x2, this.y2);
      ctx.stroke();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#FFA500FF";
      ctx.moveTo(this.x1, this.y1);
      ctx.lineTo(this.x2, this.y2);
      ctx.stroke();
    } else {
      ctx.lineWidth = 3;
      ctx.strokeStyle = GOpts.i().isDark ? "#FFFFFF80" : "#00000080";
      ctx.moveTo(this.x1, this.y1);
      ctx.lineTo(this.x2, this.y2);
      ctx.stroke();
      ctx.lineWidth = 1;
      ctx.strokeStyle = GOpts.i().isDark ? "#FFFFFF80" : "#00000080";
      ctx.moveTo(this.x1, this.y1);
      ctx.lineTo(this.x2, this.y2);
      ctx.stroke();
    }
    ctx.lineWidth = saveLineWidth;
  }

  checkOver(event) {
    return null; // TODO
  }
}

class Segment extends Element {
  p1 = null;
  p2 = null;

  constructor(p1, p2) {
    super(Types.SEGMENT);
    this.p1 = p1;
    this.p2 = p2;
  }

  toString() {
    return `(${this.p1.ename}, ${this.p2.ename})`;
  }

  draw(ctx) {
    if (!this.show) {
      return;
    }

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
    return null; // TODO
  }
}

class BoardSettings {
}

class Board {
  gelements = [];

  draw_ctx = null;
  events_ctx = null;

  draggedElement = null;
  selectedElements = [];

  menu_button = null;
  panels = new Map();

  tool_button = null;
  tools = new Map();

  settings = null;
  keys = new Map();

  constructor(container) {
    this.container = container;

    this.draw_ctx = this.container.querySelector("#canvas_draw").getContext("2d");
    let _b = this.container.querySelector(".board");
    this.draw_ctx.canvas.width = _b.clientWidth;
    this.draw_ctx.canvas.height = _b.clientHeight;
    this.events_ctx = this.container.querySelector("#canvas_events").getContext("2d");
    this.events_ctx.canvas.width = _b.clientWidth;
    this.events_ctx.canvas.height = _b.clientHeight;

    const _ec = this.events_ctx.canvas;
    _ec.addEventListener('mousedown', this.mouseDown.bind(this));
    _ec.addEventListener('mousemove', this.mouseMove.bind(this));
    _ec.addEventListener('mouseup', this.mouseUp.bind(this));
    _ec.addEventListener('touchstart', () => { document.getElementById('test1').innerHTML += "touchstart"; });
    _ec.addEventListener('touchmove', () => { document.getElementById('test1').innerHTML += "touchmove"; });
    _ec.addEventListener('touchend', () => { document.getElementById('test1').innerHTML += "touchend"; });

    this.container.querySelector("#main_menu_checkbox").addEventListener('click', (e) => {
      this.container.querySelector("#main_menu_panel").style.display =
        this.container.querySelector("#main_menu_checkbox").checked ? "block" : "none";
      this.container.querySelector("#main_menu_button").style.opacity =
        this.container.querySelector("#main_menu_checkbox").checked ? "100%" : "25%";
    });
    this.container.querySelector("#main_menu_panel").style.display =
      this.container.querySelector("#main_menu_checkbox").checked ? "block" : "none";
    let _main_menu_button = this.container.querySelector("#main_menu_button");
    if (_main_menu_button.dataset.key !== null) {
      this.keys.set(_main_menu_button.dataset.key, this.container.querySelector("#main_menu_checkbox"));
    }

    this.panels.set("tools_chooser", this.container.querySelector("#tools_chooser"));
    this.panels.set("elements_list", this.container.querySelector("#elements_list"));
    this.panels.set("board_settings", this.container.querySelector("#board_settings"));
    let _menu_buttons = this.container.querySelectorAll(".menu_button");
    _menu_buttons.forEach((e) => {
      if (e.dataset.key !== null) {
        this.keys.set(e.dataset.key, e);
      }
      e.addEventListener('click', () => {
        GOpts.i().activeContainer = this;
        if (this.menu_button !== null) {
          this.menu_button.style.backgroundColor = "var(--button-bg-color)";
          this.panels.get(this.menu_button.dataset.panel).style.visibility = 'hidden';
        }
        this.menu_button = e;
        this.menu_button.style.backgroundColor = "var(--button-focus-bg-color)";
        this.panels.get(this.menu_button.dataset.panel).style.visibility = 'visible';
      });
    });
    this.menu_button = _menu_buttons[0];
    this.menu_button.style.backgroundColor = "var(--button-focus-bg-color)";
    this.panels.get(this.menu_button.dataset.panel).style.visibility = 'visible';

    let _tools_buttons = this.panels.get("tools_chooser").querySelectorAll(".tools_button");
    _tools_buttons.forEach((e) => {
      if (e.dataset.key !== null) {
        this.keys.set(e.dataset.key, e);
      }
      e.addEventListener('click', () => {
        GOpts.i().activeContainer = this;
        if (this.tool_button !== null) {
          this.tool_button.style.backgroundColor = "var(--button-bg-color)";
        }
        this.tool_button = e;
        this.tool_button.style.backgroundColor = "var(--button-focus-bg-color)";
      });
    });
    this.tool_button = _tools_buttons[0];
    this.tool_button.style.backgroundColor = "var(--button-focus-bg-color)";
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
      switch (this.tool_button.id) {
        case "segment_tools_button":
        case "line_tools_button":
          this.draggedElement.selected = true;
          break;
      }
    } else {
      let isSelected = false;
      switch (this.tool_button.id) {
        case "segment_tools_button":
        case "line_tools_button":
          isSelected = true;
        /* FALLTHROUGH */
        case "point_tools_button":
          this.draggedElement = this.addPoint(new Point(event.offsetX, event.offsetY));
          this.draggedElement.dragged = true;
          this.draggedElement.selected = isSelected;
          break;
      }
    }
    this.draw();
  }

  mouseMove(event) {
    if (isReal(this.draggedElement) && this.draggedElement.dragged === true) {
      this.draggedElement.x = event.offsetX;
      this.draggedElement.y = event.offsetY;
      this.draggedElement.onMove();
      this.draw();
    } else {
      let element = this.checkOver(event);
      if (element !== null) {
        this.events_ctx.canvas.style.cursor = "pointer";
      } else {
        this.events_ctx.canvas.style.cursor = "default";
      }
    }
    GOpts.i().activeContainer = this;
  }

  mouseUp(event) {
    if (isReal(this.draggedElement) && this.draggedElement.dragged === true) {
      switch (this.tool_button.id) {
        case "point_tools_button":
          break;
        case "line_tools_button":
          this.selectedElements.push(this.draggedElement);
          if (this.selectedElements.length == 2) {
            this.addLine(this.selectedElements);
            this.selectedElements[0].selected = false;
            this.draggedElement.selected = false;
            this.selectedElements = [];
          }
          break;
        case "segment_tools_button":
          this.selectedElements.push(this.draggedElement);
          if (this.selectedElements.length == 2) {
            this.addSegment(this.selectedElements);
            this.selectedElements[0].selected = false;
            this.draggedElement.selected = false;
            this.selectedElements = [];
          }
          break;
      }
      this.draggedElement.dragged = false;
      this.draggedElement = null;
    }
    this.draw();
    GOpts.i().activeContainer = this;
  }

  draw_func(ctx) {
  }

  draw() {
    const ctx = this.draw_ctx;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    this.draw_func(ctx);

    for (let i = 0; i < this.gelements.length; ++i) {
      this.gelements[i].draw(ctx);
    }
  }

  addEventListener(type, func) {
    const c = this.events_ctx.canvas;
    c.addEventListener(type, func);
  }

  addPoint(p) {
    const div = document.createElement("div");
    const checkBox = document.createElement("input");
    checkBox.type = 'checkbox';
    checkBox.checked = true;
    checkBox.addEventListener('change', function () { p.show = this.checked; });
    div.appendChild(checkBox);
    const textNode = document.createTextNode(p.ename + " = " + p.etype.tname + p);
    div.appendChild(textNode);
    div.appendChild(document.createElement("br"));
    let el = this.panels.get("elements_list");
    let es = this.panels.get("elements_list").querySelector("#elements");
    es.appendChild(div);
    el.scroll({ top: el.scrollHeight, behavior: 'smooth' });

    p.addCallback("move", (e) => { textNode.nodeValue = e.ename + " = " + e.etype.tname + e; });

    this.gelements.push(p);
    return p;
  }

  addLine(elements) {
    let l = new Line(elements[0], elements[1]);

    const div = document.createElement("div");
    const checkBox = document.createElement("input");
    checkBox.type = 'checkbox';
    checkBox.checked = true;
    checkBox.addEventListener('change', function () { l.show = this.checked; });
    div.appendChild(checkBox);
    div.appendChild(document.createTextNode(l.ename + " = " + l.etype.tname + l));
    div.appendChild(document.createElement("br"));
    this.panels.get("elements_list").appendChild(div);
    this.panels.get("elements_list").scroll({ top: this.panels.get("elements_list").scrollHeight, behavior: 'smooth' });

    this.gelements.push(l);
    return l;
  }

  addSegment(elements) {
    let s = new Segment(elements[0], elements[1]);

    const div = document.createElement("div");
    const checkBox = document.createElement("input");
    checkBox.type = 'checkbox';
    checkBox.checked = true;
    checkBox.addEventListener('change', function () { s.show = this.checked; });
    div.appendChild(checkBox);
    div.appendChild(document.createTextNode(s.ename + " = " + s.etype.tname + s));
    div.appendChild(document.createElement("br"));
    this.panels.get("elements_list").appendChild(div);
    this.panels.get("elements_list").scroll({ top: this.panels.get("elements_list").scrollHeight, behavior: 'smooth' });

    this.gelements.push(s);
    return s;
  }
}

///   MAIN   ///////////////////////////////////////////////////////////////////

var g_panels = new Panels();

function main() {
  // TODO: GOpts.load(<local storage>);
  // TODO: get Panels from GOpts
}

window.onload = function () {
  main();


  ///////////////////////////////////////////////////////////////////////////////////////////////////
  let p1 = new Panel("k");
  p1.settings.width = 0;
  let p2 = new Panel("k", { "width": "400px" });
  let p3 = new Panel("k", Panel.DEFAULT_SETTINGS);

  console.log(p1);
  console.log(p2);
  console.log(p3);

  console.log(new Button("3"));


  if (false) {
    var textarea = document.getElementById('cse');
    sceditor.create(textarea, {
      format: 'bbcode',
      //toolbar: 'bold,italic,underline|source',
      style: ''
    });

    let ps = document.getElementsByTagName("p");
    for (let i = 0; i < ps.length; ++i) {
      ps[i].addEventListener('dblclick', (e) => {
        let ta = "<textarea id='tmp_cse" + i + "'>" + ps[i].innerHTML + "</textarea>";
        ps[i].insertAdjacentHTML('afterend', ta);
        sceditor.create(document.getElementById('tmp_cse' + i), {
          format: 'bbcode',
          //toolbar: 'bold,italic,underline|source',
          style: ''
        });
      });
    };
  }


  if (false) {
    const editor = new EditorJS({
      hideToolbar: false,
      autofocus: true,
      data: {
        "time": 1601066567579,
        "blocks": [
          {
            "type": "paragraph",
            "data": {
              "text": "A <b>B</b> <i>I</i>"
            }
          },
          {
            "type": "paragraph",
            "data": {
              "text": "A <b>B</b> <i>I</i> df sdf sdf sdf sdf sdf sd sdfg g b  b srb sr sd h th j j jf jfgh jfghj z  g fr df sdf sddf asdf g rtg df df g ergt erfg awef wef we fwe fw f wefwe f wert ef fg t ghrt hrt hrth rth rth rth  sdf gdf g f ref we fwe fwe fwe fwe fwe f wef we fwe fwe wer et ert 34 r34 34r rt ert te g "
            }
          }
        ],
        "version": "2.18.0"
      },
      onReady: () => {
        editor.save().then(outputData => {
          this.editor.render(outputData);
          this.$emit('close', true)
          const edjsParser = edjsHTML();
          let html = edjsParser.parse(outputData);
          console.log(html);
        }).catch((error) => {
          console.log('Saving failed: ', error)
        });
      }
    });
  }

  {
    const source = String.raw`
    Astro {
      Program   = Statement+
      Statement   = id "=" Exp ";"             --assignment
            | print Exp ";"              --print
      Exp     = Exp ("+" | "-") Term           --binary
            | Term
      Term    = Term ("*" | "/" | "%") Factor      --binary
            | Factor
      Factor    = Primary "^" Factor           --binary
            | "-" Primary              --negation
            | Primary
      Primary   = id "(" ListOf<Exp, ","> ")"      --call
            | numeral                --num
            | id                   --id
            | "(" Exp ")"              --parens

      numeral   = digit+ ("." digit+)? (("E" | "e") ("+" | "-")? digit+)?
      print     = "print" ~idchar
      idchar    = letter | digit | "_"
      id      = ~print letter idchar*
      space    += "//" (~"\n" any)*            --comment
    }
    `;

    const astroGrammar = ohm.grammar(source);

    const memory = {
      π: { type: "NUM", value: Math.PI, access: "RO" },
      sin: { type: "FUNC", value: Math.sin, paramCount: 1 },
      cos: { type: "FUNC", value: Math.cos, paramCount: 1 },
      sqrt: { type: "FUNC", value: Math.sqrt, paramCount: 1 },
      hypot: { type: "FUNC", value: Math.hypot, paramCount: 2 },
    };

    function check(condition, message, at) {
      if (!condition) throw new Error(`${at.source.getLineAndColumnMessage()}${message}`);
    }

    const evaluator = astroGrammar.createSemantics().addOperation("eval", {
      Program(statements) {
        for (const statement of statements.children) statement.eval();
      },
      Statement_assignment(id, _eq, expression, _semicolon) {
        const entity = memory[id.sourceString]
        check(!entity || entity?.type === "NUM", "Cannot assign", id)
        check(!entity || entity?.access === "RW", `${id.sourceString} not writable`, id)
        memory[id.sourceString] = { type: "NUM", value: expression.eval(), access: "RW" }
      },
      Statement_print(_print, expression, _semicolon) {
        console.log(expression.eval())
      },
      Exp_binary(left, op, right) {
        const [x, y] = [left.eval(), right.eval()]
        return op.sourceString == "+" ? x + y : x - y
      },
      Term_binary(left, op, right) {
        const [x, o, y] = [left.eval(), op.sourceString, right.eval()]
        return o == "*" ? x * y : o == "/" ? x / y : x % y
      },
      Factor_binary(left, _op, right) {
        return left.eval() ** right.eval()
      },
      Primary_parens(_leftParen, e, _rightParen) {
        return e.eval()
      },
      Primary_num(num) {
        return Number(num.sourceString)
      },
      Primary_id(id) {
        const entity = memory[id.sourceString]
        check(entity !== undefined, `${id.sourceString} not defined`, id)
        check(entity?.type === "NUM", `Expected type number`, id)
        return entity.value
      },
      Primary_call(id, _open, exps, _close) {
        const entity = memory[id.sourceString]
        check(entity !== undefined, `${id.sourceString} not defined`, id)
        check(entity?.type === "FUNC", "Function expected", id)
        const args = exps.asIteration().children.map(e => e.eval())
        check(args.length === entity?.paramCount, "Wrong number of arguments", exps)
        return entity.value(...args)
      },
    })

    try {
      const match = astroGrammar.match("x=4*π; print 3+2*x;");
      if (match.failed()) throw new Error(match.message);
      evaluator(match).eval();
    } catch (e) {
      console.error(`${e}`);
    }

  }





  document.querySelector("#dark-mode-toggle").addEventListener('click', () => {
    document.body.classList.toggle("latex-dark");
    document.body.classList.toggle("button-dark");
    GOpts.i().isDark = !GOpts.i().isDark;
  });
  document.body.classList.toggle("latex-dark");
  document.body.classList.toggle("button-dark");
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

  document.body.addEventListener('keyup', function (e) {
    if (GOpts.i().activeContainer !== null && GOpts.i().activeContainer.keys.has(e.key)) {
      GOpts.i().activeContainer.keys.get(e.key).click();
    }
  });


  boards[0].draw_func = function (ctx) {
    let w = ctx.canvas.width;
    let h = ctx.canvas.height;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.strokeStyle = 'grey';
    ctx.setLineDash([5, 15]);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(w / 4, 0);
    ctx.lineTo(w / 4, h);
    ctx.strokeStyle = 'grey';
    ctx.setLineDash([5, 15]);
    ctx.stroke();

    ctx.beginPath();
    let s = w / 15;
    ctx.moveTo(s, h / 2 + 1 / (s / 200.0) * 20.0 * Math.sin(-10 + s / 20.0));
    for (let i = s; i < (w - s); ++i) {
      ctx.lineTo(i, h / 2 + 1 / (i / 200.0) * 20.0 * Math.sin(-10 + i / 20.0));
    }
    ctx.setLineDash([]);
    ctx.strokeStyle = 'green';
    ctx.stroke();
  };
  boards[0].draw();
  boards[1].draw_func = function (ctx) {
    let w = ctx.canvas.width;
    let h = ctx.canvas.height;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.strokeStyle = 'grey';
    ctx.setLineDash([5, 15]);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.strokeStyle = 'grey';
    ctx.setLineDash([5, 15]);
    ctx.stroke();

    let f = (x) => { x = (x - w / 2.1) / 7; return -(x * x) + h / 1.3; };
    let g = (x) => { x = (x - w / 1.9) / 20; return -100 * (Math.exp(-x * x)) + h / 2.1; };
    ctx.beginPath();
    let s = w / 15;
    ctx.moveTo(s, f(s));
    for (let i = s; i < (w - s); ++i) {
      ctx.lineTo(i, f(i));
    }
    ctx.setLineDash([]);
    ctx.strokeStyle = 'yellow';
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(s, g(s));
    for (let i = s; i < (w - s); ++i) {
      ctx.lineTo(i, g(i));
    }
    ctx.setLineDash([]);
    ctx.strokeStyle = 'orange';
    ctx.stroke();
  };
  boards[1].draw();
  boards[2].draw_func = function (ctx) {
    let w = ctx.canvas.width;
    let h = ctx.canvas.height;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.strokeStyle = 'grey';
    ctx.setLineDash([5, 15]);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.strokeStyle = 'grey';
    ctx.setLineDash([5, 15]);
    ctx.stroke();

    let f = (x) => { x = (x - w / 2.0) / 20; return -20 * Math.sin(x) + h / 2; };
    let fact = (n) => { return n > 1 ? n * fact(n - 1) : 1; };
    let t = (x, n) => { return Math.pow(x, n) / fact(n) }
    let g = (x) => { x = (x - w / 2.0) / 20; return -20 * (x - t(x, 3) + t(x, 5) - t(x, 7)) + h / 2; };
    ctx.beginPath();
    let s = w / 15;
    ctx.moveTo(s, f(s));
    for (let i = s; i < (w - s); ++i) {
      ctx.lineTo(i, f(i));
    }
    ctx.setLineDash([]);
    ctx.strokeStyle = 'blue';
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(s, g(s));
    for (let i = s; i < (w - s); ++i) {
      ctx.lineTo(i, g(i));
    }
    ctx.setLineDash([]);
    ctx.strokeStyle = 'green';
    ctx.stroke();
  };
  boards[2].draw();
}
