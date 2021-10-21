//简单实现防抖函数

//连续触发在最后一个执行方法，场景：输入框匹配

let debounce = (fn, time = 2000) => {
    let timeLock = null;
    // fn()
    return function(...args) {
        console.log(...args);
        clearTimeout(timeLock); // 清空定时器
        timeLock = setTimeout(fn(...args), time); //创建定时器
    };
};




//简单实现节流
//在一定时间内只触发一次  场景：长列表滚动节流

let throttle = (fn, time = 2000) => {
    let flag = true
    return function(...args) {
        if (flag) {
            flag = false
            setTimeout(() => {
                flag = true
                fn(...args)
            }, time)
        }
    }
}