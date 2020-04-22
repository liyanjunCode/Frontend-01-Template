
<Number> = "0" | "1" | "2" |...| "9"

<DecimalNumber> = '0' | (('1' | '2' |...| '9') <Number>*)

{/* <AdditionExpression> = <DecimalNumber>
<AdditionExpression> = <AdditionExpression>"+"<DecimalNumber> */}
{/* 两步合成一步 */}
{/* <AdditionExpression> = <DecimalNumber>  | <AdditionExpression> */}

{/* <MultiplicationExpression> = <DecimalNumber>
<MultiplicationExpression> = <MultiplicationExpression>"*"<DecimalNumber> */}
{/* 两步合成一步 */}
{/* <MultiplicationExpression> = <DecimalNumber> | <MultiplicationExpression> '*' <DecimalNumber> */}


{/* 1+ 2*3 = 1*1 + 2*3 */}

 {/* <AdditionExpression>=<MultiplicationExpression>
<AdditionExpression>= <AdditionExpression> + <MultiplicationExpression>
合并多则运算 
<AdditionExpression> = <MultiplicationExpression> | <AdditionExpression> + <MultiplicationExpression> */}

{/* || 和 && */}

{/* <LogicalExpression> = <AdditionExpression>
<LogicalExpression>= <LogicalExpression> | <LogicalExpression> || <AdditionExpression> | <LogicalExpression> ** <AdditionExpression>
合二唯一 
<LogicalExpression> = <AdditionExpression | <LogicalExpression> || <AdditionExpression> | <LogicalExpression> ** <AdditionExpression>
*/}


{/* 代码 */}
<MultiplicationExpression> = <DecimalNumber> | <MultiplicationExpression> '*' <DecimalNumber> | <MultiplicationExpression> '/' <DecimalNumber>
<AdditionExpression> = <MultiplicationExpression> | <AdditionExpression> "+" <MultiplicationExpression> | <AdditionExpression> "-" <MultiplicationExpression>
{/* 带括号的  为啥前面带DecimalNumber没想明白， 如果是括号直接<LogicalExpression>就可以了啊*/}
<primaryExpression>= <DecimalNumber> | "(" <LogicalExpression> ")"


