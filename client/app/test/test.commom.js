function generateCombinations(propPaths){
    if (propPaths.length === 0) return [];
    if (propPaths.length === 1) return propPaths[0];
    
    // 从第一个数组开始，逐步与后面的数组进行组合
    let result = [...propPaths[0]];
    
    for (let i = 1; i < propPaths.length; i++) {
        const currentArray = propPaths[i];
        const tempResult = [];
        
        // 将当前结果与新数组中的每个元素组合
        for (const existing of result) {
            for (const current of currentArray) {
                tempResult.push(`${existing};${current}`);
            }
        }
        
        result = tempResult;
    }
    
    return result;
}

const propPaths = [
    [
      '1627207:-122',  '1627207:-123',
      '1627207:-124',  '1627207:-125',
      '1627207:-126',  '1627207:-127',
    ],
    [
        '1627208:-1',  '1627208:-3',
        '1627208:-5',  '1627208:-7',
    ],
    [
        '21323:-1',  '21323:-3',
        '21323:-5',  '21323:-7',
    ]
]

const combinations = generateCombinations(propPaths);
const combinationsJson = {};
for(const combination of combinations){
    combinationsJson[combination] = combination;
}
//json 获取长度
console.log("1226:366399".includes(":366399"));