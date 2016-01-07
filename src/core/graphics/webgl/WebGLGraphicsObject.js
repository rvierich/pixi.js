var GLBuffer = require('pixi-gl-core').GLBuffer,
    VertexArrayObject = require('pixi-gl-core').VertexArrayObject;

/**
 * An object containing WebGL specific properties to be used by the WebGL renderer
 *
 * @class
 * @memberof PIXI
 * @param gl {WebGLRenderingContext} the current WebGL drawing context
 * @private
 */
function WebGLGraphicsObject(gl, shader) {

    /**
     * The current WebGL drawing context
     *
     * @member {WebGLRenderingContext}
     */
    this.gl = gl;

    /**
     * An array of points to draw
     * @member {PIXI.Point[]}
     */
    this.vertices = [];

    /**
     * The indices of the vertices
     * @member {number[]}
     */
    this.indices = [];

   
    /**
     * The main buffer
     * @member {WebGLBuffer}
     */
    this.verticesBuffer = GLBuffer.createVertexBuffer(gl);
    
    /**
     * The index buffer
     * @member {WebGLBuffer}
     */
    this.indexBuffer = GLBuffer.createIndexBuffer(gl);


    this.vao = new VertexArrayObject(gl);

    // build a nice vao!
    this.vao.addIndex(this.indexBuffer);
    this.vao.addAttribute(this.verticesBuffer, shader.attributes.aVertexPosition, gl.FLOAT, false, 4 * 6, 0);
    this.vao.addAttribute(this.verticesBuffer, shader.attributes.aColor, gl.FLOAT, false,4 * 6, 2 * 4);

    /**
     * The alpha of the graphics
     * @member {number}
     */
    this.alpha = 1;
}

WebGLGraphicsObject.prototype.constructor = WebGLGraphicsObject;
module.exports = WebGLGraphicsObject;

/**
 * Resets the vertices and the indices
 */
WebGLGraphicsObject.prototype.reset = function () {
    this.vertices.length = 0;
    this.indices.length = 0;
};

WebGLGraphicsObject.prototype.destroy = function () {
   
};
