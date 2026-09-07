import { spawn } from 'child_process';

console.log('🚀 Starting GreenRoute Navigator (Backend + Frontend)...');

// Start Express Auth Backend Server
const server = spawn('node', ['server/index.js'], { 
  stdio: 'inherit', 
  shell: true,
  env: { ...process.env }
});

// Start Vite Frontend Dev Server
const client = spawn('npx', ['vite'], { 
  stdio: 'inherit', 
  shell: true,
  env: { ...process.env }
});

const cleanup = () => {
  server.kill();
  client.kill();
  process.exit();
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
