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
	.limit(20)
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
app.get('/posts', (req, res) => {
    const filters = {};
    const queryableFields = ['title','author'];
    queryableFields.forEach(field => {
        if (req.query[field]) {
            filters[field] = req.query[field];
        }
    });
    BlogPost
        .find(filters)
        .then(posts => res.json(
            BlogPost.map(posts => BlogPost.serialize())
        ))
        .catch(err => {
            console.error(err);
            res.status(500).json({message: 'Internal server error'})
        });
}); 

app.post('/posts', jsonParser, (req, res) => {
	const requiredFields = ['title', 'content', 'firstName','lastName','created'];
	for (let i=0; i<requiredFields.length; i++) {
	const field = requiredFields[i];
		if (!(field in req.body)) {
			const message = `Missing \`${field}\` in request body`
			console.error(message);
			return res.status(400).send(message);
		}
	}

	BlogPost
	.create({
		title: req.body.title,
		content: req.body.content,
		author: {firstName:req.body.firstName,lastName:req.body.lastName},
		created: req.body.created
	})
	.then(
		BlogPost => res.status(201).json(BlogPost.serialize()))
	.catch(err=> {
		res.status(500).json({message: 'internal error'});
	});
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
	const requiredFields = ['title', 'content', 'firstName','lastName', 'created']; 
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
	BlogPost.findByIdAndUpdate(req.params.id,
	  {
		id: req.params.id,
		title: req.body.title,
		author: {firstName:req.body.firstName,lastName:req.body.lastName},
		content: req.body.content,
		created: req.body.created
  	},
  	function(err) {
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



	