export default class Goron {
  constructor(options) {
    if (new.target === Goron) throw Error("GoronReadOnly is an abstract base class - ya blew it!");
    this.id = options._id; // Never, ever fuck with this yourself

    Object.keys(this.childMappings).forEach(key => {
      Object.defineProperty(this, key, {
        get: this.getChildrenFactory(this.childMappings[key])
      });
    });

    Object.keys(this.parentMappings).forEach(key => {
      const classType = this.parentMappings[key];
      const parentKey = Goron.classNameToIdName(classType.name);
      this[parentKey] = options[parentKey]
      Object.defineProperty(this, key, {
        get: this.getParentFactory(classType)
      });
    });
  }

  async save() {
    await persistenceInterface.saveModel(this);
    return;
  }

  static async summonById(id) {
    const doc = await persistenceInterface.getModelById(this.tableName, id);
    return new this(doc);
  }

  // TODO: Known bug - missing cascading delete
  async delete() {
    await persistenceInterface.deleteModel(this);
    return;
  }

  static get tableName() {
    throw Error(`Class '${this.constructor.name}' does not implement the tableName getter`);
  }

  get schema() {
    throw Error(`Class '${this.constructor.name}' does not implement the schema getter`);
  }

  static async filter(query) {
    const records = await persistenceInterface.filterRecords(this.tableName, query);
    return records.map(record => {
      return new this(record);
    });
  }

  static async all() {
    const records = await persistenceInterface.filterRecords(this.tableName, {});
    return records.map(record => {
      return new this(record);
    });
  }

  static classNameToIdName(className) {
    return className.toLowerCase() + "Id";
  }

/***************************/
/******** RELATIONS ********/
/***************************/

  // Children

  get childMappings() {
      return {};
  }

  async getChildren(classType) {
    if (!this.id)
      throw Error(`Calling getChildren on class ${this.constructor.name} before id has been retrieved`);

    const fieldName = Goron.classNameToIdName(this.constructor.name);
    const children = await classType.filter({[fieldName]: this.id});
    return children;
  }

  getChildrenFactory(classType) {
    return async () => {
       return await this.getChildren(classType);
    };
  }

  // Parent

  get parentMappings() {
      return {};
  }

  async getParent(classType) {
    const parentId = this[Goron.classNameToIdName(classType.name)];
    const parent = await classType.summonById(parentId);
    return parent;
  }

  getParentFactory(classType) {
    return async () => {
       return await this.getParent(classType);
    };
  }

  get parentRelationalSchema() {
    const schema = {}
    Object.keys(this.parentMappings).forEach(parentKey => schema[Goron.classNameToIdName(parentKey)] = String);
    return schema;
  }

}
