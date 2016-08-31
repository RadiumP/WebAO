function pnTess(gl, path, level)
{
	var newVerts = [];//new Float32Array(3*65000);
	var newNorms = [];//new Float32Array(3*65000);
	var newIndis = [];//0.0;

	var model = new SimpleMesh(gl);

	var mesh = new OBJ.Mesh(path);

	var verts = mesh.vertices;
	var norms = mesh.vertexNormals;
	var texCoord = mesh.textures;
	var indices = mesh.indices;

	if(level === 0)
	{
		model.addAttrib("position", mesh.vertices);
  		model.addAttrib("normal", mesh.vertexNormals);
  		model.addAttrib("texCoord", mesh.textures, 2);
  		model.setIndices(mesh.indices);

  		
	}
	else
	{
		level = level + 1,0;
		var fac = 1.0 / level;

		var tmpIndex = 0;
		//newIndis.push(tmpIndex);
		for(var i = 0; i < indices.length; i = i + 3)
		{	
			var P1, P2, P3;
			var N1, N2, N3;
			
			P1 = new PreGL.Vec3(verts[3 * i], verts[3 * i + 1], verts[3 * i + 2]);
			P2 = new PreGL.Vec3(verts[3 * (i + 1)], verts[3 * (i + 1) + 1], verts[3 * (i + 1) + 2]);
			P3 = new PreGL.Vec3(verts[3 * (i + 2)], verts[3 * (i + 2) + 1], verts[3 * (i + 2) + 2]);

			N1 = new PreGL.Vec3(norms[3 * i], norms[3 * i + 1], norms[3 * i + 2]);
			N2 = new PreGL.Vec3(norms[3 * (i + 1)], norms[3 * (i + 1) + 1], norms[3 * (i + 1) + 2]);
			N3 = new PreGL.Vec3(norms[3 * (i + 2)], norms[3 * (i + 2) + 1], norms[3 * (i + 2) + 2]);


			//position
			var tempP1 = new PreGL.Vec3(0,0,0);
			var tempP2 = new PreGL.Vec3(0,0,0);
			var tempP3 = new PreGL.Vec3(0,0,0);

			tempP1.setVec3(P1);
			tempP2.setVec3(P2);
			tempP3.setVec3(P3);

			//normal
			var tempON1 = new PreGL.Vec3(0,0,0);
			var tempON2 = new PreGL.Vec3(0,0,0);
			var tempON3 = new PreGL.Vec3(0,0,0);

			tempON1.setVec3(N1);
			tempON2.setVec3(N2);
			tempON3.setVec3(N3);

			//pn patch
			var bPatch = [];

			var b300 = new PreGL.Vec3(0,0,0);
			var b030 = new PreGL.Vec3(0,0,0);
			var b003 = new PreGL.Vec3(0,0,0);
			var b210 = new PreGL.Vec3(0,0,0);
			var b120 = new PreGL.Vec3(0,0,0);
			var b102 = new PreGL.Vec3(0,0,0);
			var b021 = new PreGL.Vec3(0,0,0);
			var b012 = new PreGL.Vec3(0,0,0);
			var b201 = new PreGL.Vec3(0,0,0);
			var b111 = new PreGL.Vec3(0,0,0);

			b300.setVec3(tempP1);
			b030.setVec3(tempP2);
			b003.setVec3(tempP3);
			
			//w12 = dot( p2 - p1, n1 );
			P2 = P2.sub2(P2,  P1);
			var w12 = P2.dot(N1); 
			P2.setVec3(tempP2);
			N1.setVec3(tempON1);

			//w21 = dot( p1 - p2, n2 );
			P1 = P1.sub2(P1,  P2);
			var w21 = P1.dot(N2);
			P1.setVec3(tempP1);
			N2.setVec3(tempON2);

			//w13 = dot( p3 - p1, n1 );
			P3 = P3.sub2(P3, P1);
			var w13 = P3.dot(N1);
			P3.setVec3(tempP3);
			N1.setVec3(tempON1);

			//w31 = dot( p1 - p3, n3 );
			P1 = P1.sub2(P1, P3);
			var w31 = P1.dot(N3);
			P1.setVec3(tempP1);
			N3.setVec3(tempON3);

			//w23 = dot( p3 - p2, n2 );
			P3 = P3.sub2(P3, P2);
			var w23 = P3.dot(N2);
			P3.setVec3(tempP3);
			N2.setVec3(tempON2);

			//w32 = dot( p2 - p3, n3 );
			P2 = P2.sub2(P2, P3);
			var w32 = P2.dot(N3);
			P2.setVec3(tempP2);
			N3.setVec3(tempON3);

			//b210 = ( 2.*p1 + p2 - w12*n1 ) / 3.;
			b210.setVec3(P1.scale(2.0));
			b210.sub2(b210, N1.scale(w12));
			b210.add2(b210, P2);
			b210.scale(1 / 3.0);
			P1.setVec3(tempP1);
			N1.setVec3(tempON1);

			//b120 = ( 2.*p2 + p1 - w21*n2 ) / 3.;
			b120.setVec3(P2.scale(2.0));
			b120.sub2(b120, N2.scale(w21));
			b120.add2(b120, P1);
			b120.scale(1 / 3.0);
			P2.setVec3(tempP2);
			N2.setVec3(tempON2);

			//b021 = ( 2.*p2 + p3 - w23*n2 ) / 3.;
			b021.setVec3(P2.scale(2.0));
			b021.sub2(b021, N2.scale(w23));
			b021.add2(b021, P3);
			b021.scale(1 / 3.0);
			P2.setVec3(tempP2);
			N2.setVec3(tempON2);

			//b012 = ( 2.*p3 + p2 - w32*n3 ) / 3.;
			b012.setVec3(P3.scale(2.0));
			b012.sub2(b012, N3.scale(w32));
			b012.add2(b012, P2);
			b012.scale(1 / 3.0);
			P3.setVec3(tempP3);
			N3.setVec3(tempON3);

			//b102 = ( 2.*p3 + p1 - w31*n3 ) / 3.;
			b102.setVec3(P3.scale(2.0));
			b102.sub2(b102, N3.scale(w31));
			b102.add2(b102, P1);
			b102.scale(1 / 3.0);
			P3.setVec3(tempP3);
			N3.setVec3(tempON3);


			//b201 = ( 2.*p1 + p3 - w13*n1 ) / 3.;
			b201.setVec3(P1.scale(2.0));
			b201.sub2(b201, N1.scale(w13));
			b201.add2(b201, P3);
			b201.scale(1 / 3.0);
			P1.setVec3(tempP1);
			N1.setVec3(tempON1);

			var ee = new PreGL.Vec3(0,0,0);
			ee.setVec3(b210);
			ee.add2(ee, b120);
			ee.add2(ee, b021);
			ee.add2(ee, b012);
			ee.add2(ee, b102);
			ee.add2(ee, b201);
			ee.scale(1 / 6.0);

			var vv = new PreGL.Vec3(0,0,0);
			vv.add2(vv, P1);
			vv.add2(vv, P2);
			vv.add2(vv, P3);
			vv.scale( 1 / 3.0);

			var b111 = new PreGL.Vec3(0,0,0);
			
			b111.sub2(ee, vv);
			b111.scale(1 / 2.0);
			b111.add2(b111, ee);

			bPatch.push(b300);
			bPatch.push(b030);
			bPatch.push(b003);
			bPatch.push(b210);
			bPatch.push(b120);
			bPatch.push(b201);
			bPatch.push(b021);
			bPatch.push(b102);
			bPatch.push(b012);
			bPatch.push(b111);

			//norm patch
			var nPatch = [];
			var n200 = new PreGL.Vec3(0,0,0); 
			var n020 = new PreGL.Vec3(0,0,0); 
			var n002 = new PreGL.Vec3(0,0,0); 
			var n110 = new PreGL.Vec3(0,0,0); 
			var n011 = new PreGL.Vec3(0,0,0); 
			var n101 = new PreGL.Vec3(0,0,0); 

			n200.setVec3(N1);
			n020.setVec3(N2);
			n002.setVec3(N3);

			var v12, v23, v31;
			var tmpUp = new PreGL.Vec3(0,0,0);
			var tmpDown = new PreGL.Vec3(0,0,0);

			tmpUp.sub2(P2, P1);
			tmpDown.sub2(P2, P1);
			
			v12 = 2.0 * tmpUp.dot(N1.add2(N1, N2)) / tmpDown.dot(tmpDown);
			N1.setVec3(tempON1);

			tmpUp.sub2(P3, P2);
			tmpDown.sub2(P3, P2);
			
			v23 = 2.0 * tmpUp.dot(N2.add2(N2, N3)) / tmpDown.dot(tmpDown);
			N2.setVec3(tempON2);

			tmpUp.sub2(P1, P3);
			tmpDown.sub2(P1, P3);
			
			v31 = 2.0 * tmpUp.dot(N3.add2(N3, N1)) / tmpDown.dot(tmpDown);
			N3.setVec3(tempON3);

			
			n110.sub2(P2, P1);
			n110.sub2(N2, n110.scale(v12));
			n110.add2(N1, n110);

			n011.sub2(P3, P2);
			n011.sub2(N2, n011.scale(v23));
			n011.add2(N3, n011);

			n101.sub2(P1, P3);
			n101.sub2(N1, n101.scale(v31));
			n101.add2(N3, n101);

			nPatch.push(n200);
			nPatch.push(n020);
			nPatch.push(n002);
			nPatch.push(n110);
			nPatch.push(n011);
			nPatch.push(n101);
			
			
			
            // float v12 = 2. * dot( p2-p1, n1+n2 ) / dot( p2-p1, p2-p1 );
            // float v23 = 2. * dot( p3-p2, n2+n3 ) / dot( p3-p2, p3-p2 );
            // float v31 = 2. * dot( p1-p3, n3+n1 ) / dot( p1-p3, p1-p3 );
            // vec3 n200 = n1;
            // vec3 n020 = n2;
            // vec3 n002 = n3;
            // vec3 n110 = normalize( n1 + n2 - v12*(p2-p1) );
            // vec3 n011 = normalize( n2 + n3 - v23*(p3-p2) );
            // vec3 n101 = normalize( n3 + n1 - v31*(p1-p3) );


			// In each triangle gen new verts
			for(var n = 0; n < level; n++)
			{	
				var u = 1.0, v = 0.0, w = 0.0;
				u = u - n / level;//care
				w = w + n / level

				
				for(var m = 0; m < level - n; m++)
				{	

					utmp = u - m / level;//care
					vtmp = v + m / level
					//type 2 inverse
					if((utmp - fac) >= 0.0 && (w - fac) >= 0.0)
					{
						



						var temp4 = new PreGL.Vec3(0,0,0); 
						temp4.setVec3(getPos(utmp, vtmp, w, bPatch));
						// temp4.setVec3(P1.scale(utmp));
						// temp4.add2(temp4, P2.scale(vtmp));
						// temp4.add2(temp4, P3.scale(w));		

						// P1.setVec3(tempP1);
						// P2.setVec3(tempP2);
						// P3.setVec3(tempP3);
						// // var temp6 = new PreGL.Vec3(P1 * (utmp - fac) + P2 * (vtmp + fac) + P3 * w);
						// // var temp5 = new PreGL.Vec3(P1 * utmp  + P2 * (vtmp - fac) + P3 * (w + fac));


						var temp6 = new PreGL.Vec3(0,0,0); 
						temp6.setVec3(getPos(utmp - fac, vtmp + fac, w, bPatch));

						// temp6.setVec3(P1.scale(utmp - fac));
						// temp6.add2(temp6, P2.scale(vtmp + fac));
						// temp6.add2(temp6, P3.scale(w));	

						// P1.setVec3(tempP1);
						// P2.setVec3(tempP2);
						// P3.setVec3(tempP3);

						var temp5 = new PreGL.Vec3(0,0,0); 
						temp5.setVec3(getPos(utmp, vtmp + fac, w - fac, bPatch));
						// temp5.setVec3(P1.scale(utmp));
						// temp5.add2(temp5, P2.scale(vtmp + fac));
						// temp5.add2(temp5, P3.scale(w - fac));	

						// P1.setVec3(tempP1);
						// P2.setVec3(tempP2);
						// P3.setVec3(tempP3);

						
						newVerts.push(temp4.x);
						newVerts.push(temp4.y);
						newVerts.push(temp4.z);
						tmpIndex += 1.0;
						newIndis.push(tmpIndex);
							
						newVerts.push(temp5.x);
						newVerts.push(temp5.y);
						newVerts.push(temp5.z);
						tmpIndex += 1.0;
						newIndis.push(tmpIndex);
						
						newVerts.push(temp6.x);
						newVerts.push(temp6.y);
						newVerts.push(temp6.z);
						tmpIndex += 1.0;
						newIndis.push(tmpIndex);

						//normal
					

						var tempN4 = new PreGL.Vec3(0,0,0);//N1 * utmp + N2 * vtmp + N3 * w;
						tempN4.setVec3(getNorm(utmp, vtmp, w, nPatch));	
						// tempN4.setVec3(N1.scale(utmp));
						// tempN4.add2(tempN4, N2.scale(vtmp));
						// tempN4.add2(tempN4, N3.scale(w));	

						// N1.setVec3(tempON1);
						// N2.setVec3(tempON2);
						// N3.setVec3(tempON3);	
										
						var tempN6 = new PreGL.Vec3(0,0,0);//N1 * (utmp - fac) + N2 * (vtmp + fac) + N3 * w);
						tempN6.setVec3(getNorm(utmp - fac, vtmp + fac, w, nPatch));
						// tempN6.setVec3(N1.scale(utmp - fac));
						// tempN6.add2(tempN6, N2.scale(vtmp + fac));
						// tempN6.add2(tempN6, N3.scale(w));	

						// N1.setVec3(tempON1);
						// N2.setVec3(tempON2);
						// N3.setVec3(tempON3);	

						var tempN5 = new PreGL.Vec3(0,0,0);//N1 * utmp  + N2 * (vtmp + fac) + N3 * (w - fac));
						tempN5.setVec3(getNorm(utmp, vtmp + fac, w - fac, nPatch));
						// tempN5.setVec3(N1.scale(utmp));
						// tempN5.add2(tempN5, N2.scale(vtmp - fac));
						// tempN5.add2(tempN5, N3.scale(w + fac));
						
						newNorms.push(tempN4.x);
						newNorms.push(tempN4.y);
						newNorms.push(tempN4.z);
						
						newNorms.push(tempN5.x);
						newNorms.push(tempN5.y);
						newNorms.push(tempN5.z);
						
						newNorms.push(tempN6.x);
						newNorms.push(tempN6.y);
						newNorms.push(tempN6.z);



					

					}


					//type 1 normal
					//position


				
					var temp1 = new PreGL.Vec3(0,0,0); //var temp1 = new PreGL.Vec3(P1 * utmp + P2 * vtmp + P3 * w);
					temp1.setVec3(getPos(utmp, vtmp, w, bPatch));
					
					var temp2 = new PreGL.Vec3(0,0,0);// var temp2 = new PreGL.Vec3(P1 * (utmp - fac) + P2 * (vtmp + fac) + P3 * w);
					temp2.setVec3(getPos(utmp - fac, vtmp + fac, w, bPatch));

					var temp3 = new PreGL.Vec3(0,0,0);//var temp3 = new PreGL.Vec3(P1 * (utmp - fac) + P2 * vtmp + P3 * (w + fac)); 
					temp3.setVec3(getPos(utmp - fac, vtmp, w + fac, bPatch));

					
					newVerts.push(temp1.x);
					newVerts.push(temp1.y);
					newVerts.push(temp1.z);


					if(tmpIndex !== 0)
					{
						tmpIndex += 1.0;
					}
					//tmpIndex += 1.0;	
					
					newIndis.push(tmpIndex);	
					
					newVerts.push(temp2.x);
					newVerts.push(temp2.y);
					newVerts.push(temp2.z);
					tmpIndex += 1.0;
					newIndis.push(tmpIndex);
					
					newVerts.push(temp3.x);
					newVerts.push(temp3.y);
					newVerts.push(temp3.z);
					tmpIndex += 1.0;
					newIndis.push(tmpIndex);


					//normal
					// var tempON1 = new PreGL.Vec3(0,0,0);
					// var tempON2 = new PreGL.Vec3(0,0,0);
					// var tempON3 = new PreGL.Vec3(0,0,0);

					// tempON1.setVec3(N1);
					// tempON2.setVec3(N2);
					// tempON3.setVec3(N3);

					var tempN1 = new PreGL.Vec3(0,0,0);//var tempN1 = new PreGL.Vec3(P1 * utmp + P2 * vtmp + P3 * w);	
					tempN1.setVec3(getNorm(utmp, vtmp, w, nPatch));

					// tempN1.setVec3(N1.scale(utmp));
					// tempN1.add2(tempN1, N2.scale(vtmp));
					// tempN1.add2(tempN1, N3.scale(w));	

					// N1.setVec3(tempON1);
					// N2.setVec3(tempON2);
					// N3.setVec3(tempON3);	
									
					var tempN2 = new PreGL.Vec3(0,0,0);//var tempN2 = new PreGL.Vec3(P1 * (utmp - fac) + P2 * (vtmp + fac) + P3 * w);
					tempN2.setVec3(getNorm(utmp - fac, vtmp + fac, w, nPatch));
					// tempN2.setVec3(N1.scale(utmp - fac));
					// tempN2.add2(tempN2, N2.scale(vtmp + fac));
					// tempN2.add2(tempN2, N3.scale(w));	

					// N1.setVec3(tempON1);
					// N2.setVec3(tempON2);
					// N3.setVec3(tempON3);	

					var tempN3 = new PreGL.Vec3(0,0,0);//var tempN3 = new PreGL.Vec3(P1 * (utmp - fac) + P2 * vtmp + P3 * (w + fac));
					tempN3.setVec3(getNorm(utmp - fac, vtmp, w + fac, nPatch));
					// tempN3.setVec3(N1.scale(utmp - fac));
					// tempN3.add2(tempN3, N2.scale(vtmp));
					// tempN3.add2(tempN3, N3.scale(w + fac));
					
					newNorms.push(tempN1.x);
					newNorms.push(tempN1.y);
					newNorms.push(tempN1.z);
					
					
					newNorms.push(tempN2.x);
					newNorms.push(tempN2.y);
					newNorms.push(tempN2.z);

					newNorms.push(tempN3.x);
					newNorms.push(tempN3.y);
					newNorms.push(tempN3.z);
					
								
					
					
					
					



					
				}




				//newVerts.push(u)
			}



		}

		model.addAttrib("position", newVerts);
  		model.addAttrib("normal", newNorms);
  		//model.addAttrib("texCoord", mesh.textures, 2);
  		model.setIndices(newIndis);

	}

	return model;

	


}


function getPos(u, v, w, bpatch)
{
	var xyz = new PreGL.Vec3(0,0,0);
	var tmpB300 = new PreGL.Vec3(0,0,0);
	var tmpB030 = new PreGL.Vec3(0,0,0);
	var tmpB003 = new PreGL.Vec3(0,0,0);
	var tmpB210 = new PreGL.Vec3(0,0,0);
	var tmpB120 = new PreGL.Vec3(0,0,0);
	var tmpB201 = new PreGL.Vec3(0,0,0);
	var tmpB021 = new PreGL.Vec3(0,0,0);
	var tmpB102 = new PreGL.Vec3(0,0,0);
	var tmpB012 = new PreGL.Vec3(0,0,0);
	var tmpB111 = new PreGL.Vec3(0,0,0);

	tmpB300.setVec3(bpatch[0]);
	tmpB030.setVec3(bpatch[1]);
	tmpB003.setVec3(bpatch[2]);
	tmpB210.setVec3(bpatch[3]);
	tmpB120.setVec3(bpatch[4]);
	tmpB201.setVec3(bpatch[5]);
	tmpB021.setVec3(bpatch[6]);
	tmpB102.setVec3(bpatch[7]);
	tmpB012.setVec3(bpatch[8]);
	tmpB111.setVec3(bpatch[9]);

	xyz.setVec3(tmpB300.scale( w*w*w ));
	xyz.add2(xyz, tmpB030.scale( u*u*u ));
	xyz.add2(xyz, tmpB003.scale( v*v*v ));
	xyz.add2(xyz, tmpB210.scale( 3.0*u*w*w ));
	xyz.add2(xyz, tmpB120.scale( 3.0*u*u*w ));
	xyz.add2(xyz, tmpB201.scale( 3.0*v*w*w ));
	xyz.add2(xyz, tmpB021.scale( 3.0*u*u*v ));
	xyz.add2(xyz, tmpB102.scale( 3.0*v*v*w ));
	xyz.add2(xyz, tmpB012.scale( 3.0*u*v*v ));
	xyz.add2(xyz, tmpB111.scale( 6.0*u*v*w ));

	return xyz;
}

function getNorm(u, v, w, npatch)
{
	var norm = new PreGL.Vec3(0,0,0);
	var tmpN200 = new PreGL.Vec3(0,0,0);
	var tmpN020 = new PreGL.Vec3(0,0,0);
	var tmpN002 = new PreGL.Vec3(0,0,0);
	var tmpN110 = new PreGL.Vec3(0,0,0);
	var tmpN011 = new PreGL.Vec3(0,0,0);
	var tmpN101 = new PreGL.Vec3(0,0,0);

	tmpN200.setVec3(npatch[0]);
	tmpN020.setVec3(npatch[1]);
	tmpN002.setVec3(npatch[2]);
	tmpN110.setVec3(npatch[3]);
	tmpN011.setVec3(npatch[4]);
	tmpN101.setVec3(npatch[5]);

	norm.setVec3(tmpN200.scale( w*w ));
	norm.setVec3(norm, tmpN020.scale( u*u ));
	norm.setVec3(norm, tmpN002.scale( v*v ));
	norm.setVec3(norm, tmpN110.scale( w*u ));
	norm.setVec3(norm, tmpN011.scale( u*v ));
	norm.setVec3(norm, tmpN101.scale( w*v ));

	return norm;



}