function createFolders() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Student List');
  const data = sheet.getDataRange().getValues();

  const team_drive_id = scriptProperties.getProperty('team_drive_id');
  
  // Create a map of existing folders in the team drive for efficient lookup
  let folderMap = {};
  let allFolders = DriveApp.getFolderById(team_drive_id).getFolders();

  while (allFolders.hasNext()) {
    let folder = allFolders.next();
    folderMap[folder.getName()] = true;
  }

  let foldersToCreate = [];

  for (let i = 0; i < data.length; i++) {
    let folderName = data[i][0];
    if (!folderMap[folderName]) {
      foldersToCreate.push(folderName);
    }
  }
  Logger.log(foldersToCreate);

  // Create folders that don't exist yet and set permissions
  const rosterSheet = ss.getSheetByName('SPED Rosters');
  const rosterData = rosterSheet.getDataRange().getValues();

  for (let name of foldersToCreate) {
    let newFolder = DriveApp.getFolderById(team_drive_id).createFolder(name);
    for (let i = 1; i < rosterData.length; i++) { // Assuming the first row contains headers
      if (rosterData[i][0] === name) {
        newFolder.addEditor(rosterData[i][1]);
        newFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.NONE, {skipUserNotification: true});
      }
    }
  }
}

function verifyPermissions() {
  const scriptProperties = PropertiesService.getScriptProperties();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('SPED Rosters');
  const data = sheet.getDataRange().getValues();

  const team_drive_id = scriptProperties.getProperty('team_drive_id');

  const allFolders = DriveApp.getFolderById(team_drive_id).getFolders();
  while (allFolders.hasNext()) {
    const folder = allFolders.next();
    for (let i = 1; i < data.length; i++) { // Assuming the first row contains headers
      if (data[i][0] === folder.getName()) {
        const userEmail = data[i][1];
        if (folder.getEditors().map(editor => editor.getEmail()).indexOf(userEmail) === -1) {
          folder.addEditor(userEmail);
        }
        folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.NONE, {skipUserNotification: true});
      }
    }
  }
}