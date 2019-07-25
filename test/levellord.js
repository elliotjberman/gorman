import {expect} from 'chai';
import {GormanReadOnly, Persistence,} from '../src/index.js';

const JSON_DIRECTORY = "test/json/levellord";

class Mode extends GormanReadOnly {
  constructor(options) {
    super(options);
    this.funFactor = options.funFactor;
  }
  
  static get persistenceInterface() {
    return new Persistence.InternalJsonInterface({jsonDirectory: JSON_DIRECTORY});
  }

  static get tableName() {
    return 'mode-whitelist';
  }

  get childMappings() {
    return {"levels": Level};
  }
}

class Level extends GormanReadOnly {
  constructor(options) {
    super(options);
  }

  static get persistenceInterface() {
    return new Persistence.InternalJsonInterface({jsonDirectory: JSON_DIRECTORY})
  }

  static get tableName() {
    return 'level-whitelist';
  }

  get childMappings() {
      return {"lessons": Lesson};
  }

  get parentMappings() {
      return {"mode": Mode};
  }
}

class Lesson extends GormanReadOnly {
  constructor(options) {
    super(options);
  }

  static get persistenceInterface() {
    return new Persistence.InternalJsonInterface({jsonDirectory: JSON_DIRECTORY})
  }
  
  static get tableName() {
    return 'lesson-whitelist';
  }
  
  get parentMappings() {
    return {"level": Level};
  }

}

describe("Parent class Mode", () => {
  it("should have correct attributes from json file", async () => {
    let a = await Mode.summonById("adventure");
    expect(a.funFactor).to.equal("5 Bags of Popcorn");
  });
})
