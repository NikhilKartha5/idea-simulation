import assert from 'assert';
import http from 'http';

const req = http.request({ hostname: 'localhost', port: process.env.PORT || 8080, path: '/health', method: 'GET' }, res => {
  let data='';
  res.on('data', c=> data+=c);
  res.on('end', ()=> {
    try {
      const parsed = JSON.parse(data);
      assert.equal(parsed.status, 'ok');
      console.log('Health endpoint OK');
    } catch (e) {
      console.error('Parse/assert failed', e);
      process.exitCode = 1;
    }
  });
});
req.on('error', err => { console.error('Health test failed (is gateway running?)', err.message); process.exitCode = 1; });
req.end();
