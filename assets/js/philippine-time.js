// System timestamps are UTC; clinical input values are Philippine wall time.
(function (root) {
  function parse(value, clinical) {
    if (value instanceof Date || typeof value === 'number') return new Date(value);
    var raw = String(value || '').trim().replace(/^(\d{4}-\d{2}-\d{2}) /, '$1T');
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) raw += 'T00:00:00+08:00';
    else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/.test(raw)) raw += clinical ? '+08:00' : 'Z';
    else if (/^\d{1,2}\/\d{1,2}\/\d{4},?\s+\d{1,2}:\d{2}/.test(raw) && !/(?:GMT|UTC|[+-]\d{2}:?\d{2})/i.test(raw)) raw += ' GMT+0800';
    return new Date(raw);
  }
  root.PhilippineTime = { parse: parse, today: function () {
    return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila', year: 'numeric', month: '2-digit', day: '2-digit' });
  } };
})(typeof window !== 'undefined' ? window : globalThis);
