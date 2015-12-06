/**
 * @file        Main export of the PIXI filters library
 * @author      Mat Groves <mat@goodboydigital.com>
 * @copyright   2013-2015 GoodBoyDigital
 * @license     {@link https://github.com/pixijs/pixi.js/blob/master/LICENSE|MIT License}
 */

/**
 * @namespace PIXI.filters
 */
module.exports = {
    AsciiFilter:        require('./filters/ascii/AsciiFilter'),
    BloomFilter:        require('./filters/bloom/BloomFilter'),
    BlurFilter:         require('./filters/blur/BlurFilter'),
    BlurXFilter:        require('./filters/blur/BlurXFilter'),
    BlurYFilter:        require('./filters/blur/BlurYFilter'),
    BlurDirFilter:      require('./filters/blur/BlurDirFilter'),
    ColorMatrixFilter:  require('./filters/color/ColorMatrixFilter'),
    ColorStepFilter:    require('./filters/color/ColorStepFilter'),
    ConvolutionFilter:  require('./filters/convolution/ConvolutionFilter'),
    CrossHatchFilter:   require('./filters/crosshatch/CrossHatchFilter'),
    DisplacementFilter: require('./filters/displacement/DisplacementFilter'),
    DotScreenFilter:    require('./filters/dot/DotScreenFilter'),
    GrayFilter:         require('./filters/gray/GrayFilter'),
    DropShadowFilter:   require('./filters/dropshadow/DropShadowFilter'),
    InvertFilter:       require('./filters/invert/InvertFilter'),
    NoiseFilter:        require('./filters/noise/NoiseFilter'),
    PixelateFilter:     require('./filters/pixelate/PixelateFilter'),
    RGBSplitFilter:     require('./filters/rgb/RGBSplitFilter'),
    ShockwaveFilter:    require('./filters/shockwave/ShockwaveFilter'),
    SepiaFilter:        require('./filters/sepia/SepiaFilter'),
    SmartBlurFilter:    require('./filters/blur/SmartBlurFilter'),
    TiltShiftFilter:    require('./filters/tiltshift/TiltShiftFilter'),
    TiltShiftXFilter:   require('./filters/tiltshift/TiltShiftXFilter'),
    TiltShiftYFilter:   require('./filters/tiltshift/TiltShiftYFilter'),
    TwistFilter:        require('./filters/twist/TwistFilter')
};
