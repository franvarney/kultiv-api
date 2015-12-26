import {expect} from 'code';
import Lab from 'lab';

const lab = exports.lab = Lab.script();
const {describe, it, before, after, beforeEach, afterEach} = lab;

import CookbookModel from '../../server/models/cookbook';

describe('models/cookbook', () => {
  beforeEach((done) => {
    done();
  });

  afterEach((done) => {
    done();
  });

  describe('when the collection name is assigned', () => {
    it('the collection name is set', (done) => {
      expect(CookbookModel._collection).to.equal('cookbooks'); // eslint-disable-line
      done();
    });
  });
});
