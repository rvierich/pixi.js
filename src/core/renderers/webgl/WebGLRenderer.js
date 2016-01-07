var SystemRenderer = require('../SystemRenderer'),
    MaskManager = require('./managers/MaskManager'),
    StencilManager = require('./managers/StencilManager'),
    FilterManager = require('./managers/FilterManager'),
    BlendModeManager = require('./managers/BlendModeManager'),
    RenderTarget = require('./utils/RenderTarget'),
    ObjectRenderer = require('./utils/ObjectRenderer'),
    createContext = require('pixi-gl-core').createContext,
    TextureManager = require('./TextureManager'),
    utils = require('../../utils'),
    CONST = require('../../const');

/**
 * The WebGLRenderer draws the scene and all its content onto a webGL enabled canvas. This renderer
 * should be used for browsers that support webGL. This Render works by automatically managing webGLBatchs.
 * So no need for Sprite Batches or Sprite Clouds.
 * Don't forget to add the view to your DOM or you will not see anything :)
 *
 * @class
 * @memberof PIXI
 * @extends PIXI.SystemRenderer
 * @param [width=0] {number} the width of the canvas view
 * @param [height=0] {number} the height of the canvas view
 * @param [options] {object} The optional renderer parameters
 * @param [options.view] {HTMLCanvasElement} the canvas to use as a view, optional
 * @param [options.transparent=false] {boolean} If the render view is transparent, default false
 * @param [options.autoResize=false] {boolean} If the render view is automatically resized, default false
 * @param [options.antialias=false] {boolean} sets antialias. If not available natively then FXAA antialiasing is used
 * @param [options.forceFXAA=false] {boolean} forces FXAA antialiasing to be used over native. FXAA is faster, but may not always look as great
 * @param [options.resolution=1] {number} the resolution of the renderer retina would be 2
 * @param [options.clearBeforeRender=true] {boolean} This sets if the CanvasRenderer will clear the canvas or
 *      not before the new render pass. If you wish to set this to false, you *must* set preserveDrawingBuffer to `true`.
 * @param [options.preserveDrawingBuffer=false] {boolean} enables drawing buffer preservation, enable this if
 *      you need to call toDataUrl on the webgl context.
 * @param [options.roundPixels=false] {boolean} If true Pixi will Math.floor() x/y values when rendering, stopping pixel interpolation.
 */
function WebGLRenderer(width, height, options)
{
    options = options || {};
    
    SystemRenderer.call(this, 'WebGL', width, height, options);

    /**
     * The type of this renderer as a standardised const
     *
     * @member {number}
     *
     */
    this.type = CONST.RENDERER_TYPE.WEBGL;

    this.handleContextLost = this.handleContextLost.bind(this);
    this.handleContextRestored = this.handleContextRestored.bind(this);

    this.view.addEventListener('webglcontextlost', this.handleContextLost, false);
    this.view.addEventListener('webglcontextrestored', this.handleContextRestored, false);

     // initialize the context so it is ready for the managers.
    var options = {
        alpha: this.transparent,
        antialias: options.antialias,
        premultipliedAlpha: this.transparent && this.transparent !== 'notMultiplied',
        stencil: true,
        preserveDrawingBuffer: options.preserveDrawingBuffer
    };

    this.gl = createContext(this.view, options);
    


    /**
     * Counter for the number of draws made each frame
     *
     * @member {number}
     */
    this.drawCount = 0;

    /**
     * Manages the masks using the stencil buffer.
     *
     * @member {PIXI.MaskManager}
     */
    this.maskManager = new MaskManager(this);

    /**
     * Manages the stencil buffer.
     *
     * @member {PIXI.StencilManager}
     */
    this.stencilManager = new StencilManager(this);

    /**
     * Manages the filters.
     *
     * @member {PIXI.FilterManager}
     */
    this.filterManager = new FilterManager(this);

    /**
     * Manages the blendModes
     *
     * @member {PIXI.BlendModeManager}
     */
    this.blendModeManager = new BlendModeManager(this);

    /**
     * Holds the current render target
     *
     * @member {PIXI.RenderTarget}
     */
    this.currentRenderTarget = null;

    /**
     * The currently active ObjectRenderer.
     *
     * @member {PIXI.ObjectRenderer}
     */
    this.currentRenderer = new ObjectRenderer(this);
    
   

    

    // map some webGL blend modes..
    this._mapGlModes();

    this.textureManager = new TextureManager(this.gl);

    this.prepareContext();
    this.initPlugins();

}

// constructor
WebGLRenderer.prototype = Object.create(SystemRenderer.prototype);
WebGLRenderer.prototype.constructor = WebGLRenderer;
module.exports = WebGLRenderer;
utils.pluginTarget.mixin(WebGLRenderer);


/**
 * Creates the WebGL context
 *
 * @private
 */
WebGLRenderer.prototype.prepareContext = function ()
{
    var gl = this.gl;

    // set up the default pixi settings..
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);

    // this should ALWAYS be active..
    gl.enableVertexAttribArray(0);

    this.renderTarget = new RenderTarget(gl, this.width, this.height, null, this.resolution, true);

    this.emit('context', gl);

    // setup the width/height properties and gl viewport
    this.resize(this.width, this.height);
};

/**
 * Renders the object to its webGL view
 *
 * @param object {PIXI.DisplayObject} the object to be rendered
 */
WebGLRenderer.prototype.render = function (object)
{

    this.emit('prerender');

    // no point rendering if our context has been blown up!
    if (this.gl.isContextLost())
    {
        return;
    }

    this.drawCount = 0;

    this._lastObjectRendered = object;

    // update the transformation of the objcts...
    var cacheParent = object.parent;
    object.parent = this._tempDisplayObjectParent;

    // update the scene graph
    object.updateTransform();

    // 
    object.parent = cacheParent;

    this.renderDisplayObject(object, this.renderTarget, this.clearBeforeRender);//this.projection);

    this.emit('postrender');
};


/**
 * Renders a Display Object.
 *
 * @param displayObject {PIXI.DisplayObject} The DisplayObject to render
 * @param renderTarget {PIXI.RenderTarget} The render target to use to render this display object
 *
 */
WebGLRenderer.prototype.renderDisplayObject = function (displayObject, renderTarget, clear)//projection, buffer)
{
    // TODO is this needed...
    //this.blendModeManager.setBlendMode(CONST.BLEND_MODES.NORMAL);
    this.bindRenderTarget(renderTarget);

    if(clear)renderTarget.clear();

    // start the filter manager
    this.filterManager.setFilterStack( renderTarget.filterStack );

    // render the scene!
    displayObject.renderWebGL(this);

    // finish the current renderer..
    this.currentRenderer.flush();
};

/**
 * Changes the current renderer to the one given in parameter
 *
 * @param objectRenderer {PIXI.ObjectRenderer} The object renderer to use.
 */
WebGLRenderer.prototype.setObjectRenderer = function (objectRenderer)
{
    if (this.currentRenderer === objectRenderer)
    {
        return;
    }

    this.currentRenderer.stop();
    this.currentRenderer = objectRenderer;
    this.currentRenderer.start();
};

/**
 * Resizes the webGL view to the specified width and height.
 *
 * @param width {number} the new width of the webGL view
 * @param height {number} the new height of the webGL view
 */
WebGLRenderer.prototype.resize = function (width, height)
{
    SystemRenderer.prototype.resize.call(this, width, height);

    this.filterManager.resize(width, height);
    this.renderTarget.resize(width, height);

    if(this.currentRenderTarget === this.renderTarget)
    {
        this.renderTarget.activate();
        this.gl.viewport(0, 0, this.width, this.height);
    }
};

/**
 * Updates and/or Creates a WebGL texture for the renderer's context.
 *
 * @param texture {PIXI.BaseTexture|PIXI.Texture} the texture to update
 */
/*
WebGLRenderer.prototype._updateTexture = function (texture)
{
    console.log('no need')
};*/

WebGLRenderer.prototype.bindTexture = function (texture, location)
{
    //TODO test perf of cache?
    location = location || gl.TEXTURE0;

    if(this._activeTextureLocation)//
    {
        this._activeTextureLocation = location
        gl.activeTexture(location || gl.TEXTURE0);
    }

    //TODO - can we cache this texture too?
    if (!texture._glTextures[gl.id])
    {
        this.textureManager.updateTexture(texture);
    }
    else
    {
        // bind the current texture
        texture._glTextures[gl.id].bind();
    }
}


/**
 * Changes the current render target to the one given in parameter
 *
 * @param renderTarget {PIXI.RenderTarget} the new render target
 */
WebGLRenderer.prototype.bindRenderTarget = function (renderTarget)//projection, buffer)
{
    if( this._activeRenderTarget === renderTarget)
    {
        return;
    }
    // TODO - maybe down the line this should be a push pos thing? Leaving for now though.
    this._activeRenderTarget = renderTarget;
    
    renderTarget.activate();
    
    this.stencilManager.setMaskStack( renderTarget.stencilMaskStack );

    if(this._activShader)
    {
        this._activShader.uniforms.projectionMatrix = renderTarget.projectionMatrix.toArray(true);
    }
    
}

WebGLRenderer.prototype.bindShader = function (shader)//projection, buffer)
{
    //TODO cache
    if(this._activShader !== shader)
    {
        this._activShader = shader;

        shader.bind();
        // automatically set the projection matrix
        shader.uniforms.projectionMatrix = this._activeRenderTarget.projectionMatrix.toArray(true);
    }
}

WebGLRenderer.prototype.bindVertexArrayObject = function (vbo)//projection, buffer)
{
    //if(this._activeVertexArrayObject !== vbo)
    //{   
    if(!vbo)
    {
        if(this._activeVertexArrayObject)
        {
            this._activeVertexArrayObject.unbind();
        }
    }

    this._activeVertexArrayObject = vbo;
    if(vbo)vbo.bind();
   // }
}

/**
 * Deletes the texture from WebGL
 *
 * @param texture {PIXI.BaseTexture|PIXI.Texture} the texture to destroy
 */
WebGLRenderer.prototype.destroyTexture = function (texture, _skipRemove)
{
    this.textureManager.destroyTexture(texture, _skipRemove);
};

/**
 * Handles a lost webgl context
 *
 * @private
 */
WebGLRenderer.prototype.handleContextLost = function (event)
{
    event.preventDefault();
};

/**
 * Handles a restored webgl context
 *
 * @private
 */
WebGLRenderer.prototype.handleContextRestored = function ()
{
    this._initContext();

    // empty all the old gl textures as they are useless now
    this.textureManager.destroyAll();
    
};

/**
 * Removes everything from the renderer (event listeners, spritebatch, etc...)
 *
 * @param [removeView=false] {boolean} Removes the Canvas element from the DOM.
 */
WebGLRenderer.prototype.destroy = function (removeView)
{
    this.destroyPlugins();

    // remove listeners
    this.view.removeEventListener('webglcontextlost', this.handleContextLost);
    this.view.removeEventListener('webglcontextrestored', this.handleContextRestored);

    this.textureManager.destroyAll();

    // call base destroy
    SystemRenderer.prototype.destroy.call(this, removeView);

    this.uid = 0;

    // destroy the managers
   // this.shaderManager.destroy();
    this.maskManager.destroy();
    this.stencilManager.destroy();
    this.filterManager.destroy();
    this.blendModeManager.destroy();

    //this.shaderManager = null;
    this.maskManager = null;
    this.filterManager = null;
    this.blendModeManager = null;
    this.currentRenderer = null;

    this.handleContextLost = null;
    this.handleContextRestored = null;

    this._contextOptions = null;

    this.drawCount = 0;

    this.gl.useProgram(null);

    this.gl = null;
};

/**
 * Maps Pixi blend modes to WebGL blend modes.
 *
 * @private
 */
WebGLRenderer.prototype._mapGlModes = function ()
{
    var gl = this.gl;

    if (!this.blendModes)
    {
        this.blendModes = {};

        this.blendModes[CONST.BLEND_MODES.NORMAL]        = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        this.blendModes[CONST.BLEND_MODES.ADD]           = [gl.SRC_ALPHA, gl.DST_ALPHA];
        this.blendModes[CONST.BLEND_MODES.MULTIPLY]      = [gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA];
        this.blendModes[CONST.BLEND_MODES.SCREEN]        = [gl.SRC_ALPHA, gl.ONE];
        this.blendModes[CONST.BLEND_MODES.OVERLAY]       = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        this.blendModes[CONST.BLEND_MODES.DARKEN]        = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        this.blendModes[CONST.BLEND_MODES.LIGHTEN]       = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        this.blendModes[CONST.BLEND_MODES.COLOR_DODGE]   = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        this.blendModes[CONST.BLEND_MODES.COLOR_BURN]    = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        this.blendModes[CONST.BLEND_MODES.HARD_LIGHT]    = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        this.blendModes[CONST.BLEND_MODES.SOFT_LIGHT]    = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        this.blendModes[CONST.BLEND_MODES.DIFFERENCE]    = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        this.blendModes[CONST.BLEND_MODES.EXCLUSION]     = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        this.blendModes[CONST.BLEND_MODES.HUE]           = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        this.blendModes[CONST.BLEND_MODES.SATURATION]    = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        this.blendModes[CONST.BLEND_MODES.COLOR]         = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
        this.blendModes[CONST.BLEND_MODES.LUMINOSITY]    = [gl.ONE,       gl.ONE_MINUS_SRC_ALPHA];
    }

    if (!this.drawModes)
    {
        this.drawModes = {};

        this.drawModes[CONST.DRAW_MODES.POINTS]         = gl.POINTS;
        this.drawModes[CONST.DRAW_MODES.LINES]          = gl.LINES;
        this.drawModes[CONST.DRAW_MODES.LINE_LOOP]      = gl.LINE_LOOP;
        this.drawModes[CONST.DRAW_MODES.LINE_STRIP]     = gl.LINE_STRIP;
        this.drawModes[CONST.DRAW_MODES.TRIANGLES]      = gl.TRIANGLES;
        this.drawModes[CONST.DRAW_MODES.TRIANGLE_STRIP] = gl.TRIANGLE_STRIP;
        this.drawModes[CONST.DRAW_MODES.TRIANGLE_FAN]   = gl.TRIANGLE_FAN;
    }
};
