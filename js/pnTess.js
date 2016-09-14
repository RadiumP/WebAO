function pnTess(gl, path, level)
{
	var data = [];
	var model = new SimpleMesh(gl);

	var mesh = new OBJ.Mesh(path);

	var verts = mesh.vertices;
	var norms = mesh.vertexNormals;
	var texCoord = mesh.textures;
	var indices = mesh.indices;


	var nbseen = new Array(verts.length / 3);
	nbseen.fill(0);
    var avgNormals = new Array(verts.length);
    
    for(var i = 0; i < indices.length; i += 3)
    {
       var ia = indices[i];
       var ib = indices[i + 1];
       var ic = indices[i + 2];

       var normal = new PreGL.Vec3(0, 0, 0);
       var vertA = new PreGL.Vec3(verts[ia * 3], verts[ia * 3 + 1], verts[ia * 3 + 2]);
       var vertB = new PreGL.Vec3(verts[ib * 3], verts[ib * 3 + 1], verts[ib * 3 + 2]);
       var vertC = new PreGL.Vec3(verts[ic * 3], verts[ic * 3 + 1], verts[ic * 3 + 2]);

       var edge1 = new PreGL.Vec3();
       var edge2 = new PreGL.Vec3();
       edge1.sub2(vertB, vertA);
       edge2.sub2(vertC, vertA);
       normal.cross2(edge1, edge2);
       normal.normalize();

       var v = new Array(3);
       v[0] = ia;
       v[1] = ib;
       v[2] = ic;


       for(var j = 0; j < 3; j++)
       {
       		var cur_v = v[j];
       		++nbseen[cur_v];
       		if(nbseen[cur_v] === 1)
       		{
       			avgNormals[cur_v * 3] = normal.x;
       			avgNormals[cur_v * 3 + 1] = normal.y;
       			avgNormals[cur_v * 3 + 2] = normal.z;

       		}

       		else
       		{
       			avgNormals[cur_v * 3] = avgNormals[cur_v * 3] * (1.0 - 1.0 / nbseen[cur_v]) + normal.x * 1.0 / nbseen[cur_v];
       			avgNormals[cur_v * 3 + 1] = avgNormals[cur_v * 3 + 1] * (1.0 - 1.0 / nbseen[cur_v]) + normal.y * 1.0 / nbseen[cur_v];
       			avgNormals[cur_v * 3 + 2] = avgNormals[cur_v * 3 + 2] * (1.0 - 1.0 / nbseen[cur_v]) + normal.z * 1.0 / nbseen[cur_v];
       			var tmpAvg = new PreGL.Vec3(avgNormals[cur_v * 3], avgNormals[cur_v * 3 + 1], avgNormals[cur_v * 3 + 2]);
       			tmpAvg.normalize();

       			avgNormals[cur_v * 3] = tmpAvg.x;
       			avgNormals[cur_v * 3 + 1] = tmpAvg.y;
       			avgNormals[cur_v * 3 + 2] = tmpAvg.z;

       		}
       }


    }

    var norms = avgNormals;


	if(level === 0)
	{

		model.addAttrib("position", mesh.vertices);
  		model.addAttrib("normal", norms);
  		//model.addAttrib("texCoord", mesh.textures, 2);
  		model.setIndices(mesh.indices);

  		
	}
	else
	{	

  		data.push(model);
  		data.push(verts);
  		data.push(norms);
  		data.push(indices);
  		
		for(var i = 0; i< level; i++){
			data = calVerts(data, i);
		}
		model = data[0];
	}

	return model;

	


}


function genBpatch(P1, P2, P3, N1, N2, N3)
{
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

			return bPatch;
}

function genNpatch(P1, P2, P3, N1, N2, N3)
{
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
			n110.normalize();

			n011.sub2(P3, P2);
			n011.sub2(N2, n011.scale(v23));
			n011.add2(N3, n011);
			n011.normalize();

			n101.sub2(P1, P3);
			n101.sub2(N1, n101.scale(v31));
			n101.add2(N3, n101);
			n101.normalize();

			nPatch.push(n200);
			nPatch.push(n020);
			nPatch.push(n002);
			nPatch.push(n110);
			nPatch.push(n011);
			nPatch.push(n101);

			return nPatch;
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
	norm.add2(norm, tmpN020.scale( u*u ));
	norm.add2(norm, tmpN002.scale( v*v ));
	norm.add2(norm, tmpN110.scale( w*u ));
	norm.add2(norm, tmpN011.scale( u*v ));
	norm.add2(norm, tmpN101.scale( w*v ));

	return norm;



}


function calVerts(data, i)
{		
	var newVerts = [];//new Float32Array(3*65000);
	var newNorms = [];//new Float32Array(3*65000);
	var newIndis = [];//0.0;



	var verts = [];
	verts = data[1];
	var norms = [];
	norms = data[2];
	var indices = [];
	indices = data[3];
	var model = [];
	model = data[0];	

	newVerts = verts.slice(0); //question it
	newNorms = norms.slice(0);

	//edge 
	var edge = new Array(verts.length / 3);//question it
	edge.fill([-1, -1]);
		
		level = 2.0;
		var fac = 1.0 / level;

		var tmpIndex = 0;
		//newIndis.push(tmpIndex);
		for(var i = 0; i < indices.length; i = i + 3)
		{	
			var P1, P2, P3;
			var N1, N2, N3;

			var ia = indices[i];
			var ib = indices[i + 1];
			var ic = indices[i + 2];

			
			P1 = new PreGL.Vec3(verts[3 * ia], verts[3 * ia + 1], verts[3 * ia + 2]);
			P2 = new PreGL.Vec3(verts[3 * (ib)], verts[3 * (ib) + 1], verts[3 * (ib) + 2]);
			P3 = new PreGL.Vec3(verts[3 * (ic)], verts[3 * (ic) + 1], verts[3 * (ic) + 2]);

			N1 = new PreGL.Vec3(norms[3 * ia], norms[3 * ia + 1], norms[3 * ia + 2]);
			N2 = new PreGL.Vec3(norms[3 * (ib)], norms[3 * (ib) + 1], norms[3 * (ib) + 2]);
			N3 = new PreGL.Vec3(norms[3 * (ic)], norms[3 * (ic) + 1], norms[3 * (ic) + 2]);

			//uvw hash
			var uvwHash = [];
			
		

			var edge1 = [];
			var edge2 = [];
			var edge3 = [];

			edge1 = [ia + ib, Math.abs(ia - ib)];
			edge2 = [ib + ic, Math.abs(ib - ic)];
			edge3 = [ic + ia, Math.abs(ic - ia)];


			var bPatch = genBpatch(P1,P2,P3,N1,N2,N3);
			var nPatch = genNpatch(P1,P2,P3,N1,N2,N3);		

			

			//old verts new pos
			var tempP = [];
			var tempN = [];


			tempP[1] = new PreGL.Vec3(0,0,0);
			tempP[1].setVec3(getPos(1, 0, 0, bPatch));

			tempN[1] = new PreGL.Vec3(0,0,0);
			tempN[1].setVec3(getNorm(1, 0, 0, nPatch));
		
			tempP[2] = new PreGL.Vec3(0,0,0);
			tempP[2].setVec3(getPos(0, 1, 0, bPatch));

			tempN[2] = new PreGL.Vec3(0,0,0);
			tempN[2].setVec3(getNorm(0, 1, 0, nPatch));

			tempP[0] = new PreGL.Vec3(0,0,0);
			tempP[0].setVec3(getPos(0, 0, 1, bPatch));


			tempN[0] = new PreGL.Vec3(0,0,0);
			tempN[0].setVec3(getNorm(0, 0, 1, nPatch));

			// newNorms.push(tempN[0].x);
			// newNorms.push(tempN[0].y);
			// newNorms.push(tempN[0].z);
			
			
			// newNorms.push(tempN[1].x);
			// newNorms.push(tempN[1].y);
			// newNorms.push(tempN[1].z);

			// newNorms.push(tempN[2].x);
			// newNorms.push(tempN[2].y);
			// newNorms.push(tempN[2].z);


			//?????
			if(edge[ia][0] === -1)
			{	
				newVerts[ia * 3] = (tempP[0].x);
				newVerts[ia * 3 + 1] = (tempP[0].y);
				newVerts[ia * 3 + 2] = (tempP[0].z);

				newNorms[ia * 3] = tempN[0].x;
				newNorms[ia * 3 + 1] = tempN[0].y;
				newNorms[ia * 3 + 2] = tempN[0].z;

				edge[ia] = [0,0];


			}
			if(edge[ib][0] === -1)
			{
				newVerts[ib * 3] = (tempP[1].x);
				newVerts[ib * 3 + 1] = (tempP[1].y);
				newVerts[ib * 3 + 2] = (tempP[1].z);

				newNorms[ib * 3] = tempN[1].x;
				newNorms[ib * 3 + 1] = tempN[1].y;
				newNorms[ib * 3 + 2] = tempN[1].z;

				edge[ib] = [0,0];
			}
			if(edge[ic][0] === -1)
			{
				newVerts[ic * 3] = (tempP[2].x);
				newVerts[ic * 3 + 1] = (tempP[2].y);
				newVerts[ic * 3 + 2] = (tempP[2].z);

				newNorms[ic * 3] = tempN[2].x;
				newNorms[ic * 3 + 1] = tempN[2].y;
				newNorms[ic * 3 + 2] = tempN[2].z;

				edge[ic] = [0,0];
			}


			

			// newVerts.push(tempP[1].x);
			// newVerts.push(tempP[1].y);
			// newVerts.push(tempP[1].z);
						
			// newVerts.push(tempP[2].x);
			// newVerts.push(tempP[2].y);
			// newVerts.push(tempP[2].z);

			//new verts
			tempP[3] = new PreGL.Vec3(0,0,0); 
			tempP[3].setVec3(getPos(0.5, 0.5, 0, bPatch));
			tempN[3] = new PreGL.Vec3(0,0,0);
			tempN[3].setVec3(getNorm(0.5, 0.5, 0, nPatch));	

			
			tempP[4] = new PreGL.Vec3(0,0,0); 
			tempP[4].setVec3(getPos(0, 0.5, 0.5, bPatch));

			tempN[4] = new PreGL.Vec3(0,0,0);
			tempN[4].setVec3(getNorm(0, 0.5, 0.5, nPatch));



			tempP[5] = new PreGL.Vec3(0,0,0); 
			tempP[5].setVec3(getPos(0.5, 0, 0.5, bPatch));
			tempN[5] = new PreGL.Vec3(0,0,0);
			tempN[5].setVec3(getNorm(0.5, 0, 0.5, nPatch));

			var newEdge3 = edge2;
			var index3;

			for(var x = 0; x < edge.length; x++)
			{
				if((edge[x][0] !== edge2[0] || edge[x][1] !== edge2[1]) && x === edge.length - 1)
				{
					index3 = newVerts.length / 3;
					newVerts.push(tempP[3].x); 
					newVerts.push(tempP[3].y); 
					newVerts.push(tempP[3].z);

					newNorms.push(tempN[3].x);
					newNorms.push(tempN[3].y);
					newNorms.push(tempN[3].z);
			

					edge.push(edge2);
					

					break;
				}

				else if(edge[x][0] === edge2[0] && edge[x][1] === edge2[1])
				{
					index3 = x;
					break;
				}
			}

			


			//var newEdge4 = edge3;
			var index4;

			for(var y = 0; y < edge.length; y++)
			{
				if((edge[y][0] !== edge3[0] || edge[y][1] !== edge3[1]) && y === edge.length - 1)
				{
					index4 = newVerts.length / 3;

					newVerts.push(tempP[4].x); 
					newVerts.push(tempP[4].y); 
					newVerts.push(tempP[4].z);

					newNorms.push(tempN[4].x);
					newNorms.push(tempN[4].y);
					newNorms.push(tempN[4].z);


					edge.push(edge3);
					

					break;
				}

				else if(edge[y][0] === edge3[0] && edge[y][1] === edge3[1])
				{
					index4 = y;
					break;
				}
			}


			

			
			//var newEdge5 = edge1;
			var index5;
			
			for(var z = 0; z < edge.length; z++)
			{
				if((edge[z][0] !== edge1[0] || edge[z][1] !== edge1[1]) && z === edge.length - 1)
				{
					index5 = newVerts.length / 3;
					newVerts.push(tempP[5].x); 
					newVerts.push(tempP[5].y); 
					newVerts.push(tempP[5].z);
					
					newNorms.push(tempN[5].x);
					newNorms.push(tempN[5].y);
					newNorms.push(tempN[5].z);
					
					edge.push(edge1);
					
					break;
				}

				else if(edge[z][0] === edge1[0] && edge[z][1] === edge1[1])
				{
					index5 = z;
					break;
				}
			}


			// for(var k of edge)
			// {
				
			// 	if((k[0] !== edge1[0] || k[1] !== edge1[1]) && z === edge.length)
			// 	{
			// 		index5 = newVerts.length / 3;
			// 		newVerts.push(tempP[5].x); 
			// 		newVerts.push(tempP[5].y); 
			// 		newVerts.push(tempP[5].z);
					
			// 		newNorms.push(tempN[5].x);
			// 		newNorms.push(tempN[5].y);
			// 		newNorms.push(tempN[5].z);
					
			// 		edge.push(edge1);
					
			// 		break;
			// 	}
			// 	else
			// 	{
			// 		index5 = i;
			// 	}

			// 	z++;
			// }
			


			newIndis.push(ia);
			newIndis.push(index5);
			newIndis.push(index4);

			newIndis.push(index5);
			newIndis.push(ib);
			newIndis.push(index3);

			newIndis.push(index4);
			newIndis.push(index3);
			newIndis.push(ic);

			newIndis.push(index4);
			newIndis.push(index5);
			newIndis.push(index3);

			
			//tmpIndex += 6;



			// In each triangle gen new verts
			// for(var n = 0; n < level; n++)
			// {	
			// 	var u = 1.0, v = 0.0, w = 0.0;
			// 	u = u - n / level;//care
			// 	w = w + n / level

				
			// 	for(var m = 0; m < level - n; m++)
			// 	{	

			// 		utmp = u - m / level;//care
			// 		vtmp = v + m / level
			// 		//type 2 inverse
			// 		if((utmp - fac) >= 0.0 && (w - fac) >= 0.0)
			// 		{
			// 			var uvw = new PreGL.Vec3(utmp, vtmp, w);
						
			// 			var temp4 = new PreGL.Vec3(0,0,0); 
			// 			temp4.setVec3(getPos(utmp, vtmp, w, bPatch));
						


			// 			var temp6 = new PreGL.Vec3(0,0,0); 
			// 			temp6.setVec3(getPos(utmp - fac, vtmp + fac, w, bPatch));

						

			// 			var temp5 = new PreGL.Vec3(0,0,0); 
			// 			temp5.setVec3(getPos(utmp, vtmp + fac, w - fac, bPatch));
						

						
			// 			newVerts.push(temp4.x);
			// 			newVerts.push(temp4.y);
			// 			newVerts.push(temp4.z);
			// 			tmpIndex += 1.0;
			// 			newIndis.push(tmpIndex);
							
			// 			newVerts.push(temp5.x);
			// 			newVerts.push(temp5.y);
			// 			newVerts.push(temp5.z);
			// 			tmpIndex += 1.0;
			// 			newIndis.push(tmpIndex);
						
			// 			newVerts.push(temp6.x);
			// 			newVerts.push(temp6.y);
			// 			newVerts.push(temp6.z);
			// 			tmpIndex += 1.0;
			// 			newIndis.push(tmpIndex);

			// 			//normal
					

			// 			var tempN4 = new PreGL.Vec3(0,0,0);//N1 * utmp + N2 * vtmp + N3 * w;
			// 			tempN4.setVec3(getNorm(utmp, vtmp, w, nPatch));	
			// 			// tempN4.setVec3(N1.scale(utmp));
			// 			// tempN4.add2(tempN4, N2.scale(vtmp));
			// 			// tempN4.add2(tempN4, N3.scale(w));	

			// 			// N1.setVec3(tempON1);
			// 			// N2.setVec3(tempON2);
			// 			// N3.setVec3(tempON3);	
										
			// 			var tempN6 = new PreGL.Vec3(0,0,0);//N1 * (utmp - fac) + N2 * (vtmp + fac) + N3 * w);
			// 			tempN6.setVec3(getNorm(utmp - fac, vtmp + fac, w, nPatch));
			// 			// tempN6.setVec3(N1.scale(utmp - fac));
			// 			// tempN6.add2(tempN6, N2.scale(vtmp + fac));
			// 			// tempN6.add2(tempN6, N3.scale(w));	

			// 			// N1.setVec3(tempON1);
			// 			// N2.setVec3(tempON2);
			// 			// N3.setVec3(tempON3);	

			// 			var tempN5 = new PreGL.Vec3(0,0,0);//N1 * utmp  + N2 * (vtmp + fac) + N3 * (w - fac));
			// 			tempN5.setVec3(getNorm(utmp, vtmp + fac, w - fac, nPatch));
			// 			// tempN5.setVec3(N1.scale(utmp));
			// 			// tempN5.add2(tempN5, N2.scale(vtmp - fac));
			// 			// tempN5.add2(tempN5, N3.scale(w + fac));
						
			// 			newNorms.push(tempN4.x);
			// 			newNorms.push(tempN4.y);
			// 			newNorms.push(tempN4.z);
						
			// 			newNorms.push(tempN5.x);
			// 			newNorms.push(tempN5.y);
			// 			newNorms.push(tempN5.z);
						
			// 			newNorms.push(tempN6.x);
			// 			newNorms.push(tempN6.y);
			// 			newNorms.push(tempN6.z);



					

			// 		}


			// 		//type 1 normal
			// 		//position


				
			// 		var temp1 = new PreGL.Vec3(0,0,0); //var temp1 = new PreGL.Vec3(P1 * utmp + P2 * vtmp + P3 * w);
			// 		temp1.setVec3(getPos(utmp, vtmp, w, bPatch));
					
			// 		var temp2 = new PreGL.Vec3(0,0,0);// var temp2 = new PreGL.Vec3(P1 * (utmp - fac) + P2 * (vtmp + fac) + P3 * w);
			// 		temp2.setVec3(getPos(utmp - fac, vtmp + fac, w, bPatch));

			// 		var temp3 = new PreGL.Vec3(0,0,0);//var temp3 = new PreGL.Vec3(P1 * (utmp - fac) + P2 * vtmp + P3 * (w + fac)); 
			// 		temp3.setVec3(getPos(utmp - fac, vtmp, w + fac, bPatch));

					
			// 		newVerts.push(temp1.x);
			// 		newVerts.push(temp1.y);
			// 		newVerts.push(temp1.z);


			// 		if(tmpIndex !== 0)
			// 		{
			// 			tmpIndex += 1.0;
			// 		}
			// 		//tmpIndex += 1.0;	
					
			// 		newIndis.push(tmpIndex);	
					
			// 		newVerts.push(temp2.x);
			// 		newVerts.push(temp2.y);
			// 		newVerts.push(temp2.z);
			// 		tmpIndex += 1.0;
			// 		newIndis.push(tmpIndex);
					
			// 		newVerts.push(temp3.x);
			// 		newVerts.push(temp3.y);
			// 		newVerts.push(temp3.z);
			// 		tmpIndex += 1.0;
			// 		newIndis.push(tmpIndex);


			// 		//normal
			// 		// var tempON1 = new PreGL.Vec3(0,0,0);
			// 		// var tempON2 = new PreGL.Vec3(0,0,0);
			// 		// var tempON3 = new PreGL.Vec3(0,0,0);

			// 		// tempON1.setVec3(N1);
			// 		// tempON2.setVec3(N2);
			// 		// tempON3.setVec3(N3);

			// 		var tempN1 = new PreGL.Vec3(0,0,0);//var tempN1 = new PreGL.Vec3(P1 * utmp + P2 * vtmp + P3 * w);	
			// 		tempN1.setVec3(getNorm(utmp, vtmp, w, nPatch));

			// 		// tempN1.setVec3(N1.scale(utmp));
			// 		// tempN1.add2(tempN1, N2.scale(vtmp));
			// 		// tempN1.add2(tempN1, N3.scale(w));	

			// 		// N1.setVec3(tempON1);
			// 		// N2.setVec3(tempON2);
			// 		// N3.setVec3(tempON3);	
									
			// 		var tempN2 = new PreGL.Vec3(0,0,0);//var tempN2 = new PreGL.Vec3(P1 * (utmp - fac) + P2 * (vtmp + fac) + P3 * w);
			// 		tempN2.setVec3(getNorm(utmp - fac, vtmp + fac, w, nPatch));
			// 		// tempN2.setVec3(N1.scale(utmp - fac));
			// 		// tempN2.add2(tempN2, N2.scale(vtmp + fac));
			// 		// tempN2.add2(tempN2, N3.scale(w));	

			// 		// N1.setVec3(tempON1);
			// 		// N2.setVec3(tempON2);
			// 		// N3.setVec3(tempON3);	

			// 		var tempN3 = new PreGL.Vec3(0,0,0);//var tempN3 = new PreGL.Vec3(P1 * (utmp - fac) + P2 * vtmp + P3 * (w + fac));
			// 		tempN3.setVec3(getNorm(utmp - fac, vtmp, w + fac, nPatch));
			// 		// tempN3.setVec3(N1.scale(utmp - fac));
			// 		// tempN3.add2(tempN3, N2.scale(vtmp));
			// 		// tempN3.add2(tempN3, N3.scale(w + fac));
					
			// 		newNorms.push(tempN1.x);
			// 		newNorms.push(tempN1.y);
			// 		newNorms.push(tempN1.z);
					
					
			// 		newNorms.push(tempN2.x);
			// 		newNorms.push(tempN2.y);
			// 		newNorms.push(tempN2.z);

			// 		newNorms.push(tempN3.x);
			// 		newNorms.push(tempN3.y);
			// 		newNorms.push(tempN3.z);
					
					
					
			// 	}




			// 	//newVerts.push(u)
			// }



		}

		model.addAttrib("position", newVerts);
  		model.addAttrib("normal", newNorms);
  		//model.addAttrib("texCoord", mesh.textures, 2);
  		model.setIndices(newIndis);
  		verts = newVerts.slice(0);
  		norms = newNorms.slice(0);
  		indices = newIndis.slice(0);


  		//norms.fill(0);
  		data[0] = model;
  		data[1] = verts;
  		data[2] = norms;
  		data[3] = indices;
  		
  		return data;

}


