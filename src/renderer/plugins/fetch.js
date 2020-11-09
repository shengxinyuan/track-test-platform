import { baseUrl } from '../config/constants'

export default async({
  url = '',
  data = {},
  type = 'GET',
  headers = {}
}) => {
  type = type.toUpperCase();
  url = baseUrl + url;

  if (type == 'GET') {
    //数据拼接字符串
    let dataStr = ''; 
    Object.keys(data).forEach(key => {
      dataStr += key + '=' + data[key] + '&';
    })
    
    if (dataStr !== '') {
      dataStr = dataStr.substr(0, dataStr.lastIndexOf('&'));
      url = url + '?' + dataStr;
    }
  }

  let requestConfig = {
    credentials: 'include',//为了在当前域名内自动发送 cookie (必须)
    method: type,
    headers: Object.assign({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }, headers),
    mode: 'cors',//请求的模式
    cache: 'force-cache'
  }

  if (type == 'POST') {
    Object.assign(requestConfig, {
      body: JSON.stringify(data)
    })
  }
  
  try {
    const response = await fetch(url, requestConfig);
    const responseJson = await response.json();
    return responseJson
  } catch (error) {
    console.log('error');
    throw new Error(error)
  }
}