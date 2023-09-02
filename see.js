// yuan
import { camera } from "./camera.js";
import { collide } from "./collide.js";
import { data, thing_flag } from "./data.js";
import { draw } from "./draw.js";
import { screen, ctx, time } from "./main.js";
import { util } from "./util.js";

const Query = Matter.Query,
      Vector = Matter.Vector;

const BIG_NUMBER = 1234567890;

export const clip_visibility_polygon = () => {
  
  const w = screen.w;
  const h = screen.h;
  const radius = Math.sqrt(w * w + h * h) * 1.5; // multiplied by 1.5, just in case

  let player_visited = false;

  for (const thing of [...data.things, data.player]) {

    if (thing == null || (thing.deco !== 211212 && thing.t !== data.id)) continue;

    const is_player = (thing.f & thing_flag.player) > 0;
    if (is_player) {
      if (!player_visited) {
        player_visited = true;
        continue;
      }
    }
    
    ctx.save();

    const start = { x: thing.x, y: thing.y };
    const radius = thing.r * (thing.fov || 10);
    const display_radius = radius * camera.scale;

    // get points from all things

    const points = [ ];
    const bodies = [ ];
    const end_points = [ ];
    const walls = [ ];

    const add_wall = (wall, force = false) => {
      if (!(wall.f & 1)) {
        // it's a window
        walls.push(wall);
        return;
      }
      const p1 = { x: wall.x1, y: wall.y1 };
      const p2 = { x: wall.x2, y: wall.y2 };
      const segment = collide.make_segment(start, p1, p2);
      let points_on_screen = 0;
      if (collide.segment_circle(p1, p2, start, radius)) {
        points.push(p1, p2);
        points_on_screen += 2;
      }
      /*
      for (const point of [p1, p2]) {
        const draw_point = camera.object_position(point);
        if (draw_point.x < 0 || draw_point.x > w) continue;
        if (draw_point.y < 0 || draw_point.y > h) continue;
        points_on_screen++;
        points.push(point);
      }
      */
      if (points_on_screen <= 0 && !force && !(wall.f & 2)) return;
      end_points.push(...collide.get_endpoints_from_segments([segment]));
      if (!force) {
        walls.push(wall);
      }
    }

    for (const wall of data.walls) {
      add_wall(wall);
    }

    add_wall({ x1: -BIG_NUMBER, y1: -BIG_NUMBER, x2: -BIG_NUMBER, y2: BIG_NUMBER }, true);
    add_wall({ x1: BIG_NUMBER, y1: -BIG_NUMBER, x2: BIG_NUMBER, y2: BIG_NUMBER }, true);
    add_wall({ x1: -BIG_NUMBER, y1: -BIG_NUMBER, x2: BIG_NUMBER, y2: -BIG_NUMBER }, true);
    add_wall({ x1: -BIG_NUMBER, y1: BIG_NUMBER, x2: BIG_NUMBER, y2: BIG_NUMBER }, true);
    /*
    add_wall({ x1: -radius + start.x, y1: -radius + start.y, x2: -radius + start.x, y2: radius + start.y }, true);
    add_wall({ x1: radius + start.x, y1: -radius + start.y, x2: radius + start.x, y2: radius + start.y }, true);
    add_wall({ x1: -radius + start.x, y1: -radius + start.y, x2: radius + start.x, y2: -radius + start.y }, true);
    add_wall({ x1: -radius + start.x, y1: radius + start.y, x2: radius + start.x, y2: radius + start.y }, true);
    */

    // the real thing is in collide
    const result = collide.calculate_visibility(start, end_points);

    /*
    const s = camera.object_position(start);
    //ctx.fillStyle = "#ff000055";
    //ctx.strokeStyle = "#00000000";
    visibility_path.moveTo(s.x, s.y);
    for (const triangle of result) {
      const e1 = camera.object_position(triangle[0]);
      const e2 = camera.object_position(triangle[1]);
      visibility_path.lineTo(e1.x, e1.y);
      visibility_path.lineTo(e2.x, e2.y);
      visibility_path.lineTo(s.x, s.y);
    }
    visibility_path.moveTo(s.x, s.y);
    visibility_path.arc(s.x, s.y, radius, 0, 2 * Math.PI);
    ctx.clip(visibility_path);
    */

    const s = camera.object_position(start);
    //ctx.fillStyle = "#ff000055";
    //ctx.strokeStyle = "#00000000";
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    for (const triangle of result) {
      const e1 = camera.object_position(triangle[0]);
      const e2 = camera.object_position(triangle[1]);
      ctx.lineTo(e1.x, e1.y);
      ctx.lineTo(e2.x, e2.y);
      ctx.lineTo(s.x, s.y);
    }
    ctx.clip();
    //ctx.stroke();
    //ctx.fill();

    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.arc(s.x, s.y, display_radius, 0, 2 * Math.PI);
    ctx.clip();

    draw_lighting(s, display_radius, is_player, thing.deco === 211212);
    camera.draw_things(start, radius);
    camera.draw_walls(walls);

    /*
    for (const t of data.things) {
      const s = camera.object_position({ x: t.x, y: t.y });
      if (t.team !== data.id) continue;
      circles_path.moveTo(s.x, s.y);
      circles_path.arc(s.x, s.y, t.size * 10, 0, 2 * Math.PI);
    }
    ctx.clip(circles_path);
    */

    ctx.restore();

  }

}

// call this function after clipping
export const draw_lighting = (centre, display_radius, is_player, is_ball) => {
 
  const x = centre.x;
  const y = centre.y;

  const w = screen.w;
  const h = screen.h;
  const min_radius = display_radius / 10;
  const max_radius = display_radius;
  
  if (is_player) {
    const gradient = ctx.createRadialGradient(x, y, min_radius, x, y, max_radius);
    gradient.addColorStop(0, "#555511");
    gradient.addColorStop(0.3 - util.bounce(time, 30) * 0.02, "#333311");
    gradient.addColorStop(0.7, "#222211");
    gradient.addColorStop(1, "#222211");
    ctx.fillStyle = gradient;
  } else {
    ctx.fillStyle = is_ball ? "#191911" : "#222211";
  }

  draw.circle(x, y, max_radius);
  ctx.fill();
  
  /*
  ctx.fillStyle = "#ffff0002";
  for (let i = 30; i < max_radius; i += 50) {
    let r = i;
    draw.circle(ctx, centre.x, centre.y, r);
    ctx.fill();
  }
  */

}