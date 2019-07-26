import {expect} from 'chai';
import fs from 'fs';
import path from 'path';
import {GormanWriteable, Persistence} from '../src/index.js';

const DB_DIRECTORY = "test/json/groups-writeable";

/********************/
/*** TEST CLASSES ***/
/********************/

class Group extends GormanWriteable {
  constructor(options) {
    super(options);
    this.name = options.name;
    this.minAge = options.minAge || 0;
  }

  static get persistenceInterface() {
    return new Persistence.NedbInterface({directory: DB_DIRECTORY});
  }

  static get tableName() {
    return 'groups';
  }

  get childMappings() {
      return {"playthroughs": Playthrough};
  }

  get schema() {
    return {
      name: String,
      minAge: Number,
    }
  }

}

class Playthrough extends GormanWriteable {
  constructor(options) {
    super(options);
    this.start = new Date(options.start);
    this.config = options.config;
  }

  static get persistenceInterface() {
    return new Persistence.NedbInterface({directory: DB_DIRECTORY});
  }

  static get tableName() {
    return 'playthroughs';
  }

  get childMappings() {
      return {"photos": Photo};
  }

  get parentMappings() {
      return {"group": Group};
  }

  get schema() {
    return {
      start: Date,
      config: Object
    }
  }
}

class Photo extends GormanWriteable {
  constructor(options) {
    super(options);
    this.fileName = options.fileName;
    this.title = options.title || "";
    this.createdAt = options.createdAt ? options.createdAt.$$date : null; // retrieval only
  }

  static get persistenceInterface() {
    return new Persistence.NedbInterface({directory: DB_DIRECTORY});
  }

  static get tableName() {
    return 'photos';
  }

  get parentMappings() {
    return {"playthrough": Playthrough};
  }

  get schema() {
    return {
      fileName: String,
      title: String
    }
  }

  get fullPath() {
    return path.join(UserDirectoryInterface.getStaticPath(), 'photos', this.fileName);
  }


}

/********************/
/****** TESTS  ******/
/********************/

describe("class Group", () => {
  it("should be able to be created and saved and have an id", async () => {
    const group = new Group({name: "Test Group 1"});
    await group.save();
    expect(group.id).not.to.equal(undefined);
  });

  it("should be able to be created and recalled by name", async () => {
    const group = new Group({name: "Test Group 2"});
    await group.save();
    const groups = await Group.filter({name: group.name});
    expect(groups.length).to.equal(1);
    const sameGroup = groups[0];
    expect(sameGroup.id).to.equal(group.id);
  });

  it("should work with count", async () => {
    const group3a = new Group({name: "Test Group 3"});
    await group3a.save();
    const group3b = new Group({name: "Test Group 3"});
    await group3b.save();
    const group3c = new Group({name: "Test Group 3"});
    await group3c.save();
    expect(await Group.count({name: "Test Group 3"})).to.equal(3);
  });
});

/********************/
/***** TEARDOWN *****/
/********************/

// TODO: Make better
after(async () => {
  const groupsPath = 'test/json/groups-writeable/';
  fs.readdirSync(groupsPath).forEach(file => {
    if (file.endsWith(".db"))
      fs.unlinkSync(path.join(groupsPath,file))
  })
});
