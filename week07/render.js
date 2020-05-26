const images = require('images')

// dom.children[1].children[3].children
function render(viewport, element) {
    if(element.style) {
        var img = images(element.style.width, element.style.height)
        if(element.style['background-color']) {
            let color = element.style['background-color'] || "rgba(0,0,0)";
            color.match(/rgb\((\d+),(\d+),(\d+)\)/)
            img.file(Number(RegExp.$1), Number(RegExp.$2), Number(RegExp.$3))
            viewport.draw(img, element.style.left||0, element.style.top||0 )
        }
        if(element.children) {
            for(let child of element.children) {
                render(viewport, child)
            }
        }
    }
}
module.exports = render