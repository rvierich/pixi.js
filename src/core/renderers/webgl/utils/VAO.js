/**
 * Generic Mask Stack data structure
 * @class
 * @memberof PIXI
 */
function VertexArrayObject(gl)
{
	/*
    // vertext data
    var gl = this.gl;

    // extensions??
    var ext = (
      gl.getExtension('OES_vertex_array_object') ||
      gl.getExtension('MOZ_OES_vertex_array_object') ||
      gl.getExtension('WEBKIT_OES_vertex_array_object')
    );
	*/


//	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

	this.attributes = {};

	this.indexBuffer = new IndexBuffer(gl);
}


VertexArrayObject.prototype.constructor = VertexArrayObject;
module.exports = VertexArrayObject;

VertexArrayObject.prototype.activate = function()
{
	var gl = this.gl;

	gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);  
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);  
	gl.enableVertexAttribArray(positionAttrib);  
	gl.vertexAttribPointer(positionAttrib, 3, gl.FLOAT, false, 12, 0);  

	texCoordBuffer = gl.createBuffer();  
	gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);  
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);  
	gl.enableVertexAttribArray(textureAttrib);  
	gl.vertexAttribPointer(textureAttrib, 2, gl.FLOAT, false, 8, 0);  

	indexBuffer = gl.createBuffer();  
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);  
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);  
   
}

VertexArrayObject.prototype.addAttribute = function(buffer, options)
{
    this.attributes.push({
    	attribute:options.attrib,
	 	size:2,
	 	stride:2,
	 	start:4
	})
}


VertexArrayObject.prototype.addIndex = function(buffer, options)
{
    this.attributes.push({
    	attrib:1,
	 	size:2,
	 	stride:2,
	 	start:4
	})
}


///////////////
///
///
///
///
///////////////

var VertexBuffer = function(gl, array)
{
	this.gl = gl;
	this.data = array;
	this.buffer = gl.createBuffer();
}

VertexBuffer.prototype.upload = function()
{
	var gl = this.gl;
	gl.bufferData(gl.ARRAY_BUFFER, this.data, gl.STATIC_DRAW);
}

VertexBuffer.prototype.bind = function()
{
	var gl = this.gl;
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer);
}

///////////////
///
///
///
///
///////////////

var IndexBuffer = function(gl)
{
	this.gl = gl;
	this.data = new Uint16Array(15000);
	this.buffer = gl.createBuffer();
}


IndexBuffer.prototype.upload = function(data)
{
	var gl = this.gl;
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data, gl.STATIC_DRAW);
}

IndexBuffer.prototype.bind = function()
{
	var gl = this.gl;
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer);
}

IndexBuffer.populate = function(data)
{
	for (var i=0, j=0; i < 15000; i += 6, j += 4)
    {
	  	data[i + 0] = j + 0;
	   	data[i + 1] = j + 1;
	   	data[i + 2] = j + 2;
	   	data[i + 3] = j + 0;
	   	data[i + 4] = j + 2;
	   	data[i + 5] = j + 3;
    }
}
