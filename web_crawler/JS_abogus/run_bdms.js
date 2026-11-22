// 模拟浏览器环境
global.window = global;
global.document = { createElement: () => ({}) };
global.location = { href: 'https://compass.jinritemai.com' };
global.navigator = { userAgent: 'Mozilla/5.0...' };
global.XMLHttpRequest = class {
    open() {}
    send() {}
    setRequestHeader() {}
};

// 加载 bdms2.js
require('./bdms2.js');

// 初始化 bdms
const config = {
    aid: 6383,
    paths: ['/shop/chance/rank-talent'],
    pageId: 1
};

window.bdms.init({
    bdms: config
});

// Hook XMLHttpRequest 来获取 a_bogus
const originalOpen = global.XMLHttpRequest.prototype.open;
global.XMLHttpRequest.prototype.open = function(method, url) {
    this._url = url;
    if (url.includes('a_bogus=')) {
        const match = url.match(/a_bogus=([^&]+)/);
        if (match) {
            console.log('Generated a_bogus:', match[1]);
            global._lastABogus = match[1];
        }
    }
    return originalOpen.apply(this, arguments);
};

// 模拟请求触发加密
const xhr = new global.XMLHttpRequest();
xhr.open('GET', 'https://compass.jinritemai.com/shop/chance/rank-talent?aid=6383');
xhr.send();

// 获取结果
setTimeout(() => {
    console.log('Last a_bogus:', global._lastABogus);
}, 100);