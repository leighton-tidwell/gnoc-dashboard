var now = new Date();
var lastDay = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
var month = ("0" + now.getMonth()).slice(-2);
var startDate = now.getFullYear() + "-" + (month) + "-01T00:00:00Z";
var endDate = now.getFullYear() + "-" + (month) + "-" + lastDay + "T23:59:59Z";


/* High Charts Configs */
var missionWithDvImpact = {
  chart: {
    renderTo: 'missionsWithDvImpact',
    type: 'bar',
  },
  title: {
    text: 'Missions With DV Impact'
  },
  xAxis: {
    categories: [],
    labels: {
      style: {
        fontSize: '1.2em',
        color: '#000'
      }
    }
  },
  legend: { enabled: false },
  yAxis: {
    min: 0,
    title: {
      text: ''
    },
    allowDecimals: false
  },
  lang: {
    noData: "No Data Found"
  },
  noData: {
    style: {
      fontWeight: 'bold',
      fontSize: '15px',
      color: '#303030'
    }
  },
  colors: [
    '#4572A7',
    '#AA4643',
    '#89A54E',
    '#80699B',
    '#3D96AE',
    '#DB843D',
    '#92A8CD',
    '#A47D7C',
    '#B5CA92'
  ],
  plotOptions: {
    series: {
      dataLabels: {
        enabled: true,
        color: '#fff',
        align: 'right',
        style: {
          textShadow: false,
          textOutline: 0
        }
      },
    }
  },
  series: [],
  dataSorting: {
    enabled: true
  },
  credits: {
    enabled: false
  }
};

var percentLegsIssues = {
  chart: {
    renderTo: 'percentLegsWithoutIssues',
    type: 'column',
  },
  title: {
    text: 'Percentage Missions Without Issues'
  },
  xAxis: {
    categories: [],
    labels: {
      style: {
        fontSize: '1.2em',
        color: '#000'
      }
    }
  },
  legend: { enabled: false },
  yAxis: {
    min: 0,
    max: 100,
    labels: {
      formatter: function () {
        return this.value + "%";
      }
    }
  },
  lang: {
    noData: "No Data Found"
  },
  noData: {
    style: {
      fontWeight: 'bold',
      fontSize: '15px',
      color: '#303030'
    }
  },
  colors: [
    '#4572A7',
    '#AA4643',
    '#89A54E',
    '#80699B',
    '#3D96AE',
    '#DB843D',
    '#92A8CD',
    '#A47D7C',
    '#B5CA92'
  ],
  plotOptions: {
    column: {
      dataLabels: {
        enabled: true,
        crop: false,
        overflow: 'none',
        formatter: function () {
          return this.y + "%";
        }
      },
    }
  },
  series: [],
  dataSorting: {
    enabled: true
  },
  credits: {
    enabled: false
  }
};

var legsPerDv = {
  chart: {
    renderTo: 'legsPerDv',
    type: 'column',
  },
  title: {
    text: 'Legs Per DV'
  },
  xAxis: {
    categories: [],
    labels: {
      style: {
        fontSize: '1.2em',
        color: '#000'
      }
    }
  },
  legend: { enabled: false },
  yAxis: {
    min: 0,
    allowDecimals: false
  },
  lang: {
    noData: "No Data Found"
  },
  noData: {
    style: {
      fontWeight: 'bold',
      fontSize: '15px',
      color: '#303030'
    }
  },
  colors: [
    '#4572A7',
    '#AA4643',
    '#89A54E',
    '#80699B',
    '#3D96AE',
    '#DB843D',
    '#92A8CD',
    '#A47D7C',
    '#B5CA92'
  ],
  plotOptions: {
    column: {
      dataLabels: {
        enabled: true,
        crop: false,
        overflow: 'none'
      },
    }
  },
  series: [],
  dataSorting: {
    enabled: true
  },
  credits: {
    enabled: false
  }
};

var ticketsPerDv = {
  chart: {
    renderTo: 'ticketsPerDv',
    type: 'pie',
    events: {
      load: function (event) {
        var chart = this,
          points = chart.series[0].points,
          len = points.length,
          total = 0,
          i = 0;

        for (; i < len; i++) {
          total += points[i].y;
        }
        chart.setTitle({
          text: 'Total Tickets<br />' + total,
          align: 'center',
          verticalAlign: 'middle',
          y: 20,
          style: {
            fontWeight: 'bold'
          },
        });
      }
    }
  },
  tooltip: {
    formatter: function () {
      return '<b>' + this.point.name + '</b>: ' + this.y;
    }
  },
  legend: {
    enabled: true,
    floating: true,
    borderWidth: 0,
    align: 'center',
    layout: 'horizontal',
    verticalAlign: 'bottom',
    labelFormatter: function () {
      return '<span>' + this.name + ' </span>: <span><b>' + this.y + '</span>';
    }
  },
  yAxis: {
    title: {
      text: ''
    }
  },
  plotOptions: {
    pie: {
      shadow: false
    }
  },
  series: [],
  colors: [
    '#4572A7',
    '#AA4643',
    '#89A54E',
    '#80699B',
    '#3D96AE',
    '#DB843D',
    '#92A8CD',
    '#A47D7C',
    '#B5CA92'
  ],
  credits: {
    enabled: false
  }
};

var ticketsPerTail = {
  chart: {
    renderTo: 'ticketsPerTail',
    type: 'bar'
  },
  title: {
    text: 'Tickets Per Tail (With DV Impact)'
  },
  xAxis: {
    categories: [],
    title: {
      text: 'Tail Number'
    }
  },
  yAxis: {
    min: 0,
    title: {
      text: 'Total Tickets'
    }
  },
  legend: {
    reversed: true
  },
  plotOptions: {
    series: {
      stacking: 'normal',
      dataLabels: {
        enabled: true,
        formatter: function () {
          if (this.y) {
            return this.y;
          }
        },
        style: {
          fontSize: "12px"
        }
      }
    }
  },
  series: [],
  colors: [
    '#FF0000',
    '#FFA500',
    '#FFFF00',
    '#008000'
  ],
  credits: {
    enabled: false
  }
}

var ticketsPerCategory = {
  chart: {
    renderTo: 'ticketsPerCategory',
    type: 'pie',
    events: {
      load: function (event) {
        var chart = this,
          points = chart.series[0].points,
          len = points.length,
          total = 0,
          i = 0;

        for (; i < len; i++) {
          total += points[i].y;
        }
        chart.setTitle({
          text: 'Total Tickets by Category:<br >' + total,
          align: 'center',
          verticalAlign: 'middle',
          y: 20,
          style: {
            fontWeight: 'bold'
          },
        });
      }
    },
    margin: [0, 0, 0, 0],
    spacingTop: 0,
    spacingBottom: 0,
    spacingLeft: 0,
    spacingRight: 0
  },
  tooltip: {
    formatter: function () {
      return '<b>' + this.point.name + '</b>: ' + this.y;
    }
  },
  legend: {
    enabled: true,
    floating: true,
    borderWidth: 0,
    align: 'center',
    layout: 'horizontal',
    verticalAlign: 'bottom',
    labelFormatter: function () {
      return '<span>' + this.name + ' </span>: <span><b>' + this.y + '</span>';
    }
  },
  yAxis: {
    title: {
      text: ''
    }
  },
  plotOptions: {
    pie: {
      shadow: false,
      size: '100%'
    }
  },
  series: [],
  colors: [
    '#4572A7',
    '#AA4643',
    '#89A54E',
    '#80699B',
    '#3D96AE',
    '#DB843D',
    '#92A8CD',
    '#A47D7C',
    '#B5CA92'
  ],
  credits: {
    enabled: false
  }
};

var vpotusPercentLegsIssues = {

}

var vpotusLegsPerAircraft = {
  chart: {
    renderTo: 'vpotusLegsPerAircraft',
    type: 'column',
  },
  title: {
    text: 'Total Legs Per Aircraft'
  },
  xAxis: {
    categories: [],
    labels: {
      style: {
        fontSize: '1.2em',
        color: '#000'
      }
    }
  },
  legend: { enabled: false },
  yAxis: {
    min: 0,
    allowDecimals: false
  },
  lang: {
    noData: "No Data Found"
  },
  noData: {
    style: {
      fontWeight: 'bold',
      fontSize: '15px',
      color: '#303030'
    }
  },
  colors: [
    '#4572A7'
  ],
  plotOptions: {
    column: {
      dataLabels: {
        enabled: true,
        crop: false,
        overflow: 'none'
      },
    }
  },
  series: [],
  dataSorting: {
    enabled: true
  },
  credits: {
    enabled: false
  }
}

var vpotusLegsWithImpact = {

}

var vPotusTicketCategories = {

}
// on page load
$(function () {
  $("#start_date").html(convertDate(startDate, 1, 1));
  $("#end_date").html(convertDate(endDate, 1, 0));

  var options = { timeZone: 'UTC', year: 'numeric', month: 'long', day: 'numeric' };
  var parsedate = new Date(startDate);
  $("#start_date_slide").html(parsedate.toLocaleDateString("en-US", options));
  parsedate = new Date(endDate);
  $("#end_date_slide").html(parsedate.toLocaleDateString("en-US", options));


  // General Functions
  totalTickets();
  totalCCIRs();
  missionDvImpact();
  legsPerDvFunc();
  ticketsPerDvFunc();
  ticketsPerCategoryFunc();
  ticketsPerTailFunc();
  issuesPerLeg(startDate, endDate, "VPOTUS");
  legsPerTail(startDate, endDate, "VPOTUS");

  // VPOTUS Functions
  vpotusFunctions();


  // Button handler for PDF Download
  $(document).on('click', '#genpdf', function () {
    genPDF();
  });
  feather.replace();
});


/* PDF FUNCTIONS */
function genPDF() {
  var deferreds = [];
  var doc = new jsPDF('l', 'pt', [1280, 720]);
  for (let i = 1; i < 4; i++) {
    var deferred = $.Deferred();
    deferreds.push(deferred.promise());
    generateCanvas(i, doc, deferred);
  }

  $.when.apply($, deferreds).then(function () { // executes after adding all images
    doc.save($("#header").text().trim() + '.pdf');
  });
}

function generateCanvas(i, doc, deferred) {
  html2canvas(document.getElementById(i), {
    quality: 4,
    scale: 5,
    onrendered: function (canvas) {
      var img = canvas.toDataURL('image/jpeg', 1.0);
      //console.log(doc.internal.pageSize.getWidth());
      //console.log(doc.internal.pageSize.getHeight());

      //var width = doc.getImageProperties(img);
      //console.log(canvas.width + " x " + canvas.height);
      doc.addImage(img, 'PNG', 0, 0, 1280, 720);
      doc.addPage();

      deferred.resolve();
    }
  });
}
function save_chart(chart, div) {
  var width = chart.chartWidth;
  var height = chart.chartHeight;

  var svg = chart.getSVG({
    exporting: {
      sourceWidth: chart.chartWidth,
      sourceHeight: chart.chartHeight
    }
  });

  var canvas = document.createElement('canvas');
  var select = document.getElementById(div);
  canvas.height = height;
  canvas.width = width;

  select.innerHTML = "";
  select.appendChild(canvas);

  var image = new Image;
  image.onload = function () {
    canvas.getContext('2d').drawImage(this, 0, 0, width, height);
  }
  image.src = 'data:image/svg+xml;base64,' + window.btoa(svg);

}
/* END PDF FUNCTIONS */


// Date conversion
function convertDate(date, offset, addDate) {
  var convertDate = new Date(date);

  var month = convertDate.getUTCMonth();
  if (convertDate.getUTCMonth() + 1 < 10) {
    month = convertDate.getUTCMonth() + 1;
    month = "0" + month;
  }
  else
    month = convertDate.getUTCMonth() + 1;

  if (addDate == 1)
    convertDate.setDate(convertDate.getDate() + 1);
  var date = convertDate.getDate();
  if (convertDate.getDate() < 10)
    date = "0" + convertDate.getDate();

  var minutes = convertDate.getUTCMinutes();
  if (convertDate.getUTCMinutes() < 10)
    minutes = "0" + convertDate.getUTCMinutes();

  var t = new Date();
  if (offset == 1) {
    var currentoffset = convertDate.getTimezoneOffset() * 60000;
    convertDate.setTime(convertDate.getTime() + currentoffset);
  }
  var hours = convertDate.getHours();

  if (convertDate.getHours() < 10)
    hours = "0" + hours;

  return dateString = month + "/" + date + "/" + convertDate.getUTCFullYear() + " " + hours + ":" + minutes + "Z";

}


/* GENERAL FUNCTIONS */
function totalTickets() {
  var total = 0;
  // First lets pull ALL of the tickets TOTAL
  var urlLoad = "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('Tickets')/items?$top=5000&$filter=Created le '" + endDate + "' and Created ge '" + startDate + "'";
  $.ajax({
    url: urlLoad,
    async: false,
    method: "GET",
    headers: {
      "Accept": "application/json;odata=verbose"
    },
    success: function (data) {
      var arrayOfTimes = []; // times of tickets unique to mission number
      var allResults = data.d.results;
      if (Number(allResults.length) > 0) {
        for (var i = 0; i < Number(allResults.length); i++) {
          // looping through all results
          var currentTime = allResults[i].Created;
          if (!arrayOfTimes.includes(currentTime)) {
            total++;
            arrayOfTimes.push(currentTime);
          }
        }
      }
    },
    error: function (data) {
      //alert("Error: " + JSON.stringify(data));
    }
  });
  $("#total_tickets").text(total);
}

var dvTotalCCIRs = {
  VPOTUS: 0,
  SECSTATE: 0,
  SECDEF: 0,
  CJCS: 0
};

function totalCCIRs() {
  var total = 0;
  // First lets pull ALL of the CCIRs TOTAL
  var urlLoad = "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('CCIR')/items?$top=5000&$filter=Date le '" + endDate + "' and Date ge '" + startDate + "'";
  $.ajax({
    url: urlLoad,
    async: false,
    method: "GET",
    headers: {
      "Accept": "application/json;odata=verbose"
    },
    success: function (data) {
      var arrayOfTimes = []; // times of tickets unique to mission number
      var allResults = data.d.results;
      if (Number(allResults.length) > 0) {
        for (var i = 0; i < Number(allResults.length); i++) {
          // looping through all results
          var currentTime = allResults[i].Created;
          if (!arrayOfTimes.includes(currentTime)) {
            if (allResults[i].DV == "VPOTUS") {
              dvTotalCCIRs.VPOTUS++;
            }
            else if (allResults[i].DV == "SECSTATE") {
              dvTotalCCIRs.SECSTATE++;
            }
            else if (allResults[i].DV == "SECDEF") {
              dvTotalCCIRs.SECDEF++;
            }
            else if (allResults[i].DV == "CJCS") {
              dvTotalCCIRs.CJCS++;
            }
            total++;
            arrayOfTimes.push(currentTime);
          }
        }
      }
    },
    error: function (data) {
      //alert("Error: " + JSON.stringify(data));
    }
  });
  $("#total_ccirs").text(total);
}

function missionDvImpact() {
  var dvs = ["VPOTUS", "SECSTATE", "SECDEF"];

  var number = [];
  var arrayPercent = [];
  // Loop for query for each DV
  for (var i = 0; i < dvs.length; i++) {
    var arrayOfUnsuccessfulMissions = [];
    var successfulMissions = [];
    // First lets pull ALL of the tickets TOTAL
    var urlLoad = "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('Tickets')/items?$top=5000&$filter=DV eq '" + dvs[i] + "' and Created le '" + endDate + "' and Created ge '" + startDate + "'";
    $.ajax({
      url: urlLoad,
      async: false,
      method: "GET",
      headers: {
        "Accept": "application/json;odata=verbose"
      },
      success: function (data) {
        var arrayOfTimes = []; // times of tickets unique to mission number
        var allResults = data.d.results;
        if (Number(allResults.length) > 0) {
          for (var j = 0; j < Number(allResults.length); j++) {
            // looping through all results
            var currentTime = allResults[j].Created;
            var currentMission = allResults[j].Mission_Number;

            if (!arrayOfUnsuccessfulMissions.includes(currentMission) && currentMission != null && allResults[j].DV_Impact == true) {
              // no need to keep adding the same unsucessful mission in here.. just take 1 ticket from that mission - we can use this to check against missions database
              arrayOfUnsuccessfulMissions.push(currentMission);
            }
          }
          missionWithDvImpact.xAxis.categories.push(dvs[i]);
          number.push(arrayOfUnsuccessfulMissions.length);
        }

        // Now get successful missions
        var urlLoad2 = "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('Missions')/items?$top=5000&$filter=DV eq '" + dvs[i] + "' and Created le '" + endDate + "' and Created ge '" + startDate + "'";
        $.ajax({
          url: urlLoad2,
          async: false,
          method: "GET",
          headers: {
            "Accept": "application/json;odata=verbose"
          },
          success: function (data) {
            var allResults = data.d.results;
            if (Number(allResults.length) > 0) {
              for (var j = 0; j < Number(allResults.length); j++) {
                // looping through all results
                var currentTime = allResults[j].Departure_Date;
                var currentMission = allResults[j].Mission_Number;

                if (!arrayOfTimes.includes(currentTime)) {
                  // not a duplicate so continue on.
                  if (!arrayOfUnsuccessfulMissions.includes(currentMission)) {
                    // We only need to add the ones who weren't already marked unsuccessful.
                    successfulMissions.push(currentMission);
                    arrayOfTimes.push(currentTime);
                  }
                }
              }
              percentLegsIssues.xAxis.categories.push(dvs[i]);
              var total = successfulMissions.length;
              var totalMission = total + arrayOfUnsuccessfulMissions.length;
              var percentSuccess = (total / totalMission) * 100;
              console.log(dvs[i] + " has a total of: " + total + " successful missions and " + totalMission + " total missions with " + arrayOfUnsuccessfulMissions.length + " bad missions.");
              console.log(arrayOfUnsuccessfulMissions);
              arrayPercent.push(Math.round(percentSuccess));
            }
          }
        });
      }
    });
  }

  // adding data to graphs
  missionWithDvImpact.series.push({
    name: 'Missions with DV Impact',
    colorByPoint: true,
    data: number
  })
  percentLegsIssues.series.push({
    name: 'Percentage of Missions with Issues',
    colorByPoint: true,
    data: arrayPercent
  });

  var chart = new Highcharts.Chart(missionWithDvImpact);
  var chart2 = new Highcharts.Chart(percentLegsIssues);
  save_chart(chart, "missionsWithDvImpact");
  save_chart(chart2, "percentLegsWithoutIssues");
}

var legs = [];
function legsPerDvFunc() {
  var dvs = ["VPOTUS", "SECSTATE", "SECDEF"];

  for (var i = 0; i < dvs.length; i++) {
    var urlLoad = "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('Missions')/items?$top=5000&$filter=DV eq '" + dvs[i] + "' and Created le '" + endDate + "' and Created ge '" + startDate + "'";
    $.ajax({
      url: urlLoad,
      async: false,
      method: "GET",
      headers: {
        "Accept": "application/json;odata=verbose"
      },
      success: function (data) {
        var arrayOfTimes = [];
        var allResults = data.d.results;
        if (Number(allResults.length) > 0) {
          for (var j = 0; j < Number(allResults.length); j++) {
            // looping through all results
            var currentTime = allResults[j].Departure_Date;
            if (!arrayOfTimes.includes(currentTime)) {
              // not a duplicate so continue on.
              arrayOfTimes.push(currentTime);
            }
          }
          legsPerDv.xAxis.categories.push(dvs[i]);
          legs.push(arrayOfTimes.length);
        }
      }
    });
  }
  legsPerDv.series.push({
    name: 'Legs Per DV',
    colorByPoint: true,
    data: legs
  });

  var chart = new Highcharts.Chart(legsPerDv);
  save_chart(chart, "legsPerDv");
}


var dvTotalTickets = {
  VPOTUS: 0,
  SECDEF: 0,
  SECSTATE: 0,
  CJCS: 0
};

function ticketsPerDvFunc() {
  var dvs = ["VPOTUS", "SECSTATE", "SECDEF", "CJCS"];
  var tickets = [];

  for (var i = 0; i < dvs.length; i++) {
    var total = 0;
    // First lets pull ALL of the tickets TOTAL
    var urlLoad = "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('Tickets')/items?$top=5000&$filter=DV eq '" + dvs[i] + "' and Created le '" + endDate + "' and Created ge '" + startDate + "'";
    $.ajax({
      url: urlLoad,
      async: false,
      method: "GET",
      headers: {
        "Accept": "application/json;odata=verbose"
      },
      success: function (data) {
        var arrayOfTimes = []; // times of tickets unique to mission number
        var allResults = data.d.results;
        if (Number(allResults.length) > 0) {
          for (var i = 0; i < Number(allResults.length); i++) {
            // looping through all results
            var currentTime = allResults[i].Created;
            if (!arrayOfTimes.includes(currentTime)) {
              total++;
              arrayOfTimes.push(currentTime);
            }
          }
          tickets.push(total);
        }
        else {
          tickets.push(0);
        }
      },
      error: function (data) {
        //alert("Error: " + JSON.stringify(data));
      }
    });
  }
  ticketsPerDv.series.push({
    name: 'DVS',
    data: [{
      name: dvs[0],
      y: tickets[0]
    }, {
      name: dvs[1],
      y: tickets[1]
    }, {
      name: dvs[2],
      y: tickets[2]
    }],
    size: '60%',
    innerSize: '85%',
    showInLegend: true,
    dataLabels: {
      enabled: false
    }
  });
  dvTotalTickets.VPOTUS = tickets[0];
  dvTotalTickets.SECSTATE = tickets[1];
  dvTotalTickets.SECDEF = tickets[2];
  dvTotalTickets.CJCS = tickets[3];
  var chart = new Highcharts.Chart(ticketsPerDv);
  save_chart(chart, "ticketsPerDv");
}

function ticketsPerTailFunc() {
  var aircrafts = [];
  var highArr = [];
  var medArr = [];
  var lowArr = [];
  var noneArr = [];
  for (var i = 0; i < tailsWithTickets.length; i++) {
    // Loop through each a/c
    // Lets see if any tickets exist for said a/c
    // First lets pull ALL of the tickets TOTAL
    var urlLoad = "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('Tickets')/items?$top=5000&$filter=Tail_Number eq '" + tailsWithTickets[i] + "' and Created le '" + endDate + "' and Created ge '" + startDate + "'";
    $.ajax({
      url: urlLoad,
      async: false,
      method: "GET",
      headers: {
        "Accept": "application/json;odata=verbose"
      },
      success: function (data) {
        var dataResults = data.d.results;
        if (Number(dataResults.length) > 0) {
          // Found tickets for said a/c
          // lets add it to the a/c array
          if (!aircrafts.includes(tailsWithTickets[i]))
            aircrafts.push(tailsWithTickets[i]);

          // Lets push this to an x-category on the chart
          ticketsPerTail.xAxis.categories.push(tailsWithTickets[i]);

          // Data = [None, Low, Medium, High];
          var high = 0;
          var med = 0;
          var low = 0;
          var none = 0;
          for (var j = 0; j < Number(dataResults.length); j++) {
            // Going through tickets for said a/c
            if (dataResults[j].Impact_Level == "High") {
              high++;
            } else if (dataResults[j].Impact_Level == "Medium") {
              med++;
            } else if (dataResults[j].Impact_Level == "Low") {
              low++;
            } else {
              none++;
            }
          }
          highArr.push(high);
          medArr.push(med);
          lowArr.push(low);
          noneArr.push(none);
        }
      }
    });
  }

  ticketsPerTail.series.push({
    name: 'High',
    data: highArr
  })
  ticketsPerTail.series.push({
    name: 'Med',
    data: medArr
  })
  ticketsPerTail.series.push({
    name: 'Low',
    data: lowArr
  })
  ticketsPerTail.series.push({
    name: 'None',
    data: noneArr
  })
  var chart = new Highcharts.Chart(ticketsPerTail);
  save_chart(chart, "ticketsPerTail");

}

var tailsWithTickets = [];

function ticketsPerCategoryFunc() {
  var categories = [];
  var urlLoad = "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('Ticket_Categories')/items?$orderby=Category%20asc";
  $.ajax({
    url: urlLoad,
    async: false,
    method: "GET",
    headers: {
      "Accept": "application/json;odata=verbose"
    },
    success: function (data) {
      var allResults = data.d.results;
      if (Number(allResults.length) > 0) {
        for (var i = 0; i < Number(allResults.length); i++) {
          var total = 0;
          var currentCategory = allResults[i].Category;
          // now loop through tickets to find how many tickets for this category
          var urlLoad = "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('Tickets')/items?$top=5000&$filter=Category eq '" + currentCategory + "' and Created le '" + endDate + "' and Created ge '" + startDate + "'";
          $.ajax({
            url: urlLoad,
            async: false,
            method: "GET",
            headers: {
              "Accept": "application/json;odata=verbose"
            },
            success: function (data) {
              var arrayOfTimes = [];
              var dataResults = data.d.results;
              if (Number(dataResults.length) > 0) {
                for (var j = 0; j < Number(dataResults.length); j++) {
                  if (dataResults[j].Category = currentCategory && !arrayOfTimes.includes(dataResults[j].Created)) {

                    // Add tail for later processing.
                    if (!tailsWithTickets.includes(dataResults[j].Tail_Number)) {
                      tailsWithTickets.push(dataResults[j].Tail_Number);
                    }
                    arrayOfTimes.push(dataResults[j].Created);
                    total++;
                  }
                }
              }
            }
          });
          // Now we got total for category - lets push it
          categories.push({
            name: currentCategory,
            y: total
          });
        }
      }
    },
  });

  // Now done with loop, lets push all the data
  ticketsPerCategory.series.push({
    name: 'Categories',
    data: categories,
    size: '70%',
    innerSize: '90%',
    showInLegend: true,
    dataLabels: {
      enabled: false
    }
  });
  tailsWithTickets.sort();
  var chart = new Highcharts.Chart(ticketsPerCategory);
  save_chart(chart, "ticketsPerCategory");
}

function issuesPerLeg(start, end, dv) {
  var urlLoad = "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('Missions')/items?$filter=DV eq '" + dv + "' and Created le '" + end + "' and Created ge '" + start + "'&$orderby=Created%20desc";
  var successfulLegs = 0;
  var noImpact = 0;
  var impact = 0;
  $.ajax({
    url: urlLoad,
    async: false,
    method: "GET",
    headers: {
      "Accept": "application/json;odata=verbose"
    },
    success: function (data) {
      var allResults = data.d.results;
      if (Number(allResults.length) > 0) {
        for (var i = 0; i < Number(allResults.length); i++) {
          // for each mission search for ticket (mission in this case is = to a leg) that falls in that mission
          var depDate = new Date(allResults[i].Departure_Date);
          depDate.setHours(depDate.getHours() - depDate.getTimezoneOffset() / 60);
          depDate = depDate.toISOString();
          //var m = depDate.getMonth() + 1;
          //depDate = depDate.getFullYear() + "-" + ("0" + m).slice(-2) + "-" + ("0" + depDate.getDate()).slice(-2) + "T" + ("0" + depDate.getHours()).slice(-2) + ":" + ("0" + depDate.getMinutes()).slice(-2) + ":" + ("0" + depDate.getSeconds()).slice(-2) + "Z";
          var arrDate = new Date(allResults[i].Arrival_Date);
          arrDate.setHours(arrDate.getHours() - arrDate.getTimezoneOffset() / 60);
          arrDate = arrDate.toISOString();
          //m = arrDate.getMonth() + 1;
          //arrDate = arrDate.getFullYear() + "-" + ("0" + m).slice(-2) + "-" + ("0" + arrDate.getDate()).slice(-2) + "T" + ("0" + arrDate.getHours()).slice(-2) + ":" + ("0" + arrDate.getMinutes()).slice(-2) + ":" + ("0" + arrDate.getSeconds()).slice(-2) + "Z";
          var mission = allResults[i].Mission_Number
          //console.log("Mission #: " + mission + " departed on " + depDate + " and arrived on " + arrDate);
          //console.log(depDate);
          //console.log(arrDate);
          //console.log(mission);
          //console.log(allResults[i].Created);
          var urlLoad = "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('Tickets')/items?$filter=DV eq '" + dv + "' and Mission_Number eq '" + mission + "' and Date_Opened le '" + arrDate + "' and Date_Opened ge '" + depDate + "' &$orderby=Created%20desc";
          $.ajax({
            url: urlLoad,
            async: false,
            method: "GET",
            headers: {
              "Accept": "application/json;odata=verbose"
            },
            success: function (data2) {
              var allResults2 = data2.d.results;
              var foundImpact = 0;
              if (Number(allResults2.length) > 0) {
                //console.log("Found tickets relating to " + mission);
                for (var j = 0; j < Number(allResults2.length); j++) {
                  foundImpact = 0;
                  // Issue found
                  //console.log(allResults2[j].DV_Impact + " and ticket# " + allResults2[j].GNOC_Ticket_Number);
                  if (allResults2[j].DV_Impact == true) {
                    foundImpact = 1;
                  }
                }
                if (foundImpact == 1) {
                  impact++;
                }
                else {
                  noImpact++;
                }
              }
              else {
                // no tickets found for leg
                successfulLegs++;
              }
            }
          });
        }
      }
    }
  });
  console.log(dv);
  console.log("Success: " + successfulLegs);
  console.log("Impact: " + impact);
  console.log("No Impact: " + noImpact);
}

function legsPerTail(start, end, dv) {
  var urlLoad = "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('Missions')/items?$filter=DV eq '" + dv + "' and Created le '" + end + "' and Created ge '" + start + "'&$orderby=Created%20desc";
  var tails = {};
  $.ajax({
    url: urlLoad,
    async: false,
    method: "GET",
    headers: {
      "Accept": "application/json;odata=verbose"
    },
    success: function (data) {
      var allResults = data.d.results;
      if (Number(allResults.length) > 0) {
        for (var i = 0; i < Number(allResults.length); i++) {
          if (tails[allResults[i].Tail_Number]) {
            tails[allResults[i].Tail_Number]++;
            // add more DV here
          }
          else{
            tails[allResults[i].Tail_Number] = 1;
            vpotusLegsPerAircraft.xAxis.categories.push(allResults[i].Tail_Number);
          }
        }
      }
    }
  });
  console.log(tails);
  var legArr = [];
  for(key in tails){
    legArr.push(tails[key]);
  }
  console.log(legArr);
  if (dv == "VPOTUS") {
    console.log("VPOTUS");
    vpotusLegsPerAircraft.series.push({
      name: 'Total Legs Per Aircraft',
      colorByPoint: true,
      data: legArr
    });
    var chart = new Highcharts.Chart(vpotusLegsPerAircraft);
    save_chart(chart, "vpotusLegsPerAircraft");
  }
}
/* END GENERAL FUNCTIONS */


/* VPOTUS FUNCTIONS */
function vpotusFunctions() {
  vpotusTotals();
}

function vpotusTotals() {
  $("#vpotus_total_tickets").text(dvTotalTickets.VPOTUS);
  $("#vpotus_total_ccirs").text(dvTotalCCIRs.VPOTUS);
}

/* END VPOTUS FUNCTIONS */

