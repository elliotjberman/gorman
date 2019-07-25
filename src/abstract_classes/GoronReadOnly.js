import Goron from './Goron';

export default class GoronReadOnly extends Goron {
  constructor(options) {
    if (new.target === GoronReadOnly) throw Error("GoronReadOnly is an abstract base class - ya blew it!");
    super(options)
    this.id = options._id; // Never, ever fuck with this yourself
  }

  async save() {
    throw Error(`Cannot call save() in read-only class ${this.constructor.name}`);
  }

  static async summonById(id) {
    const doc = await persistenceInterface.getModelById(this.tableName, id);
    return new this(doc);
  }

  async delete() {
    throw Error(`Cannot call delete() in read-only class ${this.constructor.name}`);
  }

}
