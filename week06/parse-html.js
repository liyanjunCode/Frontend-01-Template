
const EOF = Symbol('EOF')
let curentToken = null
let currentAttribute = null
let currentTextNode = null
let stack = [{type: 'document', children: []}]
module.exports.parseHtml = function(html){
    let state = data
    for( char of html) {
        state = state(char)
    }
    return state = state(EOF)
}
function emit(token) {
    let top = stack[stack.length - 1]
    if(token.type == "startTag"){
        let element = {
            tagName: curentToken.type,
            children:[],
            attributes: []
        }
        for(let p in token) {
            if(p !='type' && p !='tagName'){
                element.attributes.push({name: p, value: token[p]})
            }
        }
        top.children.push(element)
        if(!token.isSelfClosing) {
            stack.push(element)
        }
        currentTextNode = null
    } else if(token.type == "endTag"){
        if(top.tagName != token.tagName) {
            throw new Error('doesn`t match')
        } else {
            stack.pop()
        }
        currentTextNode = null
    } else if(token.type == 'text'){
        if(currentTextNode == null) {
            currentTextNode = {
                type: 'text',
                content: ''
            }
            top.children.push(currentTextNode)
        }
        currentTextNode.content += token.content
    }
}
function data(char) {
    if(char == '<') {
        return tagOpen
    } else if(char == EOF) {
        emit({
            type:'EOF'
        })
        return ''
    } else {
        emit({
            type: 'text',
            content: char
        })
        return data
    }
}
// 标签开始
function tagOpen(char) {
    // 结束标签
    if(char == '/') {
        return endTagOpen
        // tagname
    } else if(char.match(/^[a-zA-Z]$/)){
        currentToken = {
            type: 'startTag',
            tagName: ''
        }
        return tagName(char)
    }else {
        emit({
            type: 'text',
            content: char
        })
        return ''
    }
    
}
// 结束标签
function endTagOpen(char){
    if(char.match(/^[a-zA-Z]$/)) {
        curentToken = {
            type: 'endTag',
            tagName: ''
        }
        return tagName(char)
    } else if(char === '>') {
       
    } else if(char === EOF) {
        
    } else {
        
    }
}
// 解析标签名
function tagName(char){
    if(char.match(/^[\t\n\f ]$/)){
        return beforeAttributeName
    } else if(char == '/') {
        return selfCloseTag
    } else if(char.match(/^[a-zA-Z]$/)) {
        currentToken.tagName += char
        return tagName
    } else if(char === '>') {
        emit(currentToken)
        return data
    } else {
        currentToken.tagName += char
        return tagName
    }
}
// 解析属性名称前
function beforeAttributeName(char){
    if(char.match(/^[\t\n\f ]$/)){
        return beforeAttributeName
    } else if(char == '>' || char == '/' || char == EOF) {
        return afterAttributeName(char)
    } else if(char == '=') {
        
    } else {
        currentAttribute = {
            name: '',
            value: ''
        }
        return attributeName(char)
    }
}
// 解析属性名称
function attributeName(char) {
    if(char.match(/^[\t\n\f ]$/) || char == '/' || char ==">" || char == EOF) {
        currentAttribute.name += char
    } else if(char == '=') {
        return beforeAttibuteValue
    }else {
        currentAttribute.name += char
        return attributeName
    }
}
// 解析属性值前
function beforeAttibuteValue(char) {
    if(char.match(/^[\t\n\f ]$/) || char == '/' || char == '>' || char == EOF) {
        return beforeAttibuteValue
    }else if(char === "\'") {
        return singleAttributeValue
    } else if(char === "\"") {
        return doubleQuotedAttributeValue
    } else if(char === ">") {
        
    } else {
        return unquoteAttributeValue(char)
    }
}
// 单引号属性解析
function singleAttributeValue(char) {
    if(char == "\'") {
        currentToken[currentAttribute.name] = currentAttribute.value
        return afterQuotedAttributeValue
    }else if(char ==="\u0000") {

    } else if(char == EOF) {

    } else {
        currentAttribute.value += char
        return singleAttributeValue
    }
}
// /双引号属性解析
function doubleQuotedAttributeValue(char) {
    if(char == "\"") {
        currentToken[currentAttribute.name] = currentAttribute.value
        return afterQuotedAttributeValue
    } else if(char ==="\u0000") {

    } else if(char == EOF) {

    } else {
        currentAttribute.value += char
        return doubleQuotedAttributeValue
    }
}
// 解析完属性值
function afterQuotedAttributeValue(char) {
    if(char.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName
    } else if(char == '/') {
        return selfCloseTag
    } else if(char == '>') {
        curentToken[currentAttribute.name] = currentAttribute.value
        emit(curentToken)
        return data
    } else if(char == EOF) {

    } else {
        currentAttribute.value += char
        return doubleQuotedAttributeValue
    }
}
// 无引号属性值
function unquoteAttributeValue(char) {
    if(char.match(/^[\t\n\f ]$/)) {
        curentToken[currentAttribute.name] = currentAttribute.value
        return beforeAttributeName
    } else if(char === '/') {
        curentToken[currentAttribute.name] = currentAttribute.value
        return selfCloseTag
    } else if(char == '>') {
        curentToken[currentAttribute.name] = currentAttribute.value
        emit(curentToken)
        return data
    } else if(char =='\u0000') {

    } else if(c === "\"" || c === "\'" || c === "="|| c === ">"|| c === "`"){

    } else if(c === EOF){

    } else {
        currentAttribute.value += char
        return unquoteAttributeValue
    }
}
// 自闭和标签
function selfCloseTag(char){
    if(char == '>') {
        currentToken.isSelfClosing = true
        emit(currentToken)
        return data
    } else if( char === EOF) {
        
    } else {
       
    }
}
// 解析属性名
function afterAttributeName(char) {
    if(char.match(/^[\t\n\f ]$/)){
        return afterAttributeName
    } else if(char === '/') {
        return selfCloseTag
    }else if(char === '='){
        return beforeAttibuteValue
     } else if(char === '>'){
        currentToken[currentAttribute.name] = currentAttribute[value]
        emit(currentToken)
        return data
    } else if(char === EOF) {

    } else {
        currentToken[currentAttribute.name] = currentAttribute[value]
        currentAttribute = {
            name: '',
            value: ''
        }
        return attributeName(char)
    }
}
