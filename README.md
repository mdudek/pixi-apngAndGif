# @mdudek/pixi-apngandgif

Let Pixi.js support apng, gif images. And allow control of its operation.

### This repository is a fork of https://github.com/sbfkcel/pixi-apngAndGif

### Important changes:   
 - Depends on @pixi/* packages
 - The source code was converted to typescript 
 - Bundled by webpack 

## DEMO

- [**Use the demo**](http://jsbin.com/nodeto/edit?html,js,output)

# USE

### ES6

```bash

# Support pixi6.0+
npm install @mdudek/pixi-apngandgif
```

```javascript
import { Image } from '@mdudek/pixi-apngandgif'
import { Application } from '@pixi/app';
import { Loader, LoaderResource } from '@pixi/loaders';
import { Renderer, BatchRenderer } from '@pixi/core';
import { TickerPlugin } from '@pixi/ticker';

Application.registerPlugin(TickerPlugin);
Renderer.registerPlugin('batch', BatchRenderer);
const app = new Application({
    width: 800,
    height: 600,
    backgroundAlpha: 0,
    backgroundColor: 0x000000,
    preserveDrawingBuffer: false,
    antialias: false,
});

const loader = Loader.shared,
    title = document.title,
    loadOption = {
        loadType: LoaderResource.LOAD_TYPE.XHR,
        xhrType: LoaderResource.XHR_RESPONSE_TYPE.BUFFER,
        crossOrigin: ''
    },
    imgs = {
        gif: 'http://isparta.github.io/compare/image/dongtai/gif/1.gif',
        apng: 'http://isparta.github.io/compare/image/dongtai/apng/1.png'
        // gif:'./1.gif',
        // apng:'./1.png'
    };


loader.add(imgs.gif, loadOption);
loader.add(imgs.apng, loadOption);

loader.load((progress, resources) => {
    document.title = title;

    window['gif'] = new Image(imgs.gif, resources);
    window['apng'] = new Image(imgs.apng, resources);

    let gifSprite = window['gif'].sprite,
        apngSprite = window['apng'].sprite;

    gifSprite.x = 100;
    apngSprite.x = 450;

    gifSprite.y = 160;
    apngSprite.y = 160;

    app.stage.addChild(gifSprite);
    app.stage.addChild(apngSprite);

});

loader.onProgress.add(() => {
    document.title = Math.round(loader.progress).toString();
});

document.body.appendChild(app.view);
```

## API

### `.play(bout,callback)`

Play animation
`bout`Used to specify the number of plays
`callback`Callback executed after the specified number of plays has been completed

### `.pause()`

Pause animation

### `.stop()`

Stop animation

### `.jumpToFrame(frame)`

Jump to the specified frame

### `.getDuration()`

Get the total duration of an animation single play

### `.getFramesLength()`

Get the number of animation frames

### `.on(status,callback)`

Used to invoke the specified method in the specified phase of the animation
`status`Four states(`playing`、`played`、`pause`、`stop`)
`callback`Callback, there is a parameter. The status of the current animation is recorded.
