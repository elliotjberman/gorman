import fs from 'fs';

function readJsonAtPath(path) {
  return JSON.parse(fs.readFileSync(path));
}

export default class OrmBase {
  static idTablePath() {
    throw Error("'idTablePath()' not implemented in this class - ya blew it!");
  }

  static classAsIdName(className) {
    return className.toLowerCase() + "Id";
  }

  constructor(id) {
    if (new.target === OrmBase) throw Error("OrmBase is an abstract base class - ya blew it!");

    try {
      var idTable = readJsonAtPath(this.constructor.idTablePath());
    }
    catch (error) {
      console.error("Error while reading idTablePath");
      throw error;
    }

    let entry = idTable[id];
    if (entry === undefined) {
      throw Error(`${new.target} with id ${id} not found in idTable`)
    }

    let instance = readJsonAtPath(entry.path);

    this.id = id;
    Object.keys(instance).forEach(key => {
      this[key] = instance[key];
    });
  }

  getChildren(ormChildClass) {
    let childIdTable = readJsonAtPath(ormChildClass.idTablePath());

    return Object.keys(childIdTable).reduce((filteredChildren, childId) => {
      let potentialChild = new ormChildClass(childId);
      let currentClassName = OrmBase.classAsIdName(this.constructor.name)
      if (potentialChild[currentClassName] === this.id)
        filteredChildren.push(potentialChild);

      return filteredChildren;
    }, []);
  }
  getParent(ormParentClass) {
    let parentKey = OrmBase.classAsIdName(ormParentClass.name);
    return new ormParentClass(this[parentKey]);
  }
}
