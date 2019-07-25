import {expect} from 'chai';
import {GoronReadOnly, persistence_interfaces.InternalJsonInterface} from '../src/index.js';

class Mode extends GoronReadOnly {
  constructor(options) {
    super(options);
    this.persistenceInterface = new InternalJsonInterface("test/json/levellord")
  }

  static get tableName() {
    return 'mode-whitelist';
  }

  get childMappings() {
    return {"levels": Level};
  }
}

class Level extends GoronReadOnly {
  constructor(options) {
    super(options);
    this.persistenceInterface = new InternalJsonInterface("test/json/levellord")
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

class Lesson extends GoronReadOnly {
  constructor(options) {
    super(options);
    this.persistenceInterface = new InternalJsonInterface("test/json/levellord");
  }
  static get tableName() {
    return 'lesson-whitelist';
  }

  get parentMappings() {
    return {"level": Level};
  }

}

describe("Parent class Mode", () => {
  it("should have correct attributes from json file", () => {
    let a = new Mode("adventure");
    expect(a.funFactor).to.equal("5 Bags of Popcorn");
  });

  it("should have children of type Level", ()=> {
    let a = new Mode("adventure");
    let levels = a.levels();
    expect(levels.length).to.be.equal(1);
    levels.forEach(child => expect(child).to.be.an.instanceof(Level));
  });
})

describe("Parent class Level", () => {
  it("should have correct attributes from json file", () => {
    let b = new Level("biomes");
    expect(b.name).to.equal("Biomes");
  });

  it("should have children of type Lesson", ()=> {
    let b = new Level("biomes");
    let lessons = b.lessons();
    expect(lessons.length).to.be.equal(1);
    lessons.forEach(child => expect(child).to.be.an.instanceof(Lesson));
  });

  it("should have a parent of type Mode", ()=> {
    let b = new Level("biomes");
    expect(b.mode()).to.be.an.instanceof(Mode);
  });

  it("should have the correct parent", ()=> {
    let b = new Level("biomes");
    expect(b.mode().name).to.equal("Adventure");
  });

})

describe("Child class Lesson", () => {
  it("should have correct attributes from json file", () => {
    let c = new Lesson("fish");
    expect(c.ages).to.equal("5+");
  });

  it("should have a parent of type Level", ()=> {
    let c = new Lesson("fish");
    expect(c.level()).to.be.an.instanceof(Level);
  });

  it("should have the correct parent", ()=> {
    let c = new Lesson("fish");
    expect(c.level().name).to.equal("Biomes");
  });
})
