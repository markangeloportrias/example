<?php
declare(strict_types=1);
require __DIR__ . '/../api/case-selection.php';
$base = ['id'=>0, 'student_id'=>'S1', 'procedure_key'=>'delivery handled', 'academic_year'=>'2026-2027', 'created_at'=>'2026-09-23 10:00:00'];
$scope = caseCommentScope($base);
foreach (['procedure_key'=>'delivery assisted', 'student_id'=>'S2', 'academic_year'=>'2025-2026', 'created_at'=>'2026-09-23 10:01:00', 'id'=>5] as $field=>$value) {
    if (caseCommentScope(array_replace($base, [$field=>$value])) === $scope) {
        throw new RuntimeException('Comments leaked across '.$field);
    }
}
if (caseCommentScope($base + ['teacher_remarks'=>'New feedback', 'record_status'=>'verified']) !== $scope) {
    throw new RuntimeException('Reviewing a record must preserve its feedback link');
}
$db = new PDO('sqlite::memory:');
$db->exec('CREATE TABLE case_comments (case_id INTEGER, record_scope TEXT, comment_text TEXT)');
$write = $db->prepare('INSERT INTO case_comments VALUES (0,?,?)');
$write->execute([$scope, 'Handled only']);
$otherScope = caseCommentScope(array_replace($base, ['procedure_key'=>'delivery assisted']));
$write->execute([$otherScope, 'Assisted only']);
$read = $db->prepare('SELECT comment_text FROM case_comments WHERE record_scope=?');
$read->execute([$scope]);
if ($read->fetchAll(PDO::FETCH_COLUMN) !== ['Handled only']) throw new RuntimeException('Duplicate numeric IDs leaked feedback');
echo "PASS: procedure, student and record scope isolates feedback with duplicate IDs\n";
