export function chart2() {
  const
    width = window.innerWidth * 0.7,
    height = window.innerHeight * 0.55,
    margin = {top: 50, bottom: 30, left: 50, right: 20};
 
  var formatper = d3.format(".0%")
  let svg, xScale, yScale, yAxis,
      state = {
        data: []
      };
      
  Promise.all([
    d3.csv("data/sns.csv", d => ({
      SNS: d.SNS,
      Users: +d.Users}))]).then(([data]) => {
        state.data = data;
        console.log("state: ", state);
        init();
    });

function init() {

xScale = d3.scaleBand()
      .domain(state.data.map(d => d.SNS))
      .range([margin.left, width- margin.left - margin.right])
      .padding(0.1)
  
yScale = d3.scaleLinear()
      .domain([0, d3.max(state.data, d => d.Users)])
      .range([height - margin.top - margin.bottom, margin.top])

yAxis = d3.axisLeft(yScale).tickFormat(formatper);

const 
  logScale = d3.scaleSymlog()
    .domain(d3.extent(state.data, d => d.Users))
    .range([0.1, 0.4]),
  
  colorScale = d3.scaleSequential(d => d3.interpolatePuBuGn(logScale(d)));

svg = d3.select("#d3-container-1").append("svg").attr("width", width).attr("height", height);
          
svg.append("g")
  .attr("class", "axisy-axis")
  .attr("transform","translate(" + margin.left + ",0)")
  .call(yAxis)
        
svg.selectAll("rect")
  .data(state.data)
  .enter()
    .append("rect")
    .attr("class","bar")
      .on("mouseover",function(){
          d3.select(this).attr("fill","#8F2D56")}) 				
      .on("mouseout",function(){
          d3.select(this)
            .transition("colorfade")
            .duration(250)
            .attr("fill",d=> colorScale(d.Users))})
    .attr("fill",d => colorScale(d.Users))
    .attr("x", (d,i) => xScale(d.SNS))
    .attr("width", xScale.bandwidth())    
    .attr("y", height- margin.top - margin.bottom)
    .transition("bars")
    .delay((d, i) => i * 50)
    .duration(1000)
    .attr("y", d=> yScale(d.Users))   				
    .attr("height", (d,i) => height- margin.top - margin.bottom- yScale(d.Users))  


svg.selectAll(".val-label")
  .data(state.data)
  .enter()
  .append("text")
  .classed("val-label", true)
  .attr("x", (d,i) => xScale(d.SNS) + xScale.bandwidth()/2)
  .attr("y", height- margin.top - margin.bottom)   				
  .transition("label")
  .delay((d, i) => i * 50)
  .duration(1000)
  .attr("y", (d,i) => yScale(d.Users) - 4)
  .attr("text-anchor","middle")
  .text(d=> formatper(d.Users));

svg.selectAll(".bar-label")
  .data(state.data)
  .enter()
  .append("text")
  .classed("bar-label", true)
  .attr("transform", (d,i) => 
    "translate(" + (xScale(d.SNS) + xScale.bandwidth()/2 - 20) + "," + (height - 75) + ")" + " rotate(45)")
  .attr("text-anchor","left")
  .text(d => d.SNS)
          
d3.select("#byPercentage")
  .on("click", function() {
    state.data.sort((a, b) => d3.descending(a.Users, b.Users))

    xScale.domain(state.data.map(d =>d.SNS));

    svg.selectAll(".bar")
      .transition()
      .duration(500)
      .attr("x", (d, i) => xScale(d.SNS))
              
    svg.selectAll(".val-label")
      .transition()
      .duration(500)
      .attr("x", (d, i) => xScale(d.SNS) + xScale.bandwidth() / 2)
              
    svg.selectAll(".bar-label")
      .transition()
      .duration(500)
      .attr("transform", (d, i) => "translate(" + (xScale(d.SNS) + xScale.bandwidth() / 2 - 20) + "," + (height -75) + ")" + " rotate(45)")
  })
                    
  
d3.select("#bySite")
  .on("click", function() {
    state.data.sort((a, b) => d3.ascending(a.SNS, b.SNS))
    
    xScale.domain(state.data.map(d=> d.SNS));
    
    svg.selectAll(".bar")
      .transition()
      .duration(500)
      .attr("x", (d, i) => xScale(d.SNS))

    svg.selectAll(".val-label")
      .transition()
      .duration(500)
      .attr("x", (d, i) => xScale(d.SNS) + xScale.bandwidth() / 2)

    svg.selectAll(".bar-label")
      .transition()
      .duration(500)
      .attr("transform", (d, i) =>  "translate(" + (xScale(d.SNS) + xScale.bandwidth() / 2 - 20) + "," + (height-75) + ")" + " rotate(45)"
)
  }) 
}

}