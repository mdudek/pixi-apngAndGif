import {getFileExtension} from'./lib/utils';
import {$omggif} from'./lib/omggif' // gif
import {decodeBuffer, uPng} from'./lib/upng'
import {Ticker} from'@pixi/ticker';
import {Sprite} from'@pixi/sprite';
import {Texture} from'@pixi/core';
import {Rectangle} from'@pixi/math'; // png

class Image {
    private temp: {
        tickerIsAdd?: Boolean;
        loop?: any;
        events: {}
    };
    private __method: {play: (loop, callback) => void };
    private __attr: {loop: number; autoPlay: boolean };
    private __status: {loops: number; time: number; status: string; frame: number };
    private ticker: Ticker;
    private sprite: Sprite;
    private textures: any;
    private framesDelay: any;

    constructor(private eSource, private resources) {
        this.init();
    }

    init() {
        this.temp = {// Temporary data
            //loop:0, // save the current number of times to be played
            //tickerIsAdd:undefined // Save whether the circular executor is added
            events: {} // Used to store events
        };

        // Attributes
        this.__attr = {
            autoPlay: true, // auto play by default
            loop: 0 // Unlimited playback by default
        };

        // method
        this.__method = {
            play: this.play // play method
        };

        // state
        this.__status = {
            status:'init', // status, default initialization (init, playing, played, pause, stop)
            frame: 0, // current frame number
            loops: 0, // The number of continuous loops, it will be cleared to 0 when stopped
            time: 0
        };

        // Loop executor
        this.ticker = new Ticker();
        this.ticker.stop();

        // Elf
        this.sprite = this.createSprite(this.eSource, this.resources);
    }

    // play
    play(loop?, callback?) {
        // Throw an error when there is no texture material
        if (!this.textures.length) {
            throw new Error('No textures available');
        }

        // When the texture material is only one frame, it will not be executed down
        if (this.textures.length === 1) {
            return;
        }

        let status = this.__status,
            attr = this.__attr,
            time = 0;

        // When the state is stopped, clear the number of plays to 0
        if (status.status ==='stop') {
            status.loops = 0;
        }

        // Set loop parameters
        loop = typeof loop ==='number'? loop: attr.loop;
        this.temp.loop = loop;
        attr.loop = loop;

        // Add an operation to the round-robin executor
        if (!this.temp.tickerIsAdd) {
            this.ticker.add(_ => {
                let elapsed = Ticker.shared.elapsedMS;
                time += elapsed;

                // Play the next frame when the frame dwell time has reached the interval frame rate
                if (time> this.framesDelay[status.frame]) {
                    status.frame++;

                    // Modify the status as executing
                    status.status ='playing';

                    // When one playback is completed, reset the playback frame to 0 and record the number of playbacks
                    if (status.frame> this.textures.length-1) {
                        status.frame = 0;
                        status.loops++;

                        // When a valid number of plays is specified and the current number of plays reaches the specified number of times, the callback will be executed to stop the playback
                        if (this.temp.loop> 0 && status.loops >= this.temp.loop) {
                            if (typeof callback ==='function') {
                                callback(status);
                            }
                            // Modify the status to be executed and stopped
                            status.status ='played';
                            this.runEvent('played', status);
                            this.stop();
                        }
                    }

                    // Modify the sprite texture material to match the current frame rate
                    this.sprite.texture = this.textures[status.frame];
                    time = 0;

                    this.runEvent('playing', status);
                }
            });
            this.temp.tickerIsAdd = true;
        }

        // Let the circular executor start execution
        this.ticker.start();
    }

    // pause
    pause() {
        this.ticker.stop();
        this.__status.status ='pause';
        this.runEvent('pause', this.__status);
    }

    // Stop playing and skip to the first frame
    stop() {
        this.ticker.stop();
        this.__status.status ='stop';
        this.runEvent('stop', this.__status);
    }

    // Jump to the specified number of frames
    jumpToFrame(frameIndex) {
        // Throw an error when there is no texture material
        if (!this.textures.length) {
            throw new Error('No textures available');
        }

        frameIndex = frameIndex <0? 0: frameIndex> this.textures.length-1? this.textures.length-1: frameIndex;

        if (typeof frameIndex ==='number') {
            this.sprite.texture = this.textures[frameIndex];
            this.__status.frame = frameIndex;
        }
    }

    // Get the total playing time
    getDuration() {const framesDelay = this.framesDelay;

        // throw an error when there is no frame time
        if (!framesDelay.length) {
            throw new Error('Picture frame time not found');
        }

        let time = 0;

        for (let i = 0, len = framesDelay.length; i <len; i++) {
            time += framesDelay[i];
        }
        return time;
    }

    // Get the total number of frames
    getFramesLength() {
        // Throw an error when there is no texture material
        if (!this.textures.length) {
            throw new Error('No textures available');
        }
        return this.textures.length;
    }

    // event
    on(type, fun) {
        switch (type) {
            case'playing':
            case'played':
            case'pause':
            case'stop':
                this.temp.events[type] = fun;
                break;
            default:
                throw new Error('Invalid event');
        }
    }

    runEvent(type, status) {
        let temp = this.temp;
        if (typeof temp.events[type] ==='function') {
            temp.events[type](status);
        }
    }

    /**
     * Create sprite
     * @param {array:string}} imgSrc image resource path
     * @param {object} resources already loaded cache resources
     * @return {object} return sprite
     */
    createSprite(eSource, resources) {
        let

            imgSrc = eSource,
            exeName = getFileExtension(imgSrc.toLocaleLowerCase());

        // If the file extension is gif or png, the corresponding name will be returned, and the other will be other.
        exeName = exeName ==='gif' || exeName ==='png'? exeName:'other';

        let funs = {
            'gif': () => {
                let gifDecodeData = this.gifResourceToTextures(resources[imgSrc]);
                this.textures = gifDecodeData.textures;
                this.framesDelay = gifDecodeData.delayTimes;
                this.play();

                // Return the sprite and set the texture material to the first image
                return new Sprite(this.textures[0]);
            },
            'png': () => {
                let pngDecodeData = this.apngResourceToTextures(resources[imgSrc]);
                this.textures = pngDecodeData.textures;
                this.framesDelay = pngDecodeData.delayTimes;
                this.play();

                // Return the sprite and set the texture material to the first image
                return new Sprite(this.textures[0]);
            },
            'other': () => {
                this.textures = [resources[imgSrc].texture];
                return new Sprite(resources[imgSrc].texture);
            }
        };
        return funs[exeName]();
    }

    /**
     * Convert apng cache resources to texture materials
     * @param {object} resource cache resource
     * @return {object} returns an object, including the duration of each frame of apng and the decoded material
     */
    apngResourceToTextures(resource) {
        let obj = {
                delayTimes: [],
                textures: []
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


        // Record the time of each frame
        upng.frames.forEach((item, index) => {
            obj.delayTimes.push(item.delay);
        });

        for (let i = 0, len = rgba.length; i <len; i++) {
            let item = rgba[i],
                data = new Uint8ClampedArray(item);

            canvas = document.createElement('canvas');
            canvas.width = pngWidth;
            canvas.height = pngHeight;
            ctx = canvas.getContext('2d');
            spriteSheet = Texture.from(canvas);

            imageData = ctx.createImageData(pngWidth, pngHeight);
            imageData.data.set(data);
            ctx.putImageData(imageData, 0, 0);

            obj.textures.push(new Texture(spriteSheet, new Rectangle(0, 0, pngWidth, pngHeight)));
        }

        // document.body.appendChild(canvas);
        return obj;
    }

    /**
     * Convert gif cache resources to texture materials
     * @param {object} resource cache resource
     * @return {object} returns an object, including the duration of each frame of apng and the decoded material
     */
    gifResourceToTextures(resource) {
        let obj = {
                delayTimes: [],
                textures: []
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


        for (let i = 0; i <gifFramesLen; i++) {
            //Get the information of each frame and save the frame delay information
            gifFrameInfo = gif.frameInfo(i);
            obj.delayTimes.push(gifFrameInfo.delay * 10);

            canvas = document.createElement('canvas');
            canvas.width = gifWidth;
            canvas.height = gifHeight;
            ctx = canvas.getContext('2d');

            //Create a blank ImageData object
            imageData = ctx.createImageData(gifWidth, gifHeight);

//The first frame Converted to RGBA value, will be assigned to the image area
            gif.decodeAndBlitFrameRGBA(i, imageData.data);

            //Put the image data created above back on the screen
            ctx.putImageData(imageData, 0, 0);

            spriteSheet = Texture.from(canvas);
            obj.textures.push(new Texture(spriteSheet, new Rectangle(0, 0, gifWidth, gifHeight)));
        }
        ;
        // document.body.appendChild(canvas);
        return obj;
    }
}

export default Image;
