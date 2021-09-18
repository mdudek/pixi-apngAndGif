"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _getExeName_1 = require("./lib/_getExeName"); // 用于获取路径扩展名
var _omggif_1 = require("./lib/_omggif"); // gif图片编解码
var _upng_1 = require("./lib/_upng");
var ticker_1 = require("@pixi/ticker");
var sprite_1 = require("@pixi/sprite");
var core_1 = require("@pixi/core");
var math_1 = require("@pixi/math"); // png图片编解码
var Image = /** @class */ (function () {
    function Image(esource, resources) {
        this.esource = esource;
        this.resources = resources;
        this.init();
    }
    Image.prototype.init = function () {
        this.temp = {
            //loop:0,                                       // 保存当前需要播放的次数
            //tickerIsAdd:undefined                         // 保存轮循执行器是否添加
            events: {} // 用于存放事件
        };
        // 属性
        this.__attr = {
            autoPlay: true,
            loop: 0 // 默认无限次播放
        };
        // 方法
        this.__method = {
            play: this.play // 播放方法
        };
        // 状态
        this.__status = {
            status: 'init',
            frame: 0,
            loops: 0,
            time: 0
        };
        // 循环执行器
        this.ticker = new ticker_1.Ticker();
        this.ticker.stop();
        // 精灵
        this.sprite = this.createSprite(this.esource, this.resources);
    };
    // 播放
    Image.prototype.play = function (loop, callback) {
        var _this = this;
        // 没有纹理材质时抛出错误
        if (!this.textures.length) {
            throw new Error('没有可用的textures');
        }
        // 纹理材质只有一帧时不往下执行
        if (this.textures.length === 1) {
            return;
        }
        var status = this.__status, attr = this.__attr, time = 0;
        // 当状态是停止的时候，将播放次数清0
        if (status.status === 'stop') {
            status.loops = 0;
        }
        // 设置循环参数
        loop = typeof loop === 'number' ? loop : attr.loop;
        this.temp.loop = loop;
        attr.loop = loop;
        // 为轮循执行器添加一个操作
        if (!this.temp.tickerIsAdd) {
            this.ticker.add(function (deltaTime) {
                var elapsed = ticker_1.Ticker.shared.elapsedMS;
                time += elapsed;
                // 当帧停留时间已达到间隔帧率时播放下一帧
                if (time > _this.framesDelay[status.frame]) {
                    status.frame++;
                    // 修改状态为执行中
                    status.status = 'playing';
                    // 当一次播放完成，将播放帧归0，并记录播放次数
                    if (status.frame > _this.textures.length - 1) {
                        status.frame = 0;
                        status.loops++;
                        // 当指定了有效的播放次数并且当前播放次数达到指定次数时，执行回调则停止播放
                        if (_this.temp.loop > 0 && status.loops >= _this.temp.loop) {
                            if (typeof callback === 'function') {
                                callback(status);
                            }
                            ;
                            // 修改状态为执行完成并停止
                            status.status = 'played';
                            _this.runEvent('played', status);
                            _this.stop();
                        }
                    }
                    // 修改精灵纹理材质与当前的帧率相匹配
                    _this.sprite.texture = _this.textures[status.frame];
                    time = 0;
                    _this.runEvent('playing', status);
                }
            });
            this.temp.tickerIsAdd = true;
        }
        // 让轮循执行器开始执行
        this.ticker.start();
    };
    // 暂停
    Image.prototype.pause = function () {
        var _ts = this, status = _ts.__status;
        _ts.ticker.stop();
        status.status = 'pause';
        _ts.runEvent('pause', status);
    };
    // 停止播放并跳至第一帧
    Image.prototype.stop = function () {
        var _ts = this, status = _ts.__status;
        _ts.ticker.stop();
        status.status = 'stop';
        _ts.runEvent('stop', status);
    };
    // 跳至指定的帧数
    Image.prototype.jumpToFrame = function (frameIndex) {
        var _ts = this, textures = _ts.textures;
        // 没有纹理材质时抛出错误
        if (!textures.length) {
            throw new Error('没有可用的textures');
        }
        var status = _ts.__status;
        frameIndex = frameIndex < 0 ? 0 : frameIndex > textures.length - 1 ? textures.length - 1 : frameIndex;
        if (typeof frameIndex === 'number') {
            _ts.sprite.texture = textures[frameIndex];
            status.frame = frameIndex;
        }
    };
    // 获取总播放时长
    Image.prototype.getDuration = function () {
        var framesDelay = this.framesDelay;
        // 没有帧时间时抛出错误
        if (!framesDelay.length) {
            throw new Error('未找到图片帧时间');
        }
        var time = 0;
        for (var i = 0, len = framesDelay.length; i < len; i++) {
            time += framesDelay[i];
        }
        return time;
    };
    // 获取总帧数
    Image.prototype.getFramesLength = function () {
        var _ts = this;
        // 没有纹理材质时抛出错误
        if (!_ts.textures.length) {
            throw new Error('没有可用的textures');
        }
        ;
        return _ts.textures.length;
    };
    // 事件
    Image.prototype.on = function (type, fun) {
        var _ts = this;
        switch (type) {
            case 'playing':
            case 'played':
            case 'pause':
            case 'stop':
                _ts.temp.events[type] = fun;
                break;
            default:
                throw new Error('无效的事件');
                break;
        }
    };
    Image.prototype.runEvent = function (type, status) {
        var temp = this.temp;
        if (typeof temp.events[type] === 'function') {
            temp.events[type](status);
        }
    };
    /**
     * 创建精灵
     * @param  {array:string}} imgSrc 图片资源路径
     * @param  {object} resources 已经加载的缓存资源
     * @return {object} 返回精灵
     */
    Image.prototype.createSprite = function (esource, resources) {
        var _ts = this;
        var imgSrc = esource, exeName = (0, _getExeName_1.$getExeName)(imgSrc.toLocaleLowerCase());
        // 文件扩展名为gif或png则返回对应的名称，其它反返回other
        exeName = exeName === 'gif' || exeName === 'png' ? exeName : 'other';
        var funs = {
            'gif': function () {
                var gifDecodeData = _ts.gifResourceToTextures(resources[imgSrc]);
                _ts.textures = gifDecodeData.textures;
                _ts.framesDelay = gifDecodeData.delayTimes;
                _ts.play();
                // 返回精灵并将纹理材质设置为第一帧图像
                return new sprite_1.Sprite(_ts.textures[0]);
            },
            'png': function () {
                var pngDecodeData = _ts.apngResourceToTextures(resources[imgSrc]);
                _ts.textures = pngDecodeData.textures;
                _ts.framesDelay = pngDecodeData.delayTimes;
                _ts.play();
                // 返回精灵并将纹理材质设置为第一帧图像
                return new sprite_1.Sprite(_ts.textures[0]);
            },
            'other': function () {
                _ts.textures = [resources[imgSrc].texture];
                return new sprite_1.Sprite(resources[imgSrc].texture);
            }
        };
        return funs[exeName]();
    };
    /**
     * 将apng缓存资源转换为纹理材质
     * @param  {object} resource    缓存资源
     * @return {object} 返回一个对象，包括apng的每帧时长及解码出来材质
     */
    Image.prototype.apngResourceToTextures = function (resource) {
        var _ts = this;
        var obj = {
            delayTimes: [],
            textures: []
        }, buf = new Uint8Array(resource.data), upng = (0, _upng_1.decodeBuffer)(buf), rgba = (0, _upng_1.uPng)(upng), pngWidth = upng.width, pngHeight = upng.height, pngFramesLen = upng.frames.length, spriteSheet, canvas, ctx, imageData;
        // 记录下每帧的时间
        upng.frames.forEach(function (item, index) {
            obj.delayTimes.push(item.delay);
        });
        for (var i = 0, len = rgba.length; i < len; i++) {
            var item = rgba[i], data = new Uint8ClampedArray(item);
            canvas = document.createElement('canvas');
            canvas.width = pngWidth;
            canvas.height = pngHeight;
            ctx = canvas.getContext('2d');
            spriteSheet = core_1.BaseTexture.from(canvas);
            imageData = ctx.createImageData(pngWidth, pngHeight);
            imageData.data.set(data);
            ctx.putImageData(imageData, 0, 0);
            obj.textures.push(new core_1.Texture(spriteSheet, new math_1.Rectangle(0, 0, pngWidth, pngHeight)));
        }
        // document.body.appendChild(canvas);
        return obj;
    };
    /**
     * 将gif缓存资源转换为纹理材质
     * @param  {object} resource    缓存资源
     * @return {object} 返回一个对象，包括apng的每帧时长及解码出来材质
     */
    Image.prototype.gifResourceToTextures = function (resource) {
        var _ts = this;
        var obj = {
            delayTimes: [],
            textures: []
        }, buf = new Uint8Array(resource.data), gif = new _omggif_1.$omggif(buf), gifWidth = gif.width, gifHeight = gif.height, gifFramesLen = gif.numFrames(), gifFrameInfo, spriteSheet, canvas, ctx, imageData;
        for (var i = 0; i < gifFramesLen; i++) {
            //得到每帧的信息并将帧延迟信息保存起来
            gifFrameInfo = gif.frameInfo(i);
            obj.delayTimes.push(gifFrameInfo.delay * 10);
            canvas = document.createElement('canvas');
            canvas.width = gifWidth;
            canvas.height = gifHeight;
            ctx = canvas.getContext('2d');
            //创建一块空白的ImageData对象
            imageData = ctx.createImageData(gifWidth, gifHeight);
            //将第一帧转换为RGBA值，将赋予到图像区
            gif.decodeAndBlitFrameRGBA(i, imageData.data);
            //将上面创建的图像数据放回到画面上
            ctx.putImageData(imageData, 0, 0);
            spriteSheet = core_1.BaseTexture.from(canvas);
            obj.textures.push(new core_1.Texture(spriteSheet, new math_1.Rectangle(0, 0, gifWidth, gifHeight)));
        }
        ;
        // document.body.appendChild(canvas);
        return obj;
    };
    return Image;
}());
exports.default = Image;
//# sourceMappingURL=PixiApngAndGif.js.map