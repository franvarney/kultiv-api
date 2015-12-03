const Bcrypt = require('bcrypt');
const Code = require('code');
const Lab = require('lab');
const Sinon = require('sinon');

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
// const before = lab.before;
// const after = lab.after;
const beforeEach = lab.beforeEach;
const afterEach = lab.afterEach;
const expect = Code.expect;

const UserModel = require('../../server/models/user');

var hashed, user;

describe('models/user', function () {
  beforeEach(function (done) {
    user = {
      username: 'test',
      email: 'test@test.com',
      password: 'password'
    };

    hashed = '$2a$10$8wWmQRiUdJss4fDWc/gvXO.WMEaC2A1eaxjbqfVjADvBcbHU0ueDy';

    Sinon.stub(Bcrypt, 'compare').yields(new Error('compare failed'));
    Sinon.stub(Bcrypt, 'genSalt').yields(new Error('generating salt failed'));
    Sinon.stub(Bcrypt, 'hash').yields(new Error('hash failed'));
    Sinon.stub(UserModel, 'findOne').yields(new Error('find one failed'));
    done();
  });

  afterEach(function (done) {
    Bcrypt.compare.restore();
    Bcrypt.genSalt.restore();
    Bcrypt.hash.restore();
    UserModel.findOne.restore();
    done();
  });

  describe('when the collection name is assigned', function () {
    it('the collection name is set', function (done) {
      expect(UserModel._collection).to.equal('users'); // eslint-disable-line
      done();
    });
  });

  describe('findByCredentials', function () {
    describe('when the user is found by the username credentials', function () {
      beforeEach(function (done) {
        UserModel.findOne.yields(null, user);
        done();
      });

      it('returns the user', function (done) {
        UserModel.findByCredentials('test', 'password', function (err, foundUser) {
          expect(err).to.be.null();
          expect(foundUser).to.equal(user);
          done();
        });
      });
    });

    describe('when the user is found by the email credentials', function () {
      beforeEach(function (done) {
        UserModel.findOne.yields(null, user);
        done();
      });

      it('returns the user', function (done) {
        UserModel.findByCredentials('test@test.com', 'password', function (err, foundUser) {
          expect(err).to.be.null();
          expect(foundUser).to.equal(user);
          done();
        });
      });
    });

    describe('when find by credentials fails', function () {
      it('returns the user', function (done) {
        UserModel.findByCredentials('test', 'password', function (err) {
          expect(err.message).to.equals('find one failed');
          done();
        });
      });
    });
  });

  describe('findByToken', function () {
    describe('when the user is found by token', function () {
      beforeEach(function (done) {
        UserModel.findOne.yields(null, user);
        done();
      });

      it('returns the user', function (done) {
        UserModel.findByToken('someToken', function (err, foundUser) {
          expect(err).to.be.null();
          expect(foundUser).to.equal(user);
          done();
        });
      });
    });

    describe('when the user isn\'t found by token', function () {
      it('returns an error', function (done) {
        UserModel.findByToken('someToken', function (err) {
          expect(err.message).to.equal('find one failed');
          done();
        });
      });
    });
  });

  describe('findByEmail', function () {
    describe('when the user is found by email', function () {
      beforeEach(function (done) {
        UserModel.findOne.yields(null, user);
        done();
      });

      it('returns the user', function (done) {
        UserModel.findByEmail('test@test.com', function (err, foundUser) {
          expect(err).to.be.null();
          expect(foundUser).to.equal(user);
          done();
        });
      });
    });

    describe('when find by email fails', function () {
      it('returns the user', function (done) {
        UserModel.findByEmail('test@test.com', function (err) {
          expect(err.message).to.equals('find one failed');
          done();
        });
      });
    });
  });

  describe('findByUsername', function () {
    describe('when the user is found by username', function () {
      beforeEach(function (done) {
        UserModel.findOne.yields(null, user);
        done();
      });

      it('returns the user', function (done) {
        UserModel.findByUsername('test', function (err, foundUser) {
          expect(err).to.be.null();
          expect(foundUser).to.equal(user);
          done();
        });
      });
    });

    describe('when find by username fails', function () {
      it('returns the user', function (done) {
        UserModel.findByUsername('test', function (err) {
          expect(err.message).to.equals('find one failed');
          done();
        });
      });
    });
  });

  describe('hashPassword', function () {
    describe('when the password is hashed', function () {
      beforeEach(function (done) {
        Bcrypt.genSalt.yields(null, 'salty');
        Bcrypt.hash.yields(null, hashed);
        done();
      });

      it('returns the hashed password', function (done) {
        UserModel.hashPassword('password', function (err, hashedPassword) {
          expect(err).to.be.null();
          expect(hashedPassword).to.equal(hashed);
          done();
        });
      });
    });

    describe('when the salt generation fails', function () {
      it('returns an error', function (done) {
        UserModel.hashPassword('password', function (err) {
          expect(Bcrypt.hash.called).to.be.false();
          expect(err.message).to.equal('generating salt failed');
          done();
        });
      });
    });

    describe('when the hash fails', function () {
      beforeEach(function (done) {
        Bcrypt.genSalt.yields(null, 'salty');
        done();
      });

      it('returns an error', function (done) {
        UserModel.hashPassword('password', function (err) {
          expect(Bcrypt.genSalt.called).to.be.true();
          expect(err.message).to.equal('hash failed');
          done();
        });
      });
    });
  });

  describe('isExisting', function () {
    describe('when the user is existing', function () {
      describe('when the user is found', function () {
        beforeEach(function (done) {
          Sinon.stub(UserModel, 'findByEmail').yields(null, null);
          Sinon.stub(UserModel, 'findByUsername').yields(null, user);
          done();
        });

        afterEach(function (done) {
          UserModel.findByEmail.restore();
          UserModel.findByUsername.restore();
          done();
        });

        it('returns the user', function (done) {
          UserModel.isExisting('test@test.com', 'test', function (err, results) {
            expect(UserModel.findByEmail.called).to.be.true();
            expect(UserModel.findByUsername.called).to.be.true();
            expect(err).to.be.null();
            expect(results).to.equal(user);
            done();
          });
        });
      });

      describe('when the user is found by email', function () {
        beforeEach(function (done) {
          Sinon.stub(UserModel, 'findByEmail').yields(null, user);
          Sinon.stub(UserModel, 'findByUsername').yields(null, null);
          done();
        });

        afterEach(function (done) {
          UserModel.findByEmail.restore();
          UserModel.findByUsername.restore();
          done();
        });

        it('returns the user', function (done) {
          UserModel.isExisting('test@test.com', 'test', function (err, results) {
            expect(UserModel.findByEmail.called).to.be.true();
            expect(UserModel.findByUsername.called).to.be.true();
            expect(err).to.be.null();
            expect(results).to.equal(user);
            done();
          });
        });
      });

      describe('when the user is found by username', function () {
        beforeEach(function (done) {
          Sinon.stub(UserModel, 'findByEmail').yields(null, null);
          Sinon.stub(UserModel, 'findByUsername').yields(null, user);
          done();
        });

        afterEach(function (done) {
          UserModel.findByEmail.restore();
          UserModel.findByUsername.restore();
          done();
        });

        it('returns the user', function (done) {
          UserModel.isExisting('test', function (err, results) {
            expect(err).to.be.null();
            expect(UserModel.findByEmail.called).to.be.false();
            expect(results).to.equal(user);
            done();
          });
        });
      });
    });

    describe('when the user isn\'t existing', function () {
      beforeEach(function (done) {
        Sinon.stub(UserModel, 'findByEmail').yields(null, null);
        Sinon.stub(UserModel, 'findByUsername').yields(null, null);
        done();
      });

      afterEach(function (done) {
        UserModel.findByEmail.restore();
        UserModel.findByUsername.restore();
        done();
      })

      it('returns the user', function (done) {
        UserModel.isExisting('test@test.com', 'test', function (err, results) {
          expect(err).to.be.null();
          expect(results).to.be.false();
          done();
        });
      });
    });

    describe('when checking is user exists fails', function () {
      it('returns an error', function (done) {
        UserModel.isExisting('test@test.com', 'test', function (err) {
          expect(err.message).to.equal('find one failed');
          done();
        });
      });
    });
  });

  describe('isPasswordMatch', function () {
    describe('when the password compare fails', function () {
      it('returns an error', function (done) {
        UserModel.isPasswordMatch('test', hashed, function (err) {
          expect(Bcrypt.compare.called).to.be.true();
          expect(err.message).to.equal('compare failed');
          done();
        });
      });
    });

    describe('when the passwords match', function () {
      beforeEach(function (done) {
        Bcrypt.compare.yields(null, true);
        done();
      });

      it('returns true', function (done) {
        UserModel.isPasswordMatch('test', hashed, function (err, isMatch) {
          expect(Bcrypt.compare.called).to.be.true();
          expect(err).to.be.null();
          expect(isMatch).to.be.true();
          done();
        });
      });
    });

    describe('when the passwords don\'t match', function () {
      beforeEach(function (done) {
        Bcrypt.compare.yields(null, false);
        done();
      });

      it('returns false', function (done) {
        UserModel.isPasswordMatch('test', hashed, function (err, isMatch) {
          expect(Bcrypt.compare.called).to.be.true();
          expect(err).to.be.null();
          expect(isMatch).to.be.false();
          done();
        });
      });
    });
  });
});
