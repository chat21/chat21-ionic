
import * as moment from 'moment/moment';
import 'moment/locale/it.js';

//import { LABEL_ANNULLA, LABEL_OK, ARRAY_DAYS, LABEL_TODAY, LABEL_TOMORROW, LABEL_LAST_ACCESS, LABEL_TO } from './constants';

//import { TranslateService } from '@ngx-translate/core';
//import { CustomTranslateService } from './translate-service';

/**
 * Shortest description  for phone and tablet
 * Nota: eseguendo un test su desktop in realtà lo switch avviene a 921px 767px*/
export function windowsMatchMedia(){
  var mq = window.matchMedia("(max-width: 767px)");
  if (mq.matches) {
    console.log('window width is less than 767px ')
    return false;
  } else {
    console.log('window width is at least 767px')
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
export function urlify(text?, name?) {
  if(!text) return name;
  var regex = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi
  return text.replace(regex, function (url) {
    if (url.match(/^[/]/))
    {
      return;
    } 
    // else if (!url.match(/^[a-zA-Z]+:\/\//)){
    //   url = 'http://' + url;
    // }
    var label = url;
    if(name){
      label = name;
    }
    return '<a href=\"' + url + '\" target=\"_blank\">' + label + '</a>';
  })
}

// export function setUrlString(text, name) {
//   var urlRegex = /((?:(http|https|Http|Https|rtsp|Rtsp):\/\/(?:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,64}(?:\:(?:[a-zA-Z0-9\$\-\_\.\+\!\*\'\(\)\,\;\?\&\=]|(?:\%[a-fA-F0-9]{2})){1,25})?\@)?)?((?:(?:[a-zA-Z0-9][a-zA-Z0-9\-]{0,64}\.)+(?:(?:aero|arpa|asia|a[cdefgilmnoqrstuwxz])|(?:biz|b[abdefghijmnorstvwyz])|(?:cat|com|coop|c[acdfghiklmnoruvxyz])|d[ejkmoz]|(?:edu|e[cegrstu])|f[ijkmor]|(?:gov|g[abdefghilmnpqrstuwy])|h[kmnrtu]|(?:info|int|i[delmnoqrst])|(?:jobs|j[emop])|k[eghimnrwyz]|l[abcikrstuvy]|(?:mil|mobi|museum|m[acdghklmnopqrstuvwxyz])|(?:name|net|n[acefgilopruz])|(?:org|om)|(?:pro|p[aefghklmnrstwy])|qa|r[eouw]|s[abcdeghijklmnortuvyz]|(?:tel|travel|t[cdfghjklmnoprtvwz])|u[agkmsyz]|v[aceginu]|w[fs]|y[etu]|z[amw]))|(?:(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9])\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[1-9]|0)\.(?:25[0-5]|2[0-4][0-9]|[0-1][0-9]{2}|[1-9][0-9]|[0-9])))(?:\:\d{1,5})?)(\/(?:(?:[a-zA-Z0-9\;\/\?\:\@\&\=\#\~\-\.\+\!\*\'\(\)\,\_])|(?:\%[a-fA-F0-9]{2}))*)?(?:\b|$)/gi;
//   return text.replace(urlRegex, function (url) {
//     if (!url.match(/^[a-zA-Z]+:\/\//))
//     {
//       url = 'http://' + url;
//     }
//     return '<a href=\"' + url + '\" target=\"_blank\">' + name + '</a>';
//   })
// }
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
export function setHeaderDate(translate, timestamp, lastDate?): string {


    var date = new Date(timestamp);
    let now: Date = new Date();

    var LABEL_TODAY = translate.get('LABEL_TODAY')['value'];
    var LABEL_TOMORROW = translate.get('LABEL_TOMORROW')['value'];

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
      labelDays = convertDayToString(translate, date.getDay());
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
  export function setLastDate(translate, timestamp): string {

      var LABEL_TODAY = translate.get('LABEL_TODAY')['value'];
      var LABEL_TOMORROW = translate.get('LABEL_TOMORROW')['value'];
      var LABEL_TO = translate.get('LABEL_TO')['value'];
      var LABEL_LAST_ACCESS = translate.get('LABEL_LAST_ACCESS')['value'];

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
        labelDays = convertDayToString(translate, date.getDay());
      }
      // aggiungo orario
      const orario = date.getHours() +":"+ date.getMinutes();
      return LABEL_LAST_ACCESS + ' ' + labelDays + ' ' + LABEL_TO + ' ' + orario;
  }


export function convertDayToString(translate, day){
  //['Lunedì', 'Martedì', 'Mercoledì','Giovedì', 'Venerdì', 'Sabato', 'Domenica'];
  var ARRAY_DAYS = translate.get('ARRAY_DAYS')['value'];
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

  var dateString = moment.unix(timestamp / 1000).format('L');

  // const date = new Date(timestamp);
  // const labelDays = date.getDay()+"/"+date.getMonth()+"/"+date.getFullYear();

  return dateString;
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
    
    //console.log("window.navigator.language: ", window.navigator.language);
   
    moment.locale(window.navigator.language);
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

export function popupUrl(html,title) {
    const url = this.strip_tags(html);
    const w = 600;
    const h = screen.height - 40;
    const left = (screen.width/2)-(w/2);
    const top = (screen.height/2)-(h/2);

    const newWindow = window.open(url,'_blank', 'fullscreen=1, titlebar=0, toolbar=no, location=0, status=0, menubar=0, scrollbars=0, resizable=0, width='+w+', height='+h+', top='+top+', left='+left);
    if (window.focus) {
      newWindow.focus()
    }
}

export function isPopupUrl(url){
    let TEMP = url.split('popup=')[1];
    // può essere seguito da & oppure "
    if (TEMP) { 
      if(TEMP.startsWith('true')) {
        //console.log('isPopupUrl::::: ', TEMP.startsWith('true'));
        return true;
      }
      else {
        return false;
      } 
    }
    else {
      return false;
    }
}

export function strip_tags(html){
    return (html.replace( /<.*?>/g, '' )).trim();
}

export function isExistInArray(members, currentUid){
  console.log("isExistInArray -- ::: ", members, currentUid);
  // let resp = false;
  // members.forEach(function(element) {
  //   console.log("element::: ", element['uid'], element);
  //   if (element['uid'] === currentUid) {
  //     resp = true;
  //     return;
  //   }
  // });   
  // return resp;
  return members.includes(currentUid);
}

export function createConfirm(translate, alertCtrl, events, title, message, action, onlyOkButton) {

  var LABEL_ANNULLA = translate.get('CLOSE_ALERT_CANCEL_LABEL')['value'];
  var LABEL_OK = translate.get('CLOSE_ALERT_CONFIRM_LABEL')['value'];

  var buttons;
  if (onlyOkButton) {
    buttons = [
      {
        text: LABEL_OK,
        handler: () => {
          events.publish('PopupConfirmation', LABEL_OK, action);
          console.log('Agree clicked');
        }
      }
    ]
  } else {
    buttons = [
      {
        text: LABEL_ANNULLA,
        handler: () => {
          events.publish('PopupConfirmation', LABEL_ANNULLA, action);
          console.log('Disagree clicked');
        }
      },
      {
        text: LABEL_OK,
        handler: () => {
          events.publish('PopupConfirmation', LABEL_OK, action);
          console.log('Agree clicked');
        }
      }
    ]
  }

  let confirm = alertCtrl.create({
    title: title,
    message: message,
    buttons,
  });
  // confirm.present();
  return confirm;
}

export function createLoading(loadinController, message) {
  let loading = loadinController.create({
    spinner: 'circles',
    content: message,
  });
  // this.loading.present();
  return loading;
}


export function convertMessageAndUrlify(messageText){
  messageText = convert(messageText);
  messageText = urlify(messageText);
  return messageText;
}

export function convertMessage(messageText) {
  messageText = convert(messageText);
  return messageText;
}

function convert(str) {
  //str = str.replace(/&/g, '&amp;');
  str = str.replace(/>/g, '&gt;');
  str = str.replace(/</g, '&lt;');
  str = str.replace(/"/g, '&quot;');
  str = str.replace(/'/g, '&#039;');
  return str;
}

export function replaceBr(text) {
  const newText = text.replace(/[\n\r]/g, '<br>');
  return newText;
}

export function getColorBck(str){
  var arrayBckColor = ['#fba76f', '#80d066', '#73cdd0', '#ecd074', '#6fb1e4', '#f98bae'];
  var num = 0;
  if(str){
      var code = str.charCodeAt((str.length-1));
      num = Math.round(code%arrayBckColor.length);
      console.log('************** code',str.length, code, arrayBckColor.length, num);
  }
  console.log('getColorBck------------->',str, arrayBckColor[num]);
  return arrayBckColor[num];
}

export function avatarPlaceholder(conversation_with_fullname) {
  var initials = '';
  if(conversation_with_fullname){
      var arrayName = conversation_with_fullname.split(" ");
      arrayName.forEach(member => {
          if(member.trim().length > 1 && initials.length < 3){
              initials += member.substring(0,1).toUpperCase();
          }
      });
  }
  console.log('avatarPlaceholder------------->', conversation_with_fullname, initials);
  return initials;
}


export function urlExists(url) {
  console.log("imageExists::::::"+url);
  url = "https://firebasestorage.googleapis.com/v0/b/chat-v2-dev.appspot.com/o/profiles%2F5ad5bd40c975820014ba9009%2Fthumb_photo.jpg?alt=media";
  return false;
}


export function jsonToArray(json){
  var array = [];
  Object.keys(json).forEach(e => {

    //var item = {key: "+e+", val: "+json[e]+"};
    var item = json[e];
    array.push(item);
    //console.log('key='+key +'item='+item+array);
    //console.log(`key=${e} value=${this.member.decoded[e]}`)
  });
  return array;
}

