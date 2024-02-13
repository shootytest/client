import { Camera, camera } from "./camera.js";
import { C, colors } from "./color.js";
import { add_key_listener, init_controls, update_controls } from "./controls.js";
import { data } from "./data.js";
import { draw } from "./draw.js";
import { init_ui, ui } from "./ui.js";

// change this to whatever the deno server is running on
const SERVER = "wss://shooty.deno.dev";

export const socket = io(SERVER, {
  // i think this prevents socket.io from falling back to long polling... which is what makes it laggy sometimes
  // ~~still don't know how to fix blank screen bug though...~~
  // update: it fixes itself after a while now, if it still doesn't load, reload the page
  transports: ['websocket'],
});

export const canvas = document.getElementById("canvas");
export const ctx = canvas.getContext("2d");
export const screen = {
  x: 0,
  y: 0,
  w: 0,
  h: 0,
  sloth: "amidst",
};
export let time = 0;

const init_canvas = () => {
  // default html canvas settings
  ctx.lineCap = "square";
  ctx.lineJoin = "miter";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  resize();
};

const resize = (event) => {
  const w = window.innerWidth;
  const h = window.innerHeight;
  screen.w = w;
  screen.h = h;
  canvas.width = w;
  canvas.height = h;
  canvas.style.width = w;
  canvas.style.height = h;
  camera.width = w;
  camera.height = h;
};

const main_draw = () => {
  // unused...
  // main draw is now in camera.js
  draw.clear(C.black);
  ctx.fillStyle = C.transparent;
  for (const thing of data.things) {
    ctx.strokeStyle = (data.id === thing.t) ? C.blue : C.red;
    ctx.lineWidth = 2;
    draw.circle(thing.x, thing.y, thing.r);
    ctx.fill();
    ctx.stroke();
  }
  for (const wall of data.walls) {
    ctx.strokeStyle = colors[wall.c];
    ctx.lineWidth = 2;
    draw.line(wall.x1, wall.y1, wall.x2, wall.y2);
    ctx.stroke();
  }
};

const tick = () => {
  time++;
  camera.tick();
  camera.draw();
  update_controls(socket);
}

const init = () => {
  init_canvas();
  init_controls();
  init_ui();
}

const main = (event) => {
  add_key_listener("KeyQ", () => {
    // debug key disabled for now
    // console.log(data.things);
  });
  add_key_listener("Enter", () => {
    // chat button
    if (!ui.player_dead) {
      ui.chat.typing = !ui.chat.typing;
      socket.emit("chat", ui.chat.message);
      ui.chat.message = "";
    }
  });
  add_key_listener("Escape", () => {
    // chat escape button
    ui.chat.typing = false;
    ui.chat.message = "";
  });
  // add socket listeners
  socket.on("game_data", (gamedata) => {
    // if (ui.time % 60 === 0) console.log("things", gamedata);
    data.things = gamedata;
    data.update_things();
    if (data.walls.length <= 0 || data.id < 0) {
      socket.emit("map_please");
    }
  });
  socket.on("question", (question) => {
    data.update_question(question);
  });
  socket.on("damage_numbers", (something) => {
    data.damage_numbers = something;
    data.update_damage_numbers();
  });
  socket.on("game_map", (gamemap) => {
    data.walls = gamemap;
  });
  socket.on("map_data", (mapdata) => {
    // console.log(mapdata);
    data.map = mapdata;
    data.update_map_data();
  });
  socket.on("players", (players) => {
    // console.log(players);
    data.players = players;
    data.update_players();
    setTimeout(() => data.update_players, 500);
  });
  socket.on("id", (id) => {
    // console.log(id);
    data.id = id;
  });
  init(); // see above
  setInterval(tick, 16);
}

window.addEventListener("load", main);
window.addEventListener("resize", resize);
// also: resize detector, scale the camera accordingly
const resizeObserver = new ResizeObserver(entries => {
  for (let entry of entries) {
    let width = 0;
    if (entry.contentBoxSize) {
      const contentBoxSize = Array.isArray(entry.contentBoxSize) ? entry.contentBoxSize[0] : entry.contentBoxSize;
      width = contentBoxSize.inlineSize;
    } else {
      width = entry.contentRect.width;
    }
    // update camera scale and stuff ((hopefully) fair game field of view regardless of screen size)
    let height = width / window.innerWidth * window.innerHeight;
    const sqrt_width_height = Math.sqrt(width * height);
    camera.scale = sqrt_width_height * Camera.settings.camera_scale;
  }
});
resizeObserver.observe(document.getElementById("canvas"));