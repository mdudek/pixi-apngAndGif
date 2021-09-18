import {$getExeName}  from './lib/_getExeName'        // 用于获取路径扩展名
import {$omggif} from './lib/_omggif'                // gif图片编解码
import { decodeBuffer, uPng } from './lib/_upng'
import {Ticker} from '@pixi/ticker';
import {Sprite} from '@pixi/sprite';
import {BaseTexture, Texture} from '@pixi/core';
import {Rectangle} from '@pixi/math';                  // png图片编解码

class Image{
    private esource: any;
    private resources: any;
    private temp: {
        tickerIsAdd?: Boolean;
        loop?: any;
        events: {} };
    private __method: { play: (loop, callback) => void };
    private __attr: { loop: number; autoPlay: boolean };
    private __status: { loops: number; time: number; status: string; frame: number };
    private ticker: Ticker;
    private sprite: Sprite;
    private textures: any;
    private framesDelay: any;
    constructor(esource,resources){
        this.esource = esource;
        this.resources = resources;

        this.init();
    }

    init(){
        this.temp = {                                        // 临时数据
            //loop:0,                                       // 保存当前需要播放的次数
            //tickerIsAdd:undefined                         // 保存轮循执行器是否添加
            events:{}                                       // 用于存放事件
        };

        // 属性
        this.__attr = {
            autoPlay:true,     // 默认自动播放
            loop:0             // 默认无限次播放
        };

        // 方法
        this.__method = {
            play:this.play       // 播放方法
        };

        // 状态
        this.__status = {
            status:'init',      // 状态，默认初始化（init、playing、played、pause、stop）
            frame:0,            // 当前帧数
            loops:0,            // 连续循环播放次数，停止播放会清0
            time:0
        };
        
        // 循环执行器
        this.ticker = new Ticker();
        this.ticker.stop();

        // 精灵
        this.sprite = this.createSprite(this.esource,this.resources);
    }

    // 播放
    play(loop?,callback?){
        // 没有纹理材质时抛出错误
        if(!this.textures.length){
            throw new Error('没有可用的textures');
        }

        // 纹理材质只有一帧时不往下执行
        if(this.textures.length === 1){
            return;
        }

        let status = this.__status,
            attr = this.__attr,
            time = 0;

        // 当状态是停止的时候，将播放次数清0
        if(status.status === 'stop'){
            status.loops = 0;
        }

        // 设置循环参数
        loop = typeof loop === 'number' ? loop : attr.loop;
        this.temp.loop = loop;
        attr.loop = loop;
        
        // 为轮循执行器添加一个操作
        if(!this.temp.tickerIsAdd){
            this.ticker.add(deltaTime => {
                let elapsed = Ticker.shared.elapsedMS;
                time+=elapsed;

                // 当帧停留时间已达到间隔帧率时播放下一帧
                if(time > this.framesDelay[status.frame]){
                    status.frame++;

                    // 修改状态为执行中
                    status.status = 'playing';
    
                    // 当一次播放完成，将播放帧归0，并记录播放次数
                    if(status.frame > this.textures.length - 1){
                        status.frame = 0;
                        status.loops++;
    
                        // 当指定了有效的播放次数并且当前播放次数达到指定次数时，执行回调则停止播放
                        if(this.temp.loop > 0 && status.loops >= this.temp.loop){
                            if(typeof callback === 'function'){
                                callback(status);
                            };
                            // 修改状态为执行完成并停止
                            status.status = 'played';
                            this.runEvent('played',status);
                            this.stop();
                        }
                    }
    
                    // 修改精灵纹理材质与当前的帧率相匹配
                    this.sprite.texture = this.textures[status.frame];
                    time = 0;

                    this.runEvent('playing',status);
                }
            });
            this.temp.tickerIsAdd = true;
        }
        
        // 让轮循执行器开始执行
        this.ticker.start();
    }

    // 暂停
    pause(){
        const _ts = this,
            status = _ts.__status;
        _ts.ticker.stop();
        status.status = 'pause';
        _ts.runEvent('pause',status);
    }

    // 停止播放并跳至第一帧
    stop(){
        const _ts = this,
            status = _ts.__status;
        _ts.ticker.stop();
        status.status = 'stop'; 
        _ts.runEvent('stop',status);
    }

    // 跳至指定的帧数
    jumpToFrame(frameIndex){
        const _ts = this,
            textures = _ts.textures;

        // 没有纹理材质时抛出错误
        if(!textures.length){
            throw new Error('没有可用的textures');
        }

        let status = _ts.__status;

        frameIndex = frameIndex < 0 ? 0 : frameIndex > textures.length - 1 ? textures.length - 1 : frameIndex;

        if(typeof frameIndex === 'number'){
            _ts.sprite.texture = textures[frameIndex];
            status.frame = frameIndex;
        }
    }

    // 获取总播放时长
    getDuration(){
        const framesDelay = this.framesDelay;
        
        // 没有帧时间时抛出错误
        if(!framesDelay.length){
            throw new Error('未找到图片帧时间');
        }

        let time = 0;

        for(let i=0,len=framesDelay.length; i<len; i++){
            time += framesDelay[i];
        }
        return time;
    }

    // 获取总帧数
    getFramesLength(){
        const _ts = this;
        // 没有纹理材质时抛出错误
        if(!_ts.textures.length){
            throw new Error('没有可用的textures');
        };
        return _ts.textures.length;
    }

    // 事件
    on(type,fun){
        const _ts = this;

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
    }

    runEvent(type,status){
        let temp = this.temp;
        if(typeof temp.events[type] === 'function'){
            temp.events[type](status);
        }
    }

    /**
     * 创建精灵
     * @param  {array:string}} imgSrc 图片资源路径
     * @param  {object} resources 已经加载的缓存资源
     * @return {object} 返回精灵
     */
    createSprite(esource,resources){
        const _ts = this;

        let
            
            imgSrc = esource,
            exeName = $getExeName(imgSrc.toLocaleLowerCase());
        
        // 文件扩展名为gif或png则返回对应的名称，其它反返回other
        exeName = exeName === 'gif' || exeName === 'png' ? exeName : 'other';

        let funs = {
            'gif':()=>{
                let gifDecodeData = _ts.gifResourceToTextures(resources[imgSrc]);
                _ts.textures = gifDecodeData.textures;
                _ts.framesDelay = gifDecodeData.delayTimes;
                _ts.play();

                // 返回精灵并将纹理材质设置为第一帧图像
                return new Sprite(_ts.textures[0]);
            },
            'png':()=>{
                let pngDecodeData = _ts.apngResourceToTextures(resources[imgSrc]);
                _ts.textures = pngDecodeData.textures;
                _ts.framesDelay = pngDecodeData.delayTimes;
                _ts.play();

                // 返回精灵并将纹理材质设置为第一帧图像
                return new Sprite(_ts.textures[0]);
            },
            'other':()=>{
                _ts.textures = [resources[imgSrc].texture];
                return new Sprite(resources[imgSrc].texture);
            }
        };
        return funs[exeName]();
    }

    /**
     * 将apng缓存资源转换为纹理材质
     * @param  {object} resource    缓存资源
     * @return {object} 返回一个对象，包括apng的每帧时长及解码出来材质
     */
    apngResourceToTextures(resource){
        const _ts = this;

        let obj = {
                delayTimes:[],
                textures:[]
            },
            buf = new Uint8Array(resource.data),
            upng = decodeBuffer(buf),
            rgba = uPng(upng),
            pngWidth = upng.width,
            pngHeight = upng.height,
            pngFramesLen = upng.frames.length,
            
            spriteSheet,
            canvas,
            ctx,
            imageData;

        
        
        // 记录下每帧的时间
        upng.frames.forEach((item,index)=>{
            obj.delayTimes.push(item.delay);
        });

        for(let i=0,len=rgba.length; i<len; i++){
            let item = rgba[i],
                data = new Uint8ClampedArray(item);
            
            canvas = document.createElement('canvas');
            canvas.width = pngWidth;
            canvas.height = pngHeight;
            ctx = canvas.getContext('2d');
            spriteSheet = BaseTexture.from(canvas);
            
            imageData = ctx.createImageData(pngWidth,pngHeight);
            imageData.data.set(data);
            ctx.putImageData(imageData,0,0);

            obj.textures.push(new Texture(spriteSheet,new Rectangle(0, 0, pngWidth, pngHeight)));
        }

        // document.body.appendChild(canvas);
        return obj;
    }

    /**
     * 将gif缓存资源转换为纹理材质
     * @param  {object} resource    缓存资源
     * @return {object} 返回一个对象，包括apng的每帧时长及解码出来材质
     */
    gifResourceToTextures(resource){
        const _ts = this;

        let obj = {
                delayTimes:[],
                textures:[]
            },
            buf = new Uint8Array(resource.data),
            gif = new $omggif(buf),
            gifWidth = gif.width,
            gifHeight = gif.height,
            gifFramesLen = gif.numFrames(),
            gifFrameInfo,
            
            spriteSheet,
            canvas,
            ctx,
            imageData;
        
        

        for(let i=0; i<gifFramesLen; i++){
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
            gif.decodeAndBlitFrameRGBA(i,imageData.data);

            //将上面创建的图像数据放回到画面上
            ctx.putImageData(imageData, 0, 0);

            spriteSheet = BaseTexture.from(canvas);
            obj.textures.push(new Texture(spriteSheet,new Rectangle(0, 0, gifWidth, gifHeight)));
        };
        // document.body.appendChild(canvas);
        return obj;
    }
}

export default Image;
