const TG_API_TOKEN = "5116831231231:AAFHwiOdasdsadjby9V73hlNSe00Tm953t0OJ9Q"; 
const TG_API_URL = "https://api.telegram.org/bot" + TG_API_TOKEN;
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwNsCMBrFyiXTgi-KI9dasdasdFyExxI3itfTQkyKE8Had7M/exec";
const CHAT_ID = "-10011741242174";
//const MP_MISSIONS_FOLDER_ID = '1-4mz_nRvgNXmasdsadT_Oc2sdas_cpT';
//var mpmissionsFolder = DriveApp.getFolderById(MP_MISSIONS_FOLDER_ID);


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

function deleteFileInFolder(myFileName, folderId) {
  var allFiles, idToDLET, myFolder, rtrnFromDLET, thisFile;

  myFolder = DriveApp.getFolderById(folderId);

  allFiles = myFolder.getFilesByName(myFileName);

  while (allFiles.hasNext()) {//If there is another element in the iterator
    thisFile = allFiles.next();
    idToDLET = thisFile.getId();
    //Logger.log('idToDLET: ' + idToDLET);

    rtrnFromDLET = Drive.Files.remove(idToDLET);
  };
};

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
  testLog(replyToEntities);
  var thankyouText = `Mission will be uploaded by ${firstName}`;
  var newText =`${replyToText}\n\n${thankyouText}`;

  var indexOfThankyou = newText.lastIndexOf("Mission will");
    //Gets mission name from replyToText
    var missionName = replyToText.substring(      
      replyToText.indexOf("Name") + 6, 
      replyToText.indexOf("Sender")
    ).trim();
      var emailAdress = replyToText.substring(      
      replyToText.indexOf('(') +1 , 
      replyToText.indexOf(')')
    );
  var newEntities = [{offset:indexOfThankyou, length:thankyouText.length, type:'bold'},{"offset":indexOfThankyou, "length":thankyouText.length, "type":"underline"},{"offset":indexOfThankyou, "length":thankyouText.length, "type":"italic"}];
  var mergedEntities =replyToEntities.concat(newEntities);
  var fileLink = mergedEntities[6].url;
  var fileId = fileLink.substring(      
    fileLink.indexOf("/d/") + 3, 
    fileLink.indexOf("/view")
  );
  if (text=='\ud83d\udc4d' && replyToUsername == 'missionSubmissionBot') {
    deleteMessage(groupId, messageId);
    sendMessage(chat_id, 'thanks for the upload');
    editMessageText(groupId, replyToMessageId, newText, JSON.stringify(mergedEntities));
    replaceRow (missionName,'yes', 'B');
    var update_objects = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("update_objects");
    update_objects.appendRow([json]);
    //deleteFileInFolder(missionName, MP_MISSIONS_FOLDER_ID); 
    //var file = DriveApp.getFileById(fileId);
    //file.moveTo(mpmissionsFolder);
    MailApp.sendEmail(emailAdress, 'Mission Was Uploaded', `Your mission was uploaded to the server by ${firstName}`);
  }
}
