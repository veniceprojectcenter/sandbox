import Data from './dataRetrieval/Data';

// I didn't want to do all this by hand for a useless feature so sorry future teams
const visuals = [
  { name: 'Bubble Map Chart', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-87-300x300.png', available: false },
  { name: 'Donut Chart', image: 'http://datavizproject.com/wp-content/uploads/2015/10/3-Donut-Chart-300x300.png', available: true },
  { name: 'Bubble Chart', image: 'https://datavizproject.com/wp-content/uploads/2015/10/DVP-23-300x300.png', available: true },
  { name: 'Bar Chart (vertical)', image: 'https://datavizproject.com/wp-content/uploads/2015/10/4-Bar-Chart-300x300.png', available: true },
  { name: 'Stacked Bar Chart', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-05-300x300.png', available: true },
  { name: 'Sankey Diagram', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-21-300x300.png' },
  { name: 'Alluvial Diagram', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-93-300x300.png' },
  { name: 'Radial Bar Chart', image: 'https://datavizproject.com/wp-content/uploads/2015/11/DVP_1_100-57-300x300.png' },
  { name: 'Radial Histogram', image: 'https://datavizproject.com/wp-content/uploads/2015/11/DVP_1_100-99-1-300x300.png' },
  { name: 'Sorted Stream Graph', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-82-300x300.png' },
  { name: 'Pictorial Fraction Chart', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-53-300x300.png' },
  { name: 'Fishbone Diagram', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-70-300x300.png' },
  { name: 'Matrix Diagram (Roof Shaped)', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-71-300x300.png' },
  { name: 'Matrix Diagram', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-81-300x300.png' },
  { name: 'Arc Diagram', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-68-300x300.png' },
  { name: 'Polar Area Chart', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-40-300x300.png' },
  { name: 'Exploded View Drawing', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-64-300x300.png' },
  { name: 'Flow Map', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-78-300x300.png' },
  { name: 'Pictorial Stacked Chart', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-54-300x300.png' },
  { name: 'Sunburst Diagram', image: 'https://datavizproject.com/wp-content/uploads/2015/10/DVP-30-300x300.png' },
  { name: 'Chord Diagram', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-66-300x300.png' },
  { name: 'Isoline Map', image: 'https://datavizproject.com/wp-content/uploads/2015/10/DVP-88-300x300.png' },
  { name: 'Progress Bar', image: 'https://datavizproject.com/wp-content/uploads/2015/10/14-Progress-Bar-300x300.png' },
  { name: 'Treemap', image: 'https://datavizproject.com/wp-content/uploads/2015/10/DVP-36-300x300.png' },
  { name: 'Line Graph', image: 'https://datavizproject.com/wp-content/uploads/2015/10/1-Line-Chart-300x300.png' },
  { name: 'Word Cloud', image: 'https://datavizproject.com/wp-content/uploads/2015/10/DVP-62-300x300.png' },
  { name: 'Violin Plot', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-35-300x300.png' },
  { name: 'Hexagonal Binning', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-92-300x300.png' },
  { name: 'Radial Line Graph', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-80-300x300.png' },
  { name: 'Pictorial Fraction Chart', image: 'https://datavizproject.com/wp-content/uploads/2015/10/13-Fraction-of-pictograms-300x300.png' },
  { name: 'Waterfall Plot', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-85-300x300.png' },
  { name: 'Choropleth Map', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-28-300x300.png' },
  { name: 'Hyperbolic Tree', image: 'https://datavizproject.com/wp-content/uploads/2015/10/DVP-26-300x300.png' },
  { name: 'Hive Plot', image: 'https://datavizproject.com/wp-content/uploads/2015/11/DVP_1_100-100-300x300.png' },
  { name: 'Heat Map', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-50-300x300.png' },
  { name: 'Transit Map', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-32-300x300.png' },
  { name: 'Hanging Rootogram', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-83-300x300.png' },
  { name: 'Multi-level Donut Chart', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-51-300x300.png' },
  { name: 'Stream Graph', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-72-300x300.png' },
  { name: 'Parallel Sets', image: 'https://datavizproject.com/wp-content/uploads/2015/11/DVP_1_100-59-300x300.png' },
  { name: 'Proportional Area Chart (Square)', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-07-300x300.png' },
  { name: 'Funnel Chart', image: 'https://datavizproject.com/wp-content/uploads/2015/11/DVP-61-300x300.png' },
  { name: 'Pie Chart', image: 'https://datavizproject.com/wp-content/uploads/2015/10/11-Pie-Chart-300x300.png', available: true },
  { name: 'Linear Process Diagram', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-97-300x300.png' },
  { name: 'Packed Circle Chart', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-67-300x300.png' },
  { name: 'Convex Treemap', image: 'https://datavizproject.com/wp-content/uploads/2015/10/DVP-37-300x300.png' },
  { name: 'Stacked Area Chart', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-12-300x300.png' },
  { name: 'Mind Map', image: 'https://datavizproject.com/wp-content/uploads/2015/10/18-Mind-Map-300x300.png' },
  { name: 'SWOT Analysis', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-98-300x300.png' },
  { name: 'Angular Guage', image: 'https://datavizproject.com/wp-content/uploads/2015/10/DVP-42-300x300.png' },
  { name: 'Proportional Area Chart (Circle)', image: 'https://datavizproject.com/wp-content/uploads/2015/10/10-Proportional-Area-Chart-circle-300x300.png ' },
  { name: 'Radar Diagram', image: 'https://datavizproject.com/wp-content/uploads/2015/10/DVP-29-300x300.png' },
  { name: 'Dot Plot', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-33-300x300.png' },
  { name: 'Population Pyramid', image: 'https://datavizproject.com/wp-content/uploads/2015/10/19-Population-Pyramid1-300x300.png' },
  { name: 'Sociaogram', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-69-300x300.png' },
  { name: 'Boxplot', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-34-300x300.png' },
  { name: 'Euler Diagram', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-84-300x300.png' },
  { name: 'Topographic Map', image: 'https://datavizproject.com/wp-content/uploads/2015/10/DVP-38-300x300.png' },
  { name: 'Waterfall Chart', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-46-300x300.png' },
  { name: 'Nested Proportional Area Chart', image: 'https://datavizproject.com/wp-content/uploads/2015/10/DVP-56-300x300.png' },
  { name: 'Semi Circle Donut Chart', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-76-300x300.png' },
  { name: 'Three-dimensional Stream Graph', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-73-300x300.png' },
  { name: 'Gantt Chart', image: 'https://datavizproject.com/wp-content/uploads/2015/10/8-Gannt-Chart-300x300.png' },
  { name: 'Cycle Graph', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-95-300x300.png' },
  { name: 'Pictorial Unit Chart', image: 'https://datavizproject.com/wp-content/uploads/2015/10/15-Pictoral-Unit-Chart-300x300.png' },
  { name: 'Parallel Coordinates', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-63-300x300.png' },
  { name: 'Timeline', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-17-300x300.png' },
  { name: 'Cluster Analysis', image: 'https://datavizproject.com/wp-content/uploads/2015/10/DVP-24-300x300.png' },
  { name: 'Grouped Bar Chart', image: 'https://datavizproject.com/wp-content/uploads/2015/10/6-Grouped-Bar-Chart-300x300.png' },
  { name: 'Histogram', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-16-300x300.png' },
  { name: 'Phase Diagram', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-79-300x300.png' },
  { name: 'Pareto Chart', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-31-300x300.png' },
  { name: 'Venn Diagram', image: 'https://datavizproject.com/wp-content/uploads/2015/10/DVP_1_100-09-300x300.png' },
  { name: 'Bullet Graph', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-52-300x300.png' },
  { name: 'Scatter Plot', image: 'https://datavizproject.com/wp-content/uploads/2015/10/DVP-22-300x300.png' },
  { name: 'Solid Guage Chart', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-43-300x300.png' },
  { name: 'Kagi Chart', image: 'https://datavizproject.com/wp-content/uploads/2015/10/DVP-44-300x300.png' },
  { name: 'Partition Layer Chart Icicle Diagram', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-91-300x300.png' },
  { name: 'Swimlane Flow Chart', image: 'https://datavizproject.com/wp-content/uploads/2015/10/DVP-86-300x300.png' },
  { name: 'Polar Chart', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-60-300x300.png' },
  { name: 'Flow Chart', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-25-300x300.png' },
  { name: 'Process Diagram', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-96-300x300.png' },
  { name: 'Ternary Contour Plot', image: 'https://datavizproject.com/wp-content/uploads/2015/10/DVP-48-300x300.png' },
  { name: 'Contour Plot', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-89-300x300.png' },
  { name: 'Candlestick Chart', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-74-300x300.png' },
  { name: 'Organisational Chart', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-49-300x300.png' },
  { name: 'Target Diagram', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-90-300x300.png' },
  { name: 'Area Chart', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-02-300x300.png' },
  { name: 'Pyramid Chart', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-45-300x300.png' },
  { name: 'Ternary Plot', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-47-300x300.png' },
  { name: 'Bagplot', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-75-300x300.png' },
  { name: 'Range Area Chart', image: 'https://datavizproject.com/wp-content/uploads/2015/10/DVP-41-300x300.png' },
  { name: 'Compound Bubble and Pie Chart', image: 'https://datavizproject.com/wp-content/uploads/2015/10/DVP-58-300x300.png' },
  { name: 'Comparison Chart', image: 'https://datavizproject.com/wp-content/uploads/2015/10/DVP-39-300x300.png' },
  { name: 'Tally Chart', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-20-300x300.png' },
  { name: 'Column Range', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-77-300x300.png' },
  { name: 'Table Chart', image: 'https://datavizproject.com/wp-content/uploads/2015/10/DVP-55-300x300.png' },
  { name: 'Span Chart', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_1_100-65-300x300.png' },
  { name: 'Molecule Diagram', image: 'https://datavizproject.com/wp-content/uploads/2015/11/DVP_101_200-50-300x300.png' },
  { name: 'Radial Area Chart', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_101_200-11-300x300.png' },
  { name: 'Slope Chart', image: 'https://datavizproject.com/wp-content/uploads/2016/01/DVP_101_200-03-1-300x300.png' },
  { name: 'Spline Graph', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_101_200-12-300x300.png' },
  { name: 'Proporional Area Chart', image: 'https://datavizproject.com/wp-content/uploads/2016/01/DVP_101_200-07-1-150x150.png' },
  { name: 'Triangle Bar Chart', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_101_200-18-300x300.png' },
  { name: 'Clustered Force Layout', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_101_200-01-300x300.png' },
  { name: 'Dumbbell Plot', image: 'https://datavizproject.com/wp-content/uploads/2016/01/DVP_101_200-15-1-300x300.png' },
  { name: 'Connection Map', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_101_200-20-300x300.png' },
  { name: 'Cartogram', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_101_200-33-300x300.png' },
  { name: 'Route Map', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_101_200-19-300x300.png' },
  { name: 'Bar Chart (Horizontal)', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_101_200-14-300x300.png' },
  { name: 'Pin Map', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_101_200-49-300x300.png' },
  { name: 'Bump Chart', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_101_200-02-300x300.png' },
  { name: 'Butterfly Chart', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_101_200-21-300x300.png' },
  { name: 'Sparkline', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_101_200-08-300x300.png' },
  { name: 'Network Visualization', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_101_200-35-300x300.png' },
  { name: 'Opposite Diagram', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_101_200-25-300x300.png' },
  { name: 'Stacked Ordered Area Chart', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_101_200-30-300x300.png' },
  { name: 'Waffle Chart', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_101_200-37-300x300.png' },
  { name: 'Non-ribbon Chord Diagram', image: 'https://datavizproject.com/wp-content/uploads/2016/01/DVP_101_200-13-1-300x300.png' },
  { name: 'Curved Bar Chart', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_101_200-48-300x300.png' },
  { name: 'Scaled-up Number', image: 'https://datavizproject.com/wp-content/uploads/2016/01/DVP_101_200-17-300x300.png' },
  { name: 'Scaled Timeline', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_101_200-38-300x300.png' },
  { name: 'Circular Heat Map', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_101_200-23-300x300.png' },
  { name: 'Stopped Line Graph', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_101_200-22-300x300.png' },
  { name: 'Trendline', image: 'https://datavizproject.com/wp-content/uploads/2016/02/DVP_101_200-46-300x300.png' },
  { name: 'Icon + number', image: 'https://datavizproject.com/wp-content/uploads/2016/02/DVP_101_200-52-300x300.png' },
  { name: 'Proportional Area Chart (Icon)', image: 'https://datavizproject.com/wp-content/uploads/2016/02/DVP_101_200-51-300x300.png' },
  { name: 'Icon Count', image: 'https://datavizproject.com/wp-content/uploads/2016/02/DVP_101_200-44-1-300x300.png' },
  { name: 'Bar Chart on a Map', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_101_200-10-300x300.png' },
  { name: 'Pie Chart Map', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_101_200-43-300x300.png' },
  { name: 'Pictorial Bar Chart', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_101_200-45-300x300.png' },
  { name: 'Illustration Diagram', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_101_200-39-300x300.png' },
  { name: 'Renko Chart', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_101_200-29-300x300.png' },
  { name: 'Marimekko Chart', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_101_200-05-300x300.png' },
  { name: 'Taylor Diagram', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_101_200-32-300x300.png' },
  { name: 'Column Sparkline', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_101_200-55-300x300.png' },
  { name: 'Win-loss Sparkline', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_101_200-53-300x300.png' },
  { name: 'Matrix Diagram (Y-shaped)', image: 'https://datavizproject.com/wp-content/uploads/2016/06/DVP_101_200-26-300x300.png' },
  { name: 'Dot Density Map', image: 'https://datavizproject.com/wp-content/uploads/2017/08/DVP_101_200-56-300x300.png' },
  { name: 'Step by Step Illustration', image: 'https://datavizproject.com/wp-content/uploads/2017/08/DVP_101_200-59-300x300.png' },
  { name: 'Spiral Heat Map', image: 'https://datavizproject.com/wp-content/uploads/2017/08/DVP_101_200-58-300x300.png' },
  { name: 'Multiple Series 3D Bar Charts', image: 'https://datavizproject.com/wp-content/uploads/2017/08/DVP_101_200-27-300x300.png' },
  { name: 'Multi-level Pie Chart', image: 'https://datavizproject.com/wp-content/uploads/2017/08/DVP_101_200-60-300x300.png' },
  { name: 'Pyramid Diagram', image: 'https://datavizproject.com/wp-content/uploads/2017/09/DVP_101_200-54-300x300.png' },
  { name: 'Layered Area Chart', image: 'https://datavizproject.com/wp-content/uploads/2017/09/DVP_101_200-42-300x300.png' },
  { name: '3D Scatter Plot', image: 'https://datavizproject.com/wp-content/uploads/2017/09/DVP_101_200-34-300x300.png' },
  { name: 'Fan Chart (Geneaology)', image: 'https://datavizproject.com/wp-content/uploads/2017/09/DVP_101_200-06-300x300.png' },
  { name: 'Fan Chart (Time Series)', image: 'https://datavizproject.com/wp-content/uploads/2017/09/DVP_101_200-16-300x300.png' },
  { name: 'Bubble Timeline', image: 'https://datavizproject.com/wp-content/uploads/2017/09/DVP_101_200-36-300x300.png' },
  { name: 'Radial Convergences', image: 'https://datavizproject.com/wp-content/uploads/2017/09/DVP_101_200-57-3-300x300.png' },
  { name: 'Spiral Hisotgram', image: 'https://datavizproject.com/wp-content/uploads/2017/09/DVP_101_200-28-300x300.png' },
  { name: 'Dendrogram', image: 'https://datavizproject.com/wp-content/uploads/2017/09/DVP_1_100-94-300x300.png' },
  { name: 'Lollipop Chrat', image: 'https://datavizproject.com/wp-content/uploads/2017/09/DVP_101_200-64-300x300.png' },
  { name: 'Development and Causes', image: 'https://datavizproject.com/wp-content/uploads/2017/09/DVP_101_200-65-300x300.png' },
];

/**
 * Fetches data based on the URL
 *
 * @param {String[]} route Array of URL Extensions
 * @returns {Promise<void>}
 */
async function prefetchData(route) {
  await Data.fetchData(route[0], () => {
    console.log(`The ${route[0]} data set was prefetched!`);
  });
}


/**
 * Renders the chart selection page using the information given in the URL
 *
 * @param {String[]} route Array of URL extensions
 */
function renderVisualsList(route) {
  prefetchData(route);

  const page = document.getElementById('page');
  page.classList.remove('container-fluid');
  page.classList.add('container');

  const visualBlocks = document.createElement('div');
  visualBlocks.className = 'grid';

  const gridRow = document.createElement('div');
  gridRow.className = 'row';

  const selectionHeader = document.createElement('h3');
  selectionHeader.innerHTML = 'All graph types as classified by the Dataviz Project:';
  visualBlocks.appendChild(selectionHeader);

  visualBlocks.appendChild(gridRow);

  const sortedVisuals = visuals.sort((a, b) => {
    if (a.available && !b.available) {
      return -1;
    } else if (b.available && !a.available) {
      return 1;
    } else if (a.name < b.name) {
      return -1;
    }
    return 1;
  });

  for (let i = 0; i < sortedVisuals.length; i += 1) {
    const col = document.createElement('div');
    col.className = 'grid-element';

    const block = document.createElement('div');
    block.className = 'block';

    const link = document.createElement('div');

    const name = document.createElement('div');
    name.className = 'name';
    name.innerHTML = sortedVisuals[i].name;
    const image = document.createElement('img');
    image.src = sortedVisuals[i].image;
    if (!sortedVisuals[i].available) {
      image.style.opacity = '0.6';
      image.style.filter = 'alpha(opacity=40)';
    }
    link.appendChild(image);
    link.appendChild(name);
    block.appendChild(link);
    col.appendChild(block);

    gridRow.appendChild(col);
  }
  page.appendChild(visualBlocks);
}

export default renderVisualsList;
