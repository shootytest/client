import { camera } from "./camera.js";
import { ui } from "./ui.js";

export const keys = {};
const key_listeners = {};
const keydown_listeners = [];
const keyup_listeners = [];
let key_changed = false;

const Vector = Matter.Vector;

export const update_controls = (socket) => {
  //if (!key_changed) return;
  key_changed = false;
  const typing = ui.chat.typing;
  const controls = {
    up: keys["ArrowUp"] === true || (keys["KeyW"] === true && !typing),
    down: keys["ArrowDown"] === true || (keys["KeyS"] === true && !typing),
    left: keys["ArrowLeft"] === true || (keys["KeyA"] === true && !typing),
    right: keys["ArrowRight"] === true || (keys["KeyD"] === true && !typing),
    shoot: keys["Mouse"] === true || (keys["Space"] === true && !typing),
    rshoot: keys["MouseRight"] === true || ((keys["ShiftLeft"] === true || keys["ShiftRight"] === true) && !typing),
    facingx: Math.floor(camera.mouse_position.x),
    facingy: Math.floor(camera.mouse_position.y),
    exit: (keys["KeyP"] === true && !typing),
  };
  if (ui.question.active) {
    controls.slow = true;
    controls.shoot = false;
    controls.rshoot = false;
    // controls.facingx = 0;
    // controls.facingy = 0;
  }
  socket.emit("controls", controls);
};

export const check_keys = function(key_array) {
  if (!Array.isArray(key_array)) {
    key_array = [key_array];
  }
  for (const key of key_array) {
    if (keys[key]) {
      return true;
    }
  }
  return false;
};

const update_mouse = (buttons) => {
  keys["Mouse"] = (buttons & 1) !== 0;
  keys["MouseLeft"] = (buttons & 1) !== 0;
  keys["MouseRight"] = (buttons & 2) !== 0;
  keys["MouseWheel"] = (buttons & 4) !== 0;
};

export const add_keydown_listener = function(f) {
  keydown_listeners.push(f);
};

export const add_keyup_listener = function(f) {
  keyup_listeners.push(f);
};

export const add_key_listener = function(key, f) {
  if (key_listeners[key] == null) key_listeners[key] = [];
  key_listeners[key].push(f);
};

export const remove_key_listeners = function(key) {
  key_listeners[key] = null;
};

export const init_controls = () => {

  window.addEventListener("keydown", function(event) {
    key_changed = true;
    if (["Tab"].includes(event.code)) {
      event.preventDefault();
    }
    const key = event.code;
    keys[key] = true;
    if (!event.repeat) {
      if (key_listeners[key] != null) {
        for (const f of key_listeners[key]) {
          f();
        }
      }
    }
    for (const f of keydown_listeners) {
      f(event);
    }
  });
  
  window.addEventListener("keypress", function(event) {
    key_changed = true;
    if (["Tab"].includes(event.code)) {
      event.preventDefault();
    }
    const key = event.code;
    keys[key] = true;
  });
  
  window.addEventListener("keyup", function(event) {
    key_changed = true;
    const key = event.code;
    keys[key] = false;
    for (const f of keyup_listeners) {
      f(event);
    }
  });
  
  window.addEventListener("focus", function(event) {
    key_changed = true;
    for (const key in keys) {
      keys[key] = false;
    }
  });

  window.addEventListener("mousemove", function(event) {
    key_changed = true;
    camera.set_mouse(event.clientX, event.clientY);
  });
  
  window.addEventListener("mousedown", function(event) {
    key_changed = true;
    event.preventDefault();
    update_mouse(event.buttons);
  });
  
  window.addEventListener("contextmenu", function(event) {
    key_changed = true;
    event.preventDefault();
    update_mouse(event.buttons);
  });
  
  window.addEventListener("mouseup", function(event) {
    key_changed = true;
    event.preventDefault();
    update_mouse(event.buttons);
  });

};