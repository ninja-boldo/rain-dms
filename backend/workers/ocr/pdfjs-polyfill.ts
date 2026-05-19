/*
const canvasPkg = require("canvas");
const { CanvasRenderingContext2D: Ctx2D } = canvasPkg;

class FakePath2D {
  _commands: [string, ...any[]][] = [];
  moveTo(x: number, y: number) {
    this._commands.push(["moveTo", x, y]);
  }
  lineTo(x: number, y: number) {
    this._commands.push(["lineTo", x, y]);
  }
  bezierCurveTo(
    cp1x: number,
    cp1y: number,
    cp2x: number,
    cp2y: number,
    x: number,
    y: number,
  ) {
    this._commands.push(["bezierCurveTo", cp1x, cp1y, cp2x, cp2y, x, y]);
  }
  quadraticCurveTo(cpx: number, cpy: number, x: number, y: number) {
    this._commands.push(["quadraticCurveTo", cpx, cpy, x, y]);
  }
  arc(x: number, y: number, r: number, sa: number, ea: number, ccw?: boolean) {
    this._commands.push(["arc", x, y, r, sa, ea, ccw]);
  }
  arcTo(x1: number, y1: number, x2: number, y2: number, r: number) {
    this._commands.push(["arcTo", x1, y1, x2, y2, r]);
  }
  ellipse(
    x: number,
    y: number,
    rx: number,
    ry: number,
    rot: number,
    sa: number,
    ea: number,
    ccw?: boolean,
  ) {
    this._commands.push(["ellipse", x, y, rx, ry, rot, sa, ea, ccw]);
  }
  rect(x: number, y: number, w: number, h: number) {
    this._commands.push(["rect", x, y, w, h]);
  }
  closePath() {
    this._commands.push(["closePath"]);
  }
}

function replayPath(ctx: any, p: FakePath2D) {
  ctx.beginPath();
  for (const [cmd, ...args] of p._commands) ctx[cmd](...args);
}

function patchMethod(proto: any, name: "fill" | "stroke" | "clip") {
  const orig = proto[name];
  proto[name] = function (...args: any[]) {
    if (args[0] instanceof FakePath2D) {
      replayPath(this, args[0]);
      return orig.apply(this, args.slice(1));
    }
    return orig.apply(this, args);
  };
}

// Only patch once
if (Ctx2D && !Ctx2D.prototype.__pdfjs_patched) {
  patchMethod(Ctx2D.prototype, "fill");
  patchMethod(Ctx2D.prototype, "stroke");
  patchMethod(Ctx2D.prototype, "clip");
  Ctx2D.prototype.__pdfjs_patched = true;
}

// Expose globally so pdfjs picks it up
(globalThis as any).Path2D = canvasPkg.Path2D ?? FakePath2D;
(globalThis as any).CanvasRenderingContext2D = Ctx2D;
*/
