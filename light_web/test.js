const http = require('http');
const { spawn } = require('child_process');

const PORT = 3000;
let server;

function startServer() {
    return new Promise((resolve, reject) => {
        server = spawn('node', ['app.js'], { stdio: 'pipe' });
        server.stdout.on('data', (data) => {
            if (data.toString().includes(PORT)) resolve();
        });
        server.stderr.on('data', (data) => reject(new Error(data.toString())));
        setTimeout(() => reject(new Error('Server start timeout')), 5000);
    });
}

function testPage() {
    return new Promise((resolve, reject) => {
        http.get(`http://localhost:${PORT}/`, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                if (res.statusCode !== 200) {
                    reject(new Error(`Expected 200, got ${res.statusCode}`));
                } else if (!body.includes('GCP e2-micro')) {
                    reject(new Error('Response missing expected content'));
                } else {
                    resolve(body);
                }
            });
        }).on('error', reject);
    });
}

async function run() {
    try {
        console.log('啟動伺服器...');
        await startServer();
        console.log('測試首頁...');
        await testPage();
        console.log('✓ 測試通過：首頁回應正常，狀態碼 200');
        server.kill();
        process.exit(0);
    } catch (err) {
        console.error('✗ 測試失敗：', err.message);
        if (server) server.kill();
        process.exit(1);
    }
}

run();
