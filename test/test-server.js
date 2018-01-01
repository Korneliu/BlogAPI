
const chai = require('chai');
const chaiHttp = require('chai-http');
const {app, runServer, closeServer} = require('../server');
const should = chai.should();
chai.use(chaiHttp);

describe('posts', function() {
  before(function() {
    return runServer();
  });
  after(function() {
    return closeServer();
  });

  it('should list items on GET', function() {
    return chai.request(app)
      .get('/posts')
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('array');
        res.body.length.should.be.at.least(1);
        const expectedKeys = ['id','author', 'content', 'created'];
        res.body.forEach(function(item) {
          item.should.be.a('object');
          item.should.include.keys(expectedKeys);
      });
    });
  });
  it('should add a blog post on POST', function() {
    const newPost = {author : 'jules verne',
                     title: 'lorem ipsum',
                     content: 'lorem ipsum'
                    }; 
    return chai.request(app)
      .post('/posts')
      .send(newPost)
      .then(function(res) {
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.id.should.not.be.null; 
        res.should.include.keys('id', 'author', 'title', 'content',)
        res.body.should.deep.equal(Object.assign(newPost, {title: res.body.title}));
      });
  });
});
