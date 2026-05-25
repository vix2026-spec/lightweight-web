const express = require('express');
const app = express();
const PORT = 3000; // Use port 3000 when running without sudo privileges

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
            </div>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}...`);
});
