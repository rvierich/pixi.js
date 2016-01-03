
var setVertexAttribArrays = require('./setVertexAttribArrays');

/**
 * Generic Mask Stack data structure
 * @class
 * @memberof PIXI
 */
function VertexArrayObject(gl)
{
	
	this.nativeVaoExtension = (
      gl.getExtension('OES_vertex_array_object') ||
      gl.getExtension('MOZ_OES_vertex_array_object') ||
      gl.getExtension('WEBKIT_OES_vertex_array_object')
    );

	if(this.nativeVaoExtension)
	{
		this.nativeVao = this.nativeVaoExtension.createVertexArrayOES();  
	}

	this.gl = gl;

	this.attributes = [];

	this.indexBuffer = null;

	this.dirty = false;

	
}

VertexArrayObject.prototype.constructor = VertexArrayObject;
module.exports = VertexArrayObject;

VertexArrayObject.prototype.update = function()
{
	this.nativeVaoExtension.bindVertexArrayOES(this.nativeVao);  
   
	this.activate();

	this.nativeVaoExtension.bindVertexArrayOES(null);  
}

VertexArrayObject.prototype.bind = function()
{
	if(this.nativeVao)
	{
		if(this.dirty)
		{
			this.dirty = false;
			this.update();
		}

		if(this.nativeVao)
		{
			this.nativeVaoExtension.bindVertexArrayOES(this.nativeVao);  
		}
	}
	else
	{
		this.activate();
	}
}

VertexArrayObject.prototype.activate = function()
{
	var gl = this.gl;


	for (var i = 0; i < this.attributes.length; i++) 
	{
		var attrib = this.attributes[i];
		attrib.buffer.bind();	
		gl.vertexAttribPointer(attrib.attribute, 2, gl.FLOAT, false, 0, 0); 
	};

	setVertexAttribArrays(gl, this.attributes);

	this.indexBuffer.bind();
}

VertexArrayObject.prototype.addAttribute = function(buffer, options)
{
    this.attributes.push({
    	buffer:buffer,
    	attribute:options.attrib,
	 	size:2,
	 	stride:0,
	 	start:0
	})

	this.dirty = true;
}


VertexArrayObject.prototype.addIndex = function(buffer, options)
{
    this.indexBuffer = buffer;

    this.dirty = true;
}



