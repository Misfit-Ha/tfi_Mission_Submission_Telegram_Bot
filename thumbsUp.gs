   
const TG_API_TOKEN = "5116882161:AAFZ95i4j3g28bxovk40lz9LZGpUyEEEn1I"; 
const TG_API_URL = "https://api.telegram.org/bot" + TG_API_TOKEN;
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbz5BjKnsAX4j2du_AABn9x7WDUG91BJTBFyAr7N7h3n3McJiHBB/exec";
const CHAT_ID = "-706255843";


function setWebhook() {
  var url = TG_API_URL + "/setWebhook?url=" + WEB_APP_URL;
  var response = UrlFetchApp.fetch(url);
}

function testLog(variableToLog){
  var test_log = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("test_log");
  test_log.appendRow([variableToLog]);  
}

//http post request for sending a message
async function sendMessage(chat_id, text) {
  var url =`https://api.telegram.org/bot${TG_API_TOKEN}/sendMessage`;
  const payload = {chat_id: chat_id, parse_mode: 'HTML', text: text, disable_web_page_preview: true};
  const response = await UrlFetchApp.fetch(url, {
    method: 'POST', 
    headers: {
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify(payload) // body data type must match "Content-Type" header
  });
}

//http post request for deleting a message
async function deleteMessage(chat_id, message_id) {
  var url =`https://api.telegram.org/bot${TG_API_TOKEN}/deleteMessage`;
  const payload = {chat_id: chat_id, message_id: message_id };
  const response = await UrlFetchApp.fetch(url, {
    method: 'POST', 
    headers: {
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify(payload) // body data type must match "Content-Type" header
  });
}

//http post request for editing a message
async function editMessageText(chat_id, message_id , text, entities) {
  var url =`https://api.telegram.org/bot${TG_API_TOKEN}/editMessageText`;
  const payload = {chat_id: chat_id, message_id: message_id , text: text, entities: entities, disable_web_page_preview: true };
  const response = await UrlFetchApp.fetch(url, {
    method: 'POST', 
    headers: {
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify(payload) // body data type must match "Content-Type" header
  });
}
// finds row number and replace value of one/multiple cells
function replaceRow(findValue,val, colume) {
  var Sheet1 = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1"); 
  var lastRowEdit = Sheet1.getLastRow();
  
  for(var i = 2; i <= lastRowEdit; i++){  
   if(Sheet1.getRange(i,1).getValue() == findValue){
     Sheet1.getRange(colume + i).setValues([[val]]);     
   }    
  }
}

//every google app need to have a doPost or doGet
function doPost(e) {
  var json = e.postData.contents;
  var contents = JSON.parse(json);
  var chat_id = contents.message.from.id;
  var groupId = contents.message.chat.id;
  var firstName = contents.message.from.first_name;
  var text = contents.message.text;
  var messageId = contents.message.message_id;
  var replyToMessageId = contents.message.reply_to_message.message_id;
  var replyToUsername = contents.message.reply_to_message.from.username;
  var replyToText = contents.message.reply_to_message.text;
  var replyToEntities = contents.message.reply_to_message.entities;
  var thankyouText = `thank you ${firstName} for the upload\ud83d\udc4d\nspread sheet updated\ud83d\udc4d`;
  var newText =`${replyToText}\n\n${thankyouText}`;
  var indexOfThankyou = newText.lastIndexOf("thank");
    //Gets mission name from replyToText
    var missionName = replyToText.substring(      
      replyToText.indexOf("Name") + 6, 
      replyToText.indexOf("DL")
    ).trim();
  var newEntities = [{offset:indexOfThankyou, length:thankyouText.length, type:'bold'},{"offset":indexOfThankyou, "length":thankyouText.length, "type":"underline"},{"offset":indexOfThankyou, "length":thankyouText.length, "type":"italic"}];
  var mergedEntities =replyToEntities.concat(newEntities);
  
  
  if (text=='\ud83d\udc4d' && replyToUsername == 'missionSubmissionBot') {
    deleteMessage(groupId, messageId);
    sendMessage(chat_id, 'thanks for the upload');
    editMessageText(groupId, replyToMessageId, newText, JSON.stringify(mergedEntities));
    replaceRow (missionName,'yes', 'B');
    var update_objects = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("update_objects");
    update_objects.appendRow([json]);
  }
}
