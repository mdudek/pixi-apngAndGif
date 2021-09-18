"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var PixiApngAndGif_1 = __importDefault(require("./PixiApngAndGif"));
var app_1 = require("@pixi/app");
var loaders_1 = require("@pixi/loaders");
var app = new app_1.Application();
var loader = loaders_1.Loader.shared, title = document.title, loadOption = {
    loadType: loaders_1.LoaderResource.LOAD_TYPE.XHR,
    xhrType: loaders_1.LoaderResource.XHR_RESPONSE_TYPE.BUFFER,
    crossOrigin: ''
}, imgs = {
    gif: 'http://isparta.github.io/compare/image/dongtai/gif/1.gif',
    apng: 'http://isparta.github.io/compare/image/dongtai/apng/1.png'
    // gif:'./1.gif',
    // apng:'./1.png'
};
loader.add(imgs.gif, loadOption);
loader.add(imgs.apng, loadOption);
loader.load(function (progress, resources) {
    document.title = title;
    window['gif'] = new PixiApngAndGif_1.default(imgs.gif, resources);
    window['apng'] = new PixiApngAndGif_1.default(imgs.apng, resources);
    var gifSprite = window['gif'].sprite, apngSprite = window['apng'].sprite;
    gifSprite.x = 100;
    apngSprite.x = 450;
    gifSprite.y = 160;
    apngSprite.y = 160;
    app.stage.addChild(gifSprite);
    app.stage.addChild(apngSprite);
});
loader.onProgress.add(function () {
    document.title = Math.round(loader.progress).toString();
});
document.body.appendChild(app.view);
//# sourceMappingURL=demo.js.map