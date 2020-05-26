
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
            if(itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)){
                itemStyle[crossSize] = Math.max(crossSpace, itemStyle[crossSize])
            }
            flexLine.push(item)
            
        } else {
            // 如果父级元素比当前元素尺寸小， 当前元素设置为父级尺寸
            if(style[mainSize] < itemStyle[mainSize]) {
                itemStyle[mainSize] = style[mainSize]
            }
            // 如果当前元素尺寸大于剩余空间尺寸， 就需要换行
            if(mainSpace < itemStyle[mainSize]) {
                flexLine = [item];
                flexLine.mainSpace = mainSpace;
                flexLine.crossSpace = crossSpace;
                flexLines.push[flexLine];
                mainSpace = style[mainSize];
                crossSpace = 0;
            } else {
                flexLine.push(item)
            }
            if(itemStyle.crossSpace !== null || itemStyle.crossSpace !== (void 0)) {
                itemStyle.crossSpace = Math.max(crossSpace, itemStyle.crossSpace)
            }
            mainSpace = mainSpace - itemStyle[mainSize]
        }  
    }
    // 这个是单行和最后一行设置的
    flexLine.mainSpace = mainSpace
    
    if(style.flexWrap == 'noWrap' || isAutoMainSize) {
        // 单行crossSpace就是副轴的高，不存在高就默认为crossSpace
        flexLine.crossSpace = style[crossSize] != undefined ? style[crossSize] : crossSpace
    } else {
        flexLine.crossSpace = crossSpace
    }
    // 主轴尺寸计算
    if(mainSpace < 0) {
        // mainSpace小于0说明是一行，并且剩余空间不够， flex元素尺寸会被设置为0
        const scale = style[mainSize] / (style[mainSize] - mainSpace)
        let currentBase = mainBase
        for(let i=0; i<items.length; i++){
            const item = items[i];
            const itemStyle = getStyle(item)
            
            if(itemStyle.flex) {
                itemStyle[mainSize] = 0
            }
            itemStyle[mainSize] = itemStyle[mainSize] * scale;
            itemStyle[mainStart] = currentBase;
            itemStyle[mainEnd] = currentBase + mainSign * itemStyle[mainSize];
            currentBase = itemStyle[mainEnd];
        }
    } else {
        // 多行元素
        let currentBase = mainBase
        flexLines.forEach( items => {
            let mainSpace = items.mainSpace;
            let flexTotal = 0;
            for(let i=0; i<items.length; i++){
                const item = items[i];
                const itemStyle = getStyle(item)

                if(itemStyle.flex !== null && itemStyle.flex !== (void 0)) {
                    flexTotal += itemStyle.flex;
                    continue;
                }
            }
            // 说明有设置flex属性的元素
            if(flexTotal > 0) {
                let currentMain = currentBase;
                for(let i=0; i<items.length; i++){
                    const item = items[i];
                    const itemStyle = getStyle(item)
                    if(itemStyle.flex) {
                        itemStyle[mainSize] = itemStyle.flex / flexTotal * mainSpace;
                    }
                    itemStyle[mainStart] = currentBase;
                    itemStyle[mainEnd] = currentBase + mainSign * itemStyle[mainSize];
                    currentMain = itemStyle[mainEnd];
                }
                
                
            } else { // 没有设置flex属性宽度的元素
                // 看主轴是怎么布局的， 如果是flex-start和flex-end， 元素之间无空隙
                // 如果是space-around，元素之间有空隙，开头和结尾的空隙是两元素空隙的一半， 空隙个数为length
                // 如果是space-bewwen， 则只有元素间有空隙， 空隙个数是length-1
                let currentMain, step;
                if(style.justifyContent == 'flex-start') {
                    currentMain = mainBase;
                    step = 0;
                }
                if(style.justifyContent == 'flex-end') {
                    step = 0;
                    currentMain = mainBase + mainSpace * mainSign;
                }
                if(style.justifyContent == 'space-around') {
                    step = mainSpace / items.length  * mainSign;
                    currentMain = mainBase + step / 2;
                }
                if(style.justifyContent == 'space-between') {
                    step = mainSpace / (items.length - 1) * mainSign;
                    currentMain = mainBase;
                }
                if(style.justifyContent == 'center') {
                    step = 0;
                    currentMain = mainBase + mainSpace / 2 * mainSign;
                }

                for(let i=0; i<items.length; i++){
                    const item = items[i];
                    const itemStyle = getStyle(item)
                    item[mainStart, currentMain]
                    // itemStyle[mainStart] = currentMain;
                    itemStyle[mainEnd] = currentBase + mainSign * itemStyle[mainSize];
                    currentMain = itemStyle[mainEnd] + step;
                }
            }
        })
    }


    // 副轴尺寸计算, align-content是总体的对齐方式,而align-self和align-item是每一行的单独对齐方式

    // 副轴无高度， 这crossspace设置为0
    if(!style[crossSize]) {
        crossSpace = 0;
        elementStyle[crossSize] = 0;
        // 尺寸等于子元素相加
        for(let i=0; i< flexLines.length; i++) {
            const item = flexLines[i]
            elementStyle[crossSize] += item.crossSpace 
        }
    } else {
        crossSpace = style[crossSize];
        for(let i=0; i< flexLines.length; i++) {
            crossSpace -= flexLines[i].crossSpace;
        }
    }

    if(style.flexWrap == 'wrap-reverse') {
        crossBase = style[crossSize]
    } else {
        crossBase = 0;
    }
    // 每一行的高度
    let lineSize = style[crossSize]/ flexLines.length;

    let step;
    if(style.alignContent=== 'flex-start') {
        crossBase += 0
        step = 0;
    }
    if(style.alignContent=== 'flex-end') {
        crossBase += crossSpace * crossSign
        step = 0;
    }
    if(style.alignContent=== 'center') {
        crossBase += crossSpace / 2 * crossSign
        step = 0;
    }
    if(style.alignContent=== 'space-betwwen') {
        crossBase += 0;
        step = crossSpace / (flexLines.length - 1);
    }
    if(style.alignContent=== 'space-around') {
        step = crossSpace / flexLines.length;
        crossBase += crossSign * step / 2;
    }
    if(style.alignContent=== 'stretch') {
        crossBase += 0;
        step = 0;
    }
    flexLines.forEach( items => {
        // 如果父级设置stretch 有最大高限制
        let lineCrossSize = style.alignContent === 'stretch' ?
        items.crossSpace + crossSpace / flexLines.length : items.crossSpace;
        for(let i=0; i<flexLines.length; i++) {
            const item = items[i];
            // if(!item){ return}
            const itemStyle = getStyle(item);
            let align = itemStyle.alignSelf || itemStyle.alignItem;

            if(itemStyle[crossSize] == null) {
                itemStyle[crossSize] = align == 'stretch' ? lineCrossSize : 0;
            }

            if(align == 'flex-start') {
                itemStyle[crossStart] = crossBase
                itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize];
            }
            if(align == 'flex-end') {
                itemStyle[crossStart] = lineCrossSize * crossSign + crossBase 
                itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize];
            }
            if(align == 'center') {
                itemStyle[crossStart] = (lineCrossSize - itemStyle[crossSize])/ 2 * crossSign + crossBase 
                itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize];
            }
            if(align == 'stretch') {
                itemStyle[crossStart] = crossBase;
                itemStyle[crossEnd] = crossBase + crossSign * ((itemStyle[crossSize] !== null && itemStyle[cross] !==(void 0)) ? 
                itemStyle[crossSize] : lineCrossSize)
            }  
        }
        crossBase += crossSign * (lineCrossSize + step)
    })
}