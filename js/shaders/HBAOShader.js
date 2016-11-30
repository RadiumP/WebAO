THREE.HBAOShader = {

	uniforms: {
		"tDiffuse":     { type: "t", value: null },
		"tDepth":       { type: "t", value: null },
		"texNoise":  	{ type: "t", value: null },
		"fov":          { type: "f", value: 0.0},//???
		"size":         { type: "v2", value: new THREE.Vector2( 512, 512 ) },
		"cameraNear":   { type: "f", value: 1.0 },
		"cameraFar":    { type: "f", value: 100.0 },
		"onlyAO":       { type: "i", value: 0 },
		"aoClamp":      { type: "f", value: 0.5 },
		"lumInfluence": { type: "f", value: 0.5 },
		"fov": 			{ type: "f", value: 45.0},
	},

	vertexShader:[
		"varying vec2 vUv;",

		"void main() {",

			"vUv = uv;",//TexCoord

			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
			//Position
		"}"
	].join( "\n" ),
	fragmentShader: [
		"const float PI = 3.14159265;",
		"varying vec2 vUv;",
		
		
		
		

		"uniform float cameraNear;",
		"uniform float cameraFar;",
		"uniform sampler2D tDiffuse;",
		"uniform sampler2D tDepth;",
		"uniform sampler2D texNoise;",
		"uniform bool onlyAO;", 
		"uniform float fov;", 
		
		
		"uniform vec2 size;",
		"vec2 noiseScale = vec2(size.x/4.0, size.y/4.0);",
		"vec2 AORes = vec2(size.x,size.y);",
		"vec2 InvAORes = vec2(1.0/size.x, 1.0/size.y);",
		"const float NegInvR2 = -1.0 / (0.3 * 0.3);",
		"const float R2 = (0.3 * 0.3);",
		"const float R = 0.3;",
		"const float noiseAmount = 0.0003;",
		"const int NumSamples = 6;",
		"const int NumDirections = 4;",
		"const float MaxRadiusPixels = 100.0;",
		"const float AOStrength = 1.9;",
		"const bool useNoise = false;", 
		"float fovRad = fov / 180.0 * PI;",
		"vec2 FocalLen = vec2(1.0 / tan(fovRad * 0.5) * (size.y / size.x), 1.0 / tan(fovRad * 0.5));",
		

		"vec3 reconstructNormalVS(vec3 positionVS)",
		"{",
			
			"return normalize(cross(dFdx(positionVS),dFdy(positionVS)));",
		"}",

		// // RGBA depth

		// "float unpackDepth( const in vec4 rgba_depth ) {",

		// 	"const vec4 bit_shift = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );",
		// 	"float depth = dot( rgba_depth, bit_shift );",
		// 	"return depth;",

		// "}",

		// "float readDepth(const in vec2 coord ) {",

		// 	"float cameraFarPlusNear = cameraFar + cameraNear;",
		// 	"float cameraFarMinusNear = cameraFar - cameraNear;",
		// 	"float cameraCoef = 2.0 * cameraNear;",

		// 	// // "return ( 2.0 * cameraNear ) / ( cameraFar + cameraNear - unpackDepth( texture2D( tDepth, coord ) ) * ( cameraFar - cameraNear ) );",
		// 	"return cameraCoef / ( cameraFarPlusNear - unpackDepth( texture2D( tDepth, coord )/cameraFar ) * cameraFarMinusNear );",
		// 	//"return 1.0;",

		// "}",

		// "vec3 UVToViewSpace(vec2 uv, float z){",
		// 	//"uv = UVToViewA * uv + UVToViewB;",
		// 	"return vec3(uv *z, z);",
		// "}",


		// "vec3 GetViewPos(vec2 uv){",
					
		// 	"float z = readDepth(uv) * cameraFar;", 
		// 	//float z = texture(gPositionDepth, uv).z/(texture(gPositionDepth, uv).w + 1.0f) / 2.0f;
		// 	"return UVToViewSpace(uv, z);",
		// 	//"return vec3(1.0,1.0,1.0);",
		// "}",

		"void main() {",
		"gl_FragColor = vec4( 1.0,1.0,1.0, 1.0 );",

		"}"






	].join( "\n" ),


};