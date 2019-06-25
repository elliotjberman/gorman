import {expect} from 'chai';
import OrmBase from '../src/index.js';

class A extends OrmBase {
  static idTablePath() {
    return "test/json/a_id.json"
  }

  bs() {
    return this.getChildren(B);
  }

}

class B extends OrmBase {
  static idTablePath() {
    return "test/json/b_id.json"
  }

  a() {
    return this.getParent(A);
  }
}

describe("Parent class A", () => {
  it("should have correct attributes from json file", () => {
    let a = new A("firstAId");
    expect(a.one).to.equal(1);
  });

  it("should have children of type B", ()=> {
    let a = new A("firstAId");
    let children = a.bs();
    expect(children.length).to.be.equal(1);
    children.forEach(child => expect(child).to.be.an.instanceof(B));
  });
})

describe("Child class B", () => {
  it("should have correct attributes from json file", () => {
    let b = new B("firstBId");
    expect(b.two).to.equal(2);
  });

  it("should have a parent of type A", ()=> {
    let b = new B("firstBId");
    expect(b.a()).to.be.an.instanceof(A);
  });
})
