
function MaskFeature()
{  
    this.mask = null;
    this.displayObject = null;
}

MaskFeature.prototype.constructor = MaskFeature;
module.exports = MaskFeature;

MaskFeature.prototype.pre = function(renderer)
{
    renderer.plugins.mask.pushMask(this.displayObject, this.mask);
}

MaskFeature.prototype.post = function(renderer)
{
    renderer.plugins.mask.popMask(this.displayObject, this.mask);
}

MaskFeature.prototype.init = function(displayObject, mask)
{
    this.displayObject = displayObject;
    this.mask = mask;

    mask.renderable = false;
}

MaskFeature.prototype.end = function()
{
    this.mask.renderable = true;

    this.displayObject = null;
    this.mask = null;
}