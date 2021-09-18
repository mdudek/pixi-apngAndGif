declare class Image {
    private esource;
    private resources;
    private temp;
    private __method;
    private __attr;
    private __status;
    private ticker;
    private sprite;
    private textures;
    private framesDelay;
    constructor(esource: any, resources: any);
    init(): void;
    play(loop?: any, callback?: any): void;
    pause(): void;
    stop(): void;
    jumpToFrame(frameIndex: any): void;
    getDuration(): number;
    getFramesLength(): any;
    on(type: any, fun: any): void;
    runEvent(type: any, status: any): void;
    /**
     * 创建精灵
     * @param  {array:string}} imgSrc 图片资源路径
     * @param  {object} resources 已经加载的缓存资源
     * @return {object} 返回精灵
     */
    createSprite(esource: any, resources: any): any;
    /**
     * 将apng缓存资源转换为纹理材质
     * @param  {object} resource    缓存资源
     * @return {object} 返回一个对象，包括apng的每帧时长及解码出来材质
     */
    apngResourceToTextures(resource: any): {
        delayTimes: any[];
        textures: any[];
    };
    /**
     * 将gif缓存资源转换为纹理材质
     * @param  {object} resource    缓存资源
     * @return {object} 返回一个对象，包括apng的每帧时长及解码出来材质
     */
    gifResourceToTextures(resource: any): {
        delayTimes: any[];
        textures: any[];
    };
}
export default Image;
