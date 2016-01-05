var ObjectRenderer = require('../../renderers/webgl/utils/ObjectRenderer'),
    WebGLRenderer = require('../../renderers/webgl/WebGLRenderer'),
    CONST = require('../../const'),
    TextureShader = require('../../renderers/webgl/shaders/_TextureShader'),
    
    VertexArrayObject = require('pixi-gl-core').VertexArrayObject,
    GLBuffer = require('pixi-gl-core').GLBuffer,
    
    createIndicesForQuads = require('../../renderers/webgl/utils/createIndicesForQuads')

/**
 * @author Mat Groves
 *
 * Big thanks to the very clever Matt DesLauriers <mattdesl> https://github.com/mattdesl/
 * for creating the original pixi version!
 * Also a thanks to https://github.com/bchevalier for tweaking the tint and alpha so that they now share 4 bytes on the vertex buffer
 *
 * Heavily inspired by LibGDX's SpriteRenderer:
 * https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/graphics/g2d/SpriteRenderer.java
 */

/**
 * Renderer dedicated to drawing and batching sprites.
 *
 * @class
 * @private
 * @memberof PIXI
 * @extends PIXI.ObjectRenderer
 * @param renderer {PIXI.WebGLRenderer} The renderer this sprite batch works for.
 */
function SpriteRenderer(renderer)
{
    ObjectRenderer.call(this, renderer);

    /**
     * Number of values sent in the vertex buffer.
     * positionX, positionY, colorR, colorG, colorB = 5
     *
     * @member {number}
     */
    this.vertSize = 5;

    /**
     * The size of the vertex information in bytes.
     *
     * @member {number}
     */
    this.vertByteSize = this.vertSize * 4;

    /**
     * The number of images in the SpriteBatch before it flushes.
     *
     * @member {number}
     */
    this.size = CONST.SPRITE_BATCH_SIZE; // 2000 is a nice balance between mobile / desktop

    // the total number of bytes in our batch
    var numVerts = (this.size * 4) * this.vertByteSize;

    
    /**
     * Holds the vertex data that will be sent to the vertex shader.
     *
     * @member {ArrayBuffer}
     */
    this.vertices = new ArrayBuffer(numVerts);

    /**
     * View on the vertices as a Float32Array for positions
     *
     * @member {Float32Array}
     */
    
    //TODO test performace
    this.positions = new Float32Array(this.vertices);

    /**
     * View on the vertices as a Uint32Array for colors
     *
     * @member {Uint32Array}
     */
    this.colors = new Uint32Array(this.vertices);

    /**
     * The current size of the batch, each render() call adds to this number.
     *
     * @member {number}
     */
    this.currentBatchSize = 0;

    /**
     * The current sprites in the batch.
     *
     * @member {PIXI.Sprite[]}
     */
    this.sprites = [];

    /**
     * The default shader that is used if a sprite doesn't have a more specific one.
     *
     * @member {PIXI.Shader}
     */
    this.shader = null;


     var gl = this.renderer.gl;

    // create a couple of buffers
    this.currentBlendMode = 99999;


    var indexBuffer = new GLBuffer.createIndexBuffer(gl);
    indexBuffer.upload( createIndicesForQuads(this.size) );
    
    this.verticesBuffer = new GLBuffer.createVertexBuffer(gl, null, gl.DYNAMIC_DRAW);
    
    this._shader = new TextureShader(gl);

    // build and populate a vbo...

    this.vao = new VertexArrayObject(gl);

    this.vao.addIndex(indexBuffer);   
          
    this.vao.addAttribute(this.verticesBuffer
                         ,this._shader.attributes.aVertexPosition
                         ,gl.FLOAT
                         ,this.vertByteSize
                         ,false
                         ,0);

    this.vao.addAttribute(this.verticesBuffer
                         ,this._shader.attributes.aTextureCoord
                         ,gl.FLOAT
                         ,this.vertByteSize
                         ,false
                         ,2 * 4);

    this.vao.addAttribute(this.verticesBuffer 
                         ,this._shader.attributes.aColor
                         ,gl.UNSIGNED_BYTE
                         ,this.vertByteSize
                         ,true
                         ,4 * 4);
}

SpriteRenderer.prototype = Object.create(ObjectRenderer.prototype);
SpriteRenderer.prototype.constructor = SpriteRenderer;
module.exports = SpriteRenderer;

WebGLRenderer.registerPlugin('sprite', SpriteRenderer);

/**
 * Renders the sprite object.
 *
 * @param sprite {PIXI.Sprite} the sprite to render when using this spritebatch
 */
SpriteRenderer.prototype.render = function (sprite)
{
    var texture = sprite._texture;

    //TODO set blend modes..
    // check texture..
    if (this.currentBatchSize >= this.size)
    {
        this.flush();
    }

    // get the uvs for the texture
    var uvs = texture._uvs;

    // if the uvs have not updated then no point rendering just yet!
    if (!uvs)
    {
        return;
    }

    // TODO trim??
    var aX = sprite.anchor.x;
    var aY = sprite.anchor.y;

    var w0, w1, h0, h1;

    if (texture.trim && sprite.tileScale === undefined)
    {
        // if the sprite is trimmed and is not a tilingsprite then we need to add the extra space before transforming the sprite coords..
        var trim = texture.trim;

        w1 = trim.x - aX * trim.width;
        w0 = w1 + texture.crop.width;

        h1 = trim.y - aY * trim.height;
        h0 = h1 + texture.crop.height;

    }
    else
    {
        w0 = (texture._frame.width ) * (1-aX);
        w1 = (texture._frame.width ) * -aX;

        h0 = texture._frame.height * (1-aY);
        h1 = texture._frame.height * -aY;
    }

    var index = this.currentBatchSize * this.vertByteSize;

    var worldTransform = sprite.worldTransform;

    var a = worldTransform.a;
    var b = worldTransform.b;
    var c = worldTransform.c;
    var d = worldTransform.d;
    var tx = worldTransform.tx;
    var ty = worldTransform.ty;

    var colors = this.colors;
    var positions = this.positions;

    if (this.renderer.roundPixels)
    {
        var resolution = this.renderer.resolution;

        // xy
        positions[index] = (((a * w1 + c * h1 + tx) * resolution) | 0) / resolution;
        positions[index+1] = (((d * h1 + b * w1 + ty) * resolution) | 0) / resolution;

        // xy
        positions[index+5] = (((a * w0 + c * h1 + tx) * resolution) | 0) / resolution;
        positions[index+6] = (((d * h1 + b * w0 + ty) * resolution) | 0) / resolution;

         // xy
        positions[index+10] = (((a * w0 + c * h0 + tx) * resolution) | 0) / resolution;
        positions[index+11] = (((d * h0 + b * w0 + ty) * resolution) | 0) / resolution;

        // xy
        positions[index+15] = (((a * w1 + c * h0 + tx) * resolution) | 0) / resolution;
        positions[index+16] = (((d * h0 + b * w1 + ty) * resolution) | 0) / resolution;
    }
    else
    {

        // xy
        positions[index] = a * w1 + c * h1 + tx;
        positions[index+1] = d * h1 + b * w1 + ty;

        // xy
        positions[index+5] = a * w0 + c * h1 + tx;
        positions[index+6] = d * h1 + b * w0 + ty;

         // xy
        positions[index+10] = a * w0 + c * h0 + tx;
        positions[index+11] = d * h0 + b * w0 + ty;

        // xy
        positions[index+15] = a * w1 + c * h0 + tx;
        positions[index+16] = d * h0 + b * w1 + ty;
    }

    // uv
    positions[index+2] = uvs.x0;
    positions[index+3] = uvs.y0;

    // uv
    positions[index+7] = uvs.x1;
    positions[index+8] = uvs.y1;

     // uv
    positions[index+12] = uvs.x2;
    positions[index+13] = uvs.y2;

    // uv
    positions[index+17] = uvs.x3;
    positions[index+18] = uvs.y3;

    // color and alpha
    var tint = sprite.tint;
    colors[index+4] = colors[index+9] = colors[index+14] = colors[index+19] = (tint >> 16) + (tint & 0xff00) + ((tint & 0xff) << 16) + (sprite.worldAlpha * 255 << 24);

    // increment the batchsize
    this.sprites[this.currentBatchSize++] = sprite;
};

/**
 * Renders the content and empties the current batch.
 *
 */
SpriteRenderer.prototype.flush = function ()
{
    // If the batch is length 0 then return as there is nothing to draw
    if (this.currentBatchSize === 0)
    {
        return;
    }

    var gl = this.renderer.gl;
    var shader;

    
    // upload the verts to the buffer
    if (this.currentBatchSize > ( this.size * 0.5 ) )
    {
        this.verticesBuffer.upload(this.vertices);
    }
    else
    {
        var view = this.positions.subarray(0, this.currentBatchSize * this.vertByteSize);
        this.verticesBuffer.upload(view);
    }

    var nextTexture, nextBlendMode, nextShader;
    var batchSize = 0;
    var start = 0;

    var currentBaseTexture = null;
    var currentBlendMode = this.renderer.blendModeManager.currentBlendMode;
    var currentShader = null;

    var blendSwap = false;
    var shaderSwap = false;
    var sprite;

    for (var i = 0, j = this.currentBatchSize; i < j; i++)
    {

        sprite = this.sprites[i];

        nextTexture = sprite._texture.baseTexture;
        nextBlendMode = sprite.blendMode;
        nextShader = sprite.shader || this.shader;

        blendSwap = currentBlendMode !== nextBlendMode;
        shaderSwap = currentShader !== nextShader; // should I use uidS???

        if (currentBaseTexture !== nextTexture || blendSwap || shaderSwap)
        {
            if (batchSize > 0)
            {
              this.renderer.bindTexture(currentBaseTexture, gl.TEXTURE0);
              gl.drawElements(gl.TRIANGLES, batchSize * 6, gl.UNSIGNED_SHORT, start * 6 * 2);
            }

            start = i;
            batchSize = 0;
            currentBaseTexture = nextTexture;

            if (blendSwap)
            {
                currentBlendMode = nextBlendMode;
                this.renderer.blendModeManager.setBlendMode( currentBlendMode );
            }

            if (shaderSwap)
            {
                currentShader = nextShader;

                shader = currentShader.shaders ? currentShader.shaders[gl.id] : currentShader;

                if (!shader)
                {
                    shader = currentShader.getShader(this.renderer);
                }
            }
        }

        batchSize++;
    }

    if (batchSize > 0)
    {
      this.renderer.bindTexture(currentBaseTexture, gl.TEXTURE0);
      gl.drawElements(gl.TRIANGLES, batchSize * 6, gl.UNSIGNED_SHORT, start * 6 * 2);
    }

    // then reset the batch!
    this.currentBatchSize = 0;
};

/**
 * Starts a new sprite batch.
 *
 */
SpriteRenderer.prototype.start = function ()
{
    var gl = this.renderer.gl;
    
    this.renderer.bindVertexArrayObject(this.vao);
    this.renderer.bindShader(this._shader);
};

/**
 * Destroys the SpriteBatch.
 *
 */
SpriteRenderer.prototype.destroy = function ()
{
    //this.renderer.gl.deleteBuffer(this.vertexBuffer);
    //this.renderer.gl.deleteBuffer(this.indexBuffer);

    ObjectRenderer.prototype.destroy.call(this);

    this.shader.destroy();

    this.renderer = null;

    this.vertices = null;
    this.positions = null;
    this.colors = null;

    this.vertexBuffer = null;
    this.indexBuffer = null;

    this.sprites = null;
    this.shader = null;
};
