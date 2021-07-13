const options = {
  chart: {
      renderTo: "containerGraph",
      type: "bar",
      events: {
          redraw: !0
      }
  },
  title: {
      text: "Tickets per DV"
  },
  xAxis: {
      categories: [],
      crosshair: !0,
      labels: {
          style: {
              fontSize: "1.2em",
              color: "#000",
              fill: "#000"
          }
      }
  },
  legend: {
      enabled: !1
  },
  yAxis: {
      min: 0,
      title: {
          text: "# of Tickets"
      },
      labels: {
          style: {
              fontSize: "1.2em",
              color: "#000",
              fill: "#000"
          }
      },
      allowDecimals: !1
  },
  lang: {
      noData: "No Data Found"
  },
  noData: {
      style: {
          fontWeight: "bold",
          fontSize: "15px",
          color: "#303030"
      }
  },
  series: [],
  dataSorting: {
      enabled: !0
  }
}

const lineOptions = {
  chart: {
      renderTo: "top5LineChart",
      type: "line"
  },
  title: {
      text: "Monthly Ticket Snapshot",
      align: "center"
  },
  subtitle: {
      text: "current year",
      align: "left"
  },
  xAxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  },
  yAxis: {
      title: {
          text: " Tickets"
      },
      plotLines: [{
          value: 0,
          width: 1,
          color: "#808080"
      }],
      allowDecimals: !1
  },
  tooltip: {
      valuePrefix: "",
      valueSuffix: " Tickets"
  },
  legend: {
      layout: "horizontal",
      align: "right",
      verticalAlign: "top",
      borderWidth: 0,
      marginTop: 5,
      marginBottom: 5
  },
  lang: {
      noData: "No Data Found"
  },
  noData: {
      style: {
          fontWeight: "bold",
          fontSize: "15px",
          color: "#303030"
      }
  },
  series: []
}


export {options, lineOptions}