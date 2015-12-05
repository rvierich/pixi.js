var core = require('../core'),
	MaskFeature = require('./MaskFeature')

/**
 * @file        Main export of the PIXI interactions library
 * @author      Mat Groves <mat@goodboydigital.com>
 * @copyright   2013-2015 GoodBoyDigital
 * @license     {@link https://github.com/pixijs/pixi.js/blob/master/LICENSE|MIT License}
 */


/**
 * @namespace PIXI.interaction
 */
module.exports = {
    MaskManager: require('./webgl/MaskManager')
};

// misxin the mask target..

Object.defineProperties(core.DisplayObject.prototype, {
    /**
     * Sets a mask for the displayObject. A mask is an object that limits the visibility of an object to the shape of the mask applied to it.
     * In PIXI a regular mask must be a PIXI.Graphics or a PIXI.Sprite object. This allows for much faster masking in canvas as it utilises shape clipping.
     * To remove a mask, set this property to null.
     *
     * @member {PIXI.Graphics|PIXI.Sprite|PIXI.Rectangle}
     * @memberof PIXI.DisplayObject#
     */
    mask: {
        get: function ()
        {
            var maskF = this.featureMap.mask;

            if(maskF)
            {
                return maskF.mask;
            }
        },
        set: function (value)
        {
            if(value)
            {
                // TODO this will be pooled..
                var maskFeature = new MaskFeature();

                maskFeature.init(this, value);

                this.addFeature(maskFeature, 'mask');
            }
            else
            {
                var maskFeature = this.removeFeature('mask');

                if(maskFeature)
                {
                    maskFeature.end();
                }
            }

            //TODO - PRIORITY ORDERS?
            //TODO POOL this?
        }
    }
});