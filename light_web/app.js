const express = require('express');
const app = express();
const PORT = 3000; // 💡 注意：沒 sudo 權限時，請改成 3000 埠

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>GCP e2-micro 成功佈署！</title>
            <style>
                body { font-family: Arial, sans-serif; text-align: center; margin-top: 100px; background-color: #f0f2f5; }
                .card { background: white; padding: 30px; border-radius: 10px; display: inline-block; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
                h1 { color: #34a853; }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>恭喜！網頁已成功在 GCP e2-micro 運行！</h1>
                <p>這是一個輕量級的 Node.js Express 網頁範例。</p>
            </div>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`伺服器正在主機埠口 ${PORT} 上運行...`);
});
