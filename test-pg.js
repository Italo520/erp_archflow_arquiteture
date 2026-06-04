const { Pool } = require('pg');

async function testPort(port, connectionString) {
  const pool = connectionString 
    ? new Pool({ connectionString })
    : new Pool();
  try {
    await pool.query('SELECT NOW()');
    console.log(`Successfully connected to port ${port} ${connectionString ? 'using connection string' : ''}`);
  } catch (err) {
    console.log(`Failed to connect to port ${port}:`, err);
  } finally {
    await pool.end();
  }
}

async function main() {
  await testPort(5436, 'postgresql://postgres:postgres@localhost:5436/archflow?schema=public');
  await testPort(5432, 'postgresql://postgres:postgres@localhost:5432/archflow?schema=public');
  await testPort('default', undefined);
}

main();
