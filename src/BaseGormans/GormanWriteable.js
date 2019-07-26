import GormanReadOnly from './GormanReadOnly';

export default class GormanWriteable extends GormanReadOnly {
  constructor(options) {
    if (new.target === GormanWriteable) throw Error("GormanWriteable is an abstract base class - ya blew it!");
    super(options);
  }

  get schema() {
    throw Error(`Class '${this.constructor.name}' does not implement the schema getter`);
  }

  get parentRelationalSchema() {
    const schema = {}
    Object.keys(this.parentMappings).forEach(parentKey => schema[GormanReadOnly.classNameToIdName(parentKey)] = String);
    return schema;
  }

  async save() {
    await this.constructor.persistenceInterface.saveModel(this);
    return;
  }

  // TODO: Known bug - missing cascading delete
  async delete() {
    await this.constructor.persistenceInterface.deleteModel(this);
    return;
  }

}
