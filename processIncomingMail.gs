// GLOBALS
//Array of file extension which you would like to extract to Drive
var fileTypesToExtract = ['pbo', 'rar', 'zip'];
//Name of the folder in google drive i which files will be put
var folderName = 'Mission Submissions';
//Name of the label which will be applied after processing the mail message
var labelName = '@indrive';

function GmailToDrive(){
 
  //build query to search emails
  var query = '';
  //filename:jpg OR filename:tif OR filename:gif OR fileName:png OR filename:bmp OR filename:svg'; //'after:'+formattedDate+
  for(var i in fileTypesToExtract){
    query += (query === '' ?('filename:'+fileTypesToExtract[i]) : (' OR filename:'+fileTypesToExtract[i]));
  }
  query = 'in:inbox has:nouserlabels ' + query;
//  query += ' after:'+getDateNDaysBack_(1);
  var threads = GmailApp.search(query);
  var label = getGmailLabel_(labelName);
  var parentFolder;
  if(threads.length > 0){
    parentFolder = getFolder_(folderName);
  }
  var root = DriveApp.getRootFolder();
  for(var i in threads){
    var mesgs = threads[i].getMessages();
	for(var j in mesgs){
      //get attachments and messages and emails
      var attachments = mesgs[j].getAttachments();
      var bodies = mesgs[j].getPlainBody();
      var emailsAndName = mesgs[j].getFrom();
      var emails = emailsAndName.substring(emailsAndName.indexOf("<") + 1, emailsAndName.indexOf(">"));
      for(var k in attachments){
        var attachment = attachments[k];
        var attachmentName = attachments[k].getName();
//      var isDefinedType = checkIfDefinedType_(attachment);
//    	if(!isDefinedType) continue;
    	var attachmentBlob = attachment.copyBlob();
        var file = DriveApp.createFile(attachmentBlob);
        file.moveTo(parentFolder);
//      root.removeFile(file);
        var driveFileLink = "https://drive.google.com/file/d/" + file.getId() + "/view?usp=sharing";
        sendMessage(CHAT_ID, buidlMessage_(bodies, emails, attachmentName, driveFileLink));
        var sheet1 = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
        sheet1.appendRow([attachmentName, '-', '-', '-', '-', '-']);
        var greenAreasRange = sheet1.getRange("A:F");
        greenAreasRange.setHorizontalAlignment("center");
        MailApp.sendEmail(emails, 'Mission Recived', 'an admin will upload and test it asap. https://docs.google.com/spreadsheets/d/e/2PACX-1vRz762EzEcsvZ7IDDvSuXncGXUEk63v41fMwmEtkN-oz8iOGbcp4Okwm8QvQ8kH5-QMQxyw4uV32YM6/pubhtml?gid=0&single=true ');
        greenAreasRange.removeDuplicates([1]);
      }
	}
	threads[i].addLabel(label);
  }
}

//This function will get the parent folder in Google drive
function getFolder_(folderName){
  var folder;
  var fi = DriveApp.getFoldersByName(folderName);
  if(fi.hasNext()){
    folder = fi.next();
  }
  else{
    folder = DriveApp.createFolder(folderName);
    folder.setSharing(DriveApp.Access.ANYONE, DriveApp.Permission.VIEW);
  }
  return folder;
}

//getDate n days back
// n must be integer
function getDateNDaysBack_(n){
  n = parseInt(n);
  var date = new Date();
  date.setDate(date.getDate() - n);
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy/MM/dd');
}

function getGmailLabel_(name){
  var label = GmailApp.getUserLabelByName(name);
  if(!label){
	label = GmailApp.createLabel(name);
  }
  return label;
}

//this function will check for filextension type.
// and return boolean
function checkIfDefinedType_(attachment){
  var fileName = attachment.getName();
  var temp = fileName.split('.');
  var fileExtension = temp[temp.length-1].toLowerCase();
  if(fileTypesToExtract.indexOf(fileExtension) !== -1) return true;
  else return false;
}



function buidlMessage_(emailBody, senderEmail, attachmentName, FileLink){
  var ifBodyAvailable ='';
  if(emailBody.length > 3){
    ifBodyAvailable = 
`<b>
Email Body: </b>${emailBody}`
  }
  var longMessage = 
`<b><u>A new mission Received!</u></b>
  
<b>File Name:</b> ${attachmentName}

<b>Sender Email: </b>(${senderEmail})
      
<b>DL Link:</b> <a href="${FileLink}">Google Drive Link</a> 
        
<b>Spreadsheet:</b> <a href="https://docs.google.com/spreadsheets/d/10CZJU5CRl-BE1KX9NLjUYYJhcaz2E1I_0RCRQyKUX58/edit?usp=sharing">Sheet link</a>      
${ifBodyAvailable}
<tg-spoiler>@Alireza_HosseinAbady @hossein0hs @Lightning30k</tg-spoiler>

<i>Reply with '👍' and upload this mission to the server.</i>
        
<i>beep boop</i>`;
        
        return longMessage;        
}

