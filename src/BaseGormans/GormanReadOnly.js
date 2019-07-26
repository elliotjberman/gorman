export default class GormanReadOnly {
  constructor(options) {
    if (new.target === GormanReadOnly) throw Error("GormanReadOnly is an abstract base class - ya blew it!");
    this.id = options.id;

    Object.keys(this.childMappings).forEach(key => {
      Object.defineProperty(this, key, {
        get: this.getChildrenFactory(this.childMappings[key])
      });
    });

    Object.keys(this.parentMappings).forEach(key => {
      const classType = this.parentMappings[key];
      const parentKey = GormanReadOnly.classNameToIdName(classType.name);
      this[parentKey] = options[parentKey]
      Object.defineProperty(this, key, {
        get: this.getParentFactory(classType)
      });
    });
  }

  // Internal static methods
  static get persistenceInterface() {
    throw Error(`Class '${this.constructor.name}' does not implement the persistenceInterface getter`);
  }

  static get tableName() {
    throw Error(`Class '${this.constructor.name}' does not implement the tableName getter`);
  }

  static classNameToIdName(className) {
    return className.toLowerCase() + "Id";
  }

  static async summonById(id) {
    const doc = await this.persistenceInterface.getModelById(this.tableName, id);
    return new this(doc);
  }

  static async filter(query) {
    const records = await this.persistenceInterface.filterRecords(this.tableName, query);
    return records.map(record => {
      return new this(record);
    });
  }

  static async all() {
    const records = await this.filter({});
    return records;
  }

  static async count(query={}) {
    const count = await this.persistenceInterface.countRecords(this.tableName, query);
    return count;
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

    const fieldName = GormanReadOnly.classNameToIdName(this.constructor.name);
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
    const parentId = this[GormanReadOnly.classNameToIdName(classType.name)];
    const parent = await classType.summonById(parentId);
    return parent;
  }

  getParentFactory(classType) {
    return async () => {
       return await this.getParent(classType);
    };
  }


}
