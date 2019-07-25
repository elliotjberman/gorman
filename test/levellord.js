import {expect} from 'chai';
import {GormanReadOnly, Persistence,} from '../src/index.js';

const JSON_DIRECTORY = "test/json/levellord";

class Mode extends GormanReadOnly {
  constructor(options) {
    super(options);
    this.name = options.name;
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
    this.name = options.name;
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
    this.name = options.name;
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

describe("class Mode", () => {

  it("should be able to be summoned by id 'adventure'", async () => {
    let adv = await Mode.summonById("adventure");
    expect(adv.funFactor).to.equal("5 Bags of Popcorn");
  });

  it("should have a child level 'Biomes'", async () => {
    let adv = await Mode.summonById("adventure");
    const levels = await adv.levels;
    expect(levels.some(level => level.name === "Biomes"));
  });

})

describe("class Level", () => {

  it("should be able to be summoned by id 'biomes'", async () => {
    let bio = await Level.summonById("biomes");
    expect(bio.name).to.equal("Biomes");
  });

  it("should be able to be summoned by id 'cities' even with json by another name", async () => {
    let bio = await Level.summonById("cities");
    expect(bio.name).to.equal("Cities");
  });


  it("should have a child level 'Make Your Own Fishy'", async () => {
    let bio = await Level.summonById("biomes");
    const lessons = await bio.lessons;
    expect(lessons.some(lesson => lesson.name === "Make Your Own Fishy"));
  });

  it("should have a parent mode 'Adventure'", async () => {
    let bio = await Level.summonById("biomes");
    const mode= await bio.mode;
    expect(mode.name).to.equal("Adventure");
  });

})
