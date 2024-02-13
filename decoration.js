import { C } from "./color.js";
import { draw } from "./draw.js";
import { ctx } from "./main.js";

export const draw_decoration = (thing, position, size) => {
  const x = position.x;
  const y = position.y;
  const r = size;
  const dx = Math.cos(thing.a) * size;
  const dy = Math.sin(thing.a) * size;
  switch (thing.deco || 0) {
    case 0: {
      break;
    }
    case 101: {
      draw.line(x, y, x + dx, y + dy);
      break;
    }
    case 102: {
      const a = 0.1;
      draw.line(x + dy * a, y - dx * a, x + dx + dy * a, y + dy - dx * a);
      draw.line(x - dy * a, y + dx * a, x + dx - dy * a, y + dy + dx * a);
      break;
    }
    case 103: {
      const a = 0.2;
      draw.line(x + dy * a, y - dx * a, x + dx + dy * a, y + dy - dx * a);
      draw.line(x, y, x + dx, y + dy);
      draw.line(x - dy * a, y + dx * a, x + dx - dy * a, y + dy + dx * a);
      break;
    }
    case 113: {
      const a = 0.3;
      draw.line(x, y, x + dx + dy * a, y + dy - dx * a);
      draw.line(x, y, x + dx, y + dy);
      draw.line(x, y, x + dx - dy * a, y + dy + dx * a);
      break;
    }
    case 123: {
      const a = 0.5;
      draw.line(x + dy * a, y - dx * a, x + dx + dy * a, y + dy - dx * a);
      draw.line(x, y, x + dx, y + dy);
      draw.line(x - dy * a, y + dx * a, x + dx - dy * a, y + dy + dx * a);
      break;
    }
    case 200: {
      ctx.strokeStyle = (data.id === thing.t) ? C.blue : C.red;
      ctx.fillStyle = C.transparent;
      ctx.lineWidth = 2;
      this.draw_thing_shape(thing, position, size * 0.9);
      ctx.fill();
      ctx.stroke();
      break;
    }
    // 300+: fast path
    case 301: {
      const a = 0.4;
      ctx.strokeStyle = C.bright_blue;
      draw.line(x + dx * a, y + dy * a, x + dx, y + dy);
      break;
    }
    case 302: {
      const a = 0.3;
      const b = 0.7;
      ctx.strokeStyle = C.bright_blue;
      draw.line(x, y, x + dx * a, y + dy * a);
      draw.line(x + dx * b, y + dy * b, x + dx, y + dy);
      break;
    }
    // 400+: trap path
    case 401: {
      const a = 0.8;
      const b = 0.58;
      draw.line(x, y, x + dx, y + dy);
      draw.line(x + dx * a + dy * b, y + dy * a - dx * b, x + dx * a - dy * b, y + dy * a + dx * b);
      ctx.stroke();
      break;
    }
    case 402: {
      const a = 0.6;
      const b = 0.8;
      draw.line(x, y, x + dx, y + dy);
      draw.line(x + dx * a + dy * b, y + dy * a - dx * b, x + dx * a - dy * b, y + dy * a + dx * b);
      ctx.stroke();
      break;
    }
    case 403: {
      const a = 0.6;
      const b = 0.8;
      draw.line(x, y, x + dx, y + dy);
      draw.line(x + dx * a + dy * b, y + dy * a - dx * b, x + dx * a - dy * b, y + dy * a + dx * b);
      ctx.stroke();
      break;
    }
    case 412: {
      const a = 0.6;
      const b = 0.8;
      draw.line(x, y, x + dx, y + dy);
      ctx.strokeStyle = C.violet;
      draw.line(x + dx * a + dy * b, y + dy * a - dx * b, x + dx * a - dy * b, y + dy * a + dx * b);
      break;
    }
    // 500+: large path
    case 501: {
      ctx.lineWidth = 5;
      draw.line(x, y, x + dx, y + dy);
      break;
    }
    case 511: {
      ctx.lineWidth = 5;
      draw.line(x, y, x + dx, y + dy);
      ctx.strokeStyle = C.violet;
      ctx.lineWidth = 2;
      draw.line(x, y, x + dx, y + dy);
      break;
    }
    case 602: {
      ctx.strokeStyle = C.yellowgreen;
      draw.line(x, y, x + dx, y + dy);
      break;
    }
    case 603: {
      ctx.strokeStyle = C.yellowgreen;
      draw.circle(x, y, r * 0.55);
      ctx.stroke();
      break;
    }
    case 211212: {
      ctx.strokeStyle = C.wall_ball;
      draw.circle(x, y, r * 0.55);
      ctx.stroke();
      break;
    }
    default: {
      // console.log("invalid thing 'deco': " + thing.deco);
      break;
    }
  }
};