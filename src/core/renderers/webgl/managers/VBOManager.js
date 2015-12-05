/**
 * @class
 * @memberof PIXI
 * @param renderer {PIXI.WebGLRenderer} The renderer this manager works for.
 */
function WebGLManager(renderer)
{
  
}

WebGLManager.prototype.constructor = WebGLManager;
module.exports = WebGLManager;

/**
 * Generic method called when there is a WebGL context change.
 *
 */
WebGLManager.prototype.onContextChange = function ()
{
	// do some codes init!
};

/**
 * Generic destroy methods to be overridden by the subclass
 *
 */
WebGLManager.prototype.destroy = function ()
{
    
};
