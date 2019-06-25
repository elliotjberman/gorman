import {expect} from 'chai';
import OrmBase from '../src/index.js';

class Mode extends OrmBase {
  static idTablePath() {
    return "test/json/level/mode-whitelist.json"
  }

  levels() {
    return this.getChildren(Level);
  }
}

class Level extends OrmBase {
  static idTablePath() {
    return "test/json/level/level-whitelist.json"
  }

  mode() {
    return this.getParent(Mode);
  }

  lessons() {
    return this.getChildren(Lesson);
  }
}

class Lesson extends OrmBase {
  static idTablePath() {
    return "test/json/level/lesson-whitelist.json"
  }

  level() {
    return this.getParent(Level);
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
