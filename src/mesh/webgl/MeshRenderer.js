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

    this.currentShader = null;

    this.firstRun = true;
}

MeshRenderer.prototype = Object.create(core.ObjectRenderer.prototype);
MeshRenderer.prototype.constructor = MeshRenderer;
module.exports = MeshRenderer;

core.WebGLRenderer.registerPlugin('mesh', MeshRenderer);

/**
 * Renders the sprite object.
 *
 * @param mesh {PIXI.mesh.Mesh} the mesh to render
 */
MeshRenderer.prototype.render = function (mesh)
{

    var renderer = this.renderer,
        gl = renderer.gl

    if(this.firstRun)
    {
        this.firstRun = false;

        this.shader = new MeshShader(gl);


        this.indexBuffer = new Buffer.createIndexBuffer(gl);

        this.verticesBuffer = new Buffer.createVertexBuffer(gl, null, gl.DYNAMIC_DRAW);
        this.uvsBuffer = new Buffer.createVertexBuffer(gl);

        this.vao = new VertexArrayObject(gl);

        this.vao.addIndex(this.indexBuffer);   

        this.vao.addAttribute(this.verticesBuffer, this.shader.attributes.aVertexPosition);

        this.vao.addAttribute(this.uvsBuffer, this.shader.attributes.aTextureCoord);

        this.indexBuffer.upload(mesh.indices);

         
    }

    renderer.blendModeManager.setBlendMode(mesh.blendMode);

    var shader = this.shader;

    renderer.bindTexture(mesh._texture.baseTexture, gl.TEXTURE0);
    renderer.bindShader(shader);
    renderer.bindVertexArrayObject(this.vao);

    // set some uniforms
    shader.uniforms.translationMatrix = mesh.worldTransform.toArray(true);
    shader.uniforms.alpha = mesh.worldAlpha;    

    this.verticesBuffer.upload(mesh.vertices);
    
    if (mesh.dirty)
    {
        mesh.dirty = false;
        this.uvsBuffer.upload(mesh.uvs);    
    }
    
    var drawMode = mesh.drawMode === Mesh.DRAW_MODES.TRIANGLE_MESH ? gl.TRIANGLE_STRIP : gl.TRIANGLES;
    gl.drawElements(drawMode, mesh.indices.length, gl.UNSIGNED_SHORT, 0);
};

/**
 * Destroys the Mesh renderer
 *
 */
MeshRenderer.prototype.destroy = function ()
{
    core.ObjectRenderer.prototype.destroy.call(this);
};
