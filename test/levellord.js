import {expect} from 'chai';
import OrmBase from '../src/index.js';

class Level extends OrmBase {
  static idTablePath() {
    return "test/json/level/level-whitelist.json"
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

describe("Parent class Level", () => {
  it("should have correct attributes from json file", () => {
    let a = new Level("biomes");
    expect(a.name).to.equal("Biomes");
  });

  it("should have children of type Lesson", ()=> {
    let a = new Level("biomes");
    let lessons = a.lessons();
    expect(lessons.length).to.be.equal(1);
    lessons.forEach(child => expect(child).to.be.an.instanceof(Lesson));
  });
})

describe("Child class Lesson", () => {
  it("should have correct attributes from json file", () => {
    let b = new Lesson("fish");
    expect(b.ages).to.equal("5+");
  });

  it("should have a parent of type Level", ()=> {
    let b = new Lesson("fish");
    expect(b.level()).to.be.an.instanceof(Level);
  });
})
