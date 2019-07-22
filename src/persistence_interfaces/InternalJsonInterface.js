import path from 'path';
import fs from 'fs';

async function readJsonAtPath(path) {
  const json = await JSON.parse(fs.readFile(path));
  return json;
}

function queryComparison(queryStep, model) {
  const [key, value] = queryStep;
  return model[key] === value;
}

// READ-ONLY
export default class InternalJsonInterface {
  constructor(options) {
    this.jsonDirectory = options.jsonDirectory || './';
  }

  async getModelById(tableName, id) {
    const idTable = await readJsonAtPath(path.join(this.jsonDirectory, `${tableName}.json`));
    const modelPath = idTable[id]; //TODO: Handle errors
    const modelData = await readJsonAtPath(path.join(this.jsonDirectory, `${modelData}`));
    return modelData;
  }

  // TODO: Add support for $ne operators and the like
  async filterRecords(tableName, query) {
    const idTable = await readJsonAtPath(path.join(this.jsonDirectory, `${tableName}.json`));
    const allModels = Object.entries(idTable).map(([id, modelPath]) => {
      const modelWithoutId = await getModelById(tableName, id);
      return {...modelWithoutId, id};
    });

    const filteredModels = {};
    const querySteps = Object.entries(query);
    return allModels.filter(model => {
      return querySteps.all(step => queryComparison(step, model));
    });
  }
}


export default {
  getModelById,
  filterRecords
}
