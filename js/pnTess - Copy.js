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
						//position
						var tempP1 = new PreGL.Vec3(0,0,0);
						var tempP2 = new PreGL.Vec3(0,0,0);
						var tempP3 = new PreGL.Vec3(0,0,0);

						tempP1.setVec3(P1);
						tempP2.setVec3(P2);
						tempP3.setVec3(P3);

						var temp4 = new PreGL.Vec3(0,0,0); 
						temp4.setVec3(P1.scale(utmp));
						temp4.add2(temp4, P2.scale(vtmp));
						temp4.add2(temp4, P3.scale(w));		

						P1.setVec3(tempP1);
						P2.setVec3(tempP2);
						P3.setVec3(tempP3);
						// var temp6 = new PreGL.Vec3(P1 * (utmp - fac) + P2 * (vtmp + fac) + P3 * w);
						// var temp5 = new PreGL.Vec3(P1 * utmp  + P2 * (vtmp - fac) + P3 * (w + fac));


						var temp6 = new PreGL.Vec3(0,0,0); 
						temp6.setVec3(P1.scale(utmp - fac));
						temp6.add2(temp6, P2.scale(vtmp + fac));
						temp6.add2(temp6, P3.scale(w));	

						P1.setVec3(tempP1);
						P2.setVec3(tempP2);
						P3.setVec3(tempP3);

						var temp5 = new PreGL.Vec3(0,0,0); 
						temp5.setVec3(P1.scale(utmp));
						temp5.add2(temp5, P2.scale(vtmp + fac));
						temp5.add2(temp5, P3.scale(w - fac));	

						P1.setVec3(tempP1);
						P2.setVec3(tempP2);
						P3.setVec3(tempP3);

						
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
						var tempON1 = new PreGL.Vec3(0,0,0);
						var tempON2 = new PreGL.Vec3(0,0,0);
						var tempON3 = new PreGL.Vec3(0,0,0);

						tempON1.setVec3(N1);
						tempON2.setVec3(N2);
						tempON3.setVec3(N3);

						var tempN4 = new PreGL.Vec3(0,0,0);//N1 * utmp + N2 * vtmp + N3 * w);	
						tempN4.setVec3(N1.scale(utmp));
						tempN4.add2(tempN4, N2.scale(vtmp));
						tempN4.add2(tempN4, N3.scale(w));	

						N1.setVec3(tempON1);
						N2.setVec3(tempON2);
						N3.setVec3(tempON3);	
										
						var tempN6 = new PreGL.Vec3(0,0,0);//N1 * (utmp - fac) + N2 * (vtmp + fac) + N3 * w);
						tempN6.setVec3(N1.scale(utmp - fac));
						tempN6.add2(tempN6, N2.scale(vtmp + fac));
						tempN6.add2(tempN6, N3.scale(w));	

						N1.setVec3(tempON1);
						N2.setVec3(tempON2);
						N3.setVec3(tempON3);	

						var tempN5 = new PreGL.Vec3(0,0,0);//N1 * utmp  + N2 * (vtmp - fac) + N3 * (w + fac));

						tempN5.setVec3(N1.scale(utmp));
						tempN5.add2(tempN5, N2.scale(vtmp - fac));
						tempN5.add2(tempN5, N3.scale(w + fac));
						
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

					var tempP1 = new PreGL.Vec3(0,0,0);
					var tempP2 = new PreGL.Vec3(0,0,0);
					var tempP3 = new PreGL.Vec3(0,0,0);	

					tempP1.setVec3(P1);
					tempP2.setVec3(P2);
					tempP3.setVec3(P3);

					var temp1 = new PreGL.Vec3(0,0,0); //var temp1 = new PreGL.Vec3(P1 * utmp + P2 * vtmp + P3 * w);
					temp1.setVec3(P1.scale(utmp));
					temp1.add2(temp1, P2.scale(vtmp));
					temp1.add2(temp1, P3.scale(w));		

					P1.setVec3(tempP1);
					P2.setVec3(tempP2);
					P3.setVec3(tempP3);
					// var temp5 = new PreGL.Vec3(P1 * (utmp - fac) + P2 * (vtmp + fac) + P3 * w);
					// var temp6 = new PreGL.Vec3(P1 * utmp  + P2 * (vtmp - fac) + P3 * (w + fac));


					var temp2 = new PreGL.Vec3(0,0,0);// var temp2 = new PreGL.Vec3(P1 * (utmp - fac) + P2 * (vtmp + fac) + P3 * w);
					temp2.setVec3(P1.scale(utmp - fac));
					temp2.add2(temp2, P2.scale(vtmp + fac));
					temp2.add2(temp2, P3.scale(w));	

					P1.setVec3(tempP1);
					P2.setVec3(tempP2);
					P3.setVec3(tempP3);

					var temp3 = new PreGL.Vec3(0,0,0);//var temp3 = new PreGL.Vec3(P1 * (utmp - fac) + P2 * vtmp + P3 * (w + fac)); 
					temp3.setVec3(P1.scale(utmp - fac));
					temp3.add2(temp3, P2.scale(vtmp));
					temp3.add2(temp3, P3.scale(w + fac));	

					P1.setVec3(tempP1);
					P2.setVec3(tempP2);
					P3.setVec3(tempP3);

					
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
					var tempON1 = new PreGL.Vec3(0,0,0);
					var tempON2 = new PreGL.Vec3(0,0,0);
					var tempON3 = new PreGL.Vec3(0,0,0);

					tempON1.setVec3(N1);
					tempON2.setVec3(N2);
					tempON3.setVec3(N3);

					var tempN1 = new PreGL.Vec3(0,0,0);//var tempN1 = new PreGL.Vec3(P1 * utmp + P2 * vtmp + P3 * w);	
					tempN1.setVec3(N1.scale(utmp));
					tempN1.add2(tempN1, N2.scale(vtmp));
					tempN1.add2(tempN1, N3.scale(w));	

					N1.setVec3(tempON1);
					N2.setVec3(tempON2);
					N3.setVec3(tempON3);	
									
					var tempN2 = new PreGL.Vec3(0,0,0);//var tempN2 = new PreGL.Vec3(P1 * (utmp - fac) + P2 * (vtmp + fac) + P3 * w);
					tempN2.setVec3(N1.scale(utmp - fac));
					tempN2.add2(tempN2, N2.scale(vtmp + fac));
					tempN2.add2(tempN2, N3.scale(w));	

					N1.setVec3(tempON1);
					N2.setVec3(tempON2);
					N3.setVec3(tempON3);	

					var tempN3 = new PreGL.Vec3(0,0,0);//var tempN3 = new PreGL.Vec3(P1 * (utmp - fac) + P2 * vtmp + P3 * (w + fac));

					tempN3.setVec3(N1.scale(utmp - fac));
					tempN3.add2(tempN3, N2.scale(vtmp));
					tempN3.add2(tempN3, N3.scale(w + fac));
					
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