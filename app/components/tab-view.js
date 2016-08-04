import Ember from 'ember';
import d3 from 'd3';

export default Ember.Component.extend({
 

  didInsertElement() {
  	var userLat, userLon;

	var metersPerPixel, pixelsPerMeter;
	var padding = 1000;




	$.getJSON("http://ip-api.com/json/?callback=?", function(data) {
           	userLat = data.lat;
           	userLon = data.lon;
       

	  	var map = new L.Map("map", {center: [userLat, userLon], zoom: 2})
	    	.addLayer(new L.TileLayer("http://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"))
			;
		map.options.minZoom = 2;


  		//get pixels per meter
		// Get the y,x dimensions of the map
		var y = map.getSize().y,
    		x = map.getSize().x;
		// calculate the distance the one side of the map to the other using the haversine formula
		var maxMeters = map.containerPointToLatLng([0, y]).distanceTo( map.containerPointToLatLng([x,y]));

		var earthCircumferenceMeters = 40075000;
		if (map.getZoom() == 3)
			maxMeters += earthCircumferenceMeters;
		else if (map.getZoom() == 2)
			maxMeters += 2*earthCircumferenceMeters;
		else if (map.getZoom() == 1)
			maxMeters += 3*earthCircumferenceMeters;
		else if (map.getZoom() == 0)
			maxMeters += 4*earthCircumferenceMeters;


		// calculate how many meters each pixel represents
		metersPerPixel = maxMeters/x ;
		console.log(metersPerPixel);
		pixelsPerMeter = 1 / metersPerPixel;
		console.log(pixelsPerMeter);

	  	//add scale label to leaflet map
	  	var scale = L.control.scale().addTo(map);
		var meters = scale._getRoundNum(map.containerPointToLatLng([0, map.getSize().y / 2 ]).distanceTo( map.containerPointToLatLng([scale.options.maxWidth,map.getSize().y / 2 ])));
  		var label = meters < 1000 ? meters + ' m' : (meters / 1000) + ' km';


  		var textLabels;


		var svg = d3.select(map.getPanes().overlayPane).append("svg"),
	    	g = svg.append("g").attr("class", "leaflet-zoom-hide");





		d3.json("http://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson", function(error, collection) {
	  		if (error) throw error;




	  		var transform = d3.geoTransform({point: projectPoint}),
	      	path = d3.geoPath()
	      			.projection(transform)
	      			;

	      	//var projectedPoints = d3.geoProjection(function(x,y) { return projectPoint(x,y) });
	      	
	      	//path.pointRadius( function (d) { return getPointRadiusFromQuake(d.geometry.coordinates[2], d.properties.mag, 2.5); });
	      	var quakeCoordsPoint;

	      	var q = d3.queue(2);
// q.defer(deferTest, "hello", "there");
// q.await(function(error) 
// {
// 	if (error) throw error;
// 	console.log("await " + "is done");
// });

// function deferTest(testString, testString2, callback)
// {
// console.log(testString + " " + testString2);
// callback(null);

// }

/*
	      	var featureData = g.selectAll("path")
	      		.data(collection.features).enter()
	      		.append("g")
	      		.attr("transform", function(d,i){ 
	      			q.defer(deferredPointProjection, d, this, i);
	      			//return "translate(0,0)";
	      			})
				//.attr("x", function(d) {return projectPointNoStream(d.geometry.coordinates[0],d.geometry.coordinates[1]).x ;})
	      		//.attr("y", function(d) {return projectPointNoStream(d.geometry.coordinates[0],d.geometry.coordinates[1]).y ;})
	      		.attr("class", "node-container")
	      		.on('mouseover', function() {mouseOverNode(this);})
	    		.on('mouseout',  function() {mouseOutNode(this);})
	    		.on('mousemove', function() {mouseMoveNode(this);})
	    		;

				q.await(function(error) {
	      					if (error) throw error;
	      					console.log("set transform" + " is done");
	      				});


	    		function deferredPointProjection(d, d3this, index, callback)
	    		{
	    			console.log("executing deferredPointProjection");
	    				var quakeCoordsPoint = projectPointNoStream(d.geometry.coordinates[0],d.geometry.coordinates[1]);
						d3.select(d3this).attr("transform","translate(" + quakeCoordsPoint.x + "," + quakeCoordsPoint.y + ")" );
	      				callback(null);
	      				console.log("done executing deferredPointProjection");

	    		}

*/
	  		var quakeCoordsPoints = [];
	  		quakeCoordsPoints.length = collection.features.length;

	  		var quakeLeafletLatLng = [];
	  		quakeLeafletLatLng.length = collection.features.length;

	  		console.log("nodeCount="+collection.features.length);

	  		var featureData = g.selectAll("path")
	      		.data(collection.features).enter()
	      		.append("g")
	      		.attr("transform", function(d,i){ 
	      			//init quakeleaflet latlng
	      			quakeLeafletLatLng[i] = new L.LatLng(d.geometry.coordinates[1],d.geometry.coordinates[0]);
	      			///return "translate(" + quakeCoordsPoint.x + "," + quakeCoordsPoint.y + ")"; 
	      			})
				//.attr("x", function(d) {return projectPointNoStream(d.geometry.coordinates[0],d.geometry.coordinates[1]).x ;})
	      		//.attr("y", function(d) {return projectPointNoStream(d.geometry.coordinates[0],d.geometry.coordinates[1]).y ;})
	      		.attr("class", "node-container")
	      		.on('mouseover', function() {mouseOverNode(this);})
	    		.on('mouseout',  function() {mouseOutNode(this);})
	    		.on('mousemove', function() {mouseMoveNode(this);})
	    		;


	      	var feature = featureData
	    		.append("circle")
	    		.attr("class", "main-circle")
	    		.attr("r", function (d) { 
	    			return getPointRadiusFromQuake(d.geometry.coordinates[2], d.properties.mag, 2.5); })
	    		.style("fill-opacity", 0.5)
	    		///.style("stroke-width", 1)
	    		//.style("stroke-opacity", 1)
	    		//.style("stroke","white")
	    		//.style("fill", "blue")
	    		.style("fill", function (d, i) { return createGradient(d.properties.mag, i);});


				;		


			featureData.append("text")
				.attr("class", "mag-label")
				.attr("x", -12)
				.attr("y", 7)
				
				
				;

	  		map.on("viewreset", reset);
	  		reset();


var tooltipMag = g
	.append("text")
	//.style("z-index", "10")
	.style("visibility", "hidden")
	.attr("class", "tooltip-text")
	.text("a simple tooltip");

var tooltipDistance = g
	.append("text")
	//.style("z-index", "10")
	.style("visibility", "hidden")
	.attr("class", "tooltip-text")
	.text("a simple tooltip");

var tooltipCircle = featureData
	.append("circle")
	.style("z-index", "10")
	.style("visibility", "hidden")
	.attr("class", "circle-tooltip");

	  		var thisD;
	  		var thisGPos;

	  	function mouseOverNode(d3this) //need to cancel tooltips based on mouse distance from quake
	  	{
			//create and place gradient based on mag and max distance
			////0% color is green. 100% color is based on red being 10.0. fallofff curve needs to come from attenuation formula; use wolfram alpha for curve?
			////curve is linear...makes it nice and easy


			d3.select(d3this).selectAll("circle.main-circle")
				.style("fill-opacity", 1)
				//.style("fill", "url(#gradient)");




			d3.select(d3this).selectAll("text").text(function(d) { 
				thisD = d;

				return d.properties.mag;})
				;

			thisGPos = [d3.select(d3this).attr("x"), d3.select(d3this).attr("y")];
			console.log(thisGPos);

			var perceivedMagAndDistance = getPerceivedMagnitude(thisGPos, thisD.properties.mag, [event.pageX, event.pageY], thisD.geometry.coordinates );
			var perceivedMag = perceivedMagAndDistance[0].toFixed(2);
			var distanceKm = perceivedMagAndDistance[1].toFixed(2);
			var tooltipRadius = getPointRadiusFromQuake(thisD.geometry.coordinates[2],thisD.properties.mag,perceivedMag);


			tooltipMag.attr("transform", function(d){ 
	      			return "translate(" + (thisGPos[0] - 90) + "," + (thisGPos[1] - tooltipRadius - 10) + ")"; 
	      			})
					.text( "FEELS LIKE: " + perceivedMag);
						
			tooltipDistance.attr("transform", function(d){ 
	      			return "translate(" + (thisGPos[0] - 90) + "," + (thisGPos[1] - tooltipRadius + 10) + ")"; 
	      			})
					.text(distanceKm + " km" );

			tooltipMag.style("visibility", "visible");
			tooltipDistance.style("visibility", "visible");
			d3.select(d3this).selectAll("circle.circle-tooltip")
				.attr("r", getPointRadiusFromQuake(thisD.geometry.coordinates[2],thisD.properties.mag,perceivedMag))
				.style("visibility", "visible")
				;




	  	}

	  	function mouseOutNode(d3this)
	  	{
			d3.select(d3this).selectAll("circle.main-circle").style("fill-opacity", 0.5);
			d3.select(d3this).selectAll("text").text(function(d) { 
				return "";})
				;

			tooltipMag.style("visibility", "hidden");
			tooltipDistance.style("visibility", "hidden");
			d3.select(d3this).selectAll("circle.circle-tooltip").style("visibility", "hidden");

	  	}

	  function mouseMoveNode(d3this)
	  {

			var perceivedMagAndDistance = getPerceivedMagnitude(thisGPos, thisD.properties.mag, [event.pageX, event.pageY], thisD.geometry.coordinates );
			var perceivedMag = perceivedMagAndDistance[0];

			//if (perceivedMag < 2.49)
			//	mouseOutNode(d3this); //should be mouseOut, but behaves weird. this seems to work

			var distanceKm = perceivedMagAndDistance[1].toFixed(2);
			var tooltipRadius = getPointRadiusFromQuake(thisD.geometry.coordinates[2],thisD.properties.mag,perceivedMag);

			d3.select(d3this).selectAll("circle.circle-tooltip").attr("r", tooltipRadius);

			tooltipMag.attr("transform", function(d){ 
	      			return "translate(" + (thisGPos[0]) + "," + (thisGPos[1] - tooltipRadius - 20) + ")"; 
	      			})
					.text( "FELT LIKE: " + perceivedMag.toFixed(2));
						
			tooltipDistance.attr("transform", function(d){ 
	      			return "translate(" + (thisGPos[0]) + "," + (thisGPos[1] - tooltipRadius + 20) + ")"; 
	      			})
					.text(distanceKm + " km" );
						

	  }

	

	  // Reposition the SVG to cover the features.
	  function reset() {
	    var bounds = path.bounds(collection),
	        topLeft = bounds[0],
	        bottomRight = bounds[1];
//var topLeft = [collection.bbox[0],collection.bbox[1]];
//var bottomRight = [collection.bbox[3], collection.bbox[4]];


	    svg .attr("width", bottomRight[0] - topLeft[0] + padding*2)
	        .attr("height", bottomRight[1] - topLeft[1] + padding*2)
	        .style("left", topLeft[0] - padding + "px")
	        .style("top", topLeft[1]  - padding + "px");

	    g   .attr("transform", "translate(" + (-topLeft[0] + padding) + "," + (-topLeft[1] + padding) + ")");


		y = map.getSize().y,
    	x = map.getSize().x;
		// calculate the distance the one side of the map to the other using the haversine formula
		maxMeters = map.containerPointToLatLng([0, y]).distanceTo( map.containerPointToLatLng([x,y]));
		// calculate how many meters each pixel represents

		var earthCircumferenceMeters = 40075000;
		if (map.getZoom() == 3)
			maxMeters += earthCircumferenceMeters;
		else if (map.getZoom() == 2)
			maxMeters += 2*earthCircumferenceMeters;
		else if (map.getZoom() == 1)
			maxMeters += 3*earthCircumferenceMeters;
		else if (map.getZoom() == 0)
			maxMeters += 4*earthCircumferenceMeters;

		metersPerPixel = maxMeters/x ;
		console.log(metersPerPixel);
		pixelsPerMeter = 1 / metersPerPixel;
		console.log(pixelsPerMeter);
	    //path.pointRadius( function (d) { return getPointRadiusFromQuake(d.geometry.coordinates[2], d.properties.mag, 2.5); });

//reset all tooltips
		

		var mapPixelOrigin = map.getPixelOrigin();

		var point;

	  		g.selectAll("path")
	      		.data(collection.features).enter()
	      		.selectAll("g")
			    .attr("transform", function(d,i){ 
	       			quakeCoordsPoint = projectPointOptimized(quakeLeafletLatLng[i]);
	       			//quakeCoordsPoint = {x:0,y:0};
	       			quakeCoordsPoints[i] = quakeCoordsPoint;
	       			return "translate(" + quakeCoordsPoint.x + "," + quakeCoordsPoint.y + ")"; })
				//.attr("x", function(d,i) {return projectPointNoStream(d.geometry.coordinates[0],d.geometry.coordinates[1]).x ;})
	       		//.attr("y", function(d,i) {return projectPointNoStream(d.geometry.coordinates[0],d.geometry.coordinates[1]).y ;})
	       		.attr("x", function(d,i) {return quakeCoordsPoints[i].x ;})
	       		.attr("y", function(d,i) {return quakeCoordsPoints[i].y ;})
	      		;


/*
	      	var quakeCoordsPoint;
	      	var q = d3.queue(1);
	      	g.selectAll("path")
	      		.data(collection.features).enter()
	      		.selectAll("g")
	      		.attr("dummy", function(d,i){ 
	      			q.defer(deferredPointProjection, d, this, i);
	      			//return "translate(0,0)";
	      			})
				//.attr("x", function(d) {return projectPointNoStream(d.geometry.coordinates[0],d.geometry.coordinates[1]).x ;})
	      		//.attr("y", function(d) {return projectPointNoStream(d.geometry.coordinates[0],d.geometry.coordinates[1]).y ;})
	    		;

				q.await(function(error) {
	      					if (error) throw error;
	      					console.log("set transforms" + " is done");
	      				});


	    		function deferredPointProjection(d, d3this, index, callback)
	    		{
	    			//console.log("executing deferredPointProjection");
	    				var quakeCoordsPoint = projectPointNoStream(d.geometry.coordinates[0],d.geometry.coordinates[1]);
						d3.select(d3this).attr("transform","translate(" + quakeCoordsPoint.x + "," + quakeCoordsPoint.y + ")" )
						//d3.select(d3this.)attr("x",quakeCoordsPoint.x)
						//d3.select(d3this).attr("y",quakeCoordsPoint.y);
	      				//console.log("d3selecttransform=" + d3.select(d3this).attr("transform"));
	      				//console.log("d3selectclass=" + d3.select(d3this).attr("class"));
	      				callback(null);
	      				//console.log("mag=" + d.properties.mag + "; d3this=" + d3this + "; i=" + index + "; quakeCoordsPoint=" + quakeCoordsPoint);
	      				//console.log("done executing deferredPointProjection");

	    		}
*/
	      	featureData
	    		.selectAll("circle")
	    		.attr("r", function (d) { return getPointRadiusFromQuake(d.geometry.coordinates[2], d.properties.mag, 2.5); })
				;	


			function projectPointOptimized(leafletLatlng) {
			  	point = map.project(leafletLatlng)._round();
			  	point = point._subtract(mapPixelOrigin);
			    return point;
			  }

			  console.log("reset map done");

	  }

	  // Use Leaflet to implement a D3 geometric transformation.
	  function projectPoint(x, y) {
	    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
	    this.stream.point(point.x, point.y);
	  }
		});

	  function projectPointNoStream(x, y) {
	    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
	    return point;
	  }




	

		function getPointRadiusFromQuake(depth, epicenterMag, perceivedMag)
		{
			//console.log("depth="+depth+";epicenterMag="+epicenterMag+"; perceivedMag="+perceivedMag);
			//get km radius
			//in js, ln is "log"...
			var km = (Math.log(perceivedMag / epicenterMag) / -(0.8999 / Math.pow( depth, 2)  + 0.0014));
			//console.log("distance at perceived mag="+km);
			//convert to pixel radius
			var pixelRadius = pixelsPerMeter * km * 1000;
			if (pixelRadius < 10)
				pixelRadius = 10;
			///console.log("pixelradius="+pixelRadius);
			return pixelRadius;
		}


		function getPerceivedMagnitude(quakeGPos, epicenterMag, mouseEvent, quakeCoords)
		{


			console.log("quakeGPos[deprecated]="+quakeGPos);
			console.log("epicenterMag="+epicenterMag);
			console.log("mouseEvent="+mouseEvent);

			var mouseLeafletCoords = map.containerPointToLatLng(mouseEvent); //not correct. is mouseevent correct layerPoint?
			//var quakePosCoords = map.containerPointToLatLng(quakeGPos);

			console.log("mouseLeafletCoords="+mouseLeafletCoords);
			//console.log("quakePosCoords="+quakePosCoords);


			var distanceKm = getGlobeDistance(quakeCoords[1], quakeCoords[0],mouseLeafletCoords.lat,mouseLeafletCoords.lng,"K");
			//var distanceKm = map.containerPointToLatLng([quakeGPos[0], quakeGPos[1]]).distanceTo( map.containerPointToLatLng(mouseEvent));
			console.log("distanceKm="+distanceKm);

			//get perceived magnitude from attentuation formula
			var depth = quakeCoords[2];
			var perceived = epicenterMag * (Math.exp(-(0.8999 / Math.pow(depth,2) + 0.0014) * distanceKm));
			console.log("perceivedMagnitudeAtDistance="+perceived);
			return [perceived, distanceKm];
		}

		//get distance from two latlon in degrees
		function getGlobeDistance(lat1, lon1, lat2, lon2, unit) {
			var radlat1 = Math.PI * lat1/180;
			var radlat2 = Math.PI * lat2/180;
			var theta = lon1-lon2;
			var radtheta = Math.PI * theta/180;
			var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
			dist = Math.acos(dist);
			dist = dist * 180/Math.PI;
			dist = dist * 60 * 1.1515;
			if (unit=="K") { dist = dist * 1.609344 };
			if (unit=="N") { dist = dist * 0.8684 };
			return dist;
		}

		function createGradient(mag, circleIndex)
		{
				var gradient = svg.append("svg:defs")
	    .append("svg:radialGradient")
	    .attr("id", "gradient" + circleIndex)
	    .attr("x1", "0%")
	    .attr("y1", "0%")
	    .attr("x2", "100%")
	    .attr("y2", "100%")
	    .attr("spreadMethod", "pad");

	gradient.append("svg:stop")
	    .attr("offset", "0%")
	    //.attr("stop-color", "#FF0000") //red
	   	.attr("stop-color", getGradientColor(mag, 1))
	    .attr("stop-opacity", getGradientOpacity(mag, 0, true));

	gradient.append("svg:stop")
	    .attr("offset", "50%")
	    .attr("stop-color", getGradientColor(mag, 0.5))
	    .attr("stop-opacity", getGradientOpacity(mag, 0.5, false));

	gradient.append("svg:stop")
	    .attr("offset", "100%")
	    .attr("stop-color", "#17BF25")
	    .attr("stop-opacity", 0);

	    	return "url(#gradient" + circleIndex + ")";
		}

 	});

	function getGradientColor(mag, offset)
	{
		var hueValue = (1 - (offset * (mag+3) / 10)) * 0.4;
		if (hueValue > 0.4) {hueValue = 0.4};

		var hsl = {
			h: hueValue * 360,
			s: 1 * 100,
			l: 1 * 50
		};
	     //var H = power * 0.4; // Hue (note 0.4 = Green, see huge chart below), 0.0 is Red
	     ///var S = 0.9; // Saturation
	    // var B = 0.9; // Brightness
	    var hslColor = Color().fromHsl(hsl);
	    return hslColor.toString();
	}

	function getGradientOpacity(mag, offset, isCenter)
	{
		var scaledMag = offset * mag; 

		var opacityValue = ((scaledMag) / 10);
		if (isCenter) opacityValue += 0.8;
		if (scaledMag < 6) opacityValue /= 2;
		if (opacityValue > 1) opacityValue = 1;

		return opacityValue;
	}


  }

  
});