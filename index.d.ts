declare module 'pixi-apngandgif/lib/omggif' {
  class GifReader {
      private frames;
      private readonly loop_count;
      private readonly buf;
      width: number;
      height: number;
      constructor(buf: Uint8Array);
      numFrames(): number;
      private loopCount;
      frameInfo(frame_num: number): {
          x: number;
          y: number;
          width: number;
          height: number;
          has_local_palette: boolean;
          palette_offset: number;
          palette_size: number;
          data_offset: number;
          data_length: number;
          transparent_index: number;
          interlaced: boolean;
          delay: number;
          disposal: number;
      };
      private decodeAndBlitFrameBGRA;
      decodeAndBlitFrameRGBA(frame_num: number, pixels: Array<number>): void;
  }
  export { GifReader as $omggif };

}
declare module 'pixi-apngandgif/lib/upng' {
  export function uPng(out: any): any[];
  export function decodeBuffer(buff: any): {
      tabs: {};
      frames: any[];
      ctype: any;
      data: any;
      width: any;
      height: any;
      compress: any;
      interlace: any;
      filter: any;
  };
  export function encodeBuffer(bufs: any, w: any, h: any, ps: any, dels: any, forbidPlte: any): ArrayBufferLike;

}
declare module 'pixi-apngandgif/lib/utils' {
  export function getFileExtension(filePath: string): string;

}
declare module 'pixi-apngandgif/pixiApngAndGif' {
  import { Sprite } from '@pixi/sprite';
  class Image {
      private eSource;
      private resources;
      private temp;
      private __method;
      private __attr;
      private __status;
      private ticker;
      private textures;
      private framesDelay;
      sprite: Sprite;
      constructor(eSource: any, resources: any);
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
       * Create sprite
       * @param {array:string}} imgSrc image resource path
       * @param {object} resources already loaded cache resources
       * @return {object} return sprite
       */
      createSprite(eSource: any, resources: any): any;
      /**
       * Convert apng cache resources to texture materials
       * @param {object} resource cache resource
       * @return {object} returns an object, including the duration of each frame of apng and the decoded material
       */
      apngResourceToTextures(resource: any): {
          delayTimes: any[];
          textures: any[];
      };
      /**
       * Convert gif cache resources to texture materials
       * @param {object} resource cache resource
       * @return {object} returns an object, including the duration of each frame of apng and the decoded material
       */
      gifResourceToTextures(resource: any): {
          delayTimes: any[];
          textures: any[];
      };
  }
  export default Image;

}
