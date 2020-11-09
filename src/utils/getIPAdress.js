const os = require('os');
export default function getIPAdress(){
  const interfaces = os.networkInterfaces();
  for(let devName in interfaces){
    const iFace = interfaces[devName];
    for(let i=0;i<iFace.length;i++){
      const alias = iFace[i];
      if(alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal){
        return alias.address;
      }
    }
  }
}