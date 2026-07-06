const DAYS = Object.freeze(['mon', 'tue', 'wed', 'thu', 'fri']);
const normalizeDay = (s) => (typeof s === 'string' && s.toLowerCase().slice(0, 3)) || null;

/**
 * Takes the index of a day and gets it's name
 * @param {Number} i
 * @returns {String}
 */
module.exports.dayFromIndex = (i) => (Number.isInteger(i) && DAYS[i]) || null;

/**
 * Takes the name of a day and gets it's index
 * @param {String} s
 * @returns {Number}
 */
module.exports.indexFromDay = (s) => {
   const n = normalizeDay(s);
   if (!n) return null;
   const i = DAYS.indexOf(n);
   return i === -1 ? null : i;
};

/**
 * Takes the name of a day and determines if it's a valid one
 * @param {String} s
 * @returns {Boolean}
 */
module.exports.isValidDay = (s) => DAYS.includes(normalizeDay(s));
