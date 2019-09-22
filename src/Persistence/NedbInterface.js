import path from 'path';
import Datastore from 'nedb';

const DB_SINGLETONS = {}; // Note: A rarely sanctioned use of globals

// Helpers
function createDoc(modelInstance, isNew) {
  const doc = {};

  const allSchema = {...modelInstance.schema, ...modelInstance.parentRelationalSchema};
  Object.keys(allSchema).forEach(key => {
    const expectedType = allSchema[key];
    const value = modelInstance[key];
    if(!value instanceof expectedType)
      throw Error(`Schema error: key '${key}' is of type ${typeof value}, not ${expectedType}`)

    doc[key] = value;
  });

  return doc;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getDbSingleton(directory, collection) {
  let retries = 20;
  const timeout = 50; // 50ms
  while (DB_SINGLETONS[directory + collection] === undefined) {
    try {
      DB_SINGLETONS[directory + collection] = new Datastore({ filename: path.join(directory, collection + ".db"), autoload: true, timestampData: true });
    }
    catch(e) {
      console.warn("Error trying to open NEDB file");
      console.warn(e);
      retries-=1;
      if (retries === 0) throw e;
      await sleep(50);
    }
  }
  return DB_SINGLETONS[directory + collection];
}

async function refreshDb(db) {
  await db.loadDatabase();
}

function translateId(doc) {
  const docWithId = {...doc, id: doc._id};
  delete docWithId._id;
  return docWithId;
}

export default class NedbInterface {
  constructor(options) {
    this.directory = options.directory;
  }

  async insertModel(db, modelInstance) {
    return new Promise(async (resolve, reject) => {
      const doc = createDoc(modelInstance);

      db.insert(doc, (err, newDoc) => {
        if (err) reject(err);
        modelInstance.id = newDoc._id;
        resolve(translateId(modelInstance));
      });
    });
  }

  async updateModel(db, modelInstance) {
    return new Promise(async (resolve, reject) => {
      const doc = createDoc(modelInstance);

      db.update({_id: modelInstance.id}, {$set: doc}, {}, (err) => {
        if (err) reject(err);
        resolve(translateId(modelInstance));
      });
    });
  }

  async saveModel(modelInstance) {
    const db = await getDbSingleton(this.directory, modelInstance.constructor.tableName);
    if (!modelInstance.id) {
      await this.insertModel(db, modelInstance);
      return;
    }
    await this.updateModel(db, modelInstance);
  }

  async deleteModel(modelInstance) {
    if (!modelInstance.id)
      throw Error(`Trying to delete instance of ${modelInstance.constructor.name} that has no id. Have you saved it?`);

    return new Promise(async (resolve, reject) => {
      const db = await getDbSingleton(this.directory, modelInstance.constructor.tableName);
      db.remove({_id: modelInstance.id}, {}, (err, docs) => {
        if (err) reject(err);
        resolve(docs);
      });
    });
  }

  async getModelById(tableName, id, refresh=false) {
    return new Promise(async (resolve, reject) => {
      const db = await getDbSingleton(this.directory, tableName);
      if (refresh) await refreshDb(db);
      db.findOne({_id: id}, (err, doc) => {
        if (err) reject(err);
        resolve(translateId(doc));
      });
    });
  }

  async filterRecords(tableName, query, refresh=false) {
    if (query.id) {
      query._id = query.id;
      delete query.id;
    }
    return new Promise(async (resolve, reject) => {
      const db = await getDbSingleton(this.directory, tableName);
      if (refresh) await refreshDb(db);
      db.find(query, {}, (err, docs) => {
        if (err) reject(err);
        resolve(docs.map(translateId) || []);
      });
    });
  }

  async countRecords(tableName, query, refresh=false) {
    return new Promise(async (resolve, reject) => {
      const db = await getDbSingleton(this.directory, tableName);
      if (refresh) await refreshDb(db);
      db.count(query, (err, count) => {
        if (err) reject(err);
        resolve(count);
      });
    });
  }
}
