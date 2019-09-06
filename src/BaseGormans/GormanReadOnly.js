export default class GormanReadOnly {
  constructor(options) {
    if (new.target === GormanReadOnly) throw Error("GormanReadOnly is an abstract base class - ya blew it!");
    this.id = options.id;

    Object.keys(this.childMappings).forEach(key => {
      Object.defineProperty(this, key, {
        get: this.getChildrenFactory(this.childMappings[key], false)
      });
      Object.defineProperty(this, key+"Forced", {
        get: this.getChildrenFactory(this.childMappings[key], true)
      });
    });

    Object.keys(this.parentMappings).forEach(key => {
      const classType = this.parentMappings[key];
      const parentKey = GormanReadOnly.classNameToIdName(classType.name);
      this[parentKey] = options[parentKey]
      Object.defineProperty(this, key, {
        get: this.getParentFactory(classType, false)
      });
      Object.defineProperty(this, key+"Forced", {
        get: this.getParentFactory(classType, true)
      });
    });
  }

  static get forceRefresh() {
    return false;
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

  static async summonById(id, forceRefresh=false) {
    const doc = await this.persistenceInterface.getModelById(this.tableName, id, forceRefresh);
    return new this(doc);
  }

  static async filter(query, forceRefresh=false) {
    const records = await this.persistenceInterface.filterRecords(this.tableName, query, forceRefresh);
    return records.map(record => {
      return new this(record);
    });
  }

  static async all() {
    const records = await this.filter({});
    return records;
  }

  static async count(query={}, forceRefresh=false) {
    const count = await this.persistenceInterface.countRecords(this.tableName, query, forceRefresh);
    return count;
  }

/***************************/
/******** RELATIONS ********/
/***************************/

  // Children

  get childMappings() {
      return {};
  }

  async getChildren(classType, forceRefresh) {
    if (!this.id)
      throw Error(`Calling getChildren on class ${this.constructor.name} before id has been retrieved`);

    const fieldName = GormanReadOnly.classNameToIdName(this.constructor.name);
    const children = await classType.filter({[fieldName]: this.id}, forceRefresh);
    return children;
  }

  getChildrenFactory(classType, forceRefresh) {
    return async () => {
       return await this.getChildren(classType, forceRefresh);
    };
  }

  // Parent

  get parentMappings() {
      return {};
  }

  async getParent(classType, forceRefresh) {
    const parentId = this[GormanReadOnly.classNameToIdName(classType.name)];
    const parent = await classType.summonById(parentId, forceRefresh);
    return parent;
  }

  getParentFactory(classType, forceRefresh) {
    return async () => {
       return await this.getParent(classType, forceRefresh);
    };
  }


}
