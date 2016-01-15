var ObjectRenderer = require('../../renderers/webgl/utils/ObjectRenderer'),
    WebGLRenderer = require('../../renderers/webgl/WebGLRenderer'),
    TextureShader = require('../../renderers/webgl/shaders/_TextureShader'),
    createIndicesForQuads = require('../../utils/createIndicesForQuads'),
    CONST = require('../../const'),
    glCore = require('pixi-gl-core');

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

    this.texturesToBatch = 16;

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

    // the total number of indices in our batch, there are 6 points per quad.
    var numIndices = this.size * 6;

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
    this.positions = new Float32Array(this.vertices);
    
    /**
     * View on the vertices as a Uint32Array for uvs
     *
     * @member {Float32Array}
     */
    this.uvs = new Uint32Array(this.vertices);

    /**
     * View on the vertices as a Uint32Array for colors
     *
     * @member {Uint32Array}
     */
    this.colors = new Uint32Array(this.vertices);

    /**
     * Holds the indices of the geometry (quads) to draw
     *
     * @member {Uint16Array}
     */
    this.indices = createIndicesForQuads(this.size)

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

    this.textureCount = 0;
    this.textureArray = [];
}

SpriteRenderer.prototype = Object.create(ObjectRenderer.prototype);
SpriteRenderer.prototype.constructor = SpriteRenderer;
module.exports = SpriteRenderer;

WebGLRenderer.registerPlugin('sprite', SpriteRenderer);

/**
 * Sets up the renderer context and necessary buffers.
 *
 * @private
 * @param gl {WebGLRenderingContext} the current WebGL drawing context
 */
SpriteRenderer.prototype.onContextChange = function ()
{
    var gl = this.renderer.gl;

    this._shader = new TextureShader(gl);
    this._shader.bind();

    // set default uniforms..
    this._shader.uniforms.uSamplers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

  //  var textureLoc = gl.getUniformLocation(this._shader.program, "uSamplers");
    // Tell the shader to use texture units 0 to 3
//    gl.uniform1iv(textureLoc, [0, 1, 2, 3]);

    // setup default shader
    this.shader = this.renderer.shaderManager.defaultShader;

    // create a couple of buffers
    this.vertexBuffer = glCore.GLBuffer.createVertexBuffer(gl, null, gl.DYNAMIC_DRAW);
    this.indexBuffer = glCore.GLBuffer.createIndexBuffer(gl, this.indices, gl.STATIC_DRAW);

    // build the vao object that will render..
    this.vao = new glCore.VertexArrayObject(gl);

    this.vao.addIndex(this.indexBuffer);
    this.vao.addAttribute(this.vertexBuffer, this._shader.attributes.aVertexPosition, gl.FLOAT, false, this.vertByteSize, 0);
    this.vao.addAttribute(this.vertexBuffer, this._shader.attributes.aTextureCoord, gl.UNSIGNED_SHORT, true, this.vertByteSize, 2 * 4);
    this.vao.addAttribute(this.vertexBuffer, this._shader.attributes.aColor, gl.UNSIGNED_BYTE, true, this.vertByteSize, 3 * 4);
    this.vao.addAttribute(this.vertexBuffer, this._shader.attributes.aTextureId, gl.FLOAT, false, this.vertByteSize, 4 * 4);

    this.currentBlendMode = 99999;
};

/**
 * Renders the sprite object.
 *
 * @param sprite {PIXI.Sprite} the sprite to render when using this spritebatch
 */
SpriteRenderer.prototype.render = function (sprite)
{

    //TODO set blend modes..
    // check texture..
    if (this.currentBatchSize >= this.size)
    {
        this.flush();
    }

    

    // upload som uvs!
    
    
    
   

    
//    colors[index+3] = colors[index+7] = colors[index+11] = colors[index+15] = 


    // increment the batchsize
    this.sprites[this.currentBatchSize++] = sprite;
};

/**
 * Renders the content and empties the current batch.
 *
 */
SpriteRenderer.prototype.flush = function ()
{
    this.textureArray.length = 0;

    // If the batch is length 0 then return as there is nothing to draw
    if (this.currentBatchSize === 0)
    {
        return;
    }

    var gl = this.renderer.gl;
    var shader;

    
    var nextTexture, nextBlendMode, nextShader;
    var batchSize = 0;
    var start = 0;

    var currentBaseTexture = null;
    var currentBlendMode = this.renderer.blendModeManager.currentBlendMode;
    var currentShader = null;

    var blendSwap = false;
    var shaderSwap = false;
    var sprite;

    var textureId = 999;
  //  console.log(gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS))
    for (var i = 0, j = this.currentBatchSize; i < j; i++)
    {
        sprite = this.sprites[i];

        nextTexture = sprite._texture.baseTexture;
        nextBlendMode = sprite.blendMode;
        nextShader = sprite.shader || this.shader;

        blendSwap = currentBlendMode !== nextBlendMode;
        shaderSwap = currentShader !== nextShader; // should I use uidS???

        if (currentBaseTexture !== nextTexture)// || blendSwap || shaderSwap)
        {
            
            currentBaseTexture = nextTexture;

            if(nextTexture && !nextTexture._active)
            {
                nextTexture._active = true;
                this.textureArray[this.textureCount] = nextTexture;
                textureId = nextTexture._id = this.textureCount++;

                if(this.textureCount > 4)
                {
                    this.renderBatch(currentBaseTexture, batchSize, start);
        
                    start = i;
                    batchSize = 0;
                }
            }
            else
            {
                textureId = nextTexture._id;
            }

            if (blendSwap)
            {
                currentBlendMode = nextBlendMode;
                this.renderer.blendModeManager.setBlendMode( currentBlendMode );
            }
           
            if (shaderSwap)
            {
                this.renderer.bindShader(this._shader);
            }
        }


        // get the uvs for the texture
        var uvs = sprite.texture._uvs;

        // if the uvs have not updated then no point rendering just yet!
        if (!uvs)
        {
            continue;
        }

        // TODO trim??
        var index = i * this.vertByteSize;

        var colors = this.colors;
        var positions = this.positions;

        var vertexData = sprite.vertexData

        var tint = sprite.tint;
        var uintTint = (tint >> 16) + (tint & 0xff00) + ((tint & 0xff) << 16) + (sprite.worldAlpha * 255 << 24);

        var ix = index;

        // xy
        positions[ix++] = vertexData[0];
        positions[ix++] = vertexData[1];
        this.uvs[ix++] = uvs.uvs_uint32[0];
        colors[ix++] = uintTint
        positions[ix++] = textureId
        
        // xy
        positions[ix++] = vertexData[2];
        positions[ix++] = vertexData[3];
        this.uvs[ix++] = uvs.uvs_uint32[1];
        colors[ix++] = uintTint;
        positions[ix++] = textureId;

         // xy
        positions[ix++] = vertexData[4];
        positions[ix++] = vertexData[5];
        this.uvs[ix++] = uvs.uvs_uint32[2];
        colors[ix++] = uintTint;
        positions[ix++] = textureId;

        // xy
        positions[ix++] = vertexData[6];
        positions[ix++] = vertexData[7];
        this.uvs[ix++] = uvs.uvs_uint32[3];
        colors[ix++] = uintTint;
        positions[ix++] = textureId;

        batchSize++;
        
    }

    // do some smart array stuff..
    // double size so we dont alway subarray the elements..
    // upload the verts to the buffer
    if (this.currentBatchSize > ( this.size * 0.5 ) )
    {
        this.vertexBuffer.upload(this.vertices, 0, true);
    }
    else
    {
        // o k .. sub array is SLOW>?
        var view = this.positions.subarray(0, this.currentBatchSize * this.vertByteSize);
        this.vertexBuffer.upload(view, 0, true);
    }


    this.renderBatch(currentBaseTexture, batchSize, start);
    
    // clean
    for (var i = 0; i < this.textureCount; i++) 
    {
        this.textureArray[i]._active = false;
    };
    
    this.textureArray.length = 0;

    this.textureCount = 0;

    // then reset the batch!
    this.currentBatchSize = 0;
};

/**
 * Draws the currently batches sprites.
 *
 * @private
 * @param texture {PIXI.Texture}
 * @param size {number}
 * @param startIndex {number}
 */
SpriteRenderer.prototype.renderBatch = function (texture, size, startIndex)
{
    if (size === 0)
    {
        return;
    }

    var gl = this.renderer.gl;

    // bind the texture..
     
  //  console.log(this._shader.uniforms.uSamplers)
    for (var i = 0; i < this.textureCount; i++) 
    {
         this.renderer.bindTexture(this.textureArray[i], i);
    };

    // now draw those suckas!
    gl.drawElements(gl.TRIANGLES, size * 6, gl.UNSIGNED_SHORT, startIndex * 6 * 2);
};

/**
 * Starts a new sprite batch.
 *
 */
SpriteRenderer.prototype.start = function ()
{
    this.vao.bind();
};

/**
 * Destroys the SpriteBatch.
 *
 */
SpriteRenderer.prototype.destroy = function ()
{
    this.vertexBuffer.destroy();
    this.indexBuffer.destroy();

    ObjectRenderer.prototype.destroy.call(this);

    this.shader.destroy();

    this.renderer = null;

    this.vertices = null;
    this.positions = null;
    this.colors = null;
    this.indices = null;

    this.vertexBuffer = null;
    this.indexBuffer = null;

    this.sprites = null;
    this.shader = null;
};
