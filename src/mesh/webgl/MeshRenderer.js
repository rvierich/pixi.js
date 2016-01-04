var core = require('../../core'),
    Mesh = require('../Mesh'),
    VertexArrayObject = require('../../core/renderers/webgl/core/VertexArrayObject'),
    Buffer = require('../../core/renderers/webgl/core/GLBuffer'),
    Shader = require('../../core/renderers/webgl/core/GLShader'),
    MeshShader = require('./MeshShader')
/**
 * @author Mat Groves
 *
 * Big thanks to the very clever Matt DesLauriers <mattdesl> https://github.com/mattdesl/
 * for creating the original pixi version!
 * Also a thanks to https://github.com/bchevalier for tweaking the tint and alpha so that they now share 4 bytes on the vertex buffer
 *
 * Heavily inspired by LibGDX's MeshRenderer:
 * https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/graphics/g2d/MeshRenderer.java
 */

/**
 *
 * @class
 * @private
 * @memberof PIXI.mesh
 * @extends PIXI.ObjectRenderer
 * @param renderer {PIXI.WebGLRenderer} The renderer this sprite batch works for.
 */
function MeshRenderer(renderer)
{
    core.ObjectRenderer.call(this, renderer);


    /**
     * Holds the indices
     *
     * @member {Uint16Array}
     */
    
    this.indices = new Uint16Array(15000);

    //TODO this could be a single buffer shared amongst all renderers as we reuse this set up in most renderers
    for (var i=0, j=0; i < 15000; i += 6, j += 4)
    {
        this.indices[i + 0] = j + 0;
        this.indices[i + 1] = j + 1;
        this.indices[i + 2] = j + 2;
        this.indices[i + 3] = j + 0;
        this.indices[i + 4] = j + 2;
        this.indices[i + 5] = j + 3;
    }

    this.currentShader = null;

    this.firstRun = true;
}

MeshRenderer.prototype = Object.create(core.ObjectRenderer.prototype);
MeshRenderer.prototype.constructor = MeshRenderer;
module.exports = MeshRenderer;

core.WebGLRenderer.registerPlugin('mesh', MeshRenderer);

/**
 * Sets up the renderer context and necessary buffers.
 *
 * @private
 * @param gl {WebGLRenderingContext} the current WebGL drawing context
 */
MeshRenderer.prototype.onContextChange = function ()
{
    
};

/**
 * Renders the sprite object.
 *
 * @param mesh {PIXI.mesh.Mesh} the mesh to render
 */
MeshRenderer.prototype.render = function (mesh)
{

    var renderer = this.renderer,
        gl = renderer.gl,
        texture = mesh._texture.baseTexture;

    if(this.firstRun)
    {
        this.firstRun = false;

        this.shader = new MeshShader(gl);


        this.indexBuffer = new Buffer.createIndexBuffer(gl);

        this.verticesBuffer = new Buffer.createVertexBuffer(gl, null, gl.DYNAMIC_DRAW);
        this.uvsBuffer = new Buffer.createVertexBuffer(gl);

        this.vao = new VertexArrayObject(gl);

        this.vao.addIndex(this.indexBuffer);   

        this.vao.addAttribute(this.verticesBuffer, {
           attrib:this.shader.attributes.aVertexPosition.location
        });

        this.vao.addAttribute(this.uvsBuffer, {
           attrib:this.shader.attributes.aTextureCoord.location
        });

        this.indexBuffer.upload(mesh.indices);

         
    }

   // return;

    renderer.blendModeManager.setBlendMode(mesh.blendMode);

    var shader = this.shader;

    shader.bind();

    shader.uniforms.translationMatrix = mesh.worldTransform.toArray(true);
    shader.uniforms.projectionMatrix = renderer.currentRenderTarget.projectionMatrix.toArray(true);
    shader.uniforms.alpha = mesh.worldAlpha;

    gl.activeTexture(gl.TEXTURE0);

    if (!texture._glTextures[gl.id])
    {
        this.renderer.updateTexture(texture);
    }
    else
    {
        // bind the current texture
        texture._glTextures[gl.id].bind();
    }
 
    if (mesh.dirty)
    {
        mesh.dirty = false;
        this.uvsBuffer.upload(mesh.uvs);    
    }
    

    // bind the vao and render the mesh!
    this.vao.bind();

    this.verticesBuffer.upload(mesh.vertices);
    
    var drawMode = mesh.drawMode === Mesh.DRAW_MODES.TRIANGLE_MESH ? gl.TRIANGLE_STRIP : gl.TRIANGLES;
    gl.drawElements(drawMode, mesh.indices.length, gl.UNSIGNED_SHORT, 0);


  
    //TODO cache custom state..
};

/**
 * Empties the current batch.
 *
 */
MeshRenderer.prototype.flush = function ()
{

};

/**
 * Starts a new mesh renderer.
 *
 */
MeshRenderer.prototype.start = function ()
{
    

    this.currentShader = null;
};

/**
 * Destroys the Mesh renderer
 *
 */
MeshRenderer.prototype.destroy = function ()
{
    core.ObjectRenderer.prototype.destroy.call(this);
};
