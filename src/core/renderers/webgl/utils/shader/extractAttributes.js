
var mapType = require('./mapType');

var extractAttributes = function(gl, program)
{
    var attributes = {};

    var totalAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES)

    for (var i = 0; i < totalAttributes; i++) 
    {
        var attribData = gl.getActiveAttrib(program, i);

        attributes[attribData.name] = {
            type:mapType(gl, attribData.type),
            location:gl.getAttribLocation(program, attribData.name)
        }
    };

    return attributes;  
}

module.exports = extractAttributes;

