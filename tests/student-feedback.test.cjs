const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../student.html'), 'utf8');
const start = source.indexOf('      async function hydrateCaseComments()');
const end = source.indexOf('      function isInstructorRemarkRead(', start);
const calls = [], panes = [];
const record = { id: 0, recordIdentity: { student_id: 'S1', case_no: 'DA-2026-001' } };
let response = { ok: true, comments: [{ id: 10, comment_text: 'Please correct the date.' }] };
const context = vm.createContext({
  deliveryRecords: [record],
  ApiClient: { getCaseComments: async (...args) => { calls.push(args); return response; } },
  showOptionPane: pane => panes.push(pane),
  getCommentReadToken: () => '', renderDeliveryRecordsTable() {},
  PROCEDURE_CONFIGS: {}, activeProcedureConfig: {},
});
vm.runInContext(source.slice(start, end), context);
(async () => {
  await context.hydrateCaseComments();
  assert.equal(calls[0][0], 0);
  assert.equal(record.feedbackComments[0].comment_text, 'Please correct the date.');
  await context.openInstructorFeedback(record);
  assert.equal(panes[0].feedback.comments.length, 1);
  response = { ok: false, message: 'Feedback request failed' };
  await context.openInstructorFeedback(record);
  assert.equal(panes[1].title, 'Unable to Load Feedback');
  assert.equal(panes[1].message, response.message);
  response = { ok: true, comments: [
    { id: 21, author_name: 'Instructor2', comment_text: 'change some parts', created_at: '2026-09-23 09:26:40' },
    { id: 20, author_name: 'Instructor2', comment_text: 'change some parts', created_at: '2026-09-23 09:26:12' },
    { id: 19, author_name: ' instructor2 ', comment_text: 'change some parts ', created_at: '2026-09-23 09:26:01' },
    { id: 18, author_name: 'Instructor3', comment_text: 'change some parts', created_at: '2026-09-23 09:25:00' },
    { id: 17, author_name: 'Instructor2', comment_text: 'Check the date', created_at: '2026-09-23 09:24:00' },
  ] };
  await context.openInstructorFeedback(record);
  const feedback = panes[2].feedback.comments;
  assert.equal(feedback.length, 3, 'Repeated feedback appears once; distinct authors and comments remain');
  assert.equal(feedback[0].id, 21, 'Keep the newest copy from the API ordering');
  assert.deepEqual(Array.from(feedback[0].duplicateIds), [21, 20, 19]);
  await context.openInstructorFeedback(record, true);
  assert.equal(panes[3].feedback.comments.length, 3, 'Archived feedback uses the same grouping');
  console.log('PASS: zero-ID feedback loads saved comments; request failures are visible');
})().catch(error => { console.error(error); process.exitCode = 1; });
