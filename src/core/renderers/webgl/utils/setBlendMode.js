/**
 * Generic Mask Stack data structure
 * @class
 * @memberof PIXI
 */

var GL_MAP = {};

var setBlendMode = function (gl, blendMode)
{
    if (this.currentBlendMode === blendMode)
    {
        return false;
    }

    this.currentBlendMode = blendMode;

    var mode = this.renderer.blendModes[this.currentBlendMode];
    gl.blendFunc(mode[0], mode[1]);

    return true;
};

module.exports = setBlendMode;