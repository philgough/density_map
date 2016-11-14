// add the svg to the body
var svg = d3.select("body").append("svg");

// some dimensions for the svg
svgDims = {
	'width': 960,
	'height': 700,
	margin: {
		'top': 10,
		'bottom': 10,
		'left': 10,
		'right': 10
	},
	padding: {
		'top': 10,
		'bottom': 10,
		'left': 10,
		'right': 10
	}
}

// add some dimensions to the svg
svg.attr("width", svgDims.width)
	.attr("height", svgDims.height);




var parseDate = d3.timeParse("%Y-%m-%d");

var outputDate = d3.scaleTime();
var inputDate = d3.scaleTime();
// var colour = d3.scaleOrdinal(d3.schemeCategory10);
var colour = d3.scaleLinear();


var playing = true;
var updateNumber = 0;



d3.json("ant-paddocks.json", function(error, eva) {
	if (error) throw error;
	// console.log(eva);

	locationANT = [135.5250651, -17.9658504];

	locationEVA = [134.8255314, -18.0030278];



	var projection = d3.geoMercator()
		.scale(27000)
		.center(locationANT)
		.precision(1);

	// one path for all of them
	// svg.append("path")
	// 	.datum({type: "FeatureCollection", features: eva.features})
	// 	.attr("d", d3.geoPath())
	// 	.attr("projection", projection)
	
	// many paths
	svg.selectAll("path")
		.data(eva.features)
		.enter().append("path")
		.attr("d", d3.geoPath(projection))
		.attr("fill", "none")
		.attr("stroke", "#000")
		.attr("class", "shape-line")
		.attr("id", function(d) {
			// console.log("id:", d.properties.AACO_ID);
			return d.properties.AACO_ID;
		});


	// set controls		
	d3.select("#play").on("click", function() {
		console.log("playing animation");
		playing = true;
		d3.select("#current-state").text("playing")
	});

	d3.select("#pause").on("click", function() {
		console.log("pausing animation");
		playing = false;
		d3.select("#current-state").text("paused")
	});

	d3.select("#fwd").on("click", function() {
		console.log("advancing frame");
		playing = false;
		d3.select("#current-state").text("paused")
		if (updateNumber + 1 < availableDates.length-1) updateNumber += 1;
		update(availableDates[updateNumber])
	});

	d3.select("#back").on("click", function() {
		console.log("retreating frame. Retreating, is that the right word?");
		if (updateNumber > 0) updateNumber -= 1;
		update(availableDates[updateNumber])
		playing = false;
		d3.select("#current-state").text("paused")
	});

	d3.select("#fwd-5").on("click", function() {
		console.log("advancing frame");
		playing = false;
		d3.select("#current-state").text("paused")
		if (updateNumber + 5 < availableDates.length-1) updateNumber += 5;
		update(availableDates[updateNumber])
	});

	d3.select("#back-5").on("click", function() {
		console.log("retreating frame. Retreating, is that the right word?");
		if (updateNumber - 5 > 0) updateNumber -= 5;
		update(availableDates[updateNumber])
		playing = false;
		d3.select("#current-state").text("paused")
	});

	d3.select("#restart").on("click", function() {
		console.log("reset to 0th frame and play");
		updateNumber = 0;
		playing = true;
		d3.select("#current-state").text("playing")
	})

});





// var firstDay;
// var lastDay;

d3.csv("data/ANTEVA_Stock_Density_Timeseries_Data.csv", function(error, data) {

	if (error) throw error;

	// console.log(data);

	values = [];
	for (var i = 0; i < data.length; i++) {
		if (parseFloat(data[i].AEGD_p_Ha) > 0) {
			values[i] = parseFloat(data[i].AEGD_p_Ha);
		}
	}
	console.log("max value:", d3.max(values));
	colour.domain([0, d3.max(values)]).range(["white", "red"]);
	
	// console.log(values)

	firstDay = parseDate(data[0].Date);
	lastDay = parseDate(data[data.length-1].Date);
	d3.select("body").append("p").text("Movements from " + firstDay + " to " + lastDay);

	outputDate.range([firstDay, lastDay]).domain([0, svgDims.width]);
	inputDate.domain([firstDay, lastDay]).range([0, svgDims.width]);

	// stockLevels = data;
	availableDates = [];
	datedStockLevels = {};
	data.forEach(function (d, i) {
		// console.log(i)
		// var theDate = inputDate(parseDate(d.Date));
		// console.log(theDate);
		if (!datedStockLevels[d.Date]) {
			// console.log("creating object for", d.Date)
			datedStockLevels[d.Date] = [];
			availableDates.push(d.Date);
		}
		datedStockLevels[d.Date].push({id:d.AACO_ID, density:d.AEGD_p_Ha});
	});

	d3.select("body").append("p").text(" ").attr("id", "date-feedback");

	


});




var update = function(date, position) {

	// data = date

	datedStockLevels[date].forEach(function (d) {
		// console.log(d);
		if (d.density > 0) {
			fillColour = colour(d.density)
			d3.select("#"+d.id).attr("fill", fillColour);
		}
		else {
			d3.select("#"+d.id).attr("fill", "blue");
		}
	})

	d3.select("#date-feedback").text("Current date: " + date);



}



window.setInterval(function() {
	if (playing) {
		if (updateNumber >= availableDates.length) updateNumber = 0;
		update(availableDates[updateNumber], updateNumber/availableDates.length-1);
		updateNumber += 1
	}
}, 2000);





