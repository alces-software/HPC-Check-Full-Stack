const DAYS = Object.freeze(['mon', 'tue', 'wed', 'thu', 'fri']);

const dayFromIndex = (i) => (Number.isInteger(i) && DAYS[i]) || null;

const normalizeDay = (s) => (typeof s === 'string' && s.toLowerCase().slice(0, 3)) || null;

const indexFromDay = (s) => {
   const n = normalizeDay(s);
   if (!n) return null;
   const i = DAYS.indexOf(n);
   return i === -1 ? null : i;
};

const isValidDay = (s) => DAYS.includes(normalizeDay(s));

module.exports = { dayFromIndex, indexFromDay, isValidDay };
