import path from 'path';
import fs from 'fs';

function readJsonAtPath(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) reject(err);
      resolve(JSON.parse(data));
    });
  });
}

async function getModelFromPath(fullModelPath, id) {
  const modelWithoutId = await readJsonAtPath(fullModelPath);
  return {...modelWithoutId, id};
}

function queryComparison(queryStep, model) {
  const [key, value] = queryStep;
  return model[key] === value;
}

// READ-ONLY
export default class InternalJsonInterface {
  constructor(options) {
    this.directory = options.directory || './';
  }

  async getModelById(tableName, id) {
    const idTable = await readJsonAtPath(path.join(this.directory, `${tableName}.json`));
    const modelPath = idTable[id].path; //TODO: Handle errors
    const modelData = await getModelFromPath(path.join(this.directory, `${modelPath}`), id);
    return modelData;
  }

  // TODO: Add support for $ne operators and the like
  async filterRecords(tableName, query) {
    const idTable = await readJsonAtPath(path.join(this.directory, `${tableName}.json`));
    const modelPromises = Object.entries(idTable).map(async ([id, modelPath]) => {
      const modelData = await this.getModelById(tableName, id);
      return modelData;
    });

    const allModels = await Promise.all(modelPromises);

    const querySteps = Object.entries(query);
    return allModels.filter(model => {
      return querySteps.every(step => queryComparison(step, model));
    });
  }

  async countRecords(tableName, query) {
    const filteredRecords = await this.filterRecords(tableName, query);
    return filteredRecords.length;
  }
}
