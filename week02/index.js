


    // 匹配数字字面量
    let reg =/[+|-]?([0-9]*)\.?([0-9]*)/


    function UTF8Encode(str) {
        let encodeStr = '';
        const dealSub = function(str, byteLen) {
            const len = str.length;
            let strLen = byteLen;
            let strArr = [];
            while(strLen-- > 0) {
                if(strLen) {
                    strArr.push(`10${str.substr(len - 6 * (3 - strLen), 6).padStart(6, '0')}`)
                } else {
                    let str1 = '';
                    for(let i=0; i<byteLen; i++) {
                        str1 += 1;
                    }
                    str1 +=0;
                    strArr.push(`${str1}${str.substring(0, len - 6 * (2 - strLen)).padStart(7 - byteLen, '0')}`)
                }
            }
            return strArr.reverse().join(' ')
        }
        for(let item of str) {
            const point = item.codePointAt(0)
            const hexadecimal = '0x' +point.toString(16)
            const binary = point.toString(2);
            const len = binary.length;
            if (hexadecimal >= 0x0000 && hexadecimal <= 0x007F){
                encodeStr += binary.padStart(8, '0')
            }else if (hexadecimal >= 0x0080 && hexadecimal <= 0x07FF) {
                encodeStr += dealSub(binary, 2) + ' '
            } else if (hexadecimal >= 0x0800 && hexadecimal <= 0xFFFF) {
                encodeStr += dealSub(binary, 3) + ' '
            } else if (hexadecimal <= 0x10FFFF) {
                encodeStr += dealSub(binary, 4) + ' '
            }
        }
        return encodeStr
    }
    // console.log(UTF8Encode('a'))
    console.log(UTF8Encode('严'))