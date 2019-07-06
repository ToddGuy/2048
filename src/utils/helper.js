//helper functions
export const rng = (min, max, random) => Math.floor((random === undefined ? Math.random() : random )* (max - min)) + min;

export const range = (start, end) => [...Array(end - start).keys()].map((_, i) => i + start);

export const generateKey = (function() {
  let i = 0;
  return () => i++;
})();


