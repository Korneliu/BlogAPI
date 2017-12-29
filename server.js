const cors = require('cors');
const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const {PORT, DATABASE_URL} = require('./config');
const {BlogPost} = require('./models');
const jsonParser = bodyParser.json();
const app = express();
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
app.use(cors());

app.get('/posts', (req, res) => {
	BlogPost
	.find()
	.limit(10)
	.then(posts => {
		res.json(posts.map(post => post.serialize()));
	})
	.catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Internal server error'});
    });
});

app.get('/posts/:id', (req, res) => {
  BlogPost
    .findById(req.params.id)
    .then(post =>res.json(post.serialize()))
    .catch(err => {
      console.error(err);
        res.status(500).json({message: 'Internal server error'})
    });
});

app.post('/posts', jsonParser, (req, res) => {
	const requiredFields = ['title', 'content', 'author', 'created'];
	for (let i=0; i<requiredFields.length; i++) {
	const field = requiredFields[i];
		if (!(field in req.body)) {
			const message = `Missing \`${field}\` in request body`
			console.error(message);
			return res.status(400).send(message);
		}
	}
	const item = BlogPost.create(req.body);
	res.status(201).json(item);
});

app.delete('/posts/:id', (req, res) => {
	BlogPost
		.findByIdAndRemove(req.params.id)
		.then(() => {
			res.status(204).json({ message: 'succes'});
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({error: 'internal server error'});
		});
});


app.put('/posts/:id', jsonParser, (req, res) => {
	const requiredFields = ['title', 'content', 'author', 'created']; 
	for (let i=0; i<requiredFields.length; i++) {
		const field = requiredFields[i];
		if (!(field in req.body)) {
			const message = `Missing \`${field}\` in request body`
			console.error(message);
			return res.status(400).send(message);
		}
	}

	if (req.params.id !== req.body.id) {
		const message = `Request path id \`${req.params.id}\` and request 
		body id \`${req.body.id}\` must match `;
		console.error(message);
		return res.status(400).send(message);
	}
	console.log(`Updating blog-posts item \`${req.params.id}\``);
	BlogPost.findByIdAndUpdate(req.params.id,{
		id: req.params.id,
		title: req.body.title,
		content: req.body.content,
		created: req.body.created
  },function(err) {
  	if(err)
  		return res.status(500).send(err)
  			res.status(204).end();
  }
  ) 
});

function runServer(databaseUrl=DATABASE_URL, port=PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, { useMongoClient: true }, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
     return new Promise((resolve, reject) => {
       console.log('Closing server');
       server.close(err => {
           if (err) {
               return reject(err);
           }
           resolve();
       });
     });
  });
}

if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};



	