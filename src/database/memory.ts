interface Database<Model> { [key: string]: Model; }
type AnyValue = string | number | Database<AnyValue> | Array<AnyValue> | boolean | null;

export function createMemoryDatabase<Model = AnyValue>() {
  let db: Database<Model> = {};
  return {
    get: key => key ? db[key] : db,
    set: (key, value) => { db[key] = value; return db; },
    delete: key => { delete db[key]; return db; },
    put: obj => { db = obj; return db; },
    reset: () => { db = {}; return db; },
  } as {
    get(): Database<Model>;
    get(key: string): Model;
    set(key: string, value: Model): Database<Model>;
    delete(key: string): Database<Model>;
    put(obj: Database<Model>): Database<Model>;
    reset(): Database<Model>;
  };
}
