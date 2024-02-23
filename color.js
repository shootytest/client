export const C = {

  // shooty colours... not really used much in this

  pink: "#ff33c9",
  pink_bullet: "#fc77ea",
  
  red: "#ff4733",
  enemy_bullet: "#fc7777",
  red_health: "#bf0000",
  red_dark: "#990f00",

  orangered: "#ff7733",
  orangered_bullet: "#fca478",
  
  orange: "#ffaa33",
  orange_bullet: "#fcc578",
  wall_brown: "#603611",
  
  gold: "#ffcf33",
  yellow: "#fff133",
  yellow_bullet: "#fcfa77",
  wall_yellow: "#949911",

  lightning_yellow: "#f9ff42",

  yellowgreen: "#ddff33",

  green: "#96ff33",
  green_bullet: "#b7fc77",
  green_health: "#5dbf00",
  green_dark: "#4a9900",
  wall_green: "#166011",

  wall_teal: "#116037",
  wall_ball: "#08c98f",

  blue: "#4d7fff", //"#336dff",
  bright_blue: "#33a7ff",
  neon_blue: "#00ddff",
  sky_blue: "#b0efff",
  storm_blue: "#055063",
  wall_blue: "#116060",
  player_bullet: "#779dfc",

  lightning_blue: "#4249ff",

  purple: "#b833ff",
  purple_bullet: "#ce78fc",
  wall_purple: "#2f1160",

  violet: "#dd33ff",
  violet_bullet: "#ea78fc",
  wall_violet: "#4b1160",

  background: "#000000",
  camo: "#eeeeee11",

  white: "#eeeeee",
  lightgrey: "#c0c0c0",
  grey: "#888888",
  darkgrey: "#444444",
  black: "#111111",

  message_text: "#ff9999",
  message_text_red: "#ff9999",
  message_text_green: "#99ff9c",
  message_text_aqua: "#99ffce",
  message_text_gold: "#ffdd99",
  message_text_tutorial: "#c4a1ff",

  joystick_left: "#99ffce",
  joystick_right: "#ff9999",

  transparent: "#00000000",

};

export const colors = {
  [0]: C.white,
  [1]: C.blue,
  [2]: C.red,
  [3]: C.green,
  [4]: C.yellow,
  [5]: C.purple,
  [6]: C.yellowgreen,
  [11]: C.wall_yellow,
  [12]: C.wall_blue,
  [13]: C.wall_purple,
  [14]: C.wall_ball,
};

// really no idea why i put this here
const NAMES = [
  // synonyms
  "A", "amog", "amongst", "emonges", "amid", "amidst", "midst", "within", "within", "betwixt", "inbetwixt", "inbetween",
  // far-fetched
  "along", "alongst", "alongside", "mongoose", "mongrel", "agog", "smog", "fungus", "amoonguss", "mango", "mangoes",
  // ncl
  "by and large", "proof of concept",
  // vent
  "vent", "ventilation", "ventral", "event", "prevent", "solvent", "haven't", "adventure", "invent",
  // sus
  "unsustained", "sustainability", "misuse", "disused", "suspension", "consensus", "versus", "caucasus",
  // impostor
  "preposterous", "imp", "gnome", "poster", "eco", "smog",
  // colours
  "red", "blue", "green", "pink", "orange", "yellow", "black", "white", "purple", "brown", "cyan", "lime", "maroon", "rose", "banana", "gray", "tan", "coral", "fortegreen",
  // numbers
  "15", "17", "7th", "11th", "70",
  // usernames
  "alien", "balldan", "halogen", "hub", "oui", "ozy", "skill", "skull", "tsk",
  // lida
  "laid", "dial", "LIDAR", "holiday", "solidarity", "consolidate", "consolidation", "consolidationists", "alidade", "validation", "collidable", "solidate", "slidable", "solidago",
  // locations
  "security", "o2", "engine", "airship", "mira", "decontamination", "navigation",
  // mentioned in the game
  "shhhhhhh", "discuss", "crew", "enginner", "ghost", "report", "airship", "spaceship", "sabotage", "inner", "sloth", "hit", "space", "task", "vote", "the thing",
  // combination of letters
  "mongolia", "samoa", "guam", "oman", "gnu",
  // really really obscure references
  "klotski", "stacey", "bulbul", "surveys", "fix", "goldenrods", "phosphorus", "hidden agenda", "who goes there", "primus inter pares", "spirit of st. louis airport",
];

// NAME doesn't stand for anything right
export const random_NAME = () => {
  return NAMES[Math.floor(Math.random() * NAMES.length)];
};