
function getStyle(element){
    if(!element.style) {
        element.style = {}
    }
    // 将样式存入style中
    for(let name in element.computedStyle) {
        element.style[name] = element.computedStyle[name]
        // 如果是px 或数字， 要把字符串转为数值类型
        if(element.style[name].match(/px$/) || element.style[name].match(/^[0-9\.]+$/)) {
            element.style[name] = parseInt(element.style[name])
        }
    }
    return element.style
}

module.exports.layout = function(element){ 
    if(!element.computedStyle){ return }
    const elementStyle = getStyle(element)
    // 只处理flex布局
    if(elementStyle.display !== 'flex') {
        return
    }
    const items = element.children.filter(e => e.type == 'element')

    items.sort(function(a, b){
        return (a.order || 0) - (b.order || 0)
    })

    const style = elementStyle;
    
    ['width', 'height'].forEach( size => {
        if(style[size] == 'auto' ||  style[size] == '') {
            style[size] = null
        }
    })
    // 加默认方向
    if(!style.flexDirection || style.flexDirection == 'auto') {
        style.flexDirection = 'row'
    }
    // 加默认水平方向对齐
    if(!style.justifyContent || style.justifyContent == 'auto') {
        style.justifyContent = 'flex-start'
    }
    // 加副轴单行对齐方式
    if(!style.alignItem || style.alignItem == 'auto') {
        style.alignItem = 'stretch'
    }
    // 加副轴多行对齐方式
    if(!style.alignContent || style.alignContent == 'auto') {
        style.alignContent = 'stretch'
    }
    // 加是否换行
    if(!style.flexWrap || style.flexWrap == 'auto') {
        style.flexWrap = 'noWrap'
    }


    let mainSize,mainStart, mainEnd, mainSign,mainBase,
        crossSize, crossStart, crossEnd, crossSign, crossBase;
    if(style.flexDirection == 'row'){
        mainSize = 'width'
        mainStart = 'left'
        mainEnd = 'right'
        mainSign = +1
        mainBase= 0
        crossSize = 'height'
        crossStart = 'top'
        crossEnd = 'bottom'
    }

    if(style.flexDirection == 'row-reverse') {
        mainSize = 'width'
        mainStart = 'right'
        mainEnd = 'left'
        mainSign = -1
        mainBase= style.width

        crossSize = 'height'
        crossStart = 'top'
        crossEnd = 'bottom'
    }

    if(style.flexDirection == 'column'){
        mainSize = 'height'
        mainStart = 'top'
        mainEnd = 'bottom'
        mainSign = +1
        mainBase= 0

        crossSize = 'width'
        crossStart = 'left'
        crossEnd = 'right'
    }

    if(style.flexDirection == 'column-reverse'){
        mainSize = 'height'
        mainStart = 'bottom'
        mainEnd = 'top'
        mainSign = -1
        mainBase= style.height

        crossSize = 'width'
        crossStart = 'left'
        crossEnd = 'right'
    }
    // 处理副轴，wap反转和不反转的情况
    if(style.flexWrap == 'wrap-reverse') {
        // wrap 反转
        const tem = crossStart;
        crossStart = crossEnd
        crossEnd = tem
        crossSign = -1
    } else {
        // wrap未反转， 正常
        crossBase = 0;
        crossSign = +1
    }
    // 如果父级元素没有尺寸， 父级的尺寸就是子元素的尺寸和
    let isAutoMainSize = false
    if(!style[mainSize]) {
        elementStyle[mainSize] = 0
        for(let i=0; i< items.length; i++){
            const item = items[i]
            const itemStyle = getStyle(item)
            if(itemStyle[mainSize] !== null && itemStyle[mainSize] !== (void 0)) {
                elementStyle[mainSize] = elementStyle[mainSize] + item.style[mainSize]
            }   
        }
        isAutoMainSize = true
    }

    // 用flexLine记录一行的， flexLines记录折行的
    const flexLine = []
    const flexLines = [flexLine]
    // 主轴剩余空间
    let mainSpace = elementStyle[mainSize]
    // 副轴剩余空间
    let crossSpace = 0
    // 区分情况，将item存入flexLine 和flexLines
    for(let i=0; i< items.length; i++){ 
        const item = items[i]
        const itemStyle = getStyle(item)
        if(itemStyle[mainSize] == null) {
            itemStyle[mainSize] = 0;
        }
        if(itemStyle.flex){
            flexLine.push(item)
        } else if(itemStyle.flexWrap =='noWrap' && isAutoMainSize) {
            mainSpace = mainSpace - itemStyle[mainSize]
            if(itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0))
            flexLine.push(item)
        } else {

        }
    }

}