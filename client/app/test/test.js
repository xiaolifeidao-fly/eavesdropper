function splitArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
      let end = i + size;
      if(end > array.length){
          end = array.length;
      }
      result.push(array.slice(i, end));
  }
  return result;
}
const array = [];
for(let i = 0; i < 26; i++){
    array.push(i);
}
console.log(array);
const result = splitArray(array, 20);
console.log(result);