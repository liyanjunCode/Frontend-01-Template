function convertStringToNumber(str, hex) {
    let arr = str.split('');
    let number = 0;
    let i=0;
    while(i < arr.length && arr[i] != '.') {
        number = number * hex;
        number += arr[i].codePointAt(0) - '0'.codePointAt(0);
        i++;
    }
    if(arr[i] === '.') {
        i++;
    }
    let fraction = 0;
    while(i < arr.length) {
        fraction += arr[i].codePointAt(0) - '0'.codePointAt(0);
        fraction = fraction / hex;
        i++;
    }
    return number + fraction
}
console.log(convertStringToNumber('1100.00110101110000101000111101011100001010001111011', 2))
