import { random_NAME } from "./color.js";

const START_OPTIONS_KEY = "name";
const USERNAME_KEY = "user";

export const get_start_options = () => {
  return JSON.parse(localStorage.getItem(START_OPTIONS_KEY)) || {
    name: random_NAME(),
    upgrade: "basic",
    ability: "speed_boost",
  };
};

export const set_start_options = (options) => {
  return localStorage.setItem(START_OPTIONS_KEY, JSON.stringify(options));
};

export const get_account_username = () => {
  return localStorage.getItem(USERNAME_KEY);
};

export const set_account_username = (username) => {
  return localStorage.setItem(USERNAME_KEY, username);
};