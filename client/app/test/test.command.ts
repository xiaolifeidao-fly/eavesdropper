
const code = `
async function add(b, a){
    console.log("this is a test!," + (a + b));
    return a + b;
}

return async function test(a, b){
    return await add(a, b);
}

`
async function main(){
    const dynamicFunction = new Function(code)();
    const result = await dynamicFunction(3,5); 
    console.log(result);
}

main();