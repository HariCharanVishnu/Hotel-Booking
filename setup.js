#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Hotel Booking Application...\n');

// Function to start a process
function startProcess(command, args, cwd, name) {
  console.log(`📦 Starting ${name}...`);
  
  const process = spawn(command, args, {
    cwd: path.resolve(cwd),
    stdio: 'pipe',
    shell: true
  });

  process.stdout.on('data', (data) => {
    console.log(`[${name}] ${data.toString().trim()}`);
  });

  process.stderr.on('data', (data) => {
    console.error(`[${name} ERROR] ${data.toString().trim()}`);
  });

  process.on('close', (code) => {
    console.log(`[${name}] Process exited with code ${code}`);
  });

  return process;
}

// Start server
const server = startProcess('npm', ['start'], './server', 'Server');

// Wait a bit then start client
setTimeout(() => {
  const client = startProcess('npm', ['run', 'dev'], './client', 'Client');
}, 2000);

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  server.kill();
  process.exit(0);
});

console.log('✅ Setup complete! Check the output above for any errors.');
console.log('🌐 Frontend: http://localhost:5173');
console.log('🔗 Backend: http://localhost:5000');
console.log('📊 Health Check: http://localhost:5000/api/health'); 