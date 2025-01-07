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

///   MAIN   ///////////////////////////////////////////////////////////////////

var g_panels = new Panels();

function main() {
  // TODO: GOpts.load(<local storage>);
  // TODO: get Panels from GOpts
}

window.onload = function () {
  main();


  ///////////////////////////////////////////////////////////////////////////////////////////////////
  console.log("p1");
  let p1 = new Panel("k");
  p1.settings.width = 0;
  console.log(p1);
  console.log("p2");
  let buttons = ["a", {"m":10}, "b"];
  let p2 = new Panel("panel_1", null, { "width": "400px", frozen: true, "buttons": buttons});
  p2.settings["buttons"][1]["m"] = 9;
  console.log(p2);
  console.log(buttons);
  console.log("p3");
  let p3 = new Panel("k", Panel.DEFAULT_SETTINGS);
  console.log(p3);

  console.log(new Button("3"));

  if (false) {
    const editor = new toastui.Editor({
      el: document.querySelector('#editor'),
      height: '500px',
      initialEditType: 'markdown',
      previewStyle: 'vertical',
      theme: 'dark',
      usageStatistics: false,
    });
  }

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
      holder: "editorjs",
      tools: { 
        paragraph: {
          class: Paragraph,
          inlineToolbar: true,
        },
      }, 
      /*hideToolbar: false,
      autofocus: true,*/
      data: {
        "blocks": [
          {
            "type": "paragraph",
            "data": {
              "text": "A <b>B</b> <i>I</i> ez hova lett"
            }
          },
          {
            "type": "paragraph",
            "data": {
              "text": "A <b>B</b> <i>I</i> df sdf sdf sdf sdf sdf sd sdfg g b  b srb sr sd h th j j jf jfgh jfghj z  g fr df sdf sddf asdf g rtg df df g ergt erfg awef wef we fwe fw f wefwe f wert ef fg t ghrt hrt hrth rth rth rth  sdf gdf g f ref we fwe fwe fwe fwe fwe f wef we fwe fwe wer et ert 34 r34 34r rt ert te g "
            }
          }
        ],
      },
      /*onReady: () => {
        /*editor.save().then(outputData => {
          this.editor.render(outputData);
          this.$emit('close', true)
          const edjsParser = edjsHTML();
          let html = edjsParser.parse(outputData);
          console.log(html);
        }).catch((error) => {
          console.log('Saving failed: ', error)
        });
      }*/
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
