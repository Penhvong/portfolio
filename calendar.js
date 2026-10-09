// Khmer festival calendar: tells the site which festival theme to show today.
// Dates are the official Royal Government dates (Cambodia time), checked Oct 2026.
// Each row is [theme id, first day, last day], both days included, format YYYY-MM-DD.
// The first matching row wins, so one-day rows (Ok Om Bok) go before wider ones.
//
// EVERY YEAR: the government publishes next year's holidays in Aug-Sep. Add a new block below.
// A year that has no block still gets the two fixed-date festivals (Angkor Sankranta, Khmer New Year).
(function(){
  var FALLBACK='default';   // theme on days with no festival ('khmer-heritage' gives the sand look all year)

  var CALENDAR={
    2026:[
      ['meak-bochea',     '2026-03-02','2026-03-04'],   // full moon of Meak (about Mar 3)
      ['angkor-sankranta','2026-04-13','2026-04-13'],
      ['khmer-new-year',  '2026-04-14','2026-04-16'],
      ['visak-bochea',    '2026-04-30','2026-05-02'],   // official: May 1
      ['royal-ploughing', '2026-05-04','2026-05-06'],   // official: May 5
      ['pchum-ben',       '2026-09-26','2026-10-12'],   // 15 days, public holiday Oct 10-12
      ['kathina',         '2026-10-27','2026-11-22'],   // after the end of Buddhist Lent
      ['water-festival',  '2026-11-23','2026-11-23'],   // official: Nov 23-25
      ['ok-om-bok',       '2026-11-24','2026-11-24'],   // moon worship, middle night
      ['water-festival',  '2026-11-25','2026-11-25']
    ],
    2027:[
      ['meak-bochea',     '2027-02-19','2027-02-21'],   // full moon of Meak (about Feb 20)
      ['angkor-sankranta','2027-04-13','2027-04-13'],
      ['khmer-new-year',  '2027-04-14','2027-04-16'],
      ['visak-bochea',    '2027-05-19','2027-05-21'],   // about May 20
      ['royal-ploughing', '2027-05-23','2027-05-25'],   // about May 24
      ['pchum-ben',       '2027-09-15','2027-10-01'],   // official holiday Sep 29-Oct 1
      ['kathina',         '2027-10-16','2027-11-11'],   // approximate: check after Pchum Ben
      ['water-festival',  '2027-11-12','2027-11-12'],   // official: Nov 12-14
      ['ok-om-bok',       '2027-11-13','2027-11-13'],
      ['water-festival',  '2027-11-14','2027-11-14']
    ]
  };

  // Same every year (Gregorian dates)
  var FIXED=[['angkor-sankranta','04-13','04-13'],['khmer-new-year','04-14','04-16']];

  // Today's date in Phnom Penh as YYYY-MM-DD, so every visitor sees the festival of Cambodia's calendar
  function today(){
    try{
      var s=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Phnom_Penh',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
      if(/^\d{4}-\d{2}-\d{2}$/.test(s))return s;
    }catch(e){}
    var d=new Date(),p=function(n){return (n<10?'0':'')+n;};
    return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate());
  }

  // Theme id for a YYYY-MM-DD date
  function forDate(iso){
    var year=+String(iso).slice(0,4);
    var rows=CALENDAR[year]||FIXED.map(function(r){return [r[0],year+'-'+r[1],year+'-'+r[2]];});
    for(var i=0;i<rows.length;i++){
      if(iso>=rows[i][1]&&iso<=rows[i][2])return rows[i][0];
    }
    return FALLBACK;
  }

  window.KhmerCalendar={today:today,forDate:forDate,FALLBACK:FALLBACK,CALENDAR:CALENDAR};
})();
