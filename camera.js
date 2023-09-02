import { collide } from "./collide.js";
import { C, colors } from "./color.js";
import { data, thing_flag } from "./data.js";
import { draw_decoration } from "./decoration.js";
import { draw } from "./draw.js";
import { ctx, time } from "./main.js";
import { clip_visibility_polygon } from "./see.js";
import { draw_ui, draw_ui_before, draw_ui_view, ui } from "./ui.js";
import { util } from "./util.js";

const Vector = Matter.Vector;

export class Camera {

  static settings = {
    camera_scale: 0.0008,
    smoothness: 0.1,
    mouse_offset_factor: 0.05,
    mouse_offset_smoothness: 0.1,
  }
  
  position = Vector.create();
  width = window.innerWidth;
  height = window.innerHeight;
  mouse = Vector.create();
  mouse_offset = Vector.create();
  scale = 1;
  minimap_location = Vector.create();
  minimap_radius = 0;
  minimap_scale = 0;
  mouse_on_screen = false;

  constructor() {

  }

  get location() {
    return Vector.add(Vector.sub(this.position, this.halfscreen), this.mouse_offset);
  }

  get x() {
    return this.position.x;
  }

  get y() {
    return this.position.y;
  }

  get halfscreen() {
    return Vector.create(this.width / 2, this.height / 2);
  }

  get mouse_position() {
    return this.camera_position(this.mouse);
  }

  get mouse_offset_target() {
    return Vector.mult(Vector.sub(this.mouse, this.halfscreen), Camera.settings.mouse_offset_factor);
  }

  get sqrt_width_height() {
    return this.scale / Camera.settings.camera_scale;
  }

  object_position(v) { // object to screen
    return Vector.sub(Vector.mult(v, this.scale), this.location);
  }

  camera_position(v) { // screen to object
    return Vector.mult(Vector.add(v, this.location), 1 / this.scale);
  }

  minimap_position(v) { // object to minimap
    return Vector.add(Vector.mult(v, this.minimap_scale), this.minimap_location);
  }

  tick() {
    this.move_to_player();
    this.mouse_on_screen = document.body.matches(":hover");
  }
  
  draw_thing_shape(thing, position, size) {
    if (thing.shape === 0) {
      draw.circle(position.x, position.y, size);
    } else if (thing.shape === 1) {
      const dx = Math.sin(thing.a) * size;
      const dy = Math.cos(thing.a) * size;
      draw.line(position.x + dx, position.y - dy, position.x - dx, position.y + dy);
    } else if (thing.shape === 2) {
      draw.draw_rectangle_angle(position.x, position.y, size * 0.2, size * 2, thing.a);
    } else if (thing.shape >= 3) {
      draw.regular_polygon(thing.shape, size, position.x, position.y, thing.a);
    }
  }

  draw_thing(thing, fake = null) {
    // if invisible, don't draw it
    if (thing.f & thing_flag.invisible) return;
    const invincible = thing.f & thing_flag.invincible;
    const size = fake ? thing.r : thing.r * camera.scale;
    // draw the thing itself
    const position = fake ? { x: thing.x, y: thing.y } : camera.object_position({ x: thing.x, y: thing.y });
    ctx.strokeStyle = thing.c <= 1 ? ((data.id === thing.t) ? C.blue : C.red) : colors[thing.c];
    ctx.fillStyle = C.transparent;
    ctx.lineWidth = 2;
    this.draw_thing_shape(thing, position, size);
    ctx.fill();
    ctx.stroke();
    // draw decoration
    if (thing.c === 6) console.log(thing);
    draw_decoration(thing, position, size);
    // draw health bars
    let y = position.y + size;
    if ((thing.f & thing_flag.show_health)) {
      const health_ratio = (thing.hp / thing.hc);
      y += size * 0.3;
      ctx.save();
      ctx.lineCap = "round";
      ctx.lineWidth = size * 0.2;
      ctx.strokeStyle = C.grey;
      draw.line(position.x - size * 0.9, y, position.x + size * 0.9, y);
      ctx.strokeStyle = invincible ? chroma(C.green_bullet).brighten(util.bounce(time, 10) * 1.5) : C.green;
      draw.line(position.x - size * 0.9, y, position.x + size * (-0.9 + 1.8 * (health_ratio || 0)), y);
      ctx.restore();
    }
    // draw ability bars
    if ((thing.f & thing_flag.player) && thing.ab > 0 && thing.ab < thing.ac) {
      const ability_ratio = (thing.ab / thing.ac);
      y += size * 0.3;
      ctx.save();
      ctx.lineCap = "round";
      ctx.lineWidth = size * 0.2;
      ctx.strokeStyle = C.grey;
      draw.line(position.x - size * 0.9, y, position.x + size * 0.9, y);
      ctx.strokeStyle = invincible ? chroma(C.yellow_bullet).brighten(util.bounce(time, 10) * 1.5) : C.yellow;
      draw.line(position.x - size * 0.9, y, position.x + size * (-0.9 + 1.8 * (ability_ratio || 0)), y);
      ctx.restore();
    }
    // draw time left bars
    if ((thing.f & thing_flag.show_time_left) && thing.tl > 0) {
      y += size * 0.3;
      ctx.save();
      ctx.lineCap = "round";
      ctx.lineWidth = size * 0.2;
      ctx.strokeStyle = C.grey;
      draw.line(position.x - size * 0.9, y, position.x + size * 0.9, y);
      ctx.strokeStyle = C.neon_blue;
      draw.line(position.x - size * 0.9, y, position.x + size * (-0.9 + 1.8 * (thing.tl || 0)), y);
      ctx.restore();
    }
    // draw name
    if ((thing.f & thing_flag.player) && data.player_ids[thing.id] != undefined) {
      ctx.font = `${Math.round(size * 0.5)}px roboto mono`;
      y = position.y - size * 1.6;
      ctx.fillStyle = C.white;
      ctx.strokeStyle = C.white;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      draw.fill_text(data.player_ids[thing.id].name, position.x, y);
      if (ui.chat.typing && thing.id === data.player.id) {
        y -= size * 1;
        draw.stroke_rectangle(position.x, y, draw.get_text_width(ui.chat.message) + size * 1, size * 1);
        draw.fill_text(ui.chat.message, position.x, y);
      }
      if (thing.chat != undefined && thing.chat.length > 0) {
        // draw chat
        for (const message of thing.chat.toReversed()) {
          if (message.length <= 0) continue;
          y -= size * 1;
          ctx.fillStyle = C.white + "77";
          draw.fill_rectangle(position.x, y, draw.get_text_width(message) + size * 1, size * 1);
          ctx.fillStyle = C.white;
          draw.fill_text(message, position.x, y);
        }
      }
    }
    return;
  }

  draw_wall(wall) {
    const p1 = camera.object_position({ x: wall.x1, y: wall.y1 });
    const p2 = camera.object_position({ x: wall.x2, y: wall.y2 });
    ctx.strokeStyle = colors[wall.c];
    ctx.lineWidth = 2;
    draw.line(p1.x, p1.y, p2.x, p2.y);
    ctx.stroke();
  }

  draw_wall_minimap(wall) {
    const p1 = camera.minimap_position({ x: wall.x1, y: wall.y1 });
    const p2 = camera.minimap_position({ x: wall.x2, y: wall.y2 });
    // if (Math.random() < 0.01) console.log(p1, p2);
    ctx.strokeStyle = colors[wall.c];
    ctx.lineWidth = 2;
    draw.line(p1.x, p1.y, p2.x, p2.y);
    ctx.stroke();
  }

  draw_things(circle_point, radius) {
    for (const thing of data.things) {
      if (collide.circle_circle({ x: thing.x, y: thing.y }, circle_point, thing.r, radius)) {
        this.draw_thing(thing);
      }
    }
  }

  draw_walls(walls) {
    for (const wall of walls) {
      this.draw_wall(wall);
    }
  }

  draw_map(map) {

  }

  draw_damage_particle(particle) {
    // draw particle
    const size = particle.size * this.scale;
    const position = this.object_position(particle.position);
    const x = position.x;
    const y = position.y;
    ctx.fillStyle = particle.color;
    ctx.font = `${Math.round(size)}px roboto mono`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    draw.fill_text(Math.abs(particle.damage), x, y);
    // update particle
    particle.position = Vector.add(particle.position, Vector.mult(particle.velocity, 1 / 30));
    particle.velocity = Vector.add(particle.velocity, Vector.mult(particle.acceleration, 1 / 30));
    if (particle.time <= ui.time) {
      data.remove_damage_particle(particle);
    }
  }

  // actually the main draw function
  draw() {
    draw.clear("#111111");
    draw_ui_before();
    clip_visibility_polygon();
    // draw damage particles
    for (const particle of data.damage_particles) {
      this.draw_damage_particle(particle);
    }
    // draw fake walls
    ctx.globalAlpha = 0.05;
    this.draw_walls(data.walls);
    ctx.globalAlpha = 1;
    //draw_ui_middle(ctx);
    draw_ui_view();
    draw_ui();
  }

  move_to_player() {
    const smooth = Camera.settings.smoothness;
    this.position = Vector.add(Vector.mult(this.position, 1 - smooth), Vector.mult(data.player_position, smooth * this.scale));
    this.mouse_offset = Vector.lerp(this.mouse_offset, this.mouse_offset_target, Camera.settings.mouse_offset_smoothness);
  }

  jump_to_player() {
    this.position = Vector.mult(player.position, this.scale);
  }

  set_mouse(x, y) {
    this.mouse.x = x;
    this.mouse.y = y;
  }

  mouse_in_circle(x, y, r) {
    const mx = this.mouse.x, my = this.mouse.y;
    return (mx - x) * (mx - x) + (my - y) * (my - y) <= r * r;
  }

  mouse_in_rect(x, y, w, h) {
    const mx = this.mouse.x, my = this.mouse.y;
    return (mx >= x && my >= y && mx <= x + w && my <= y + h);
  }

  mouse_in_rectangle(x, y, w, h) {
    return camera.mouse_in_rect(x - w / 2, y - h / 2, w, h);
  }

  mouse_in_thing(t) {
    const mx = this.mouse_position.x, my = this.mouse_position.y;
    return t.query_point(mx, my).length > 0;
  }

}

export const camera = new Camera();