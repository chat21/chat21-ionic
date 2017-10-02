
import * as moment from 'moment';
import 'moment/locale/it.js';


export function funcTest2(str:string): string {
    return "date_as_string";
}
export function urlify(text) {
  var urlRegex = /((?:(http|https|Http|Https|rtsp|Rtsp):\/\/(?:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,64}(?:\:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,25})?\@)?)?((?:(?:[a-zA-Z0-9][a-zA-Z0-9\-]{0,64}\.)+(?:(?:aero|arpa|asia|a[cdefgilmnoqrstuwxz])|(?:biz|b[abdefghijmnorstvwyz])|(?:cat|com|coop|c[acdfghiklmnoruvxyz])|d[ejkmoz]|(?:edu|e[cegrstu])|f[ijkmor]|(?:gov|g[abdefghilmnpqrstuwy])|h[kmnrtu]|(?:info|int|i[delmnoqrst])|(?:jobs|j[emop])|k[eghimnrwyz]|l[abcikrstuvy]|(?:mil|mobi|museum|m[acdghklmnopqrstuvwxyz])|(?:name|net|n[acefgilopruz])|(?:org|om)|(?:pro|p[aefghklmnrstwy])|qa|r[eouw]|s[abcdeghijklmnortuvyz]|(?:tel|travel|t[cdfghjklmnoprtvwz])|u[agkmsyz]|v[aceginu]|w[fs]|y[etu]|z[amw]))|(?:(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9])\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[0-9])))(?:\:\d{1,5})?)(\/(?:(?:[a-zA-Z0-9\;\/\?\:\@\&\=\#\~\-\.\+\!\*\'\(\)\,\_])|(?:\%[a-fA-F0-9]{2}))*)?(?:\b|$)/gi;
  return text.replace(urlRegex, function (url) {
    if (!url.match(/^[a-zA-Z]+:\/\//))
    {
      url = 'http://' + url;
    }
    return '<a href="' + url + '" target="_blank">' + url + '</a>';
  })
}

export function removeHtmlTags(text) {
  return text.replace(/(<([^>]+)>)/ig,"");
}

 
export function setHeaderDate(timestamp, lastDate): string {
    //if (this.isHeaderDate(timestamp)){
      
      var date = new Date(timestamp);
      let now: Date = new Date();
      var labelDays:string = "";
      //console.log('setHeaderDate **************',timestamp, lastDate, date, this);
      if (now.getFullYear() != date.getFullYear()){
        labelDays = date.getDay()+"/"+date.getMonth()+"/"+date.getFullYear();
      } else if (now.getMonth() != date.getMonth()){
        labelDays = date.getDay()+"/"+date.getMonth()+"/"+date.getFullYear();
      } else if (now.getDay() == date.getDay()){
        labelDays = "Oggi";
      } else if (now.getDay() - date.getDay() == 1){
        labelDays = "Ieri";
      } else {
        labelDays = convertDayToString(date.getDay());
      }
      // se le date sono diverse o la data di riferimento non è impostata
      // ritorna la data calcolata
      // altrimenti torna null 
      if (lastDate != labelDays || lastDate == null){
        return labelDays;
      } else {
        return null;
      }
  }

  export function setLastDate(timestamp): string {
    //if (this.isHeaderDate(timestamp)){
      var date = new Date(timestamp);
      let now: Date = new Date();
      var labelDays:string = "";
      //console.log('setHeaderDate **************',timestamp, lastDate, date, this);
      if (now.getFullYear() != date.getFullYear()){
        labelDays = date.getDay()+"/"+date.getMonth()+"/"+date.getFullYear();
      } else if (now.getMonth() != date.getMonth()){
        labelDays = date.getDay()+"/"+date.getMonth()+"/"+date.getFullYear();
      } else if (now.getDay() == date.getDay()){
        labelDays = "oggi";
      } else if (now.getDay() - date.getDay() == 1){
        labelDays = "ieri";
      } else {
        labelDays = convertDayToString(date.getDay());
      }
      // aggiungo orario
      const orario = date.getHours() +":"+ date.getMinutes();
      return "ultimo accesso " + labelDays + " alle "+orario;
  }


export function convertDayToString(day){
  let arrayDays = ['Lunedì', 'Martedì', 'Mercoledì','Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
   return arrayDays[day];
}

// function for dynamic sorting
export function compareValues(key, order='asc') {
  return function(a, b) {
    if(!a.hasOwnProperty(key) || !b.hasOwnProperty(key)) {
      // property doesn't exist on either object
      return 0; 
    }
    const varA = (typeof a[key] === 'string') ? 
      a[key].toUpperCase() : a[key];
    const varB = (typeof b[key] === 'string') ? 
      b[key].toUpperCase() : b[key];

    let comparison = 0;
    if (varA > varB) {
      comparison = 1;
    } else if (varA < varB) {
      comparison = -1;
    }
    return (
      (order == 'desc') ? (comparison * -1) : comparison
    );
  };
}

export function getNowTimestamp(){
  //console.log("timestamp:", moment().valueOf());
  return moment().valueOf();
}

export function getFromNow(timestamp): string {
    // var fullDate = new Date(this.news.date.$date)
    // console.log('FULL DATE: ', fullDate);
    // var month = '' + (fullDate.getMonth() + 1)
    // var day = '' + fullDate.getDate()
    // var year = fullDate.getFullYear()
    // var hour = '' + fullDate.getHours()
    // var min = fullDate.getMinutes()
    // var sec = fullDate.getSeconds()
    // if (month.length < 2) month = '0' + month;
    // if (day.length < 2) day = '0' + day;
    // if (hour.length < 2) hour = '0' + hour;
    // console.log('Giorno ', day)
    // console.log('Mese ', month)
    // console.log('Anno ', year)
    // console.log('Ora ', hour)
    // console.log('Min ', min)
    // console.log('Sec', sec)
    
    // this.dateFromNow = moment(year + month + day, "YYYYMMDD").fromNow()
    // let date_as_string = moment(year + month + day, "YYYYMMDD").fromNow()
    
    // let date_as_string = moment(year + "-" + month + "-" + day + " " + hour + ":" + min + ":" + sec).fromNow()
    // let date_as_string = moment("2017-07-03 08:33:37").fromNow()
    //var day = new Date(2017, 8, 16);
    //let date_as_string = moment(day);
    
    // var dateString = moment.unix(timestamp).format("MM/DD/YYYY");
    // console.log(moment(dateString).fromNow(), dateString);
    // var date = "Thu Aug 19 2017 19:58:03 GMT+0000 (GMT)";
    // console.log(moment(date).fromNow()); // 1 hour ago
    // console.log(moment.unix(1483228800).fromNow());
    // console.log(moment.unix(1501545600).fromNow());
    //console.log("timestamp: ",timestamp, " - 1483228800 - ", moment.unix(1483228800).fromNow());
    // console.log();
    
    moment.locale('it');
    let date_as_string = moment.unix(timestamp).fromNow();
    return date_as_string;
  }