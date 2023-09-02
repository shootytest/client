export const util = {};

export const pi = Math.PI;

util.lerp = (a, b, t) => {
  return a * (1 - t) + b * t;
}

util.lerp_angle = (a1, a2, t) => {
  return a1 + (((((a2 - a1) % (pi * 2)) + pi * 3) % (pi * 2)) - pi) * t;
}

util.lerp_half_angle = (a1, a2, t) => {
  return lerp_mod(a1, a2, t, pi);
}

util.lerp_mod = (a1, a2, t, mod) => {
  return a1 + (((((a2 - a1) % mod) + mod * 3 / 2) % mod) - mod / 2) * t;
}

util.bounce = (time, period) => {
  return Math.abs(period - time % (period * 2)) / period;
}

util.vector_create = function(x, y) {
  return { x: x || 0, y: y || 0 };
};

util.random_sphere = () => {
  return Math.cbrt(Math.random());
}

util.get_color_component = (number_from_0_to_1) => {
  let result = ((number_from_0_to_1 * 255) | 0).toString(16);
  result = result.length == 1 ? "0" + result : result;
  return result;
}

util.color_alpha = (hex, alpha) => {
  return hex + util.get_color_component(alpha);
}

util.random_color = () => {
  return "#" + util.get_color_component(Math.random()) + util.get_color_component(Math.random()) + util.get_color_component(Math.random());
}

util.deg_to_rad = (deg) => {
  return deg / 180 * pi;
}

util.rad_to_deg = (rad) => {
  return rad / pi * 180;
}

util.round = function(value, decimals) {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

util.round_to = function(value, multiple) {
  return Number(Math.round(value / multiple) * multiple);
}

util.fix_precision = function(value) {
  return util.round(value, 10);
}

util.bound = function(n, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, n));
}

util.regpoly = function(sides, size, angle = 0, x = 0, y = 0) {
  const ans = [];
  let a = angle;
  size *= util.get_real_regpoly_size(sides);
  for (let i = 0; i < sides; ++i) {
    ans.push(util.vector_create(x + size * Math.cos(a), y + size * Math.sin(a)));
    a += Math.PI * 2 / sides;
  }
  return ans;
}

util.get_real_regpoly_size = function(sides) {
  return 1;
}

const regpolySizes = (() => {
  const o = [1, 1, 1]; 
  for (let sides = 3; sides < 16; sides++) {
    o.push(Math.sqrt((2 * Math.PI / sides) * (1 / Math.sin(2 * Math.PI / sides))));
  }
  return o;
})();

const Vector = Matter.Vector;

// just some extensions
Vector.createpolar = function(theta, r = 1) {
  return Vector.create(r * Math.cos(theta), r * Math.sin(theta));
}
Vector.lerp = function(v1, v2, smoothness) {
  return Vector.add(Vector.mult(v1, 1 - smoothness), Vector.mult(v2, smoothness));
}
Vector.lerp_angle = function(a1, a2, smoothness) {
  return Vector.angle(Vector.create(), Vector.add(Vector.createpolar(a1, 1 - smoothness), Vector.createpolar(a2, smoothness)));
}
Vector.deg_to_rad = function(degrees) {
  return degrees / 180 * Math.PI;
}
Vector.rad_to_deg = function(radians) {
  return radians * 180 / Math.PI;
}

util.rand = function(a = 1, b) {
  if (b != undefined) {
    return a + Math.random() * (b - a);
  } else {
    return Math.random() * a;
  }
};

util.randint = function(a, b) {
  return Math.floor(rand(a, b + 1));
};

util.randbool = function() {
  return Math.random() > 0.5;
};

util.randgauss = function(mean, deviation) {
  let x1, x2, w;
  do {
    x1 = 2 * Math.random() - 1;
    x2 = 2 * Math.random() - 1;
    w = x1 * x1 + x2 * x2;
  } while (0 === w || w >= 1);

  w = Math.sqrt(-2 * Math.log(w) / w);
  return mean + deviation * x1 * w;
};

util.randstring = (length = 10) => {
  const letters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += letters.charAt(
      Math.floor(Math.random() * letters.length),
    );
  }
  return result;
};

util.randpick = (array) => {
  return array[util.randint(0, array.length - 1)];
}