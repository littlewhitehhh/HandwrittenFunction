// 关键 ：Promise 本质是个状态机   pending fulfilled  rejected
//  then需要支持链式调用

//  创建一个Promise类

class MyPromise {
    // 属性
    state = "pending"; //状态
    value = "null"; //保存结果
    callbacks = []; //回调函数

    constructor(fn) {
        fn(this._resolve.bind(this), this._rejected.bind(this)); //fn(resolve,reject){}

        //构造实例的时候传过来的就是个fn携带了resolve和reject 两个参数   参数都是函数类型的      作用是将pending变为fulfilled或者rejected
    }

    //then方法
    // then方法返回一个新的Promise实例  不是原来的
    then(onFulfilled, onRejected) {
        //onfulfilled和onrejected 还是函数类型的参数   表示成功后或失败后执行的回调
        return new MyPromise((resolve, reject) => {
            //fn = (resolve,reject)=>{ this._handle({})}
            this._handle({
                onFulfilled: onFulfilled || null,
                onRejected: onRejected || null,
                resolve: resolve,
                reject: reject,
            });
        });
    }

    // 处理方法
    _handle(callback) {
        //callback 是个对象  状态 方法
        //状态是pending时  执行下面操作
        if (this.state === "pending") {
            this.callbacks.push(callback);
            return;
        }
        let cb =
            this.state === "fulfilled" ? callback.onFulfilled : callback.onRejected;

        if (!cb) {
            //如果then里面没有传递任何东西
            cb = this.state === "fulfilled" ? callback.resolve : callback.reject;
            cb(this.value);
            return;
        }

        let ret = cb(this.value);

        cb = this.state === "fulfilled" ? callback.resolve : callback.reject;
        cb(ret);
    }

    _resolve(value) {
        // 判断 resolve函数的参数存在并且是object类型或者function类型  then方法？
        if (value && (typeof value === "object" || typeof value === "function")) {
            var then = value.then; // ????
            if (typeof then === "function") {
                then.call(value, this._resolve.bind(this), this._rejected.bind(this));
                return;
            }
        }

        this.state = "fulfilled"; //改变状态
        this.value = value; //保存结果

        this.callbacks.forEach((callback) => this._handle(callback));
    }

    _rejected(error) {
        this.state = "reject";
        this.value = error;

        this.callbacks.forEach((callback) => this._handle(callback));
    }
}

// var p1 = new MyPromise((resolve, reject) => {
//     resolve('1')
// }).then(res => {
//     console.log(res);
// })

// promise.resolve()
//可以将任何值转为value状态时fulfilled的promise
MyPromise.resolve = function(value) {
    if (value && value instanceof MyPromise) {
        return MyPromise;
    } else if (
        value &&
        typeof value === "object" &&
        typeof value.then === "function"
    ) {
        let then = value.then;
        return new MyPromise((resolve) => {
            then(resolve);
        });
    } else if (value) {
        return new MyPromise((resolve) => {
            resolve(value);
        });
    } else {
        return new MyPromise((resolve) => {
            resolve();
        });
    }
};

//promise.reject
MyPromise.reject = function(reason) {
    return new MyPromise((resolve, reject) => {
        reject(reason);
    });
};

//promise.all
//传入所有的promise都是fulfilled，则反水他们的值所组成的，状态为fulfilled的PROMISE
//只要有一个为rejected  则返回rejected的promise ，且他的值是第一个rejected的promise值
//只要有一个promise是pengding状态，则返回一个pending状态的promise
MyPromise.all = function(promiseArr) {
    let index = 0,
        result = [];

    return new MyPromise((resolve, reject) => {
        promiseArr.forEach((item, index) => {
            MyPromise.resolve(item).then(
                (val) => {
                    index++;
                    result[i] = val;
                    if (index === promiseArr.length) {
                        resolve(result);
                    }
                },
                (err) => {
                    reject(err);
                }
            );
        });
    });
};

//promise.race
//返回一个由所有可迭代实例中第一个fulfilled或者rejected的实例包装后的promise实例
MyPromise.race = function(promiseArr) {
    return new MyPromise((resolve, reject) => {
        promiseArr.forEach((item) => {
            MyPromise.resolve(item).then(
                (val) => {
                    resolve(val);
                },
                (err) => {
                    reject(err);
                }
            );
        });
    });
};