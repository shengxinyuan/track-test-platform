function parseUrl(url) {
  let arr = url.split('&')
  // console.log(arr);
  let obj = {}
  arr.forEach(val => {
    if (/\=/.test(val)) {
      val.replace(/(\w+)=(\S*)/g, (_, key, value) => {
        return (obj[key] = value)
      })
    }
  });
  // url.replace(/(\w+)=(\S*)/g, (_, key, value) => {
  //   return (obj[key] = value)
  // })
  return obj
}

export default parseUrl