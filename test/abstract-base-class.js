import {expect} from 'chai';
import {GormanReadOnly, GormanWriteable} from '../src/index.js';

describe("GormanReadOnly", ()=> {
  it("should not be able to be instantiated", async () => {
    expect(() => new GormanReadOnly()).to.throw("GormanReadOnly is an abstract base class - ya blew it!")
  });
});

describe("GormanWriteable", ()=> {
  it("should not be able to be instantiated", async () => {
    expect(() => new GormanWriteable()).to.throw("GormanWriteable is an abstract base class - ya blew it!")
  });
});
