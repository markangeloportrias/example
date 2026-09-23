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
  console.log('PASS: zero-ID feedback loads saved comments; request failures are visible');
})().catch(error => { console.error(error); process.exitCode = 1; });
