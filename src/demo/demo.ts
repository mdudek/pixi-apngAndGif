import $apngAndGif from '../pixiApngAndGif'
import {Application} from '@pixi/app';
import { Loader, LoaderResource } from '@pixi/loaders';
import { Renderer, BatchRenderer } from '@pixi/core';
import {TickerPlugin} from '@pixi/ticker';

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
        crossOrigin:''
    },
    imgs = {
        gif:'http://isparta.github.io/compare/image/dongtai/gif/1.gif',
        apng:'http://isparta.github.io/compare/image/dongtai/apng/1.png'
        // gif:'./1.gif',
        // apng:'./1.png'
    };


loader.add(imgs.gif,loadOption);
loader.add(imgs.apng,loadOption);

loader.load((progress,resources)=>{
    document.title = title;

    window['gif'] = new $apngAndGif(imgs.gif,resources);
    window['apng'] = new $apngAndGif(imgs.apng,resources);

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
