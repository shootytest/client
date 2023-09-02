import { camera } from "./camera.js";
import { C, colors, random_NAME } from "./color.js";
import { add_keydown_listener, add_keyup_listener, check_keys, keys } from "./controls.js";
import { data, thing_flag } from "./data.js";
import { draw } from "./draw.js";
import { get_start_options, set_start_options } from "./localstorage.js";
import { ctx, screen, socket } from "./main.js";
import { questions } from "./questions.js";
import { pi, util } from "./util.js";

const Vector = Matter.Vector;

const upgrades = {
  basic: {
    deco: 101,
  },
  circle: {
    deco: 100,
  },
  double: {
    deco: 102,
  },
  triple: {
    deco: 103,
  },
  split3: {
    deco: 113,
  },
  fast: {
    deco: 301,
  },
  faster: {
    deco: 302,
  },
  large: {
    deco: 501,
  },
  launch: {
    deco: 511,
  },
  trap: {
    deco: 401,
  },
  trap_large: {
    deco: 403,
  },
  trap_fast: {
    deco: 401,
  },
  trap_tower: {
    deco: 412,
  },
  sniper: {
    deco: 602,
  },
};
for (const u of Object.values(upgrades)) {
  u.a = 0;
}
const upgrade_order = [/*"circle",*/ "faster", "split3", "triple", /*"double",*/ "basic", "sniper", "large", "launch", /*"trap_large",*/ "trap_fast", "trap_tower"];
const abilities = {};
const ability_order = ["reload_boost", "speed_boost", "tower_basic", "tower_place", "octopus", "jellyfish", "push", /*"heal",*/ "heal_bulk"];
for (const ab of ability_order) {
  const img = new Image();
  img.onerror = (event) => {
    img.src = "./abilities/empty.svg";
  };
  img.src = `./abilities/${ab}.svg`;
  abilities[ab] = {
    image: img,
  };
}

export const ui = {
  time: 0,
  old_click: false,
  new_click: false,
  old_rclick: false,
  new_rclick: false,
  name: "there is an error",
  helping: false,
  player_dead: true,
  typing_name: false,
  chat: {
    typing: false,
    message: "",
  },
  upgrade: {
    ok: true,
    selected: "basic",
    index: upgrade_order.findIndex((a) => a === "basic"),
    display_index: 0,
    update_index: () => {
      ui.upgrade.index = upgrade_order.findIndex((a) => a === ui.upgrade.selected);
    },
    spinrate: 0.1,
    this_is_selected: true,
    this_position: Vector.create(),
    this_target: Vector.create(),
  },
  ability: {
    selected: "speed_boost",
    index: ability_order.findIndex((a) => a === "speed_boost"),
    display_index: 0,
    update_index: () => {
      ui.ability.index = ability_order.findIndex((a) => a === ui.ability.selected);
    },
  },
  question: {
    active: false,
    correct: false,
    wait_time: 0,
    wait_time_config: 5 * 60,
    calc_y: 0,
    option_y: [],
    selected: [],
    just_selected: -1,
  },
  save_options: () => {
    set_start_options({
      name: ui.name,
      upgrade: ui.upgrade.selected,
      ability: ui.ability.selected,
    });
  },
}

const check_click = () => {
  return check_keys(["Mouse", "MouseLeft"]);
};

const tick_ui_before = () => {
  if (check_click()) {
    ui.new_click = !ui.old_click;
    ui.old_click = true;
  } else {
    ui.new_click = false;
    ui.old_click = false;
  }
  if (check_keys(["MouseRight"])) {
    ui.new_rclick = !ui.old_rclick;
    ui.old_rclick = true;
  } else {
    ui.new_rclick = false;
    ui.old_rclick = false;
  }
  ui.time++;
};

export const draw_ui_before = () => {
  tick_ui_before();
};

export const init_ui = () => {
  add_keydown_listener((event) => {
    if (event.ctrlKey || event.metaKey) return;
    // if ("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890_-+=`~!@#$%^&*(),./<>?;':\"[]\\{}|".includes(event.key))
    if (ui.player_dead) {
      if (ui.typing_name) {
        if (event.key != undefined && event.key.length <= 1) {
          ui.name += event.key;
          if (ui.name.length > 16) {
            ui.name = ui.name.substring(0, 16);
          }
        } else if (event.key === "Backspace" || event.key === "Delete") {
          ui.name = ui.name.substring(0, ui.name.length - 1);
        }
      } else {
      }
      if (ui.upgrade.this_is_selected) {
        if (ui.upgrade.index < upgrade_order.length - 1 && (event.code === "ArrowRight" || (event.code === "KeyD" && !ui.typing_name))) {
          ui.upgrade.index++;
          ui.upgrade.selected = upgrade_order[ui.upgrade.index];
        } else if (ui.upgrade.index > 0 && (event.code === "ArrowLeft" || (event.code === "KeyA" && !ui.typing_name))) {
          ui.upgrade.index--;
          ui.upgrade.selected = upgrade_order[ui.upgrade.index];
        } else if (event.code === "ArrowDown" || (event.code === "KeyS" && !ui.typing_name)) {
          ui.upgrade.this_is_selected = false;
        }
      }
      else {
        if (ui.ability.index < ability_order.length - 1 && (event.code === "ArrowRight" || (event.code === "KeyD" && !ui.typing_name))) {
          ui.ability.index++;
          ui.ability.selected = ability_order[ui.ability.index];
        } else if (ui.ability.index > 0 && (event.code === "ArrowLeft" || (event.code === "KeyA" && !ui.typing_name))) {
          ui.ability.index--;
          ui.ability.selected = ability_order[ui.ability.index];
        } else if (event.code === "ArrowUp" || (event.code === "KeyW" && !ui.typing_name)) {
          ui.upgrade.this_is_selected = true;
        }
      }
    }
    else {
      if (ui.chat.typing) {
        if (event.key != undefined && event.key.length <= 1) {
          ui.chat.message += event.key;
          if (ui.chat.message.length > 30) {
            ui.chat.message = ui.chat.message.substring(0, 30);
          }
        } else if (event.key === "Backspace" || event.key === "Delete") {
          ui.chat.message = ui.chat.message.substring(0, ui.chat.message.length - 1);
        }
      }
    }
  });
  const o = get_start_options();
  ui.name = o.name;
  ui.upgrade.selected = o.upgrade;
  ui.upgrade.update_index();
  ui.ability.selected = o.ability;
  ui.ability.update_index();
  ui.upgrade.this_position = Vector.create(screen.w / 2, 0);
  ui.upgrade.this_target = Vector.create(screen.w / 2, screen.h / 2 - 60 * camera.scale);
};

const tick_ui = () => {
  ui.upgrade.display_index = util.lerp(ui.upgrade.display_index, ui.upgrade.index, 0.05);
  ui.ability.display_index = util.lerp(ui.ability.display_index, ui.ability.index, 0.05);
};

export const draw_ui = () => {

  tick_ui();

  let x, y, w, h, r, i;
  let hover, click;
  const size = 30 * camera.scale;

  // check if the player is invisible
  if (data.player == null || data.player.f & thing_flag.invisible) {

    if (!ui.player_dead) {
      // if player was alive last loop then reset controls and stuff
      keys["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "KeyW", "KeyA", "KeyS", "KeyD"] = false;
      ui.question.active = false;
      ui.question.correct = false;
      ui.question.wait_time = 0;
    }
    ui.player_dead = true;
    // player is dead, draw pre-join stuff
    draw.clear(C.black + "bb");
    const middle_y = screen.h / 2;
    // draw name
    ctx.font = `bold ${Math.round(size * 0.9)}px roboto mono`;
    x = screen.w / 2;
    y = (middle_y - size * 2) / 2;
    w = draw.get_text_width(ui.name) + size * 2;
    h = size * 1.5;
    hover = camera.mouse_in_rectangle(x, y, w + size * 0.5, h + size * 0.5);
    ctx.lineWidth = 2;
    ctx.strokeStyle = hover ? C.green : C.white;
    ctx.fillStyle = C.background;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    draw.stroke_rectangle(x, y, w, h);
    draw.fill_rectangle(x, y, w, h);
    ctx.fillStyle = ui.typing_name ? C.yellow : C.white;
    draw.fill_text(ui.name, x, y);
    if (ui.new_click) {
      ui.typing_name = hover;
    }
    if (ui.typing_name) {
      x += w / 2 - size;
      ctx.strokeStyle = util.color_alpha(C.yellow, Math.sqrt(util.bounce(ui.time, 50)));
      draw.line(x, y - size * 0.5, x, y + size * 0.4);
      x -= w / 2 - size;
    }
    x += w / 2 + size * 2;
    r = size * 0.75;
    hover = camera.mouse_in_circle(x, y, r);
    ctx.strokeStyle = hover ? C.green : C.white;
    draw.circle(x, y, r);
    ctx.stroke();
    const dicepath = new Path2D("M255.76 44.764c-6.176 0-12.353 1.384-17.137 4.152L85.87 137.276c-9.57 5.536-9.57 14.29 0 19.826l152.753 88.36c9.57 5.536 24.703 5.536 34.272 0l152.753-88.36c9.57-5.535 9.57-14.29 0-19.825l-152.753-88.36c-4.785-2.77-10.96-4.153-17.135-4.153zm.926 82.855a31.953 18.96 0 0 1 22.127 32.362a31.953 18.96 0 1 1-45.188-26.812a31.953 18.96 0 0 1 23.06-5.55zM75.67 173.84c-5.753-.155-9.664 4.336-9.664 12.28v157.696c0 11.052 7.57 24.163 17.14 29.69l146.93 84.848c9.57 5.526 17.14 1.156 17.14-9.895V290.76c0-11.052-7.57-24.16-17.14-29.688l-146.93-84.847c-2.69-1.555-5.225-2.327-7.476-2.387zm360.773.002c-2.25.06-4.783.83-7.474 2.385l-146.935 84.847c-9.57 5.527-17.14 18.638-17.14 29.69v157.7c0 11.05 7.57 15.418 17.14 9.89L428.97 373.51c9.57-5.527 17.137-18.636 17.137-29.688v-157.7c0-7.942-3.91-12.432-9.664-12.278zM89.297 195.77a31.236 18.008 58.094 0 1 33.818 41.183a31.236 18.008 58.094 1 1-45-25.98a31.236 18.008 58.094 0 1 11.182-15.203zm221.52 64.664A18.008 31.236 31.906 0 1 322 275.637a18.008 31.236 31.906 0 1-45 25.98a18.008 31.236 31.906 0 1 33.818-41.183zM145.296 289.1a31.236 18.008 58.094 0 1 33.818 41.183a31.236 18.008 58.094 0 1-45-25.98a31.236 18.008 58.094 0 1 11.182-15.203zm277.523 29.38A18.008 31.236 31.906 0 1 434 333.684a18.008 31.236 31.906 0 1-45 25.98a18.008 31.236 31.906 0 1 33.818-41.184zm-221.52 64.663a31.236 18.008 58.094 0 1 33.817 41.183a31.236 18.008 58.094 1 1-45-25.98a31.236 18.008 58.094 0 1 11.182-15.203z");
    r *= 0.8;
    ctx.translate(x - r, y - r);
    ctx.scale(r / 256, r / 256);
    ctx.fillStyle = hover ? C.green : C.white;
    ctx.fill(dicepath);
    ctx.resetTransform();
    if (ui.new_click && hover)  {
      ui.name = random_NAME();
    }

    // then draw this
    ctx.fillStyle = C.gold + "40";
    draw.fill_rectangle(ui.upgrade.this_position.x, ui.upgrade.this_position.y, size * 4, size * 4);
    ui.upgrade.this_position = Vector.lerp(ui.upgrade.this_position, ui.upgrade.this_target, 0.3);

    // then draw upgrade options
    x = screen.w / 2 - ui.upgrade.display_index * size * 5;
    y = middle_y - size * 2;
    let i = 0;
    for (const key of upgrade_order) {
      const u = upgrades[key];
      const selected = ui.upgrade.selected === key;
      if (selected && ui.upgrade.this_is_selected) {
        ui.upgrade.this_target = Vector.create(x, y);
      }
      if (camera.mouse_on_screen) u.a = Math.atan2(camera.mouse.y - y, camera.mouse.x - x);
      else u.a += ui.upgrade.spinrate;
      hover = camera.mouse_in_rectangle(x, y, size * 3, size * 3);
      click = hover && ui.new_click;
      ctx.lineWidth = 2;
      ctx.strokeStyle = hover ? C.green : (selected ? colors[4] : colors[0]);
      ctx.fillStyle = hover ? C.black : C.background;
      draw.stroke_rectangle(x, y, size * 3, size * 3, 0);
      draw.fill_rectangle(x, y, size * 3, size * 3);
      camera.draw_thing({
        x, y,
        a: u.a,
        r: u.size || u.r || size,
        shape: u.shape || 0,
        deco: u.deco,
        c: u.color || u.c || 1,
        t: data.id,
      }, true);
      if (click) {
        ui.new_click = false;
        ui.upgrade.selected = key;
        ui.upgrade.update_index();
        ui.upgrade.this_is_selected = true;
      }
      i++;
      x += size * 5;
    }

    // and also ability options
    x = screen.w / 2 - ui.ability.display_index * size * 5;
    y += size * 4;
    i = 0;
    for (const key of ability_order) {
      const a = abilities[key];
      const selected = ui.ability.selected === key;
      if (selected && !ui.upgrade.this_is_selected) {
        ui.upgrade.this_target = Vector.create(x, y);
      }
      hover = camera.mouse_in_rectangle(x, y, size * 3, size * 3);
      click = hover && ui.new_click;
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = hover ? C.green : (selected ? colors[4] : colors[0]);
      ctx.fillStyle = hover ? C.black : C.background;
      draw.circle(x, y, size * 1.6);
      ctx.stroke();
      ctx.fill();
      //draw.stroke_rectangle(x, y, size * 3, size * 3);
      //draw.fill_rectangle(x, y, size * 3, size * 3);
      ctx.drawImage(a.image, x - size, y - size, size * 2, size * 2);
      if (click) {
        ui.new_click = false;
        ui.ability.selected = key;
        ui.ability.update_index();
        ui.upgrade.this_is_selected = false;
      }
      i++;
      x += size * 5;
    }

    // yellow arrows pointing to current selection
    x = screen.w / 2;
    y -= size * 7;
    ctx.strokeStyle = C.yellow;
    draw.regular_polygon(3, size * 0.5, x, y, pi / 2);
    ctx.stroke();
    x = screen.w / 2;
    y += size * 10;
    ctx.strokeStyle = C.yellow;
    draw.regular_polygon(3, size * 0.5, x, y, -pi / 2);
    ctx.stroke();

    // and the play button at the bottom
    y = (y + size * 1.5 + screen.h) / 2;
    hover = camera.mouse_in_circle(x, y, size * 1.5);
    click = hover && ui.new_click;
    ctx.fillStyle = hover ? C.green_dark + "44" : C.background;
    ctx.strokeStyle = C.green;
    draw.circle(x, y, size * 1.5);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = C.green;
    draw.regular_polygon(3, size * 0.9, x, y);
    ctx.stroke();
    if ((click || check_keys("Enter")) && ui.upgrade.ok) {
      ui.new_click = false;
      ui.upgrade.ok = false;
      ui.name = ui.name.trim();
      ui.chat.typing = false;
      ui.chat.message = "";
      ui.save_options();
      socket.emit("join", { upgrade: ui.upgrade.selected, ability: ui.ability.selected, name: (ui.name.length <= 0 ? "blank" : ui.name), });
      window.onbeforeunload = () => true;
    } else {
      window.onbeforeunload = null;
    }

    // and the help button at the top
    r = size * 1;
    x = r * 2;
    y = r * 2;
    hover = camera.mouse_in_circle(x, y, r);
    click = hover && ui.new_click;
    ctx.fillStyle = hover ? C.wall_purple + "44" : C.background;
    ctx.strokeStyle = chroma.mix(C.purple, C.red, util.bounce(ui.time, 30));
    draw.circle(x, y, r);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = ctx.strokeStyle;
    ctx.font = `bold ${Math.round(size)}px roboto mono`;
    draw.fill_text("?", x, y + 1);
    ctx.textAlign = "left";
    ctx.font = `${Math.round(size * 0.8)}px roboto mono`;
    draw.fill_text("help", x + r * 1.8, y + 1);
    if (click) {
      ui.new_click = false;
      ui.helping = true;
      window.open("./help/", "_blank");
    }

    // and the help dialog box
    if (ui.helping) {
      ctx.fillStyle = C.pink + "40";
      
    }

  } else {

    ui.player_dead = false;
    ui.upgrade.ok = true;
    // player is not dead, draw question (if applicable)
    if (ui.question.active) {
      if (ui.question.wait_time >= 0) {
        ui.question.wait_time -= 1;
      }
      x = screen.w / 2;
      const q = questions[data.question_id];
      ctx.textAlign = "center";
      ctx.fillStyle = C.darkgrey + "80";
      draw.fill_rectangle(x, 0, x, ui.question.calc_y * 2);
      ctx.font = `${Math.round(size * 0.7)}px roboto mono`;
      ctx.fillStyle = C.white;
      y = size * 1.2;
      for (const s of draw.split_text(q.question, x * 0.95)) {
        draw.fill_text(s, x, y);
        y += size * 0.9;
      }
      y += size * 0.3;
      ctx.strokeStyle = C.white + "80";
      draw.line(x * 0.5, y, x * 1.5, y);
      y += size * 0.3;
      y += size * 0.9;
      for (let i = 0; i < q.options.length; i++) {
        let y_start = y - size * 0.7;
        const digit_pressed = keys["Digit" + (i + 1)];
        h = ui.question.option_y[i];
        if (ui.question.selected.includes(i)) {
          ctx.fillStyle = (q.answer === i ? C.green : C.red) + "80";
          r = ui.question.just_selected === i ? (1 - ui.question.wait_time / ui.question.wait_time_config) : 1;
          draw.fill_rect(x * 0.525, y_start, x * 0.95 * r, h * 0.9);
        }
        for (const s of draw.split_text(`${i + 1}. ${q.options[i]}`, x * 0.9)) {
          ctx.fillStyle = C.white;
          draw.fill_text(s, x, y);
          y += size * 0.9;
        }
        h = y - y_start;
        ui.question.option_y[i] = h;
        if (ui.question.wait_time <= 0 &&
            (camera.mouse_in_rectangle(x, (y + y_start) / 2 - size * 0.1, x * 0.95, h) || digit_pressed)) {
          draw.stroke_rectangle(x, (y + y_start) / 2 - size * 0.1, x * 0.95, h);
          if ((ui.new_click || digit_pressed) && !ui.question.selected.includes(i)) {
            // select option i
            ui.question.just_selected = i;
            ui.question.selected.push(i);
            if (q.answer === i) {
              ui.question.active = false;
              ui.question.correct = true;
              socket.emit("question", data.id); // tell the server that the question is solved
            } else {
              ui.question.wait_time = ui.question.wait_time_config;
            }
          }
        }
        y += size * 0.7;
      }
      ui.question.calc_y = y;
    }
    else {
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `${Math.round(size * 0.5)}px roboto mono`;
      ctx.fillStyle = C.white;
      draw.fill_text(`Next question in`, screen.w / 2, size);
      draw.fill_text(`seconds`, screen.w / 2, size * 3);
      ctx.font = `bold ${Math.round(size)}px roboto mono`;
      draw.fill_text(`${util.round_to(120 - data.question_time / 60, 0.01).toPrecision(3)}`, screen.w / 2, size * 2.08);
    }

  }

};

export const draw_ui_view = () => {

  let x, y, w, h, r, i;
  let hover, click;
  const size = 30 * camera.scale;

  x = screen.w / 2;
  y = screen.h / 2;
  r = camera.sqrt_width_height;
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r / 2, 0, 2 * Math.PI);
  ctx.arc(x, y, r * 10, 0, 2 * Math.PI);
  ctx.clip("evenodd");
  if ("view") {
    draw.clear(C.background);
    x = screen.w - size * 4;
    y = screen.h - size * 1.4;
    // bottom right: draw points (with green bar for some reason)
    if (data.player) {
      ctx.lineWidth = 3;
      ctx.strokeStyle = C.white;
      ctx.fillStyle = C.grey;
      draw.fill_rectangle(x, y, size * 6, size * 0.8);
      draw.stroke_rectangle(x, y, size * 6 + 3, size * 0.8 + 3);
      ctx.fillStyle = C.green_health;
      draw.fill_rectangle(x, y, size * 6, size * 0.8);
      ctx.fillStyle = C.black;
      ctx.font = `bold ${Math.round(size * 0.5)}px roboto mono`;
      draw.fill_text(`${data.player_points}`, x, y);
    }
    // top right: draw minimap
    for (const wall of data.walls) {
      camera.draw_wall_minimap(wall);
    }
    for (const thing of data.things) {
      if (thing.t === data.id) {
        // draw blue dots on the minimap
        ctx.fillStyle = C.blue;
        const position = camera.minimap_position(Vector.clone(thing));
        draw.circle(position.x, position.y, thing.r * camera.minimap_scale);
        ctx.fill();
      } else if (thing.deco === 211212) {
        ctx.fillStyle = C.wall_ball;
        const position = camera.minimap_position(Vector.clone(thing));
        draw.circle(position.x, position.y, thing.r * camera.minimap_scale);
        ctx.fill();
      }
    }
    // bottom left: TODO: new chat location
    x = size * 1.5;
    y = screen.h - size * 1.5;
    ctx.font = `${Math.round(size * 0.5)}px roboto mono`;
    ctx.textAlign = "left";
    for (const message of data.chats) {
      const name = message.name;
      const s = message.string;
      ctx.globalAlpha = Math.pow(message.time / (60 * 5), 0.5);
      ctx.fillStyle = message.me ? C.blue : C.red;
      draw.fill_text(`${name}: ${s}`, x, y);
      y -= size * 0.7;
    }
    ctx.globalAlpha = 1;
    // top left: leaderboard
    x = size * 1.5;
    y = size * 1.5;
    let rank = 1;
    ctx.font = `${Math.round(size * 0.6)}px roboto mono`;
    ctx.textAlign = "left";
    for (const entry of data.leaderboard) {
      const name = entry.name;
      const points = entry.points;
      ctx.fillStyle = entry.me ? C.green : C.white;
      draw.fill_text(`${rank}. ${name}: ${points}`, x, y);
      rank++;
      y += size;
    }
  }
  ctx.restore();

}