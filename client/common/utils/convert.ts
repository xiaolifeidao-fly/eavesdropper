function transformArrayToObject(arr) {
  return arr.reduce((result, item) => {
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