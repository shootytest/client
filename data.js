import { camera } from "./camera.js";
import { C } from "./color.js";
import { screen } from "./main.js";
import { questions } from "./questions.js";
import { ui } from "./ui.js";
import { util } from "./util.js";

const Vector = Matter.Vector;

export const data = {
  things: [],
  walls: [],
  map: {},
  id: -1,
  player: null,
  player_position: Vector.create(),
  player_points: 0,
  players: [],
  player_ids: {},
  damage_numbers: [],
  damage_particles: [],
  leaderboard: [],
  chats: [],
  question_id: 0,
  question_time: -1,
};

/** data format (defined in server)
 * 
 * THING KEYS
 * x: x position
 * y: y position
 * a: angle
 * r: size
 * shape: shape
 * hp: health value
 * hc: health capacity
 * ab: ability value
 * ac: ability capacity
 * fov: field of view
 * c: color
 * t: team
 * f: flag(s) (some bits)
 * 
 * WALL KEYS
 * x1, y1, x2, y2
 * c: color
 * f: flag(s) (some bits)
 * 
 * PLAYER KEYS
 * chat: chat data per person
 * pt: (whole) number of points
 * die: death status boolean
 * 
 * QUESTION KEYS
 * t: time (in ticks) since last question
 * r: random float from 0 to 1
 * 
 */

export const thing_flag = {
  player: 0x0001,
  show_health: 0x0002,
  invisible: 0x0004,
  invincible: 0x0008,
  show_time_left: 0x0010,
};

data.check_thing_flag = (thing, flag) => {
  return (thing.f & thing_flag[flag]) > 0;
};

data.update_things = () => {
  data.leaderboard = [];
  data.chats = [];
  for (const thing of data.things) {
    // set player position
    if (thing.t === data.id && (thing.f & thing_flag.player)) {
      data.player = thing;
      data.player_position.x = thing.x;
      data.player_position.y = thing.y;
      data.player_points = thing.pt;
    }
    // get players
    if ((thing.f & thing_flag.player) && data.player_ids[thing.id] != undefined && /*(thing.t === data.id || thing.pt > 0) &&*/ (!thing.die)) {
      data.leaderboard.push({
        name: data.player_ids[thing.id].name,
        points: thing.pt,
        me: (thing.t === data.id),
      });
      for (let i = 0; i < thing.chat.length; i++) {
        const m = thing.chat[i];
        const t = thing.ttl[i];
        if (m.length <= 0) continue;
        data.chats.push({
          name: data.player_ids[thing.id].name,
          string: m,
          time: t,
          me: (thing.t === data.id),
        });
      }
    }
  }
  data.leaderboard.sort((a, b) => b.points - a.points);
  data.chats.sort((a, b) => b.time - a.time);
};

data.update_players = () => {
  data.player_ids = {};
  for (const player of data.players) {
    data.player_ids[player.id] = player;
  }
  console.log(data.player_ids);
};

data.update_damage_numbers = () => {
  for (const d of data.damage_numbers) {
    const damage_ratio_1 = util.bound(Math.abs(d.d) / 50, 0, 1);
    const damage_ratio_2 = util.bound(Math.abs(d.d) / 25, 0, 1);
    data.damage_particles.push({
      position: Vector.create(d.x, d.y),
      velocity: Vector.create(util.rand(-1, 1), util.rand(-50, -60)),
      acceleration: Vector.create(0, 10),
      damage: d.d,
      size: 9 + damage_ratio_1 * 12,
      color: d.d <= 0 ? C.green_health : chroma.mix(C.orange, C.red, damage_ratio_2),
      time: ui.time + 120,
    });
  }
};

data.remove_damage_particle = (particle) => {
  const index = data.damage_particles.indexOf(particle);
  if (index > -1) {
    data.damage_particles.splice(index, 1);
  }
};

let updated_map_data = false;
data.update_map_data = () => {
  if (updated_map_data) return;
  updated_map_data = true;
  const update_resize_thingy = (event) => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const m = data.map;
    const size = 30 * camera.scale;
    camera.minimap_radius = Math.min(Math.min(width, height) * 2 - size * 2, Math.max(
      Math.max(width, height) - Math.sqrt(width * height) - size * 2,
      0.29289321881345254 * Math.min(width, height)
    )) / 4;
    camera.minimap_scale = camera.minimap_radius / (m.width);
    // console.log(camera.minimap_radius, camera.minimap_scale);
    camera.minimap_location = Vector.create(screen.w - camera.minimap_radius - size * 0.5, camera.minimap_radius + size * 0.5);
  };
  window.addEventListener("resize", update_resize_thingy);
  update_resize_thingy();
};

data.update_question = (question) => {
  data.question_time = question.t;
  if (ui.player_dead) return;
  if (question.r != undefined) {
    data.question_id = Math.floor(1 + question.r * (questions.length - 1));
    ui.question.active = true;
    ui.question.correct = false;
    ui.question.wait_time = 0;
    ui.question.selected = [];
    ui.question.option_y = [];
    for (let i = 0; i < questions[data.question_id].options.length; i++) {
      ui.question.option_y.push(0);
    }
  }
};