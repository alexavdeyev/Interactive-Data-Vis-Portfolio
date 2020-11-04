/**
 * CONSTANTS AND GLOBALS
 **/
const 
    margin = { top: 10, right: 30, bottom: 20, left: 50 },
    width = 700, height = 400,
    radius = 3, time = 1000,
    default_selection = "Select a Country";

/**
 * This extrapolated function allows us to replace the "G" with "B" min the case of billions.
 * We cannot do this in the .tickFormat() because we need to pass a function as an argument,
 * and replace needs to act on the text (result of the function). 
**/
  formatBillions = (num) => d3.format(".2s")(num).replace(/G/, 'B'),
  formatComma = (num) => d3.format(",")(num),
  formatDate = d3.timeFormat('%Y');

/**
 * These variables allow us to access anything we manipulate in
 * init() but need access to in draw().
 * All these variables are empty before we assign something to them.
 **/
let svg, xScale, yScale, yAxis;

/**
 * APPLICATION STATE
 **/
let state = {data: [], selectedCountry: null};

/**
 * LOAD DATA
 **/
d3.csv("data/multi.csv", d => ({
  year: new Date(d.Year, 0, 1),
  country: d.Entity,
  prevalence: +d.Prevalence}))
    .then(data => {
      console.log("data", data)
      state.data = data
      init()
    }
);

/**
 * INITIALIZING FUNCTION
 * This will be run *one time* when the data finishes loading in
 **/
function init() {
// SCALES
  xScale = d3
    .scaleTime()
    .domain(d3.extent(state.data, d => d.year))
    .range([margin.left, width - margin.right])
    .nice();

  yScale = d3
    .scaleLinear()
    .domain([0, d3.max(state.data, d => d.prevalence)])
    .range([height - margin.bottom, margin.top])
    .nice();
    
  // AXES
  const xAxis = d3.axisBottom(xScale);
  
  yAxis = d3.axisLeft(yScale).tickFormat(formatBillions);
  
  // UI ELEMENT SETUP
  const selectElement = d3.select("#dropdown")
    .on("change", function() {
      console.log("new selected entity is", this.value);
      // `this` === the selectElement
      // this.value holds the dropdown value a user just selected
      state.selectedCountry = this.value;
      draw() // re-draw the graph based on this new selection
    });
  
  // Add in dropdown options from the unique values in the data
  selectElement
    .selectAll("option")
    .data([
      ...Array.from(new Set(state.data.map(d => d.country))),
      default_selection])
    .join("option")
    .attr("value", d => d)
    .text(d => d);

  // This ensures that the selected value is the same as what we have 
  // in state when we initialize the options
  selectElement.property("value", default_selection);

  // Create an svg element in our main `d3-container` element
  svg = d3
    .select("#viz2")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // add the xAxis
  svg
    .append("g")
    .attr("class", "axis x-axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis)
    .append("text")
    .attr("class", "axis-label")
    .attr("x", width-margin.right)
    .attr("y", -6)
    .text("Year");
  
  // add the yAxis
  svg
    .append("g")
    .attr("class", "axis y-axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxis)
    .append("text")
    .attr("class", "axis-label")
    .attr("transform", "rotate(-90)")
    .attr("x", -margin.top)
    .attr("y", margin.top)
    .text("Incidence rates");

  // tooltip
  div = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip");
  
  hvlines = svg
    .append("line")
    .attr("class", "hover-line")

  draw() // call the draw function
}

/**
 * DRAW FUNCTION
 * we call this everytime there is an update to the data/state
 **/
function draw() {
  // filter the data for the selectedParty
  let filteredData = [];
    if (state.selectedCountry !== null) {
      filteredData = state.data.filter(d => d.country === state.selectedCountry)
    }
  // update the scale domain (now that our data has changed)
  yScale.domain([0, d3.max(filteredData, d => d.prevalence)]);

  // re-draw our yAxix since our yScale is updated with the new data
  d3.select("g.y-axis")
    .transition()
    .duration(time)
  // this updates the yAxis' scale to be our newly updated one
    .call(yAxis); 

  // we define our line function generator telling it how to access the x,y values for each point
  const lineFunc = d3
    .area()
    .x(d => xScale(d.year))
    .y(d => yScale(d.prevalence))
    .y1(yScale(0));
  
  const dot = svg
    .selectAll(".dot")
    .data(filteredData, d => d.year) // use `d.year` as the `key` to match between HTML and data elements
    .join(
      enter =>
        // enter selections -- all data elements that don't have a `.dot` element attached to them yet
        enter
          .append("circle")
          .attr("class", "dot")
          .attr("r", radius)
          .attr("cy", d => yScale(d.prevalence)) 
          .attr("cx", d => xScale(d.year))

        // initial value - to be transitioned
          .on("mouseover", function (d) {
            d3.select(this)
              .transition()
              .duration(time)
              .attr("r", 3*radius)
            div.transition()
              .duration(time)
              .style("opacity", .8)
            div.html("There were " + `${formatComma(Math.round(d.prevalence))}` + " cases in " + `${formatDate(d.year)}`)
              .style("left", (d3.event.pageX) + "px")
              .style("top", (d3.event.pageY - 30) + "px")
            hvlines
              .style("opacity", 0.5)
              .attr("x1",xScale(d.year))
              .attr("y1",yScale(d.prevalence))
              .attr("x2",xScale(d.year))
              .attr("y2",height - margin.bottom)
          })
    
          .on("mouseout", function () {
            d3.select(this)
              .transition()
              .duration(time)
              .attr("r", radius)
            div.transition()
              .duration(time)
              .style("opacity", 0)
            hvlines
              .style("opacity", 0)
          }),
          update => update,
      exit =>
        exit.call(exit =>
          // exit selections -- all the `.dot` element that no longer match to HTML elements
          exit.remove())
    )
    // the '.join()' function leaves us with the 'Enter' + 'Update' selections together.
    // Now we just need move them to the right place
    .call(
      selection => 
        selection
          .transition()
          .duration(time) 
          .attr("cy", d => yScale(d.prevalence)) 
    );

  const line = svg
    .selectAll("path.trend")
    .data([filteredData])
    .join(
      enter => 
        enter
          .append("path")
          .attr("class", "trend"),
        update => update, // pass through the update selection
        exit => exit.remove()
    )
    .call(selection =>
      selection
        .transition() // sets the transition on the 'Enter' + 'Update' selections together.
        .duration(time)
        .attr("d", d => lineFunc(d))  
    )
}