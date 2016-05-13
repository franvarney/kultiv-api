const Code = require('code')
const Lab = require('lab')
// const Sinon = require('sinon')

const lab = exports.lab = Lab.script()
const describe = lab.describe
const it = lab.it
// const before = lab.before
// const after = lab.after
const beforeEach = lab.beforeEach
const afterEach = lab.afterEach
const expect = Code.expect

const CookbookModel = require('../../server/models/cookbook')

describe('models/cookbook', function () {
  beforeEach(function (done) {
    done()
  })

  afterEach(function (done) {
    done()
  })

  describe('when the collection name is assigned', function () {
    it('the collection name is set', function (done) {
      expect(CookbookModel._collection).to.equal('cookbooks') // eslint-disable-line
      done()
    })
  })
})
