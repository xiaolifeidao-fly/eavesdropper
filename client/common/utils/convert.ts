function transformArrayToObject(arr : any[]) : {[key : string]:any} {
  return arr.reduce((result : {[key : string]:any}, item : any) => {
    result[item.value] = {
      text: item.label,
      status: item.value
    }
    return result
  }, {})
}


export {
  transformArrayToObject
}