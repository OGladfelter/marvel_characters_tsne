// set the dimensions and margins of the graph
if (screen.width < 600){
    var margin = {top: 30, right: 30, bottom: 50, left: 50},
    width = window.innerWidth - margin.left - margin.right,
    height = (window.innerHeight) - margin.top - margin.bottom;
}
else{
    var margin = {top: 30, right: 30, bottom: 30, left: 30},
    width = (window.innerWidth / 1) - margin.left - margin.right,
    height = (window.innerHeight / 1) - margin.top - margin.bottom;
}

// append the SVG object to the body of the page
var SVG = d3.select("#scatterplot")
  .append("svg")
    .attr("width", width - margin.left - margin.right)
    .attr("height", height)
    .style("border", "1px solid black");
  
  var focus = SVG.append("g")
    //.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//Read the data
d3.csv("data/Top_Marvel_characters_With_Metadata.csv", function(data) {

  data.forEach(function(d) {
    d.x = +d.x; // convert to number
    d.y = +d.y;
    d.appearances = +d.appearances;
  });

  // Add X axis
  var x = d3.scaleLinear()
    .domain(d3.extent(data, function(d) { return d.x; }))
    .range([ 10, width-10 ]);
  var xAxis = SVG.append("g")
    .style("display","none")
    .call(d3.axisBottom(x));

  // Add Y axis
  var y = d3.scaleLinear()
    .domain(d3.extent(data, function(d) { return d.y; }))
    .range([ height-10, 10]);
  var yAxis = SVG.append("g")
    .style("display","none")
    .call(d3.axisLeft(y));

  // create circle radius size scale
  radius = d3.scaleSqrt()
    .domain(d3.extent(data, function(d) { return d.appearances; }))
    .range([50, 125]);
  
  
  // Set the zoom and Pan features: how much you can zoom, on which part, and what to do when there is a zoom
  var zoom = d3.zoom()
  .scaleExtent([.5, 20])  // This control how much you can unzoom (x0.5) and zoom (x20)
  .extent([[0, 0], [width, height]])
  .on("zoom", updateChart);

  // This add an invisible rect on top of the chart area. This rect can recover pointer events: necessary to understand when the user zoom
  // SVG.append("rect")
  // .attr("width", width)
  // .attr("height", height)
  // .style("fill", "none")
  // .style("pointer-events", "all")
  // .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
  // .call(zoom);
  // now the user can zoom and it will trigger the function called updateChart
  

  // Add a clipPath: everything out of this area won't be drawn.
  var clip = SVG.append("defs").append("SVG:clipPath")
      .attr("id", "clip")
      .append("SVG:rect")
      .attr("width", width )
      .attr("height", height )
      .attr("x", 0)
      .attr("y", 0);

  // Create the scatter variable: where both the circles and the brush take place
  var scatter = focus.append('g')
    .attr("clip-path", "url(#clip)");

  // Tool tip 
  var tooltip = d3.select("#scatterplot")
      .append("div")
      .style('visibility', 'hidden')
      .attr('class', 'tooltip')
      .style("pointer-events", "none");

  defs = SVG.append('svg:defs');

  var config = {
    "avatar_size": 75 //define the size of teh circle radius
  }

  data.forEach(function(d, i) {
    defs.append("svg:pattern")
      .attr("id", "grump_avatar" + d.pic_id)
      .attr("width", 1) 
      .attr("height", 1)
      .attr("patternUnits", "objectBoundingBox")
      .append("svg:image")
      .attr("id", "test")
      .attr("xlink:href", "img_square/" + d.pic_id + ".jpg")
      .attr("width", radius(d.appearances))
      .attr("height", radius(d.appearances))
      .attr("x", 0)
      .attr("y", 0);
      
      })

  // Add circles
  var circles = scatter
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
      .attr("class","dot")
      // .attr("cx", function (d) { return x(d.x); } )
      // .attr("cy", function (d) { return y(d.y); } )
      .attr("transform", function(d){ return "translate(" + x(d.x) + "," + y(d.y) + ")"})
      .attr("cx", function(d){return radius(d.appearances) / 2})
      .attr("cy", function(d){return radius(d.appearances) / 2})
      .attr("r", function(d){return radius(d.appearances) / 2})
      .style("opacity", 1)
      .style("fill", "#fff")
      //.style("pointer-events", "none")
      .style("fill", function(d){ return "url(#grump_avatar" + d.pic_id})
      .on("mouseover", function(d){

        // bring selected character to top
        d3.select(this).raise();
        
        if (d.superName.trim() != d.nickName.trim()){
          var text = "<b>" + d.superName + "</b><br> " +d.nickName + "</br>";
        }
        else{
          var text = "<b>" + d.superName + "</b>"
        }

        return tooltip
        .style("visibility", "visible")
        .html(text)
        .transition().duration(500)
         .style("left", event.pageX + 5 + "px")
         .style("top", event.pageY + 5 + "px")
    })
    .on("mouseout", function(d){
      return tooltip
      .style("visibility", "hidden")
  });

  focus.append("rect")
          .attr("width", width)
          .attr("height", height)
          .style("fill", "none")
          .attr("pointer-events", "all")
          .style("cursor", "move")
          .lower();

  focus.call(zoom);
 

  // A function that updates the chart when the user zoom and thus new boundaries are available
  function updateChart() {

    // recover the new scale
    var newX = d3.event.transform.rescaleX(x);
    var newY = d3.event.transform.rescaleY(y);
    
    // update axes with these new boundaries
    xAxis.call(d3.axisBottom(newX))
    yAxis.call(d3.axisLeft(newY))

    // used to determine how "zoomed in" user is --> use for radius resize later on
    // var k = d3.event.transform.k

    // radius = d3.scaleLinear()
    // .domain(d3.extent(data, function(d) { return d.appearances; }))
    // .range([25, 125]);

    // update circle position
    scatter
      .selectAll("circle")
      .attr('cx', function(d) {return newX(d.x)})
      .attr('cy', function(d) {return newY(d.y)})
      //.attr('r', function(d)  {return radius(d.appearances) + k});
  }

})
