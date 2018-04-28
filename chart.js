function makePlot() {
  Plotly.purge('plot');

  var trace1 = {
    x: plotX,
    y: plotY,
    mode: 'markers+text',
    type: 'scatter',
    name: 'Team A',
    text: plotX,
    textposition: 'top center',
    textfont: {
      family: 'Raleway, sans-serif'
    },
    marker: {
      size: 12
    }
  };

  var data = [trace1];

  var layout = {
    xaxis: {
      range: [getStart(), getEnd()],
      title: ("Starting from Zone " + getStart())
    },
    yaxis: {
      range: [0, (plotY.length + 2)],
      title: "Times you leveled up"
    },
    margin: {
      l: 40,
      r: 5,
      b: 35,
      t: 0,
      pad: 4
    },
    legend: {
      y: 1,
      yref: 'paper',
      font: {
        family: 'Arial, sans-serif',
        size: 20,
        color: 'grey',
      }
    },
    title: 'You will level up on zone'
  };

  Plotly.newPlot('plot', data, layout);
}

function getEnd() {

  var get = plotX.length - 1;
  endZone = plotX[get];

  return endZone + 50;

}

function getStart() {
  if (game.global.world >= 301) {
    return game.global.world;
  }
  if (game.global.world <= 300) {
    return 301;
  }
}
