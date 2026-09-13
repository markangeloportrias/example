const fs = require('node:fs');
const assert = require('node:assert/strict');
require('../assets/js/philippine-time.js');
const p = PhilippineTime.parse;
for (const tz of ['UTC', 'Asia/Manila', 'America/New_York']) {
  process.env.TZ = tz;
  assert.equal(p('2026-09-13 09:19:00').toISOString(), '2026-09-13T09:19:00.000Z');
  assert.equal(p('2026-09-13T17:19:00+08:00').toISOString(), p('2026-09-13T09:19:00Z').toISOString());
  assert.equal(p('2026-09-13T17:19', true).toISOString(), '2026-09-13T09:19:00.000Z');
  assert.equal(p('2026-09-13', true).toISOString(), '2026-09-12T16:00:00.000Z');
  assert.equal(p('9/13/2026, 5:19:00 PM').toISOString(), '2026-09-13T09:19:00.000Z');
  assert.equal(Number.isNaN(p('').getTime()), true);
  const formatted = p('2026-09-13 18:30:00').toLocaleString('en-US', {timeZone: 'Asia/Manila'});
  assert.match(formatted, /9\/14\/2026, 2:30:00 AM/);
}
for (const file of ['student.html','instructor.html','admin-dashboard.html']) {
  const source = fs.readFileSync(require('node:path').join(__dirname, '..', file), 'utf8');
  for (const part of source.split('<script').slice(1)) new Function(part.slice(part.indexOf('>') + 1, part.indexOf('</script>')));
  assert.ok(source.indexOf('assets/js/philippine-time.js') < source.indexOf('assets/js/api-client.js'));
  for (const call of source.matchAll(/\.toLocale(?:String|DateString|TimeString)\([^)]*\)/g)) assert.match(call[0], /timeZone: "Asia\/Manila"/);
}
console.log('Philippine timestamp tests passed across three device timezones; page syntax passed.');
