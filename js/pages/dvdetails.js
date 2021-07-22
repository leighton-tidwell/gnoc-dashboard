import { HOST_URL } from "../modules/constants.js";
import permissionsCheck from "../modules/userPermissionsCheck.js";
import {
  daysIntoYear,
  insertIntoList,
  convertDateToISOString,
  convertDateToHTMLString,
  convertDateToTicketHTMLString,
} from "../modules/utility.js";
const TICKETS_LIST_NAME = "Tickets";
const CCIR_LIST_NAME = "CCIR";
const MISSION_LIST_NAME = "Missions";
feather.replace();
permissionsCheck("RFYgREVUQUlMUw==");

/* High Charts Configs */
let yearDvOptions = {
  chart: {
    renderTo: "dvYearlyGraph",
    type: "line",
  },
  title: {
    text: "Percentage of Legs without Issue",
    align: "center",
    style: {
      color: "#FFF",
    },
  },
  legend: {
    align: "right",
    verticalAlign: "top",
    itemStyle: {
      color: "#FFF",
    },
  },
  xAxis: {
    categories: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
  },
  yAxis: {
    title: {
      text: " Missions Per Month",
      style: {
        color: "#FFF",
      },
    },
  },
  series: [],
};

let percentLegsIssues = {
  chart: {
    renderTo: "percentLegsWithoutIssues",
    type: "column",
  },
  title: {
    text: "Percentage Missions Without Issues",
    style: {
      color: "#FFF",
    },
  },
  xAxis: {
    categories: [],
    labels: {
      style: {
        fontSize: "1.2em",
        color: "#FFF",
      },
    },
  },
  legend: {
    enabled: false,
    itemStyle: {
      color: "#FFF",
    },
  },
  yAxis: {
    min: 0,
    max: 100,
    labels: {
      formatter: function () {
        return this.value + "%";
      },
    },
  },
  lang: {
    noData: "No Data Found",
  },
  noData: {
    style: {
      fontWeight: "bold",
      fontSize: "15px",
      color: "#303030",
    },
  },
  colors: [
    "#4572A7",
    "#AA4643",
    "#89A54E",
    "#80699B",
    "#3D96AE",
    "#DB843D",
    "#92A8CD",
    "#A47D7C",
    "#B5CA92",
  ],
  plotOptions: {
    column: {
      dataLabels: {
        enabled: true,
        crop: false,
        overflow: "none",
        formatter: function () {
          return this.y + "%";
        },
        style: {
          color: "#FFF",
          textOutline: 0,
        },
      },
    },
  },
  series: [],
  dataSorting: {
    enabled: true,
  },
  credits: {
    enabled: false,
  },
};

let ticketsPerCategory = {
  chart: {
    renderTo: "ticketsPerCategory",
    type: "pie",
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
          text: "Tickets by Category:<br >" + total,
          align: "center",
          verticalAlign: "middle",
          y: 20,
          style: {
            fontWeight: "bold",
            color: "#FFF",
          },
        });
      },
    },
    margin: [0, 0, 0, 0],
    spacingTop: 0,
    spacingBottom: 0,
    spacingLeft: 0,
    spacingRight: 0,
  },
  tooltip: {
    formatter: function () {
      return "<b>" + this.point.name + "</b>: " + this.y;
    },
  },
  legend: {
    enabled: true,
    floating: true,
    borderWidth: 0,
    align: "center",
    layout: "horizontal",
    verticalAlign: "bottom",
    labelFormatter: function () {
      return "<span>" + this.name + " </span>: <span><b>" + this.y + "</span>";
    },
    itemStyle: {
      color: "#FFF",
    },
  },
  yAxis: {
    title: {
      text: "",
      style: {
        color: "#FFF",
      },
    },
  },
  plotOptions: {
    pie: {
      shadow: false,
      size: "100%",
      borderWidth: 0,
    },
  },
  series: [],
  colors: ["#4572A7", "#AA4643", "#89A54E", "#80699B", "#3D96AE"],
  credits: {
    enabled: false,
  },
};

let ticketsPerTail = {
  chart: {
    renderTo: "ticketsPerTail",
    type: "bar",
  },
  title: {
    text: "Tickets Per Tail (With DV Impact)",
    style: {
      color: "#FFF",
    },
  },
  xAxis: {
    categories: [],
    title: {
      text: "Tail Number",
      style: {
        color: "#FFF",
      },
    },
  },
  yAxis: {
    min: 0,
    title: {
      text: "Total Tickets",
      style: {
        color: "#FFF",
      },
    },
  },
  legend: {
    reversed: true,
    itemStyle: {
      color: "#FFF",
    },
  },
  plotOptions: {
    series: {
      stacking: "normal",
      dataLabels: {
        enabled: true,
        formatter: function () {
          if (this.y) {
            return this.y;
          }
        },
        style: {},
      },
    },
  },
  series: [],
  colors: ["#FF0000", "#FFA500", "#FFFF00", "#008000"],
  credits: {
    enabled: false,
  },
};

let issuesPerLeg = {
  chart: {
    renderTo: "dvIssuesPerLeg",
    type: "bar",
  },
  title: {
    text: "Issues Per Leg",
    style: {
      color: "#FFF",
    },
  },
  xAxis: {
    categories: [],
    title: {
      text: "Month",
      style: {
        color: "#FFF",
      },
    },
  },
  yAxis: {
    min: 0,
    title: {
      text: "Total Tickets",
      style: {
        color: "#FFF",
      },
    },
  },
  legend: {
    reversed: true,
    itemStyle: {
      color: "#FFF",
    },
  },
  plotOptions: {
    series: {
      stacking: "normal",
      dataLabels: {
        enabled: true,
        formatter: function () {
          if (this.y) {
            return this.y;
          }
        },
        style: {},
      },
    },
  },
  series: [],
  colors: ["#FF0000", "#FFFF00", "#008000"],
  credits: {
    enabled: false,
  },
};

// Set up data tables time settings
$.fn.dataTable.moment("MM/DD/YYYY HH:mmZ");

// Populate Start and End Date
const currentDate = new Date();
const currentDay = ("0" + currentDate.getDate()).slice(-2);
const currentMonth = ("0" + (currentDate.getMonth() + 1)).slice(-2);
const currentYear = currentDate.getFullYear();

const chartStartDate = `${currentYear}-${currentMonth}-01`;
const chartStartDateISO = `${currentYear}-${currentMonth}-01T00:00:00Z`;
const chartEndDate = `${currentYear}-${currentMonth}-${currentDay}`;
const chartEndDateISO = `${currentYear}-${currentMonth}-${currentDay}T23:59:59Z`;
document.getElementById("start_date").value = chartStartDate;
document.getElementById("end_date").value = chartEndDate;

// Populate DV Drop Down
fetch(`${HOST_URL}/_api/web/lists/getbytitle('DVList')/items?$top=5000`, {
  headers: { Accept: "application/json; odata=verbose" },
  credentials: "include",
})
  .then((response) => response.json())
  .then((data) => {
    const items = data.d.results;
    const dvSelectInput = document.getElementById("dv_select_2");
    items.forEach((item) => {
      let opt = document.createElement("option");
      opt.innerHTML = item.DV;
      dvSelectInput.appendChild(opt);
    });
    $(".selectpicker").selectpicker("refresh");
  })
  .catch((error) => {
    console.error("Error:", error);
  });
// $("#dv_select_2").on("change", function () {
//   // User has selected a DV on the dv page.
//   var dvs = $("#dv_select_2").val();
//   dvDetails(dvs);
// });

// // Change the start_date
// $("#start_date").change(function () {
//   var startDate = $("#start_date").val() + "T00:00:00Z";
//   var endDate = $("#end_date").val() + "T23:59:59Z";
//   updateInformation(startDate, endDate);
// });

// $("#end_date").change(function () {
//   var startDate = $("#start_date").val() + "T00:00:00Z";
//   var endDate = $("#end_date").val() + "T23:59:59Z";
//   updateInformation(startDate, endDate);
// });

const getAllDvTickets = async (startDate, endDate, selectedDv) => {
  const response = await fetch(
    `${HOST_URL}/_api/web/lists/getbytitle('${TICKETS_LIST_NAME}')/items?$filter=DV eq '${encodeURIComponent(
      selectedDv
    )}' and Created le datetime'${encodeURIComponent(
      endDate
    )}' and Created ge datetime'${encodeURIComponent(startDate)}'&top=5000`,
    {
      headers: { Accept: "application/json; odata=verbose" },
      credentials: "include",
    }
  );
  const data = await response.json();
  if (!data.d) return {};
  const items = data.d.results;
  return items;
};

const getAllDvLegs = async (startDate, endDate, selectedDv) => {
  const response = await fetch(
    `${HOST_URL}/_api/web/lists/getbytitle('${MISSION_LIST_NAME}')/items?$filter=DV eq '${encodeURIComponent(
      selectedDv
    )}' and Created le datetime'${encodeURIComponent(
      endDate
    )}' and Created ge datetime'${encodeURIComponent(startDate)}'&top=5000`,
    {
      headers: { Accept: "application/json; odata=verbose" },
      credentials: "include",
    }
  );
  const data = await response.json();
  if (!data.d) return {};
  const items = data.d.results;
  return items;
};

const getAllDvMissions = async (missionList) => {
  let missionsProcessed = [];
  let missionsArray = [];
  for (let mission in missionList) {
    if (!missionsProcessed.includes(missionList[mission].Mission_Number)) {
      missionsProcessed.push(missionList[mission].Mission_Number);
      missionsArray.push(missionList[mission]);
    }
  }
  return missionsArray;
};

const getYearLegs = async (selectedDv) => {
  const response = await fetch(
    `${HOST_URL}/_api/web/lists/getbytitle('${MISSION_LIST_NAME}')/items?$filter=DV eq '${encodeURIComponent(
      selectedDv
    )}'&top=5000&$orderby=Created desc`,
    {
      headers: { Accept: "application/json; odata=verbose" },
      credentials: "include",
    }
  );
  const data = await response.json();
  if (!data.d) return {};
  const items = data.d.results;
  return items;
};

const getYearTickets = async (selectedDv) => {
  const response = await fetch(
    `${HOST_URL}/_api/web/lists/getbytitle('${TICKETS_LIST_NAME}')/items?$filter=DV eq '${encodeURIComponent(
      selectedDv
    )}'&top=5000&$orderby=Created desc`,
    {
      headers: { Accept: "application/json; odata=verbose" },
      credentials: "include",
    }
  );
  const data = await response.json();
  if (!data.d) return {};
  const items = data.d.results;
  return items;
};

const getAllDvCcirs = async (startDate, endDate, selectedDv) => {
  const response = await fetch(
    `${HOST_URL}/_api/web/lists/getbytitle('${CCIR_LIST_NAME}')/items?$filter=DV eq '${encodeURIComponent(
      selectedDv
    )}' and Created le datetime'${encodeURIComponent(
      endDate
    )}' and Created ge datetime'${encodeURIComponent(startDate)}'&top=5000`,
    {
      headers: { Accept: "application/json; odata=verbose" },
      credentials: "include",
    }
  );
  const data = await response.json();
  if (!data.d) return {};
  const items = data.d.results;
  return items;
};

const generateOpenTicketTable = async (ticketList) => {
  for (let ticket in ticketList) {
    if (ticketList[ticket].Status.toUpperCase() === "CLOSED") continue;
    const dateOpened = convertDateToTicketHTMLString(
      ticketList[ticket].Date_Opened
    );
    const dateUpdated = convertDateToTicketHTMLString(
      ticketList[ticket].Update_Date
    );
    const ticketNumber = ticketList[ticket].GNOC_Ticket_Number;
    const ticketHref = `<a href="./viewTicket.html?ticket=${ticketNumber}">${ticketNumber}</a>`;
    const ticketMissionNumber = ticketList[ticket].Mission_Number;
    const ticketMissionHref = `<a href="./viewMission.html?mission=${ticketMissionNumber}">${ticketMissionNumber}</a>`;
    $("#dvOpenTickets")
      .DataTable()
      .row.add([
        ticketHref,
        dateOpened,
        ticketList[ticket].Tail_Number,
        ticketMissionHref,
        ticketList[ticket].DV,
        ticketList[ticket].Impact_Level,
        ticketList[ticket].Category,
        ticketList[ticket].Status,
        ticketList[ticket].Issue_Description,
        ticketList[ticket].Last_Reported_Action,
        dateUpdated,
      ])
      .draw();
  }
};

const findTicketsPerCategory = async (ticketList) => {
  let chartData = [];
  let ticketCategories = [];
  ticketsPerCategory.series = []; // Reset chart

  for (let ticket in ticketList) {
    if (!ticketCategories.includes(ticketList[ticket].Category))
      ticketCategories.push(ticketList[ticket].Category);
  }

  for (let category in ticketCategories) {
    let totalForCurrentCategory = 0;
    for (let ticket in ticketList) {
      if (ticketList[ticket].Category === ticketCategories[category])
        totalForCurrentCategory++;
    }
    chartData.push({
      name: ticketCategories[category],
      y: totalForCurrentCategory,
      borderWidth: 0,
    });
  }

  return chartData;
};

const generateTicketsPerCategoryChart = (chartData) => {
  ticketsPerCategory.series.push({
    name: "Categories",
    data: chartData,
    size: "70%",
    innerSize: "90%",
    showInLegend: true,
    dataLabels: {
      enabled: false,
    },
  });
  new Highcharts.Chart(ticketsPerCategory);
};

const findTicketsPerTail = async (ticketList) => {
  ticketsPerTail.series = [];
  ticketsPerTail.xAxis.categories = [];
  let ticketsPerTailBySeverity = {
    tails: [],
    high: [],
    med: [],
    low: [],
    none: [],
  };
  for (let ticket in ticketList) {
    if (
      !ticketsPerTailBySeverity.tails.includes(ticketList[ticket].Tail_Number)
    )
      ticketsPerTailBySeverity.tails.push(ticketList[ticket].Tail_Number);
  }

  for (let tail in ticketsPerTailBySeverity.tails) {
    let currentTail = { high: 0, med: 0, low: 0, none: 0 };
    for (let ticket in ticketList) {
      if (
        ticketList[ticket].Tail_Number !== ticketsPerTailBySeverity.tails[tail]
      )
        continue;
      if (ticketList[ticket].Impact_Level === "High") currentTail.high++;
      else if (ticketList[ticket].Impact_Level === "Medium") currentTail.med++;
      else if (ticketList[ticket].Impact_Level === "Low") currentTail.low++;
      else currentTail.none++;
    }
    ticketsPerTailBySeverity.high.push(currentTail.high);
    ticketsPerTailBySeverity.med.push(currentTail.med);
    ticketsPerTailBySeverity.low.push(currentTail.low);
    ticketsPerTailBySeverity.none.push(currentTail.none);
  }
  return ticketsPerTailBySeverity;
};

const generateTicketsPerTailChart = (chartData) => {
  for (let tail in chartData.tails) {
    ticketsPerTail.xAxis.categories.push(chartData.tails[tail]);
  }

  ticketsPerTail.series.push({
    name: "High",
    data: chartData.high,
    color: "#ff0000",
    borderWidth: 0,
  });
  ticketsPerTail.series.push({
    name: "Med",
    data: chartData.med,
    color: "#ffa500",
    borderWidth: 0,
  });
  ticketsPerTail.series.push({
    name: "Low",
    data: chartData.low,
    color: "#ffff00",
    borderWidth: 0,
  });
  ticketsPerTail.series.push({
    name: "None",
    data: chartData.none,
    color: "#008000",
    borderWidth: 0,
  });
  new Highcharts.Chart(ticketsPerTail);
};

const findPercentageOfMissionsWithoutIssues = async (
  ticketList,
  missionList
) => {
  percentLegsIssues.xAxis.categories = [];
  percentLegsIssues.series = [];
  let totalMissionArray = [];
  for (let mission in missionList) {
    totalMissionArray.push(missionList[mission].Mission_Number);
  }

  let successfulMissions = [...totalMissionArray];
  for (let ticket in ticketList) {
    if (successfulMissions.includes(ticketList[ticket].Mission_Number)) {
      const indexOfMission = successfulMissions.indexOf(
        ticketList[ticket].Mission_Number
      );
      successfulMissions.splice(indexOfMission, 1);
    }
  }

  if (successfulMissions.length === 0) return 0;

  const percentSuccess =
    (successfulMissions.length / totalMissionArray.length) * 100;
  return Math.round(percentSuccess);
};

const generatePercentageOfMissionsChart = (chartData, selectedDv) => {
  percentLegsIssues.xAxis.categories.push(selectedDv);
  percentLegsIssues.series.push({
    name: "Percentage of Missions without Issues",
    colorByPoint: true,
    data: [chartData],
  });

  new Highcharts.Chart(percentLegsIssues);
};

const findIssuesPerLegPerMonth = async (
  startDate,
  endDate,
  ticketList,
  legsList
) => {
  issuesPerLeg.xAxis.categories = [];
  issuesPerLeg.series = [];
  let chartData = {
    months: [],
    successfulLegs: [],
    legsWithImpact: [],
    legsWithNoImpact: [],
  };

  let parsedStartDate = moment(new Date(startDate)).utc();
  let parsedStartMonth = parsedStartDate.month();
  let parsedEndDate = moment(new Date(endDate)).utc();

  while (true) {
    let currentStart;
    let currentEnd;
    let breakIndicator = false;
    // Check to see if current start month and end month are different
    if (
      parsedStartDate.month() === parsedStartMonth &&
      parsedStartDate.month() !== parsedEndDate.month()
    ) {
      currentStart = parsedStartDate
        .startOf("month")
        .startOf("day")
        .toISOString();
      currentEnd = parsedStartDate.endOf("month").endOf("day").toISOString();
    } else if (
      parsedStartDate.month() !== parsedStartMonth &&
      parsedStartDate.month() !== parsedEndDate.month()
    ) {
      currentStart = parsedStartDate
        .startOf("month")
        .startOf("day")
        .toISOString();
      currentEnd = parsedStartDate.endOf("month").endOf("day").toISOString();
    } else {
      currentStart = parsedStartDate
        .startOf("month")
        .startOf("day")
        .toISOString();
      currentEnd = parsedEndDate.toISOString();
      breakIndicator = true;
    }

    let ticketData = {
      legsWithNoIssues: 0,
      legsWithImpact: 0,
      legsWithNoImpact: 0,
    };
    let thisMonthsMissions = [];
    for (let leg in legsList) {
      if (
        new Date(legsList[leg].Created).getTime() >=
          new Date(currentEnd).getTime() ||
        new Date(legsList[leg].Created).getTime() <=
          new Date(currentStart).getTime()
      )
        continue;
      const indexOfMission = thisMonthsMissions.findIndex(
        (mission) => mission.mission === legsList[leg].Mission_Number
      );
      if (indexOfMission !== -1) thisMonthsMissions[indexOfMission].legs++;
      else
        thisMonthsMissions.push({
          mission: legsList[leg].Mission_Number,
          legs: 1,
        });
    }

    for (let mission in thisMonthsMissions) {
      for (let ticket in ticketList) {
        if (
          new Date(ticketList[ticket].created).getTime() >=
            new Date(currentEnd).getTime() ||
          new Date(ticketList[ticket].Created).getTime() <=
            new Date(currentStart).getTime()
        )
          continue;
        if (
          ticketList[ticket].Mission_Number !==
          thisMonthsMissions[mission].mission
        )
          continue;
        if (ticketList[ticket].Leg === "N/A") continue;
        if (ticketList[ticket].DV_Impact === true) ticketData.legsWithImpact++;
        else ticketData.legsWithNoImpact++;
        thisMonthsMissions[mission].legs--;
      }
    }

    for (let mission in thisMonthsMissions) {
      ticketData.legsWithNoIssues += thisMonthsMissions[mission].legs;
    }

    chartData.months.push(parsedStartDate.utc().format("MMMM"));
    chartData.successfulLegs.push(ticketData.legsWithNoIssues);
    chartData.legsWithImpact.push(ticketData.legsWithImpact);
    chartData.legsWithNoImpact.push(ticketData.legsWithNoImpact);

    if (breakIndicator) break;

    parsedStartDate.add(1, "months");
  }

  return chartData;
};

const generateIssuesPerLegChart = (chartData) => {
  issuesPerLeg.xAxis.categories = chartData.months;
  issuesPerLeg.series.push({
    name: "Legs with DV Impact",
    data: chartData.legsWithImpact,
    color: "#ff0000",
    borderWidth: 0,
  });
  issuesPerLeg.series.push({
    name: "Legs with No Impact Issues",
    data: chartData.legsWithNoImpact,
    color: "#ffff00",
    borderWidth: 0,
  });
  issuesPerLeg.series.push({
    name: "Legs with No Issues",
    data: chartData.successfulLegs,
    color: "#008000",
    borderWidth: 0,
  });

  new Highcharts.Chart(issuesPerLeg);
};

const findYearlyLegsWithoutIssues = async (ticketList, legsList) => {
  yearDvOptions.series = [];

  let parsedStartDate = moment(new Date()).startOf("year");

  let chartData = { months: [], successfulLegs: [], unsuccessfulLegs: [] };

  while (true) {
    let currentStart = parsedStartDate
      .startOf("month")
      .startOf("day")
      .toISOString();
    let currentEnd = parsedStartDate.endOf("month").endOf("day").toISOString();

    let thisMonthsLegs = { successful: 0, unsuccessful: 0 };
    for (let leg in legsList) {
      if (
        legsList[leg].Created >= currentEnd ||
        legsList[leg].Created <= currentStart
      )
        continue;
      thisMonthsLegs.successful++;
    }

    for (let ticket in ticketList) {
      if (
        new Date(ticketList[ticket].Created).getTime() >=
          new Date(currentEnd).getTime() ||
        new Date(ticketList[ticket].Created).getTime() <=
          new Date(currentStart).getTime()
      )
        continue;
      if (thisMonthsLegs.successful !== 0) {
        thisMonthsLegs.successful--;
        thisMonthsLegs.unsuccessful++;
      }
    }

    chartData.months.push(parsedStartDate.month());
    chartData.successfulLegs.push(thisMonthsLegs.successful);
    chartData.unsuccessfulLegs.push(thisMonthsLegs.unsuccessful);

    parsedStartDate.add(1, "months");

    if (parsedStartDate.month() === 11) break;
  }

  return chartData;
};

const generateYearlyLegsWithoutIssuesChart = (chartData) => {
  yearDvOptions.series.push({
    name: "Unsuccessful Legs",
    data: chartData.unsuccessfulLegs,
    color: "#ff0000",
  });

  yearDvOptions.series.push({
    name: "Successful Legs",
    data: chartData.successfulLegs,
    color: "#008000",
  });

  new Highcharts.Chart(yearDvOptions);
};

const gatherDvInformation = async (startDate, endDate, selectedDv) => {
  // Generate DataTable object
  if (!$.fn.DataTable.isDataTable("#dvOpenTickets")) {
    $("#dvOpenTickets").DataTable({
      dom: "Bfrtip",
      buttons: ["copy", "csv", "excel", "pdf", "print"],
      columnDefs: [
        { width: "140px", targets: [0] },
        { width: "125px", targets: [1] },
        { width: "300px", targets: [8] },
      ],
      order: [[0, "desc"]],
    });
  } else {
    $("#dvOpenTickets").DataTable().clear().draw();
  }

  // Clear highcharts if required
  if ($("#dvYearlyGraph").highcharts()) {
    while (yearDvOptions.series.length > 0) yearDvOptions.series.pop();
  }

  const [
    selectedTickets,
    selectedLegs,
    selectedCcirs,
    thisYearsTickets,
    thisYearsLegs,
  ] = await Promise.all([
    getAllDvTickets(startDate, endDate, selectedDv),
    getAllDvLegs(startDate, endDate, selectedDv),
    getAllDvCcirs(startDate, endDate, selectedDv),
    getYearTickets(selectedDv),
    getYearLegs(selectedDv),
  ]);

  const selectedMissions = await getAllDvMissions(selectedLegs);

  document.getElementById("total_missions").innerHTML = selectedMissions.length;
  document.getElementById("total_tickets").innerHTML = selectedTickets.length;
  document.getElementById("total_legs").innerHTML = selectedLegs.length;
  document.getElementById("total_ccirs").innerHTML = selectedCcirs.length;

  // Generate Open Tickets Table
  generateOpenTicketTable(selectedTickets);

  // Generate tickets per tail chart
  const grabTicketsPerTailData = await findTicketsPerTail(selectedTickets);
  generateTicketsPerTailChart(grabTicketsPerTailData);

  // Generate percentage of missions without issues chart
  const grabMissionsWithIssuesData =
    await findPercentageOfMissionsWithoutIssues(
      selectedTickets,
      selectedMissions
    );
  generatePercentageOfMissionsChart(grabMissionsWithIssuesData, selectedDv);

  // Generate tickets per category chart
  const grabTicketsPerCategoryData = await findTicketsPerCategory(
    selectedTickets
  );
  generateTicketsPerCategoryChart(grabTicketsPerCategoryData);

  // Generate issues per leg chart
  const grabIssuesPerLegPerMonthData = await findIssuesPerLegPerMonth(
    startDate,
    endDate,
    selectedTickets,
    selectedLegs
  );
  generateIssuesPerLegChart(grabIssuesPerLegPerMonthData);

  // Generate Percentage of legs without issue chart
  const grabYearlyLegsWithoutIssues = await findYearlyLegsWithoutIssues(
    thisYearsTickets,
    thisYearsLegs
  );
  generateYearlyLegsWithoutIssuesChart(grabYearlyLegsWithoutIssues);
};

/* Event Handlers */
document.querySelector("#dv_select_2").addEventListener("change", (event) => {
  const selectedDv = document.getElementById("dv_select_2").value;
  const startDate = `${document.getElementById("start_date").value}T00:00:00Z`;
  const endDate = `${document.getElementById("end_date").value}T23:59:59Z`;

  gatherDvInformation(startDate, endDate, selectedDv);
});

document.querySelector("#start_date").addEventListener("change", (event) => {
  const selectedDv = document.getElementById("dv_select_2").value;
  const startDate = `${document.getElementById("start_date").value}T00:00:00Z`;
  const endDate = `${document.getElementById("end_date").value}T23:59:59Z`;

  gatherDvInformation(startDate, endDate, selectedDv);
});

document.querySelector("#end_date").addEventListener("change", (event) => {
  const selectedDv = document.getElementById("dv_select_2").value;
  const startDate = `${document.getElementById("start_date").value}T00:00:00Z`;
  const endDate = `${document.getElementById("end_date").value}T23:59:59Z`;

  gatherDvInformation(startDate, endDate, selectedDv);
});

// // Everything for DV Details Page:
// function dvDetails(dvs) {
//   var arrayOfUnsuccessfulMissions = [];
//   var arrayOfSuccessfulMissions = [];
//   var yearUnsuccessful = 0;
//   var yearSuccessful = 0;
//   // First lets pull ALL of the tickets TOTAL
//   var urlLoad =
//     "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('Tickets')/items?$select=DV,Created,GNOC_Ticket_Number,Date_Opened,Tail_Number,Mission_Number,DV_Impact,Impact_Level,Category,Status,Issue_Description,Last_Reported_Action,Update_Date,CCIR,CCIR_Number,CSO&$top=5000&$filter=DV eq '" +
//     dvs +
//     "'";
//   $.ajax({
//     url: urlLoad,
//     async: false,
//     method: "GET",
//     headers: {
//       Accept: "application/json;odata=verbose",
//     },
//     success: function (data) {
//       var total = 0;
//       var arrayOfTimes = []; // times of tickets unique to mission number
//       var countYearly = [];
//       var allResults = data.d.results;
//       if (Number(allResults.length) > 0) {
//         for (var i = 0; i < Number(allResults.length); i++) {
//           // looping through all results
//           var currentTime = allResults[i].Created;
//           var currentMission = allResults[i].Mission_Number;

//           if (arrayOfTimes.includes(currentTime)) {
//             // this is to make sure no duplicates are included.
//           } else {
//             // not a duplicate so continue on.

//             // Dont care about when or where, just if its open - if open lets add to table.
//             if (
//               allResults[i].Status != "CLOSED" &&
//               allResults[i].Status != "Closed"
//             ) {
//               var dateOpened = convertTheDate(allResults[i].Date_Opened, 1);
//               var dateUpdated = convertTheDate(allResults[i].Update_Date, 1);
//               var href =
//                 '<a href="./viewTicket.html?ticket=' +
//                 allResults[i].GNOC_Ticket_Number +
//                 '">' +
//                 allResults[i].GNOC_Ticket_Number +
//                 "</a>";
//               if (checkPermissions("VklFVyBNSVNTSU9O", false, false)) {
//                 var missionhref =
//                   '<a href="./viewMission.html?mission=' +
//                   allResults[i].Mission_Number +
//                   '">' +
//                   allResults[i].Mission_Number +
//                   "</a>";
//               } else {
//                 var missionhref = allResults[i].Mission_Number;
//               }
//               $("#dvOpenTickets")
//                 .DataTable()
//                 .row.add([
//                   href,
//                   dateOpened,
//                   allResults[i].Tail_Number,
//                   missionhref,
//                   allResults[i].DV,
//                   allResults[i].Impact_Level,
//                   allResults[i].Category,
//                   allResults[i].Status,
//                   allResults[i].Issue_Description,
//                   allResults[i].Last_Reported_Action,
//                   dateUpdated,
//                 ])
//                 .draw();
//             }
//             if (!arrayOfUnsuccessfulMissions.includes(currentMission)) {
//               // no need to keep adding the same unsucessful mission in here.. just take 1 ticket from that mission - we can use this to check against missions database
//               arrayOfUnsuccessfulMissions.push(currentMission);
//               arrayOfTimes.push(currentTime);
//             }
//           }
//         }

//         // Now we need to loop, per month.
//         for (var j = 1; j < 13; j++) {
//           total = 0;
//           if (j < 10) {
//             var currentMonth = "0" + j;
//           } else {
//             var currentMonth = j;
//           }

//           var startDate = year + "-" + currentMonth + "-01";
//           var endDate = year + "-" + currentMonth + "-31";

//           for (var k = 0; k < arrayOfTimes.length; k++) {
//             if (arrayOfTimes[k] <= endDate && arrayOfTimes[k] >= startDate) {
//               total++;
//             }
//           }
//           countYearly.push(total);
//         }
//         yearDvOptions.series.push({
//           name: "Unsuccessful Missions",
//           data: countYearly,
//         });

//         for (i = 0; i < countYearly.length; i++) {
//           yearUnsuccessful = yearUnsuccessful + countYearly[i];
//         }
//       }
//     },
//     error: function (data) {
//       //alert("Error: " + JSON.stringify(data));
//     },
//   });

//   // Now lets poll all the missions for said DV and see what ones were successful.
//   var urlLoad =
//     "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('Missions')/items?$select=DV,Mission_Number,Departure_Date&$top=5000&$filter=DV eq '" +
//     dvs +
//     "'";
//   $.ajax({
//     url: urlLoad,
//     async: false,
//     method: "GET",
//     headers: {
//       Accept: "application/json;odata=verbose",
//     },
//     success: function (data) {
//       var total = 0;
//       var arrayOfTimes = []; // times of tickets unique to mission number
//       var countYearly = [];
//       var allResults = data.d.results;
//       if (Number(allResults.length) > 0) {
//         for (var i = 0; i < Number(allResults.length); i++) {
//           // looping through all results
//           var currentTime = allResults[i].Departure_Date;
//           var currentMission = allResults[i].Mission_Number;

//           if (!arrayOfTimes.includes(currentTime)) {
//             // not a duplicate so continue on.
//             if (
//               !arrayOfUnsuccessfulMissions.includes(currentMission) &&
//               !arrayOfSuccessfulMissions.includes(currentMission)
//             ) {
//               // We only need to add the ones who weren't already marked unsuccessful. and check for duplicates
//               arrayOfSuccessfulMissions.push(currentMission);
//               arrayOfTimes.push(currentTime);
//             }
//           }
//         }

//         // Now we need to loop, per month.
//         for (var j = 1; j < 13; j++) {
//           total = 0;
//           if (j < 10) {
//             var currentMonth = "0" + j;
//           } else {
//             var currentMonth = j;
//           }

//           var startDate = year + "-" + currentMonth + "-01";
//           var endDate = year + "-" + currentMonth + "-31";

//           for (var k = 0; k < arrayOfTimes.length; k++) {
//             if (arrayOfTimes[k] <= endDate && arrayOfTimes[k] >= startDate) {
//               total++;
//             }
//           }
//           countYearly.push(total);
//         }
//         yearDvOptions.series.push({
//           name: "Successful Missions",
//           data: countYearly,
//         });
//         for (i = 0; i < countYearly.length; i++) {
//           yearSuccessful = yearSuccessful + countYearly[i];
//         }
//       }
//     },
//     error: function (data) {
//       //alert("Error: " + JSON.stringify(data));
//     },
//   });
//   if ($("#dvYearlyGraph").highcharts())
//     $("#dvYearlyGraph").highcharts().destroy();
//   var dvYearlyChart = new Highcharts.Chart(yearDvOptions);

//   // Now lets calculate mission success rate for the year:
//   var totalYearMissions = yearSuccessful + yearUnsuccessful;
//   var percentageMission = (yearSuccessful / totalYearMissions) * 100;
//   //$("#missionSuccessRate").text(Math.round(percentageMission) + "%");
//   var startDate = $("#start_date").val() + "T00:00:00Z";
//   var endDate = $("#end_date").val() + "T23:59:59Z";
//   updateInformation(startDate, endDate);
//   // Now we need to calculate this month's aircraft success rate.
//   // This will be done on the first selection of the DV.
//   // We will just make a call to the below function as that function can be reused with a select event.
// }

// // Global Variables
// var unsuccessfulMissions = [];
// var totalMissions = 0;
// var totalLegs = 0;
// var categories = [];
// var totalTickets = 0;
// var tails = [];
// function updateInformation(startDate, endDate) {
//   tails = [];
//   ticketsPerCategory.series = [];
//   percentLegsIssues.series = [];
//   percentLegsIssues.xAxis.categories = [];
//   ticketsPerTail.xAxis.categories = [];
//   ticketsPerTail.series = [];
//   issuesPerLeg.xAxis.categories = [];
//   issuesPerLeg.series = [];
//   unsuccessfulMissions = [];
//   totalMissions = 0;
//   totalLegs = 0;
//   categories = [];
//   totalTickets = 0;
//   // Get current DV
//   var dv = $("#dv_select_2").val();
//   if (dv) {
//     // If DV selected

//     // First get total CCIR since we cant do that in another loop
//     $("#total_ccirs").text(totalCCIRs(startDate, endDate, dv));
//     ticketProcessing(startDate, endDate, dv);
//     $("#total_tickets").text(totalTickets);
//     missionProcessing(startDate, endDate, dv);
//     $("#total_missions").text(totalMissions);
//     $("#total_legs").text(totalLegs);
//     ticketsPerTailFunc(startDate, endDate, dv);
//     issuesPerLegFunc(startDate, endDate, dv);
//   }
// }

// function ticketProcessing(startDate, endDate, dv) {
//   // Get ticket categories
//   var urlLoad =
//     "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('Ticket_Categories')/items?$orderby=Category%20asc";
//   $.ajax({
//     url: urlLoad,
//     async: false,
//     method: "GET",
//     headers: {
//       Accept: "application/json;odata=verbose",
//     },
//     success: function (data) {
//       var allResults = data.d.results;
//       if (Number(allResults.length) > 0) {
//         for (var i = 0; i < Number(allResults.length); i++) {
//           var total = 0;
//           var currentCategory = allResults[i].Category;
//           // now loop through tickets to find how many tickets for this category
//           var urlLoad =
//             "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('Tickets')/items?$top=5000&$filter=Category eq '" +
//             currentCategory +
//             "' and Created le '" +
//             endDate +
//             "' and Created ge '" +
//             startDate +
//             "' and DV eq '" +
//             dv +
//             "'";
//           $.ajax({
//             url: urlLoad,
//             async: false,
//             method: "GET",
//             headers: {
//               Accept: "application/json;odata=verbose",
//             },
//             success: function (data) {
//               var arrayOfTimes = [];
//               var dataResults = data.d.results;
//               if (Number(dataResults.length) > 0) {
//                 for (var j = 0; j < Number(dataResults.length); j++) {
//                   if (
//                     (dataResults[j].Category =
//                       currentCategory &&
//                       !arrayOfTimes.includes(dataResults[j].Created))
//                   ) {
//                     if (
//                       !unsuccessfulMissions.includes(
//                         dataResults[j].Mission_Number
//                       )
//                     ) {
//                       unsuccessfulMissions.push(dataResults[j].Mission_Number); // add mission as non successful
//                     }
//                     if (!tails.includes(dataResults[j].Tail_Number)) {
//                       tails.push(dataResults[j].Tail_Number);
//                     }
//                     arrayOfTimes.push(dataResults[j].Created); // to make sure no duplicates
//                     total++;
//                     totalTickets++;
//                   }
//                 }
//               }
//             },
//           });
//           // Now we got total for category - lets push it
//           if (total != 0) {
//             categories.push({
//               name: currentCategory,
//               y: total,
//             });
//           }
//         }
//       }
//     },
//   });

//   // Now done with loop, lets push all the data
//   ticketsPerCategory.series.push({
//     name: "Categories",
//     data: categories,
//     size: "70%",
//     innerSize: "90%",
//     showInLegend: true,
//     dataLabels: {
//       enabled: false,
//     },
//   });

//   var chart = new Highcharts.Chart(ticketsPerCategory);
// }

// function missionProcessing(startDate, endDate, dv) {
//   // Total Missions
//   var percentSuccess = 0;
//   var missions = [];
//   var urlLoad2 =
//     "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('Missions')/items?$top=5000&$filter=DV eq '" +
//     dv +
//     "' and Created le '" +
//     endDate +
//     "' and Created ge '" +
//     startDate +
//     "'";
//   $.ajax({
//     url: urlLoad2,
//     async: false,
//     method: "GET",
//     headers: {
//       Accept: "application/json;odata=verbose",
//     },
//     success: function (data) {
//       var allResults = data.d.results;
//       var arrayOfTimes = [];
//       if (Number(allResults.length) > 0) {
//         for (var j = 0; j < Number(allResults.length); j++) {
//           // looping through all results
//           var currentTime = allResults[j].Departure_Date;
//           var currentMission = allResults[j].Mission_Number;

//           if (!arrayOfTimes.includes(currentTime)) {
//             // not a duplicate so continue on.
//             if (!missions.includes(currentMission)) {
//               missions.push(currentMission);
//               totalMissions++;
//             }

//             totalLegs++;

//             if (!unsuccessfulMissions.includes(currentMission)) {
//               // We only need to add the ones who weren't already marked unsuccessful.

//               arrayOfTimes.push(currentTime);
//             }
//           }
//         }
//         percentLegsIssues.xAxis.categories.push(dv);
//         percentSuccess =
//           ((totalMissions - unsuccessfulMissions.length) / totalMissions) * 100;
//         percentSuccess = Math.round(percentSuccess);
//       }
//     },
//   });

//   percentLegsIssues.series.push({
//     name: "Percentage of Missions without Issues",
//     colorByPoint: true,
//     data: [percentSuccess],
//   });

//   var chart2 = new Highcharts.Chart(percentLegsIssues);
// }

// function ticketsPerTailFunc(startDate, endDate, dv) {
//   var highArr = [];
//   var medArr = [];
//   var lowArr = [];
//   var noneArr = [];

//   for (var i = 0; i < tails.length; i++) {
//     // Loop through each a/c
//     // Lets see if any tickets exist for said a/c
//     // First lets pull ALL of the tickets TOTAL
//     var urlLoad =
//       "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('Tickets')/items?$top=5000&$filter=Tail_Number eq '" +
//       tails[i] +
//       "' and Created le '" +
//       endDate +
//       "' and Created ge '" +
//       startDate +
//       "' and DV eq '" +
//       dv +
//       "'";
//     $.ajax({
//       url: urlLoad,
//       async: false,
//       method: "GET",
//       headers: {
//         Accept: "application/json;odata=verbose",
//       },
//       success: function (data) {
//         var dataResults = data.d.results;
//         if (Number(dataResults.length) > 0) {
//           // Found tickets for said a/c
//           // Lets push this to an x-category on the chart
//           ticketsPerTail.xAxis.categories.push(tails[i]);

//           // Data = [None, Low, Medium, High];
//           var high = 0;
//           var med = 0;
//           var low = 0;
//           var none = 0;
//           for (var j = 0; j < Number(dataResults.length); j++) {
//             // Going through tickets for said a/c
//             if (dataResults[j].Impact_Level == "High") {
//               high++;
//             } else if (dataResults[j].Impact_Level == "Medium") {
//               med++;
//             } else if (dataResults[j].Impact_Level == "Low") {
//               low++;
//             } else {
//               none++;
//             }
//           }
//           highArr.push(high);
//           medArr.push(med);
//           lowArr.push(low);
//           noneArr.push(none);
//         }
//       },
//     });
//   }

//   ticketsPerTail.series.push({
//     name: "High",
//     data: highArr,
//   });
//   ticketsPerTail.series.push({
//     name: "Med",
//     data: medArr,
//   });
//   ticketsPerTail.series.push({
//     name: "Low",
//     data: lowArr,
//   });
//   ticketsPerTail.series.push({
//     name: "None",
//     data: noneArr,
//   });
//   var chart = new Highcharts.Chart(ticketsPerTail);
// }

// function exists(arr, search) {
//   return arr.some((row) => row.includes(search));
// }

// function getRow(arr, search) {
//   for (var i = 0; i < arr.length; i++) {
//     if (arr[i][0] == search) return i;
//   }
// }

// function issuesPerLegFunc(start, end, dv) {
//   var months = [];
//   var success = [];
//   var impact = [];
//   var noImpact = [];

//   var parseStart = moment(new Date(start)).utc();
//   //console.log(parseStart.toDate() + " and " + parseStart.toISOString());
//   var startMonth = parseStart.month();
//   var parseEnd = moment(new Date(end)).utc();

//   //console.log(parseStart.month() + " - " + parseEnd.month());
//   var breakOut = 0;
//   while (true) {
//     // if we aren't in same month as the end date, but in the same month as the start date make the search date to the end of the month
//     if (
//       parseStart.month() == startMonth &&
//       parseStart.month() != parseEnd.month()
//     ) {
//       // current month is same as start month.
//       start = parseStart.toISOString();
//       end =
//         parseStart.year() +
//         "-" +
//         (parseStart.month() + 1) +
//         "-" +
//         parseStart.endOf("month").toDate().getDate() +
//         "T23:59:59Z";
//     } else if (
//       parseStart.month() != startMonth &&
//       parseStart.month() != parseEnd.month()
//     ) {
//       start = parseStart.startOf("month").startOf("day").toISOString();
//       end = parseStart.endOf("month").endOf("day").toISOString();
//     } else {
//       // Same months
//       start = parseStart.startOf("month").startOf("day").toISOString();
//       end = parseEnd.toISOString();
//       breakOut = 1;
//     }

//     // Now run the equations
//     var urlLoad =
//       "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('Missions')/items?$filter=DV eq '" +
//       dv +
//       "' and Created le '" +
//       end +
//       "' and Created ge '" +
//       start +
//       "'&$orderby=Created%20desc";
//     var successfulLegs = 0;
//     var impactLegs = 0;
//     var noImpactLegs = 0;
//     var missionArry = [];
//     $.ajax({
//       url: urlLoad,
//       async: false,
//       method: "GET",
//       headers: {
//         Accept: "application/json;odata=verbose",
//       },
//       success: function (data) {
//         var allResults = data.d.results;
//         if (Number(allResults.length) > 0) {
//           for (var i = 0; i < Number(allResults.length); i++) {
//             if (!exists(missionArry, allResults[i].Mission_Number)) {
//               missionArry.push([allResults[i].Mission_Number, 1]);
//             } else {
//               var row = getRow(missionArry, allResults[i].Mission_Number);
//               missionArry[row][1]++;
//             }
//           }
//         }
//       },
//     });

//     for (var i = 0; i < missionArry.length; i++) {
//       // loop through each mission to get final values
//       var mission = missionArry[i][0];
//       var urlLoad =
//         "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('Tickets')/items?$filter=DV eq '" +
//         dv +
//         "' and Mission_Number eq '" +
//         mission +
//         "' and Date_Opened le '" +
//         end +
//         "' and Date_Opened ge '" +
//         start +
//         "' &$orderby=Created%20desc";
//       $.ajax({
//         url: urlLoad,
//         async: false,
//         method: "GET",
//         headers: {
//           Accept: "application/json;odata=verbose",
//         },
//         success: function (data) {
//           var allResults = data.d.results;
//           if (Number(allResults.length) > 0) {
//             for (var i = 0; i < Number(allResults.length); i++) {
//               if (allResults[i].Leg != "N/A") {
//                 // Check for DV Impact
//                 if (allResults[i].DV_Impact == true) {
//                   impactLegs++;
//                   missionArry[i][1]--;
//                 } else {
//                   noImpactLegs++;
//                   missionArry[i][1]--;
//                 }
//               }
//             }
//           }
//         },
//       });
//     }

//     // calculate success legs
//     for (var i = 0; i < missionArry.length; i++) {
//       successfulLegs = successfulLegs + missionArry[i][1];
//     }
//     /*
//     $.ajax({
//       url: urlLoad,
//       async: false,
//       method: "GET",
//       headers: {
//         "Accept": "application/json;odata=verbose"
//       },
//       success: function (data) {
//         var allResults = data.d.results;
//         if (Number(allResults.length) > 0) {
//           for (var i = 0; i < Number(allResults.length); i++) {
//             // for each mission search for ticket (mission in this case is = to a leg) that falls in that mission
//             var depDate = new Date(allResults[i].Departure_Date);
//             depDate.setHours(depDate.getHours() - depDate.getTimezoneOffset() / 60);
//             depDate = depDate.toISOString();
//             //var m = depDate.getMonth() + 1;
//             //depDate = depDate.getFullYear() + "-" + ("0" + m).slice(-2) + "-" + ("0" + depDate.getDate()).slice(-2) + "T" + ("0" + depDate.getHours()).slice(-2) + ":" + ("0" + depDate.getMinutes()).slice(-2) + ":" + ("0" + depDate.getSeconds()).slice(-2) + "Z";
//             var arrDate = new Date(allResults[i].Arrival_Date);
//             arrDate.setHours(arrDate.getHours() - arrDate.getTimezoneOffset() / 60);
//             arrDate = arrDate.toISOString();
//             //m = arrDate.getMonth() + 1;
//             //arrDate = arrDate.getFullYear() + "-" + ("0" + m).slice(-2) + "-" + ("0" + arrDate.getDate()).slice(-2) + "T" + ("0" + arrDate.getHours()).slice(-2) + ":" + ("0" + arrDate.getMinutes()).slice(-2) + ":" + ("0" + arrDate.getSeconds()).slice(-2) + "Z";
//             var mission = allResults[i].Mission_Number
//             //console.log("Mission #: " + mission + " departed on " + depDate + " and arrived on " + arrDate);
//             //console.log(depDate);
//             //console.log(arrDate);
//             //console.log(mission);
//             //console.log(allResults[i].Created);
//             var urlLoad = "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('Tickets')/items?$filter=DV eq '" + dv + "' and Mission_Number eq '" + mission + "' and Date_Opened le '" + arrDate + "' and Date_Opened ge '" + depDate + "' &$orderby=Created%20desc";
//             $.ajax({
//               url: urlLoad,
//               async: false,
//               method: "GET",
//               headers: {
//                 "Accept": "application/json;odata=verbose"
//               },
//               success: function (data2) {
//                 var allResults2 = data2.d.results;
//                 var foundImpact = 0;
//                 if (Number(allResults2.length) > 0) {
//                   //console.log("Found tickets relating to " + mission);
//                   for (var j = 0; j < Number(allResults2.length); j++) {
//                     foundImpact = 0;
//                     // Issue found
//                     //console.log(allResults2[j].DV_Impact + " and ticket# " + allResults2[j].GNOC_Ticket_Number);
//                     if (allResults2[j].DV_Impact == true) {
//                       foundImpact = 1;
//                     }
//                   }
//                   if (foundImpact == 1) {
//                     impactLegs++;
//                   }
//                   else {
//                     noImpactLegs++;
//                   }
//                 }
//                 else {
//                   // no tickets found for leg
//                   successfulLegs++;
//                 }
//               }
//             });
//           }
//         }
//       }
//     });
//     */

//     months.push(parseStart.utc().format("MMMM"));
//     success.push(successfulLegs);
//     impact.push(impactLegs);
//     noImpact.push(noImpactLegs);

//     if (breakOut) {
//       break;
//     }

//     // Add Month
//     parseStart.add(1, "months");
//   }

//   issuesPerLeg.xAxis.categories = months;
//   issuesPerLeg.series.push({
//     name: "Legs with DV Impact",
//     data: impact,
//   });
//   issuesPerLeg.series.push({
//     name: "Legs with No Impact Issues",
//     data: noImpact,
//   });
//   issuesPerLeg.series.push({
//     name: "Legs with No Issues",
//     data: success,
//   });
//   var chart = new Highcharts.Chart(issuesPerLeg);
// }
