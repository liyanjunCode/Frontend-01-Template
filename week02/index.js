


    // 匹配数字字面量
    let reg =/[+|-]?([0-9]*)\.?([0-9]*)/


    // utf8编码
    // function UTF8Encode(str) {
    //     let encodeStr = '';
    //     for(let item of str) {
    //         const point = item.codePointAt(0)
    //         let hexadecimal = '\\u' + point.toString(16).padStart(4, '0');
    //         const binary = item.codePointAt(0).toString(2);
    //         const len = binary.length
    //         if(hexadecimal >= '\u0000' && hexadecimal <= '\u007F') {
    //             console.log(1111, hexadecimal)
    //             encodeStr += binary.padStart(8, '0')  
    //         } else if (hexadecimal >= '\u0080' && hexadecimal <= '\u07FF') {
    //             console.log(22222)
    //             encodeStr += 110 + binary.substr(0, len).padStart(5, '0') + 10 + binary.substr(len - 1).padStart(6, '0');
    //         } else if (hexadecimal >= '\u0800' && hexadecimal <= '\uFFFF') {
    //             console.log(3333)
    //             encodeStr += 1110 + binary.substr(0, len).padStart(4, '0') + 10 + 
    //                         binary.substr(len - 11).padStart(6, '0') + 10 + binary.substr(len - 5).padStart(6, '0')
    //         } else {
    //             console.log(hexadecimal, 444)
    //             encodeStr += 11110 + binary.substr(0, len).padStart(3, '0') + 10 + 
    //                     binary.substr(len - 17).padStart(6, '0') + 10 + binary.substr(len - 5).padStart(6, '0') + 
    //                     binary.substr(len - 5).padStart(6, '0')
    //         }
    //     }
    //     return encodeStr
    // }
    // console.log(UTF8Encode('严'))