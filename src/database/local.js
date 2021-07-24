const db = require("quick.db");

module.exports = name => {
  const table = new db.table(name);
  return {
    get: (key) => table.get(key),
    raw: () => table.all(),
    set: (key, value) => table.set(key, value),
    push: (key, value) => table.push(key, value),
    unset: (key) => table.delete(key),
    unsetAll: () => table.all().forEach(({ ID }) => table.delete(ID))
  };
};