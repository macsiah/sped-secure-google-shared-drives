function getBearerToken() {
  const scriptProperties = PropertiesService.getScriptProperties()
  const baseURL = scriptProperties.getProperty('psURL');
  const client_id = scriptProperties.getProperty('client_id');
  const client_secret = scriptProperties.getProperty('client_secret');  
  const tokenUrl = baseURL + '/oauth/access_token/';
  const tokenCredential = Utilities.base64EncodeWebSafe(client_id + ':' + client_secret);    
  const tokenOptions = {  
    headers : {  
      Authorization: 'Basic ' + tokenCredential,  
     'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'  
    },  
    method: 'post',  
    payload: 'grant_type=client_credentials'  
  };  
  const responseToken = UrlFetchApp.fetch(tokenUrl, tokenOptions);
  const parsedToken = JSON.parse(responseToken);
  const token = parsedToken.access_token;
  const newProperties = {'accessToken' : token};
  scriptProperties.setProperties(newProperties);
  //Logger.log(scriptProperties.getProperty('accessToken'));
}