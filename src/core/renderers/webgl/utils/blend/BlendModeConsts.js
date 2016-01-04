

/**
 * Various blend modes supported by PIXI. IMPORTANT - The WebGL renderer only supports
 * the NORMAL, ADD, MULTIPLY and SCREEN blend modes. Anything else will silently act like
 * NORMAL.
 *
 * @static
 * @constant
 * @property {object} BLEND_MODES
 * @property {number} BLEND_MODES.NORMAL
 * @property {number} BLEND_MODES.ADD
 * @property {number} BLEND_MODES.MULTIPLY
 * @property {number} BLEND_MODES.SCREEN
 * @property {number} BLEND_MODES.OVERLAY
 * @property {number} BLEND_MODES.DARKEN
 * @property {number} BLEND_MODES.LIGHTEN
 * @property {number} BLEND_MODES.COLOR_DODGE
 * @property {number} BLEND_MODES.COLOR_BURN
 * @property {number} BLEND_MODES.HARD_LIGHT
 * @property {number} BLEND_MODES.SOFT_LIGHT
 * @property {number} BLEND_MODES.DIFFERENCE
 * @property {number} BLEND_MODES.EXCLUSION
 * @property {number} BLEND_MODES.HUE
 * @property {number} BLEND_MODES.SATURATION
 * @property {number} BLEND_MODES.COLOR
 * @property {number} BLEND_MODES.LUMINOSITY
 */

var BLEND_MODES = {
        NORMAL:         0,
        ADD:            1,
        MULTIPLY:       2,
        SCREEN:         3,
        OVERLAY:        4,
        DARKEN:         5,
        LIGHTEN:        6,
        COLOR_DODGE:    7,
        COLOR_BURN:     8,
        HARD_LIGHT:     9,
        SOFT_LIGHT:     10,
        DIFFERENCE:     11,
        EXCLUSION:      12,
        HUE:            13,
        SATURATION:     14,
        COLOR:          15,
        LUMINOSITY:     16
    }

module.exports = BLEND_MODES;
    