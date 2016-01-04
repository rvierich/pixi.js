/**
 * Generic Mask Stack data structure
 * @class
 * @memberof PIXI
 */

var BLEND_MODES = require('./BlendModeConsts');

var GL_BLEND_MAP = null; 

//TODO cach?

var setBlendMode = function (gl, blendMode)
{
	if (!GL_BLEND_MAP)
	{
		GL_BLEND_MAP = {
			 BLEND_MODES.NORMAL: 		[gl.ONE,       gl.ONE_MINUS_SRC_ALPHA]
			,BLEND_MODES.ADD:          	[gl.SRC_ALPHA, gl.DST_ALPHA]
			,BLEND_MODES.MULTIPLY:     	[gl.DST_COLOR, gl.ONE_MINUS_SRC_ALPHA]
			,BLEND_MODES.SCREEN:       	[gl.SRC_ALPHA, gl.ONE]
			,BLEND_MODES.OVERLAY:      	[gl.ONE,       gl.ONE_MINUS_SRC_ALPHA]
			,BLEND_MODES.DARKEN:       	[gl.ONE,       gl.ONE_MINUS_SRC_ALPHA]
			,BLEND_MODES.LIGHTEN:      	[gl.ONE,       gl.ONE_MINUS_SRC_ALPHA]
			,BLEND_MODES.COLOR_DODGE:  	[gl.ONE,       gl.ONE_MINUS_SRC_ALPHA]
			,BLEND_MODES.COLOR_BURN:   	[gl.ONE,       gl.ONE_MINUS_SRC_ALPHA]
			,BLEND_MODES.HARD_LIGHT:   	[gl.ONE,       gl.ONE_MINUS_SRC_ALPHA]
			,BLEND_MODES.SOFT_LIGHT:   	[gl.ONE,       gl.ONE_MINUS_SRC_ALPHA]
			,BLEND_MODES.DIFFERENCE:   	[gl.ONE,       gl.ONE_MINUS_SRC_ALPHA]
			,BLEND_MODES.EXCLUSION:    	[gl.ONE,       gl.ONE_MINUS_SRC_ALPHA]
			,BLEND_MODES.HUE:          	[gl.ONE,       gl.ONE_MINUS_SRC_ALPHA]
			,BLEND_MODES.SATURATION:   	[gl.ONE,       gl.ONE_MINUS_SRC_ALPHA]
			,BLEND_MODES.COLOR:        	[gl.ONE,       gl.ONE_MINUS_SRC_ALPHA]
			,BLEND_MODES.LUMINOSITY:   	[gl.ONE,       gl.ONE_MINUS_SRC_ALPHA]
 		}
	}

    var mode = GL_BLEND_MAP[blendMode];
    gl.blendFunc(mode[0], mode[1]);

    return blendMode;
};

module.exports = setBlendMode;