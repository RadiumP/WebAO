


window.onload = function() {  

	//gui

	var level = 0;
	var gui = new dat.GUI();
	var mode;
	mode = {
		AOMode: "SSAO",
		TessLvl: 0,
	}
	var aoShader = 'SSAO';

	
	


	var canvas = document.getElementById("canvas");
	var gl = PreGL.WebGL.getContext(canvas);

	var havePointerLock = 'pointerLockElement' in document ||
    'mozPointerLockElement' in document ||
    'webkitPointerLockElement' in document;

	canvas.requestPointerLock = canvas.requestPointerLock ||
			     canvas.mozRequestPointerLock ||
			     canvas.webkitRequestPointerLock;
	// Ask the browser to lock the pointer
	

	canvas.onclick = function() {
  		canvas.requestPointerLock();
	}


	// Ask the browser to release the pointer
	document.exitPointerLock = document.exitPointerLock ||
				document.mozExitPointerLock ||
				document.webkitExitPointerLock;
	//document.exitPointerLock();

	// Hook pointer lock state change events for different browsers
	document.addEventListener('pointerlockchange', lockChangeAlert, false);
	document.addEventListener('mozpointerlockchange', lockChangeAlert, false);

	function lockChangeAlert() {
	  if(document.pointerLockElement === canvas ||
	  document.mozPointerLockElement === canvas) {
	    console.log('The pointer lock status is now locked');
	    document.addEventListener("mousemove", canvasLoop, false);
	  } else {
	    console.log('The pointer lock status is now unlocked');  
	    document.removeEventListener("mousemove", canvasLoop, false);
	  }
	}

	var yaw = 0;
	var pitch = 0;

	function canvasLoop(e) {
	  var movementX = e.movementX ||
	      e.mozMovementX          ||
	      0;

	  var movementY = e.movementY ||
	      e.mozMovementY      ||
	      0;
	 yaw += movementX;
	 pitch -= movementY;
	   
}
	var front = new  PreGL.Vec3(0,0,0);
	
	var right = new  PreGL.Vec3(0,0,0);
	

	document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;


    //camera
	var cameraX, cameraY, cameraZ;
	var targetX, targetY, targetZ;
	var move = new PreGL.Vec3(0,0,0);
	var yawRate = 0;	


	var time = 0;  
	var sphere;   
	var plane;    		
	var renderDepthShader;    
	var blurShader;	
	var ssaoFSQuad;             
	var ssaoShader;   
	var hbaoShader;
	var noiseTexture;
	var depthFbo; 
	var normalFbo;     
	var ssaoFbo;    
	var prevTime = 0;  
	var fpsFrames = 0;
	var fpsTime = 0;
	var fps = 0; 
	var kernel = [];
	var model;

	var pnTest;

	
	gui.add(mode,'AOMode', ['SSAO', 'HBAO', 'SAO', 'HBAO+','No AO']).onChange(function(AO){
		aoShader = AO;
		loadAOShader();
	});
	gui.add(mode, 'TessLvl',['0',1,2,3]).onChange(function(lvl){
		if(lvl === '0' )
			level = 0;
		else level = lvl;
		
		load();
	});
   
   function loadAOShader()
   {
   	if(aoShader === 'SSAO')
		{
			ssaoShader = new Shader(gl, "ssao.vert", "ssao.frag");
			
		}	
		if(aoShader === 'HBAO+')
		{
			ssaoShader = new Shader(gl, "ssao.vert", "hbaoplus.frag");
			
		}
		if(aoShader === 'HBAO'){
		ssaoShader = new Shader(gl, "ssao.vert", "hbao.frag");
		}

		if(aoShader === 'SAO'){
		ssaoShader = new Shader(gl, "ssao.vert", "sao.frag");
		}	
		if(aoShader === 'No AO'){
		ssaoShader = new Shader(gl, "ssao.vert", "noao.frag");
		}	
	
   }



	function setup() { 
		var supported = gl.getSupportedExtensions();                  
		PreGLExt.log("Supported WebGL extensions: " + supported);

		//shader  		
		renderDepthShader = new Shader(gl, "showDepth.vert", "showDepth.frag"); 

		//renderDepthShader = new Shader(gl, "geoSSAO.vs", "geoSSAO.fs"); 
		

		blurShader = new Shader(gl, "baseTexture.vert", "blur.frag");
		//blurShader = new Shader(gl, "SSAO.vs", "ssaoBlur.fs");

		loadAOShader();
		load();

		//pnTest = new subMesh(gl,sub, level);

		
		ssaoFSQuad = new FullScreenQuad(gl);
		depthFbo = new FBO(gl, 1280, 960); 
		normalFbo = new FBO(gl, 1280, 960);  
		ssaoFbo = new FBO(gl, 1280, 960);
		
		noiseTexture = genNoiseTextureRGBA(gl, 4, 4);  
		
		prevTime = (new Date()).getTime();  
		
		
		var kernelSize = 16;
		for(var i=0; i<kernelSize; i++) {
			kernel.push(2.0 * (Math.random() - 0.5));
			kernel.push(2.0 * (Math.random() - 0.5));
			kernel.push(Math.random());				
		}	

	}

	function draw() { 

		var currTime = (new Date()).getTime();
		var deltaTime = (currTime - prevTime)/1000;
		prevTime = currTime;		                              
		time += deltaTime;	  
		fpsTime += deltaTime;
		fpsFrames++;
		if (fpsTime > 5) {
			fps = fpsFrames / fpsTime;
			fpsTime = 0;   
			fpsFrames = 0;			
			PreGLExt.log("FPS : " + fps);  
		}          
		
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);						
		gl.enable(gl.DEPTH_TEST);      
		

		handleKeys();

		cameraX = -4;
		cameraY = 0;
		cameraZ = 4;

		targetX = 0;
		targetY = 0;
		targetZ = 0;

		front = new PreGL.Vec3(Math.cos(yaw * Math.PI / 180.0 ) * Math.cos(pitch * Math.PI / 180.0 ), Math.sin(pitch * Math.PI / 180.0 ), Math.sin(yaw * Math.PI / 180.0 ) * Math.cos(pitch * Math.PI / 180.0 ));
		var up = new PreGL.Vec3(0, 1, 0);
		right.cross2(front, up);
		var lookAt = new PreGL.Vec3(targetX - cameraX, targetY - cameraY, targetZ - cameraZ);
		//var r = Math.sqrt(lookAt.dot(lookAt));
	

		var cameraPos = new PreGL.Vec3(cameraX, cameraY, cameraZ);//controls
		cameraPos.add2(cameraPos, move);
		var targetPos = new PreGL.Vec3();
		targetPos.add2(front, cameraPos);
		console.log(front);
		var camera = new PerspectiveCamera(60, depthFbo.width/depthFbo.height, 1, 2000, cameraPos, targetPos);
		//target (0,0,0)
		
		PreGLExt.once("camera frustum", function() {
		   var frustumCorners = camera.getFrustumCorners();
		});



	    depthFbo.bind();		
		gl.clearColor(0, 0, 0, 1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.viewport(0, 0, depthFbo.width, depthFbo.height);                               	  
		renderScene(camera, renderDepthShader, time); 
		depthFbo.unbind(); 
                  
		ssaoFbo.bind();    
		gl.clearColor(0, 0, 0, 1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.viewport(0, 0, ssaoFbo.width, ssaoFbo.height);
		
		//SSAO
		ssaoShader.use();           			
		ssaoShader.set("depthTex", 0);    
		ssaoShader.set("noiseTex", 1);    
		ssaoShader.set("fov", camera.fov/180*Math.PI);  
		ssaoShader.set("aspectRatio", camera.aspectRatio);
		ssaoShader.set("noiseScale", [depthFbo.width/noiseTexture.width, depthFbo.height/noiseTexture.height]); //4 = noise texture width
		ssaoShader.set("kernel", kernel);
		
		var viewProjectionMatrix = new PreGL.Mat4();
		var viewProjectionInverseMatrix = new PreGL.Mat4();
		viewProjectionMatrix.mult2(camera.projectionMatrix, camera.viewMatrix);
		viewProjectionInverseMatrix = viewProjectionMatrix. invert().transpose();
		ssaoShader.set("viewProjectionInverseMatrix",viewProjectionInverseMatrix);

		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, depthFbo.colorBuffer);    
		gl.activeTexture(gl.TEXTURE1);            
		gl.bindTexture(gl.TEXTURE_2D, noiseTexture); 

		renderScene(camera, ssaoShader, time);
		
		gl.activeTexture(gl.TEXTURE0);  
		ssaoFbo.unbind(); 

		//blur	 
		blurShader.use();           			
		blurShader.set("colorTex", 0);    
		blurShader.set("texelSize", [1/ssaoFbo.width, 1/ssaoFbo.height]);
		gl.activeTexture(gl.TEXTURE0);
		gl.bindTexture(gl.TEXTURE_2D, ssaoFbo.colorBuffer);    
		

		ssaoFSQuad.draw(blurShader); 
		gl.activeTexture(gl.TEXTURE0);  
		
		
		gl.viewport(0, 0, canvas.width, canvas.height);  
		
		requestAnimFrame(draw, canvas);

	}

	function renderScene(camera, shader, time) {
		shader.use();           
		shader.set("projectionMatrix", camera.projectionMatrix);		
		shader.set("viewMatrix", camera.viewMatrix);		
		shader.set("near", camera.near);
		shader.set("far", camera.far);

		          


		modelViewMatrix = camera.getModelViewMatrix([1, 0, 0], [Math.PI / 2 * time, 0, 1, 0], [1, 1, 1]);			
		shader.set("modelViewMatrix", modelViewMatrix);                                         
		normalMatrix = modelViewMatrix.invert().transpose();
		shader.set("normalMatrix", normalMatrix);   
			
		//rabbit.draw(shader);
		//strip

		//pnTest.draw(shader, gl.LINE_STRIP);
		pnTest.draw(shader);
		

		modelViewMatrix = camera.getModelViewMatrix([-100, 0, 0], [Math.PI / 3 * time, 0, 1, 0], [1, 1, 1]);			
		shader.set("modelViewMatrix", modelViewMatrix);                                         
		normalMatrix = modelViewMatrix.invert().transpose();
		shader.set("normalMatrix", normalMatrix);


		luffy.draw(shader);


	}

	function start() {
		//setInterval(draw, 1000/60);
		requestAnimFrame(draw, canvas);

		
	}      

	var currentlyPressedKeys = {};

    function handleKeyDown(event) {
        currentlyPressedKeys[event.keyCode] = true;
        //console.log("down");
    }


    function handleKeyUp(event) {
        currentlyPressedKeys[event.keyCode] = false;
    }
 

	function handleKeys() {
        if (currentlyPressedKeys[33]) {
            // Page Up
            pitchRate = 0.1;
        } else if (currentlyPressedKeys[34]) {
            // Page Down
            pitchRate = -0.1;
        } else {
            pitchRate = 0;
        }

        if (currentlyPressedKeys[37] || currentlyPressedKeys[65]) {
            // Left cursor key or A
            //yawRate += Math.PI / 32.0;
            move.sub2(move, right);
        } else if (currentlyPressedKeys[39] || currentlyPressedKeys[68]) {
            // Right cursor key or D
            //yawRate -= Math.PI / 32.0;
             move.add2(move, right);
        } else {
            //yawRate = 0;
        }

        if (currentlyPressedKeys[38] || currentlyPressedKeys[87]) {
            // Up cursor key or W
            var temp = front.scaled(0.5);
            move.add2(move,temp);
        } else if (currentlyPressedKeys[40] || currentlyPressedKeys[83]) {
            // Down cursor key
            var temp = front.scaled(0.5);
            move.sub2(move,temp);
        } else {
            speed = 0;
        }

    }



	setup();   

		
	start();

}



