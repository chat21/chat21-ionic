
import * as moment from 'moment/moment';
import 'moment/locale/it.js';

import { ARRAY_DAYS, LABEL_TODAY, LABEL_TOMORROW, LABEL_LAST_ACCESS, LABEL_TO } from './constants';




/**
 * Shortest description  for phone and tablet
 * Nota: eseguendo un test su desktop in realtà lo switch avviene a 921px*/
export function windowsMatchMedia(){
  var mq = window.matchMedia("(max-width: 1024px)");
  if (mq.matches) {
    console.log('window width is less than 1024px ')
    return false;
  } else {
    console.log('window width is at least 1024px')
    return true;
  }
}
/**
 * chiamata da ChatConversationsHandler
 * restituisce url '/conversations'
 * @param tenant 
 */
export function conversationsPathForUserId(tenant, userId){
  const urlNodeConversations = '/apps/'+tenant+'/users/'+userId+'/conversations';
  return urlNodeConversations;
}
/**
 * chiamata da ChatConversationHandler
 * restituisce url '/messages'
 */
export function conversationMessagesRef(tenant, userId){
  const urlNodeMessages = '/apps/'+tenant+'/users/'+userId+'/messages/';
  return urlNodeMessages;
}
/**
 * chiamata da ChatContactsSynchronizer
 * restituisce url '/contacts'
 */
export function contactsRef(tenant){
  const urlNodeContacts = '/apps/'+tenant+'/contacts/';
  return urlNodeContacts;
}


/**
 * restituiso indice item nell'array con uid == key 
 * @param items 
 * @param key 
 */
export function searchIndexInArrayForUid(items, key){
  return items.findIndex(i => i.uid === key);   
}
/**
 * trasforma url contenuti nel testo passato in tag <a>
 */
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
/**
 * rimuove il tag html dal testo
 * ATTUALMENTE NON USATA
 */
export function removeHtmlTags(text) {
  return text.replace(/(<([^>]+)>)/ig,"");
}
/**
 * calcolo il tempo trascorso tra due date 
 * e lo formatto come segue:
 * gg/mm/aaaa; 
 * oggi; 
 * ieri; 
 * giorno della settimana (lunedì, martedì, ecc)
 */
export function setHeaderDate(timestamp, lastDate): string {
    var date = new Date(timestamp);
    let now: Date = new Date();
    var labelDays:string = LABEL_TODAY;
    var _MS_PER_DAY = 1000 * 60 * 60 * 24;
    // Esclude l'ora ed il fuso orario
    var utc1 = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
    var utc2 = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    const days =  Math.floor((utc2 - utc1) / _MS_PER_DAY);
    // console.log('setHeaderDate days: ********************',days);
    if(days > 6){
      labelDays = date.toLocaleDateString();//date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear();
    }
    else if( days == 0 ){
      labelDays = LABEL_TODAY;
    } else if( days == 1 ){
      labelDays = LABEL_TOMORROW;
    } else {
      labelDays = convertDayToString(date.getDay());
    }
    // console.log('setHeaderDate labelDays: ********************',labelDays);
    // se le date sono diverse o la data di riferimento non è impostata
    // ritorna la data calcolata
    // altrimenti torna null 
    if (lastDate != labelDays || lastDate == null || lastDate == ''){
      return labelDays;
    } else {
      return null;
    }
  }


  
  /**
   * calcolo il tempo trascorso tra la data passata e adesso
   * utilizzata per calcolare data ultimo accesso utente
   * @param timestamp 
   */
  export function setLastDate(timestamp): string {
      var date = new Date(timestamp);
      let now: Date = new Date();
      var labelDays:string = "";
      if (now.getFullYear() != date.getFullYear()){
        labelDays = date.getDay()+"/"+date.getMonth()+"/"+date.getFullYear();
      } else if (now.getMonth() != date.getMonth()){
        labelDays = date.getDay()+"/"+date.getMonth()+"/"+date.getFullYear();
      } else if (now.getDay() == date.getDay()){
        labelDays = LABEL_TODAY;
      } else if (now.getDay() - date.getDay() == 1){
        labelDays = LABEL_TOMORROW;
      } else {
        labelDays = convertDayToString(date.getDay());
      }
      // aggiungo orario
      const orario = date.getHours() +":"+ date.getMinutes();
      return LABEL_LAST_ACCESS + ' ' + labelDays + ' ' + LABEL_TO + ' ' + orario;
  }


export function convertDayToString(day){
  //['Lunedì', 'Martedì', 'Mercoledì','Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
   return ARRAY_DAYS[day];
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

export function getFormatData(timestamp): string {
  const date = new Date(timestamp);
  const labelDays = date.getDay()+"/"+date.getMonth()+"/"+date.getFullYear();
  return labelDays;
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

  export function getSizeImg(message, MAX_WIDTH_IMAGES): any {
    const metadata = message.metadata;
    const sizeImage = {
      width: metadata.width,
      height: metadata.height
    }
    if(metadata.width && metadata.width>MAX_WIDTH_IMAGES){
      const rapporto = (metadata['width'] / metadata['height']);
      sizeImage.width = MAX_WIDTH_IMAGES;
      sizeImage.height = MAX_WIDTH_IMAGES / rapporto;
    }
    return sizeImage;
  }