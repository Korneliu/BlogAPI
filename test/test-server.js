'use strict'
const chai = require('chai');
const chaiHttp = require('chai-http');
const {app, runServer, closeServer} = require('../server');
const should = chai.should();
chai.use(chaiHttp);

describe('post', function() {
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
        res.body.length.should.be.above(0);
        /*res.body.forEach(function(item) {
          item.should.be.a('object');
          item.should.have.all.keys('id','author','title','content','created');
        });*/
      });
    });
 
  it('should add a blog post on POST', function() {
    const newPost = {author : 'jules verne',
                     title: 'five weeks',
                     content: 'lorem ipsum'
                    }; 
    return chai.request(app)
      .post('/posts')
      .send(newPost)
      .then(function(res) {
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.be.a('object');
        res.should.include.keys('author', 'title', 'content',);
        res.body.author.should.equal(newPost.author);
        res.body.title.should.equal(newPost.title);
        res.body.content.should.equal(newPost.content);
      });
  });
});
