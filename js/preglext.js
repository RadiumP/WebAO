/*    
preglext.js
3d WebGL stuff by Marcin Ignac http://marcinignc.com
Depends on PreGL by Dean McNamee
*/          

//--------------------------------------------------------------------

String.prototype.trim = function() {
	return this.replace(/^\s+|\s+$/g,"");
}

//--------------------------------------------------------------------                                                     

window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     ||    
          //callback is function
          //element is DOMElement
          function(callback, element){
            window.setTimeout(callback, 1000 / 60);
          };
})();     

//--------------------------------------------------------------------                                             

var PreGLExt = (function() {
    function valueToVector(value, defaultValue) {    
      value = value || defaultValue;
      if (value instanceof Array) {
        if (value.length == 4) {
          return new PreGL.Vec4(value[0], value[1], value[2], value[3]);
        }
        if (value.length == 3) {
          return new PreGL.Vec4(value[0], value[1], value[2]);
        }
      } 
      else return value;
    }                  
    var onceMap = [];
    function once(label, fn) {
      if (!onceMap[label]) {
        onceMap[label] = true;
        fn();               
      }
    }     
    
    function log(msg) {
       if (window.console) {
    			console.log(msg);
    		}
    }
    
    return {
      valueToVector: valueToVector,
      once: once,
      log: log
    }                                                                                                                      
})();                                                                 

//--------------------------------------------------------------------
    
function loadTexture(gl, src) {
  var texture = gl.createTexture();
  texture.image = new Image();
  texture.image.onload = function() {
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(
      gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, 
      gl.UNSIGNED_BYTE, texture.image
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
	  //gl.generateMipmap(gl.TEXTURE_2D)
    gl.bindTexture(gl.TEXTURE_2D, null);    
  }
  texture.image.src = src;
  return texture;
}    

function genNoiseTexture(gl, w, h) {       
  var texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  var b = new ArrayBuffer(w*h);
  var pixels = new Uint8Array(b);
  for(var y=0; y<h; y++) {
    for(var x=0; x<w; x++) {
      pixels[y*w + x] = Math.floor(Math.random()*255);
    }
  } 
  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.LUMINANCE, w, h, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, pixels
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.bindTexture(gl.TEXTURE_2D, null);   
  return texture;
}   

function genNoiseTextureRGBA(gl, w, h) {       
  var texture = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  var b = new ArrayBuffer(w*h*4);
  var pixels = new Uint8Array(b);
  for(var y=0; y<h; y++) {
    for(var x=0; x<w; x++) {
      pixels[(y*w + x)*4+0] = Math.floor(255 * Math.random());
      pixels[(y*w + x)*4+1] = Math.floor(255 * Math.random());
      pixels[(y*w + x)*4+2] = Math.floor(255 * Math.random());
      pixels[(y*w + x)*4+3] = Math.floor(255 * Math.random());
    }
  } 
  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, pixels
  );
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);   
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.bindTexture(gl.TEXTURE_2D, null);  
  
  texture.width = w;
  texture.height = h; 
  return texture;
}  

//jitter

function genJitter(gl, randEle, max, numDir ) {
  var jitter = new Array(randEle * max);
  var hbaoRandom = new PreGL.Vec4();
  //float Rand1 = rng.randExc();
  //float Rand2 = rng.randExc();
  for(var i = 0; i < randEle * max; i++)
  {
    var Rand1 = Math.random();
    var Rand2 = Math.random();//MTRand
    // Use random rotation angles in [0,2PI/NUM_DIRECTIONS)
    var Angle = 2.0 * Math.PI * Rand1 / numDir;
    hbaoRandom.x = Math.cos(Angle);
    hbaoRandom.y = Math.sin(Angle);
    hbaoRandom.z = Rand2;
    hbaoRandom.w = 0;
    jitter[i] = hbaoRandom; 
  }
  
  return jitter;
}                                                                 

//--------------------------------------------------------------------                                                     

function PerspectiveCamera(fov, aspectRatio, near, far, eye, target, up) {      
  this.fov = fov || 60;
  this.aspectRatio = aspectRatio || 4/3;
  this.near = near || 0.1;
  this.far = far || 100;        
  //this.eye = eye || new PreGL.Vec3(0, 0, 10);
  this.eye = eye || new PreGL.Vec3(0, 0, 5);  
  this.target = target || new PreGL.Vec3(0, 0, 0);  
  this.up = up || new PreGL.Vec3(0, 1, 0);
  this.projectionMatrix = new PreGL.Mat4();               
  this.viewMatrix = new PreGL.Mat4();
  this.updateMatrices();
}       

PerspectiveCamera.prototype.updateMatrices = function() {
  this.projectionMatrix.reset();
  this.projectionMatrix.perspective(this.fov, this.aspectRatio, this.near, this.far); 
  this.viewMatrix.reset();                         
  this.viewMatrix.lookAt(
    this.eye.x, this.eye.y, this.eye.z, 
    this.target.x, this.target.y, this.target.z, 
    this.up.x, this.up.y, this.up.z
  );  
}

PerspectiveCamera.prototype.getModelViewMatrix = function(modelTranslation, modelRotation, modelScale) {
  var t = PreGLExt.valueToVector(modelTranslation, new PreGL.Vec3(0, 0, 0));
  var r = PreGLExt.valueToVector(modelRotation, new PreGL.Vec4(0, 0, 1, 0));
  var s = PreGLExt.valueToVector(modelScale, new PreGL.Vec3(1, 1, 1));      
  
  var modelWorldMatrix = new PreGL.Mat4();
	modelWorldMatrix.translate(t.x, t.y, t.z);
	modelWorldMatrix.rotate(r.x, r.y, r.z, r.w);
	modelWorldMatrix.scale(s.x, s.y, s.z);      
	var modelViewMatrix = new PreGL.Mat4();
	return modelViewMatrix.mult2(this.viewMatrix, modelWorldMatrix);
}           
                               
//returns array of near and far frustrum corners in view coordinates
//starting from near top left and going forward in clock wise order
PerspectiveCamera.prototype.getFrustumCorners = function() {
  var hnear = 2 * Math.tan(this.fov/180*Math.PI / 2) * this.near;
 	var wnear = hnear * this.aspectRatio;      	
 	var hfar = 2 * Math.tan(this.fov/180*Math.PI / 2) * this.far;
  var wfar = hfar * this.aspectRatio;                        
  
  var corners = [];
  corners.push(new PreGL.Vec3(-wnear/2, hnear/2, -this.near)); //0, Near Top Left
  corners.push(new PreGL.Vec3( wnear/2, hnear/2, -this.near)); //1, Near Top Right
  corners.push(new PreGL.Vec3( wnear/2,-hnear/2, -this.near)); //2, Near Bottom Right
  corners.push(new PreGL.Vec3(-wnear/2,-hnear/2, -this.near)); //3, Near Bottom Left
  corners.push(new PreGL.Vec3(-wfar/2, hfar/2, -this.far));    //4, Far Top Left
  corners.push(new PreGL.Vec3( wfar/2, hfar/2, -this.far));    //5, Far Top Right
  corners.push(new PreGL.Vec3( wfar/2,-hfar/2, -this.far));    //6, Far Bottom Right
  corners.push(new PreGL.Vec3(-wfar/2,-hfar/2, -this.far));    //7, Far Bottom Left   
            
  /*
  var c = corners[4];
  var ntr = new PreGL.Vec4(c.x,c.y, c.z, 1.0);
  var p = this.projectionMatrix.multVec4(ntr);
  var uv = new PreGL.Vec3(p.x/p.w, p.y/p.w, p.z/p.w);
  var s = uv.scaled(0.5).added(new PreGL.Vec3(0.5, 0.5, 0.0));
  s.x = Math.round(s.x*100)/100;
  s.y = Math.round(s.y*100)/100;
  s.z = Math.round(s.z*100)/100;   
                                       
  var texCoord = {x:1, y:1};
  var hfar = 2.0 * Math.tan(this.fov/180*Math.PI/2.0) * this.far;
	var wfar = hfar * this.aspectRatio;   
	var ray = new PreGL.Vec3(wfar * (texCoord.x - 0.5), hfar * (texCoord.y - 0.5), -this.far);
	                                   
	console.log(corners[5].debugString());    
  console.log(ray.debugString());       
  
  var origin = ray;
  var originSS = new PreGL.Vec4(origin.x, origin.y, origin.z, 1.0);
  originSS = this.projectionMatrix.multVec4(originSS);
  var offset = new PreGL.Vec3(originSS.x, originSS.y, originSS.z);
  offset.scale(1.0 / originSS.w);
  offset.x = offset.x*0.5 + 0.5;
  offset.y = offset.y*0.5 + 0.5;  
  console.log(originSS.debugString());   
  */        
  return corners;
}

//--------------------------------------------------------------------                                                     

function FullScreenQuad(gl) {
  this.plane = SimpleMesh.buildPlaneXY(gl, 1, 1);
}     

FullScreenQuad.prototype.draw = function(shader) {    
  var projectionMatrix = new PreGL.Mat4();
	projectionMatrix.ortho(-0.5,0.5,-0.5,0.5,-1,10);
	var modelViewMatrix = new PreGL.Mat4();
  shader.set("projectionMatrix", projectionMatrix);
	shader.set("modelViewMatrix", modelViewMatrix);
  this.plane.draw(shader);
}

//--------------------------------------------------------------------
      
function FBO(gl, width, height) {     
  this.gl = gl;
  this.width = width;
  this.height = height;
  this.fbo = gl.createFramebuffer();
  this.depthBuffer = gl.createRenderbuffer();
  this.colorBuffer = gl.createTexture();
  
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, this.colorBuffer);  
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); //LINEAR_MIPMAP_LINEAR
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  //gl.generateMipmap(gl.TEXTURE_2D)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
                width, height, 0,
                gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
  gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthBuffer);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthBuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.colorBuffer, 0);
  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
    throw "Incomplete frame buffer object.";
  }

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}    

FBO.prototype.bind = function() {
  this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo);
}

FBO.prototype.unbind = function() {
  this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
}                                        
  
//--------------------------------------------------------------------

function Shader(gl, vertScriptId, fragScriptId) {    
  this.uniforms = {};
  this.attribs = {};  
  this.gl = gl;
  
  var vertSrc = document.getElementById(vertScriptId).innerHTML;
  var fragSrc = document.getElementById(fragScriptId).innerHTML
  this.program = PreGL.WebGL.createProgramFromShaderSources(gl, vertSrc, fragSrc);    
  this.scanVariables(gl, vertSrc);
  this.scanVariables(gl, fragSrc);  
}      

Shader.prototype.use = function() {  
  this.gl.useProgram(this.program);
}       

Shader.prototype.scanVariables = function(gl, src) {
  //';' would be better than '\n' in case shader source was compressed
  //but doesn't work if there are comments
  //TODO(marcin) switch to reg ex
  var lines = src.split("\n");                                             
  for(var i in lines) {
    var line = lines[i];    
    line = line.replace(/^\s+/g,"");    
    if (line.indexOf("uniform") === 0) {
      var t = line.split(" "); //TODO(marcin) switch to reg ex
      var type = t[1];
      var name = ""+t[2].replace(";", ""); 
      //check for uniform array
      if (name.indexOf("[") > 0) {                      
        name = name.substring(0, name.indexOf("["));        
      }
      var setterFunc;
      switch(type) {
        case "mat4": setterFunc = gl.uniformMatrix4fv; break;
        case "vec4": setterFunc = gl.uniform4fv; break;
        case "vec3": setterFunc = gl.uniform3fv; break;
        case "vec2": setterFunc = gl.uniform2fv; break;        
        case "float": setterFunc = gl.uniform1f; break;
        case "sampler2D": setterFunc = gl.uniform1i; break;
        case "sampler3D": setterFunc = gl.uniform1i; break;
        case "samplerCube": setterFunc = gl.uniform1i; break;                
        default: PreGLExt.log("Unknown uniform type : \"" + line + "\"");        
      }              
      this.uniforms[name] = {
        type: type,           
        location: gl.getUniformLocation(this.program, name),
        setterFunc: setterFunc
      }    
    } 
    if (line.indexOf("attribute") === 0) {
      var t = line.split(" "); //TODO(marcin) switch to reg ex
      var type = t[1];
      var name = t[2].replace(";", "");;      
      this.attribs[name] = {
        type: type,
        location: gl.getAttribLocation(this.program, name)
      }
    }
  }
}  

Shader.prototype.set = function(name, value) { 
  if (!name) {
    throw "Empty name";
    return;
  }
  var uniform = this.uniforms[name];
  if (uniform) {           
    if (uniform.setterFunc == this.gl.uniformMatrix4fv) {   
      uniform.setterFunc.call(this.gl, uniform.location, false, value.toFloat32Array())
    } 
    else {
      uniform.setterFunc.call(this.gl, uniform.location, value);
    }    
  } 
  else {                     
    PreGLExt.log("Unknown uniform name : " + name);
  }
}       

Shader.prototype.getAttribute = function(name){ 
  return this.attribs[name];
}          

//--------------------------------------------------------------------

function SimpleMesh(gl) {   
  this.gl = gl;
	this.attribs = [];
}

SimpleMesh.prototype.addAttrib = function(name, data, size) {
  size = size || 3  
	var attrib = {};
	attrib.name = name;
	attrib.data = data;
	attrib.buffer = this.gl.createBuffer();  
	attrib.size = size;
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, attrib.buffer);
	this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(data), this.gl.STATIC_DRAW);
	this.attribs.push(attrib);
}



SimpleMesh.prototype.updateAttrib = function(name, data) {
  var attrib = null;
  for(var i=0; i<this.attribs.length; i++) {
    if (this.attribs[i].name == name) {
      attrib = this.attribs[i];
      break;
    }
  }
  if (!attrib) {
    return;
  }
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, attrib.buffer);
	this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(data), this.gl.STATIC_DRAW);
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, 0);
}

SimpleMesh.prototype.setIndices = function(data) {  
  this.indices = {};
  this.indices.data = data;
  this.indices.buffer =this. gl.createBuffer();
	this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indices.buffer);
  this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, 
    new Uint16Array(data), this.gl.STATIC_DRAW
  ); 
  //this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, 0);
}
//plane draw
SimpleMesh.prototype.draw = function(program, primitive) {
  primitive = primitive || this.gl.TRIANGLES;  
  program = program.program ? program.program : program;
  
  for(var i in this.attribs) {         
    var attrib = this.attribs[i];
    if (attrib.location === undefined) {
      attrib.location = this.gl.getAttribLocation(program, attrib.name);      
    }
    if (attrib.location >= 0) {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, attrib.buffer);
      this.gl.vertexAttribPointer(attrib.location, attrib.size, this.gl.FLOAT, false, 0, 0);
      this.gl.enableVertexAttribArray(attrib.location);
    }                      
  }  
  this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indices.buffer);
  this.gl.drawElements(primitive, this.indices.data.length, this.gl.UNSIGNED_SHORT, 0);   
                       
  //for(var i in this.attribs) {         
  //  var attrib = this.attribs[i];
  //  this.gl.disableVertexAttribArray(attrib.location);   
  //}
  // bind with 0, so, switch back to normal pointer operation
  //this.gl.bindBuffer(this.gl.ARRAY_BUFFER, 0);
  //glBindBufferARB(GL_ELEMENT_ARRAY_BUFFER_ARB, 0);
}

//obj-model load
SimpleMesh.loadObj = function(gl, path)
{
  var model = new SimpleMesh(gl);

  var mesh = new SOBJ.MeshO(path);// data saved
  //OBJ.initMeshBuffers(gl, mesh);// buffer saved
  model.addAttrib("position", mesh.vertices);
  model.addAttrib("normal", mesh.vertexNormals);
  //model.addAttrib("texCoord", mesh.textures, 2);
  model.setIndices(mesh.indices);

  return model;
}






SimpleMesh.prototype.destroy = function() {
  this.gl.deleteBuffer(this.indices.buffer);
  for(var i in this.attribs) {
    this.gl.deleteBuffer(this.attribs[i].buffer);
  }
}        
 
SimpleMesh.buildPlaneXY = function(gl, sx, sy, nx, ny) {
  sx = sx || 1;
  sy = sy || 1;
  nx = nx || 10;
  ny = ny || 10;
  
  var vertices = [];
  var normals = [];
  var texCoords = [];
  var indices = [];
  
  for(var y=0; y < ny; y++ ) {
    for(var x=0; x < nx; x++ ) {
      vertices.push(x/(nx-1) * sx - sx/2, y/(ny-1) * sy - sy/2, 0);
      normals.push(0, 0, 1);
      texCoords.push(x/(nx-1), y/(ny-1));
      if (x < nx-1 && y < ny-1) {
        indices.push(y*nx + x, (y+1)*nx + x + 1, y*nx + x + 1);
        indices.push(y*nx + x, (y+1)*nx + x, (y+1)*nx + x + 1);
      }
    }    
  }
  
  var plane = new SimpleMesh(gl);
  plane.addAttrib("position", vertices);        
  plane.addAttrib("normal", normals);          
  plane.addAttrib("texCoord", texCoords, 2);    
  plane.setIndices(indices);
  plane.type = "PlaneXY";
  return plane;
}

SimpleMesh.buildPlaneXZ = function(gl, sx, sz, nx, nz) {
  sx = sx || 1;
  sz = sz || 1;
  nx = nx || 10;
  nz = nz || 10;
  
  var vertices = [];
  var texCoords = [];
  var indices = [];
  
  for(var z=0; z < nz; z++ ) {
    for(var x=0; x < nx; x++ ) {
      vertices.push(x/nx * sx - sx/2, 0, z/nz * sz - sz/2);
      texCoords.push(x/nx, z/nz);
      if (x < nx-1 && z < nz-1) {
        indices.push(z*nx + x, (z+1)*nx + x + 1, z*nx + x + 1);
        indices.push(z*nx + x, (z+1)*nx + x, (z+1)*nx + x + 1);
      }
    }    
  }
  
  var plane = new SimpleMesh(gl);
  plane.addAttrib("position", vertices);
  plane.addAttrib("texCoord", texCoords, 2);    
  plane.setIndices(indices); 
  plane.type = "PlaneXZ";
  return plane;
}

SimpleMesh.buildSphere = function(gl, r, nsides, nsegments) {  
  r = r || 1;
  nsides = nsides || 30;
  nsegments = nsegments || 30;
	function degToRad(d) {
		return d/180 * Math.PI;
	}
	var mesh = {
		vertices : [],
		normals : [],
		texCoords : [],
		indices: []
	};
	
 	var dtheta = 180.0/nsegments;
 	var dphi   = 360.0/nsides;
	
	var estimatedNumPoints = (Math.floor(360/dtheta) + 1) * (Math.floor(180/dphi) + 1);
	
	//vertexStream.setNumVertices(estimatedNumPoints);
	//vertexStream.setNumIndices(estimatedNumPoints * 6);
	function evalPos(theta, phi) {
	  var R = r;
		var pos = new PreGL.Vec3();
		pos.x = R * Math.sin(degToRad(theta)) * Math.sin(degToRad(phi));
		pos.y = R * Math.cos(degToRad(theta));
		pos.z = R * Math.sin(degToRad(theta)) * Math.cos(degToRad(phi));
		return pos;
	}
	for (var theta=0, segment=0; theta<=180; theta+=dtheta, ++segment) {
		for (var phi=0, side=0; phi<=360; phi+=dphi, ++side) { 
		  var pos = evalPos(theta, phi);           
		  //var pos2 = evalPos(theta+0.01, phi);           
		  //var pos3 = evalPos(theta, phi+0.01); 
		  //var n = pos2.sub(pos).cross(pos3.sub(pos));
		  //n = n.normalize();    
		  var n = pos.normalized();
		  
			mesh.vertices.push(pos.x, pos.y, pos.z); 			
			mesh.normals.push(n.x, n.y, n.z);
			mesh.texCoords.push(phi/360.0, theta/180.0);

			//no faces on the last segment
			if (segment == nsegments) continue;
			if (side == nsides) continue;

			mesh.indices.push((segment  )*(nsides+1) + side); 			
			mesh.indices.push((segment+1)*(nsides+1) + side);	
			mesh.indices.push((segment+1)*(nsides+1) + side + 1);
			
			mesh.indices.push((segment  )*(nsides+1) + side); 			
			mesh.indices.push((segment+1)*(nsides+1) + side + 1);
			mesh.indices.push((segment  )*(nsides+1) + side + 1);
			
					
			/*
			mesh.indices.push((segment  )*(nsides+1) + side); 
			mesh.indices.push((segment+1)*(nsides+1) + side);			
			mesh.indices.push((segment+1)*(nsides+1) + side + 1);
			mesh.indices.push((segment  )*(nsides+1) + side); 
			mesh.indices.push((segment+1)*(nsides+1) + side + 1);
			mesh.indices.push((segment  )*(nsides+1) + side + 1);
			*/
		}
	}
	
	var sphere = new SimpleMesh(gl);
  sphere.addAttrib("position", mesh.vertices);
  sphere.addAttrib("normal", mesh.normals);  
  sphere.addAttrib("texCoord", mesh.texCoords, 2); 
  sphere.type = "Sphere";   
  sphere.setIndices(mesh.indices); 
  
  return sphere;
}