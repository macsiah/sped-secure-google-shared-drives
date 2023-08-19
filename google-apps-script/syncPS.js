function populateRosters() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('SPED Rosters');
  var queryPQ = PropertiesService.getScriptProperties().getProperty('queryRosters');
  var column_order = ['Folder','User','School','Course Number','Section Number'];
  var dataSet = fetchPSData(queryPQ);
  writeToSheet(ss, sheet, column_order, dataSet, 'roster');
}

function populateStudents() { 
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Student List');
  var queryPQ = PropertiesService.getScriptProperties().getProperty('queryStudents');
  var column_order = ['Student Name','Student Number','Grade Level','School','Latest Entry Date','SPED Start Date','Program Code'];
  var dataSet = fetchPSData(queryPQ);
  writeToSheet(ss, sheet, column_order, dataSet, 'student');
}

function fetchPSData(queryPQ) {
  const baseURL = PropertiesService.getScriptProperties().getProperty('psURL');
  var queryUrl = 'https://' + baseURL + '/ws/schema/query/' + queryPQ + '?pagesize=0';
  var queryOptions = {  
    headers: {  
      Authorization: 'Bearer ' + PropertiesService.getScriptProperties().getProperty('accessToken'),  
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },  
    method: 'post',
    muteHttpExceptions: true,
  };
  const response = UrlFetchApp.fetch(queryUrl, queryOptions);
  const responseCode = response.getResponseCode();
  if (responseCode === 200) {
    var dataAll = JSON.parse(response.getContentText());
    return dataAll['record'];
  } else {
    let error = JSON.parse(response.getContentText());
    Logger.log(error);
    getBearerToken();
    return fetchPSData(queryPQ);
  }
}

function writeToSheet(ss, sheet, column_order, dataSet, type) {
  var headerRow = column_order,
      rows = [];

  for (var i = 0; i < dataSet.length; i++) {
    let data = dataSet[i];
    let rowData = [];
    
    if(type === 'roster') {
      rowData = [
        data.folder,
        data.user,
        data.school,
        data.coursenumber,
        data.sectionnumber
      ];
    } else if(type === 'student') {
      rowData = [
        data.student_name,
        data.student_number,
        data.grade_level,
        data.school,
        data.latest_entry_date,
        data.sped_start_date,
        data.programcode
      ];
    }
    rows.push(rowData);
  }

  // Delete previous data
  var range = sheet.getRange(1,1,sheet.getLastRow(),sheet.getLastColumn());
  range.clearContent();

  // Fill sheet with data
  var len = rows.length;
  var cols = rows[0].length;
  sheet.getRange(1,1,1,cols).setValues([headerRow]);
  sheet.getRange(2,1,len,cols).setValues(rows);

  sheet.autoResizeColumns(1, sheet.getLastColumn());
}