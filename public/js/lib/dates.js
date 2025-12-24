// /public/js/lib/dates.js
// Date helpers used across pages. All functions work with "YYYY-MM-DD" strings.

(function() {
  // Parse "YYYY-MM-DD" safely as a local calendar day (no timezone drift)
  window.parseYmd = function parseYmd(ymd) {
    if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return null;
    const [y, m, d] = ymd.split('-').map(Number);
    const dt = new Date(y, m - 1, d);
    dt.setHours(0, 0, 0, 0);
    return dt;
  };

  // Normalize a Date or string into "YYYY-MM-DD" (local, no timezone issues)
  window.toYmd = function toYmd(value) {
    if (!value) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  
  // Pretty date for UI (keeps the same calendar day everywhere)
  window.fmtNice = function fmtNice(ymd) {
    if (!ymd) return 'N/A';
    const [y, m, d] = ymd.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC'
    }).format(dt);
  };
  
  // Number of nights between two "YYYY-MM-DD" dates (minimum 1 when valid)
  window.nightsBetween = function nightsBetween(checkInYmd, checkOutYmd) {
    if (!checkInYmd || !checkOutYmd) return 0;
    // Parse dates without timezone issues
    const [inYear, inMonth, inDay] = checkInYmd.split('-').map(Number);
    const [outYear, outMonth, outDay] = checkOutYmd.split('-').map(Number);
    
    const a = new Date(inYear, inMonth - 1, inDay);
    const b = new Date(outYear, outMonth - 1, outDay);
    
    // Calculate difference in days
    const diff = (b - a) / (1000 * 60 * 60 * 24);
    return diff > 0 ? Math.floor(diff) : 0;
  };
  
  // Today as "YYYY-MM-DD" in Chad timezone (Africa/Ndjamena, UTC+1)
  window.todayYmd = function todayYmd() {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Africa/Ndjamena',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return formatter.format(now); // Returns YYYY-MM-DD in Chad time
  };

  // Get today in Chad timezone as a Date object
  window.getTodayChad = function getTodayChad() {
    const todayStr = window.todayYmd();
    return window.parseYmd(todayStr);
  };
})();
  