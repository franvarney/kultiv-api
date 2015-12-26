import Bcrypt from 'bcrypt';
import {expect} from 'code';
import Lab from 'lab';
import Sinon from 'sinon';

const lab = exports.lab = Lab.script();
const {describe, it, before, after, beforeEach, afterEach} = lab;

import UserModel from '../../server/models/user';

let hashed, user;

describe('models/user', () => {
  beforeEach((done) => {
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

  afterEach((done) => {
    Bcrypt.compare.restore();
    Bcrypt.genSalt.restore();
    Bcrypt.hash.restore();
    UserModel.findOne.restore();
    done();
  });

  describe('when the collection name is assigned', () => {
    it('the collection name is set', (done) => {
      expect(UserModel._collection).to.equal('users'); // eslint-disable-line
      done();
    });
  });

  describe('findByCredentials', () => {
    describe('when the user is found by the username credentials', () => {
      beforeEach((done) => {
        UserModel.findOne.yields(null, user);
        done();
      });

      it('returns the user', (done) => {
        UserModel.findByCredentials('test', 'password', (err, foundUser) => {
          expect(err).to.be.null();
          expect(foundUser).to.equal(user);
          done();
        });
      });
    });

    describe('when the user is found by the email credentials', () => {
      beforeEach((done) => {
        UserModel.findOne.yields(null, user);
        done();
      });

      it('returns the user', (done) => {
        UserModel.findByCredentials('test@test.com', 'password', (err, foundUser) => {
          expect(err).to.be.null();
          expect(foundUser).to.equal(user);
          done();
        });
      });
    });

    describe('when find by credentials fails', () => {
      it('returns the user', (done) => {
        UserModel.findByCredentials('test', 'password', (err) => {
          expect(err.message).to.equals('find one failed');
          done();
        });
      });
    });
  });

  describe('findByToken', () => {
    describe('when the user is found by token', () => {
      beforeEach((done) => {
        UserModel.findOne.yields(null, user);
        done();
      });

      it('returns the user', (done) => {
        UserModel.findByToken('someToken', (err, foundUser) => {
          expect(err).to.be.null();
          expect(foundUser).to.equal(user);
          done();
        });
      });
    });

    describe('when the user isn\'t found by token', () => {
      it('returns an error', (done) => {
        UserModel.findByToken('someToken', (err) => {
          expect(err.message).to.equal('find one failed');
          done();
        });
      });
    });
  });

  describe('findByEmail', () => {
    describe('when the user is found by email', () => {
      beforeEach((done) => {
        UserModel.findOne.yields(null, user);
        done();
      });

      it('returns the user', (done) => {
        UserModel.findByEmail('test@test.com', (err, foundUser) => {
          expect(err).to.be.null();
          expect(foundUser).to.equal(user);
          done();
        });
      });
    });

    describe('when find by email fails', () => {
      it('returns the user', (done) => {
        UserModel.findByEmail('test@test.com', (err) => {
          expect(err.message).to.equals('find one failed');
          done();
        });
      });
    });
  });

  describe('findByUsername', () => {
    describe('when the user is found by username', () => {
      beforeEach((done) => {
        UserModel.findOne.yields(null, user);
        done();
      });

      it('returns the user', (done) => {
        UserModel.findByUsername('test', (err, foundUser) => {
          expect(err).to.be.null();
          expect(foundUser).to.equal(user);
          done();
        });
      });
    });

    describe('when find by username fails', () => {
      it('returns the user', (done) => {
        UserModel.findByUsername('test', (err) => {
          expect(err.message).to.equals('find one failed');
          done();
        });
      });
    });
  });

  describe('hashPassword', () => {
    describe('when the password is hashed', () => {
      beforeEach((done) => {
        Bcrypt.genSalt.yields(null, 'salty');
        Bcrypt.hash.yields(null, hashed);
        done();
      });

      it('returns the hashed password', (done) => {
        UserModel.hashPassword('password', (err, hashedPassword) => {
          expect(err).to.be.null();
          expect(hashedPassword).to.equal(hashed);
          done();
        });
      });
    });

    describe('when the salt generation fails', () => {
      it('returns an error', (done) => {
        UserModel.hashPassword('password', (err) => {
          expect(Bcrypt.hash.called).to.be.false();
          expect(err.message).to.equal('generating salt failed');
          done();
        });
      });
    });

    describe('when the hash fails', () => {
      beforeEach((done) => {
        Bcrypt.genSalt.yields(null, 'salty');
        done();
      });

      it('returns an error', (done) => {
        UserModel.hashPassword('password', (err) => {
          expect(Bcrypt.genSalt.called).to.be.true();
          expect(err.message).to.equal('hash failed');
          done();
        });
      });
    });
  });

  describe('isExisting', () => {
    describe('when the user is existing', () => {
      describe('when the user is found', () => {
        beforeEach((done) => {
          Sinon.stub(UserModel, 'findByEmail').yields(null, null);
          Sinon.stub(UserModel, 'findByUsername').yields(null, user);
          done();
        });

        afterEach((done) => {
          UserModel.findByEmail.restore();
          UserModel.findByUsername.restore();
          done();
        });

        it('returns the user', (done) => {
          UserModel.isExisting('test@test.com', 'test', (err, results) => {
            expect(UserModel.findByEmail.called).to.be.true();
            expect(UserModel.findByUsername.called).to.be.true();
            expect(err).to.be.null();
            expect(results).to.equal(user);
            done();
          });
        });
      });

      describe('when the user is found by email', () => {
        beforeEach((done) => {
          Sinon.stub(UserModel, 'findByEmail').yields(null, user);
          Sinon.stub(UserModel, 'findByUsername').yields(null, null);
          done();
        });

        afterEach((done) => {
          UserModel.findByEmail.restore();
          UserModel.findByUsername.restore();
          done();
        });

        it('returns the user', (done) => {
          UserModel.isExisting('test@test.com', 'test', (err, results) => {
            expect(UserModel.findByEmail.called).to.be.true();
            expect(UserModel.findByUsername.called).to.be.true();
            expect(err).to.be.null();
            expect(results).to.equal(user);
            done();
          });
        });
      });

      describe('when the user is found by username', () => {
        beforeEach((done) => {
          Sinon.stub(UserModel, 'findByEmail').yields(null, null);
          Sinon.stub(UserModel, 'findByUsername').yields(null, user);
          done();
        });

        afterEach((done) => {
          UserModel.findByEmail.restore();
          UserModel.findByUsername.restore();
          done();
        });

        it('returns the user', (done) => {
          UserModel.isExisting('test', (err, results) => {
            expect(err).to.be.null();
            expect(UserModel.findByEmail.called).to.be.false();
            expect(results).to.equal(user);
            done();
          });
        });
      });
    });

    describe('when the user isn\'t existing', () => {
      beforeEach((done) => {
        Sinon.stub(UserModel, 'findByEmail').yields(null, null);
        Sinon.stub(UserModel, 'findByUsername').yields(null, null);
        done();
      });

      afterEach((done) => {
        UserModel.findByEmail.restore();
        UserModel.findByUsername.restore();
        done();
      })

      it('returns the user', (done) => {
        UserModel.isExisting('test@test.com', 'test', (err, results) => {
          expect(err).to.be.null();
          expect(results).to.be.false();
          done();
        });
      });
    });

    describe('when checking is user exists fails', () => {
      it('returns an error', (done) => {
        UserModel.isExisting('test@test.com', 'test', (err) => {
          expect(err.message).to.equal('find one failed');
          done();
        });
      });
    });
  });

  describe('isPasswordMatch', () => {
    describe('when the password compare fails', () => {
      it('returns an error', (done) => {
        UserModel.isPasswordMatch('test', hashed, (err) => {
          expect(Bcrypt.compare.called).to.be.true();
          expect(err.message).to.equal('compare failed');
          done();
        });
      });
    });

    describe('when the passwords match', () => {
      beforeEach((done) => {
        Bcrypt.compare.yields(null, true);
        done();
      });

      it('returns true', (done) => {
        UserModel.isPasswordMatch('test', hashed, (err, isMatch) => {
          expect(Bcrypt.compare.called).to.be.true();
          expect(err).to.be.null();
          expect(isMatch).to.be.true();
          done();
        });
      });
    });

    describe('when the passwords don\'t match', () => {
      beforeEach((done) => {
        Bcrypt.compare.yields(null, false);
        done();
      });

      it('returns false', (done) => {
        UserModel.isPasswordMatch('test', hashed, (err, isMatch) => {
          expect(Bcrypt.compare.called).to.be.true();
          expect(err).to.be.null();
          expect(isMatch).to.be.false();
          done();
        });
      });
    });
  });
});
