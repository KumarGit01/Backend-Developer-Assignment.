const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const Article = require('./models/article');
const User = require('./models/user');
const Notification = require('./models/notification');
const ArticleInteraction = require('./models/articleInteraction');
const dotenv = require('dotenv')

dotenv.config()

const app = express();
const port = 3000;

const cache = {};

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0.wt87sub.mongodb.net/`)
.then(()=> console.log('mongodb connected'))
.catch((error)=>console.log(error))

app.use(bodyParser.json());

// Nodemailer sepup 
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  timeout: 300000,
});


//Id Incre
let articleId = 0;
let userId = 0;



// Endpoint to create a user (Login)
app.post('/users', async (req, res) => {
    const { name, email } = req.body; 
    const user = new User({ id: userId++, name, email });
    await user.save();
    res.status(201).send(user);
  });
  


  // Endpoint to get all articles in db
app.get('/articles', async (req, res) => {
    const articles = await Article.find({})
    res.status(201).send(articles);
  });



// Endpoint to create an article
app.post('/articles', async (req, res) => {
  const { title, author, body } = req.body;
  const article = new Article({ id: articleId++, title, author, body });
  await article.save();
  res.status(201).send(article);
});



// Endpoint to view an article
app.get('/articles/:id', async (req, res) => {
    const { id } = req.params;
  
    const article = await Article.findOne({ id });
    if (!article) {
      return res.status(404).send('Article not found');
    }
  
    article.views += 1;
    await article.save();
  
    await ArticleInteraction.findOneAndUpdate(
      { userId: req.query.userId, articleId: article._id },
      { viewed: true },
      { upsert: true, new: true }
    );
  
    cache[`article_${id}_views`] = article.views;
  
    res.send(article);
  });
  

// Endpoint to like an article
app.post('/articles/:id/like', async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  const article = await Article.findOne({ id });
  if (!article) {
    return res.status(404).send('Article not found');
  }

  article.likes += 1;
  await article.save();

  await ArticleInteraction.findOneAndUpdate(
    { userId, articleId: article._id },
    { liked: true },
    { upsert: true, new: true }
  );

  const author = await User.findOne({ _id: article.author });
  if (author && author.email) {
    const notification = new Notification({
      userId: author._id,
      articleId: article._id,
      message: `Your article "${article.title}" was liked!`,
    });
    await notification.save();

    // Send notification email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: author.email,
      subject: 'Article Liked',
      text: `Your article "${article.title}" was liked!`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Email sent: ' + info.response);
    });
  }

  cache[`article_${id}_likes`] = article.likes;

  res.send(article);
});


// Endpoint to get notifications
app.get('/notifications/:userId', async (req, res) => {
  const { userId } = req.params;

  const notifications = await Notification.find({ userId });

  res.send(notifications);
});

// Mark notifications as read
app.post('/notifications/:id/read', async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findById(id);
  if (!notification) {
    return res.status(404).send('Notification not found');
  }

  notification.read = true;
  await notification.save();

  res.send(notification);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
