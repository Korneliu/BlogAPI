const express = require('express');
const router = express.Router();
//const morgan = require('morgan');
const bodyParser = require('body-parser');

const {BlogPosts} = require('./models');

const jsonParser = bodyParser.json();
const app = express();
//not sure about 'common'
//app.use(morgan('common'));

BlogPosts.create('Space X','Falcon 12 from Space X landed on Mars',
	'Neil deGrasse Tyson','12 July 2030');
BlogPosts.create('Windows 12','Microsoft announced new Windows',
	'Lara Wilson','10 October 2024');

app.get('/blog-posts', (req, res) => {
	res.json(BlogPosts.get());
});

app.post('/blog-posts', jsonParser, (req, res) => {
	const requiredFields = ['title', 'content', 'author', 'publishDate'];
	for (let i=0; i<requiredFields.length; i++) {
	const field = requiredFields[i];
		if (!(field in req.body)) {
			const message = `Missing \`${field}\` in request body`
			console.error(message);
			return res.status(400).send(message);
		}
	}
	const item = BlogPosts.create(req.body.title, req.body.content, req.body.author,
		req.body.publishDate);
	res.status(201).json(item);
});

app.delete('/blog-posts/:id', (req, res) => {
	BlogPosts.delete(req.params.id);
	console.log(`Deleted blog post \`${req.params.id}\``);
	res.status(204).end();
})

app.put('/blog-posts/:id', jsonParser, (req, res) => {
	const requiredFields = ['title', 'content', 'author', 'publishDate']; 
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
	BlogPosts.update({
		id: req.params.id,
		title: req.body.title,
		content: req.body.content,
		author: req.body.author,
		publishDate: req.body.publishDate
  })
  res.status(204).end();
})


app.listen(process.env.PORT || 8080, () => {
	console.log(`My app should be listening on port ${process.env.PORT || 8080}`);
})
	