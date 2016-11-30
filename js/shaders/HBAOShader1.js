THREE.HBAOShader = {

	uniforms: {
		"tDiffuse":     { type: "t", value: null },
		"tDepth":       { type: "t", value: null },
		"texNoise":  	{ type: "t", value: null },
		"fov":          { type: "f", value: 75},//???
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
		//"FocalLen = vec2(1.0, 1.0);",

		// generating noise / pattern texture for dithering

		"vec3 rand( const vec2 coord ) {",

			"vec2 noise;",
			"float z;",

			"if ( useNoise ) {",

				"float nx = dot ( coord, vec2( 12.9898, 78.233 ) );",
				"float ny = dot ( coord, vec2( 12.9898, 78.233 ) * 2.0 );",

				"noise = clamp( fract ( 43758.5453 * sin( vec2( nx, ny ) ) ), 0.0, 1.0 );",
				//Why 
				"z = clamp( fract ( 43758.5453 * sin( ny  ) ), 0.0, 1.0 );",

			"} else {",

				"float ff = fract( 1.0 - coord.s * ( size.x / 2.0 ) );",
				"float gg = fract( coord.t * ( size.y / 2.0 ) );",

				"noise = vec2( 0.15, 0.65 ) * vec2( ff ) + vec2( 0.65, 0.15 ) * gg;",
				"z = gg * 0.20;",

			"}",

			"return vec3( noise * 2.0  - 1.0, z) * noiseAmount;",

		"}",


		// RGBA depth

		"float unpackDepth( const in vec4 rgba_depth ) {",

			"const vec4 bit_shift = vec4( 1.0 / ( 256.0 * 256.0 * 256.0 ), 1.0 / ( 256.0 * 256.0 ), 1.0 / 256.0, 1.0 );",
			"float depth = dot( rgba_depth, bit_shift );",
			"return depth;",

		"}",

		"float readDepth(const in vec2 coord ) {",

			"float cameraFarPlusNear = cameraFar + cameraNear;",
			"float cameraFarMinusNear = cameraFar - cameraNear;",
			"float cameraCoef = 2.0 * cameraNear;",

			// // "return ( 2.0 * cameraNear ) / ( cameraFar + cameraNear - unpackDepth( texture2D( tDepth, coord ) ) * ( cameraFar - cameraNear ) );",
			"return cameraCoef / ( cameraFarPlusNear - unpackDepth( texture2D( tDepth, coord )/cameraFar ) * cameraFarMinusNear );",
			//"return 1.0;",

		"}",

		"vec3 UVToViewSpace(vec2 uv, float z){",
			//"uv = UVToViewA * uv + UVToViewB;",
			"return vec3(uv *z, z);",
		"}",


		"vec3 GetViewPos(vec2 uv){",
					
			"float z = readDepth(uv) * cameraFar;", 
			//float z = texture(gPositionDepth, uv).z/(texture(gPositionDepth, uv).w + 1.0f) / 2.0f;
			"return UVToViewSpace(uv, z);",
			//"return vec3(1.0,1.0,1.0);",
		"}",

		
		"float TanToSin(float x)",
		"{",
			"return x * inversesqrt(x * x + 1.0);",
		"}",

		"float InvLength(vec2 V)",
		"{",
			"return inversesqrt(dot(V,V));",
		"}",
		
		"float Tangent(vec3 V)",
		"{",
			"return V.z * InvLength(V.xy);",
		"}",

		"float BiasedTangent(vec3 V)",
		"{",
			"float TanBias = tan(45.0 * PI / 180.0);",
			"return V.z * InvLength(V.xy) + TanBias;",
		"}",

		"float Tangent(vec3 P, vec3 S)",
		"{",
			"return -(P.z - S.z) * InvLength(S.xy - P.xy);",

		"}",

		"float Length2(vec3 V)",
		"{",
			"return dot(V,V);",
		"}",

		"vec3 MinDiff(vec3 P , vec3 Pr, vec3 Pl)",
		"{",
			"vec3 V1 = Pr- P;",
			"vec3 V2 = P - Pl;",
			"return (Length2(V2) < Length2(V2)) ? V1 : V2;",
		"}",

		"vec2 SnapUVOffset(vec2 uv)",
		"{",
			"return floor(uv*AORes) * InvAORes;",// floor for round
		"}",

		"float Falloff(float d2)",
		"{",
			"return d2 * NegInvR2 + 1.0;",
		"}",

		"float HorizonOcclusion(vec2 deltaUV, vec3 P, vec3 dPdu, vec3 dPdv, float randstep, float numSamples)",
		"{",
			"float ao = 0.0;",
			//"float randstep_float = float(randstep);",
			"vec2 uv = vUv + SnapUVOffset(randstep * deltaUV);",
			"deltaUV = SnapUVOffset(deltaUV);",
			"vec3 T = deltaUV.x * dPdu + deltaUV.y * dPdv;",
			"float tanH = BiasedTangent(T);",
			"float sinH = TanToSin(tanH);",
			"float tanS;",
			"float d2;",
			"vec3 S;",
			"float s = 1.0;",
			"for(int i = 0; i < 64; i++)",
			"{",
				"if(s > numSamples) break;",
				"else",
				"{",
					"s += 1.0;",
					"uv += deltaUV;",
					"S = GetViewPos(uv);",
					"tanS = Tangent(P,S);",
					"d2 = Length2(S-P);",
					"if(d2 < R2 && tanS > tanH)",
					"{",
						"float sinS = TanToSin(tanS);",
						"ao += Falloff(d2) * (sinS - sinH);",
						"tanH = tanS;",
						"sinH = sinS;",
					"}",
				"}",
			"}",
			// "for(int s = 1; s <= numSamples; ++s)",
			// "{",
			// 	"uv += deltaUV;",
			// 	"S = GetViewPos(uv);",
			// 	"tanS = Tangent(P,S);",
			// 	"d2 = Length2(S-P);",
			// 	"if(d2 < R2 && tanS > tanH)",
			// 	"{",
			// 		"float sinS = TanToSin(tanS);",
			// 		"ao += Falloff(d2) * (sinS - sinH);",
			// 		"tanH = tanS;",
			// 		"sinH = sinS;",
			// 	"}",
			// "}",

			"return ao;",
		"}",
		
		"vec2 RotateDirections(vec2 Dir, vec2 CosSin)",
		"{",
			"return vec2(Dir.x * CosSin.x - Dir.y * CosSin.y, Dir.x * CosSin.y + Dir.y * CosSin.x);",
		"}",

		"void ComputeSteps(inout vec2 stepSizeUv, inout float numSteps, float rayRadiusPix, float rand)",

		"{",
			"float NumSamples_float = float(NumSamples);",
			"numSteps = min(NumSamples_float, rayRadiusPix);",
			"float stepSizePix = rayRadiusPix / (numSteps + 1.0);",
			"float maxNumSteps = MaxRadiusPixels / stepSizePix;",
			"if(maxNumSteps < numSteps)",
			"{",
				"numSteps = floor(maxNumSteps + rand);",
				"numSteps = max(numSteps, 1.0);",
				"stepSizePix = MaxRadiusPixels / numSteps;",
			"}",
			"stepSizeUv = stepSizePix * InvAORes;",

		"}",


		"void main() {",
			"float numDirections_float = float(NumDirections);",
			"int numDirections = NumDirections;",
			"vec3 P, Pr, Pl, Pt, Pb;",
			"P = GetViewPos(vUv);",

			"Pr = GetViewPos(vUv + vec2(InvAORes.x,0));",
			"Pl = GetViewPos(vUv + vec2(-InvAORes.x,0));",
			"Pt = GetViewPos(vUv + vec2(0, InvAORes.y));",
			"Pb = GetViewPos(vUv + vec2(0, -InvAORes.y));",
			"vec3 dPdu = MinDiff(P, Pr, Pl);",
			"vec3 dPdv = MinDiff(P, Pt, Pb) * (AORes.y * InvAORes.x);",
			//"vec3 random = texture2D(texNoise, vUv.xy * noiseScale).rgb;",
			"vec3 random = rand(vUv * noiseScale).rgb;",
			"vec2 rayRadiusUV = 0.5 * R * FocalLen / -P.z;",
			"float rayRadiusPix = rayRadiusUV.x * AORes.x;",
			"float ao = 1.0;",
			"if(rayRadiusPix > 1.0)",
			"{",
				"ao = 0.0;",
				"float numSteps;",
				"vec2 stepSizeUV;",
				"ComputeSteps(stepSizeUV, numSteps, rayRadiusPix,random.z);",
				"float alpha = 2.0 * PI / numDirections_float;",
				"float d = 0.0;",
				"for(int a = 0 ; a <= NumDirections; ++a)",
				"{",
					"d = d + 1.0;",
					"float theta = alpha * d;",
					"vec2 dir = RotateDirections(vec2(cos(theta), sin(theta)),random.xy);",
					"vec2 deltaUV = dir * stepSizeUV;",
					"ao += HorizonOcclusion(deltaUV, P, dPdu, dPdv, random.z, numSteps);",
				"}",

				"ao = 1.0 - ao / numDirections_float * 50.0;",
			
			"}",

			//"gl_FragColor = vec4(0.0,1.0,0.0,1.0 );",
			"vec3 color = texture2D( tDiffuse, vUv ).rgb;",

			"vec3 lumcoeff = vec3( 0.299, 0.587, 0.114 );",
			"float lum = dot( color.rgb, lumcoeff );",
			"vec3 luminance = vec3( lum );",

			"vec3 final = vec3( color * mix( vec3( ao ), vec3( 1.0 ), luminance) );",  // mix( color * ao, white, luminance )

			"if ( onlyAO ) {",

				"final = vec3(ao,ao,ao);",  // ambient occlusion only ao=1.0?
				
			"}",
			//"gl_FragColor = vec4(0.0,1.0,0.0,1.0 );",
			"gl_FragColor = vec4( final, 1.0 );",
			//Position
		"}"


	].join( "\n" ),


};