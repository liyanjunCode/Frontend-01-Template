const css = require('css')
let { layout } = require('../week07/layout.js')
const EOF = Symbol('EOF')
let curentToken = {}
let currentAttribute = null
let currentTextNode = null
let stack = [{type: 'document', children: []}]
let rules = []
function addCSSRules(text){
    const ast = css.parse(text)
    rules.push(...ast.stylesheet.rules)
}
function match(element, selector){
    // 元素没有属性或没有选择器， 没有对比的价值， 就判定为不是当前元素的style规则
    if(!selector || !element.attributes) {
        return false
    }
    // id选择器处理
    if(selector.charAt(0) == '#') {
        const attr = element.attributes.filter(attr => attr.name == 'id')[0]
        if(attr && attr.value == selector.replace('#', '')) {
            return true
        }
    } else if(selector.charAt(0) == '.') { //class 选择器处理
        const attr = element.attributes.filter(attr => attr.name == 'class')[0]
        if(attr && attr.value == selector.replace('.', '')) {
            return true
        }
    } else { //标签选择器处理
        if(element.tagName == selector) {
            return true
        }
    }
}
function specificity(selectors){
    const p = [0, 0, 0, 0]
    const selectorParts = selectors.split(' ')
    for(let part in selectorParts) {
        if(part.charAt(0) == '#') {
            p[1] += 1
        } else if(part.charAt(0) == '.'){
            p[2] += 1
        } else {
            p[3] += 1
        }
    }
    return p
}
function compare(sp1, sp2) {
    if(sp1[0] -sp2[0]) {
        return sp1[0] -sp2[0]
    }
    // 如果id选择器数值不相等，就可以计算出哪个权重大
    if(sp1[1] -sp2[1]) {
        return sp1[1] -sp2[1]
    }
    // 如果class选择器数值不相等，就可以计算出哪个权重大
    if(sp1[2] -sp2[2]) {
        return sp1[2] -sp2[2]
    }
     // 最后比较tag
    return sp1[3] -sp2[3]
}
function computedCss(element) {
    let matched = false
    // 去除一份反转的stack
    const elements = stack.slice().reverse()
    // 元素上定义computedStyle对象存储元素style样式
    if(!element.computedStyle) {
        element.computedStyle = {}
    }
    for(let rule of rules) {
        // /取出当前规则中的选择器文本， 用空格分割，反转让本身的选择器在第一位
        const selectorParts = rule.selectors[0].split(' ').reverse()
        // 先匹配元素的选择器和规则第一个， 也就是当前元素的标签是否相等， 不相等， 就不是当前元素的规则， 跳过，进行下一个对比
        if(!match(element, selectorParts[0])){
            continue
        }
        // 匹配规则
        // selectorParts [#myid, div, body]
        // elements [{div, body}]
        // 直接从父级开始对比， 符合就对比下一个选择器
        let j =1;
        for(let i=0; i<elements.length; i++) {
            if(match(elements[i], selectorParts[j])){
                j++
            }
        }
        // 如果j大于等于选择器的数量， 说明所有的标签名都命中了， 符合当前写的选择器， 此rule就是当前元素的
        if(j >= selectorParts.length){
            matched = true
        }
        if(matched){
            //计算选择器权重,因为可能写多种选择器去覆盖
            const sp = specificity(rule.selectors[0])
            const computedStyle = element.computedStyle
            for (let declaration of rule.declarations) {
                // 每一行样式都需要用一个对象存储
                if(!computedStyle[declaration.property]) {
                    computedStyle[declaration.property] = {}
                }
                // 每一条样式都有权重， 用权重对比样式优先使用哪个
                if(!computedStyle[declaration.property].specificity) {
                    computedStyle[declaration.property] = declaration.value
                    computedStyle[declaration.property].specificity = sp
                } else if(compare(computedStyle[declaration.property].specificity, sp) < 0 ){
                    // 若果计算出当前的rule权重大， 就需要覆盖原有的样式, 并覆盖权重
                    computedStyle[declaration.property] = declaration.value
                    computedStyle[declaration.property].specificity = sp
                }
            }
        }
    }
}
module.exports.parseHtml = function(html){
    let state = data
    for( char of html) {
        const index = html.indexOf(char)
        state = state(char)
    }
    state = state(EOF)
    return stack[0]
}
function emit(token) {
    let top = stack[stack.length - 1]
    if(token.type == "startTag"){
        let element = {
            type: 'element',
            tagName: token.tagName,
            children:[],
            attributes: []
        }
        for(let p in token) {
            if(p !='type' && p !='tagName'){
                element.attributes.push({name: p, value: token[p]})
            }
        }
        computedCss(element)
        layout(element)
        top.children.push(element)
        element.parent = top
        if(!token.isSelfClosing) {
            stack.push(element)
        }
        currentTextNode = null
    } else if(token.type == "endTag"){
        if(top.tagName != token.tagName) {
            throw new Error('doesn`t match')
        } else {
            // style标签解析完， 有了css文本， 就开始解析
            if(top.tagName === 'style') {
                addCSSRules(top.children[0].content)
            }
            // 在元素在栈中去除前计算位置
            layout(top)
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
        currentToken = {
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
        return afterAttributeName(char)
    } else if(char == '=') {
        return beforeAttibuteValue
    }else if(char =='\u0000'){

    } else if(char == "\'" || char =="'" || char ==">"){

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
        currentToken[currentAttribute.name] = currentAttribute.value
        emit(currentToken)
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

    } else if(char === "\"" || char === "\'" || char === "="|| char === ">"|| char === "`"){

    } else if(char === EOF){

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
        currentToken[currentAttribute.name] = currentAttribute.value
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
