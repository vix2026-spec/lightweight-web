'use strict';
const express = require('express');
const path = require('node:path');
const session = require('express-session');
const helmet = require('helmet');

const app = express();
const PORT = 3000;

if (!process.env.SESSION_SECRET) {
  console.warn('WARNING: SESSION_SECRET not set. Please create a .env file. See .env.example.');
}

app.use(helmet({ contentSecurityPolicy: false }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: false }));
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: process.env.SESSION_SECRET || 'change-this-in-production',
  cookie: {
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  }
}));

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>GCP e2-micro Deployed Successfully!</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; margin-top: 100px; background-color: #f0f2f5; }
                .card { background: white; padding: 30px; border-radius: 10px; display: inline-block; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
                h1 { color: #34a853; }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>Congratulations! The web server is running on GCP e2-micro!</h1>
                <p>This is a lightweight Node.js Express web page example.</p>
                <p><a href="/auth/login">Try the Auth Example &rarr;</a></p>
            </div>
        </body>
        </html>
    `);
});

app.use('/auth', require('./auth'));
app.use('/admin', require('./admin'));

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}...`);
});
