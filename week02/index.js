// let arr = [0.1, -0.1, +0.1, -.1, +.1, 1, +1, -1, 1.0, -1.0, +1.0, 1.02, -1.02, +1.02 ]
// let reg = /[+|-]?([0-9]*)\.?([0-9]*)/
// let arr1 = arr.map((item, i) => {
    
//     console.log(item.toString().match(reg), i)
//     console.log(RegExp.$1, RegExp.$2, RegExp.$3, `a${i}b`)
//     return [RegExp.$1, RegExp.$2]
// })
// utf8编码
function UTF8Encode(str) {
    let encodeStr = '';
    for(let item of str) {
        0000 0080
        0080 0800
        
        // item.codePointAt(0).toString(16).padStart(4, '0')
        const binary = item.codePointAt(0).toString(2);
        const byteNum = Math.ceil(binary.length / 4);
            console.log(binary.length / 4, 111)
        // encodeStr += `\\u}`
    }
    return encodeStr
}
    console.log(UTF8Encode('严'))