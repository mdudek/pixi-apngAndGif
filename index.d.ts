declare module '@mdudek/pixi-apngandgif' {
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
  export { Image };

}
