//helper functions

export const range = (min, max, random) => Math.floor((random === undefined ? Math.random() : random )* (max - min)) + min;

export const generateKey = (function() {
  let i = 0;
  return () => i++;
})();
