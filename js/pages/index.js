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
permissionsCheck("REFTSEJPQVJE");

let uniqueDVs = [];
let allTicketCount = [];

/* High Charts Configs */
let barGraphOptions = {
  chart: {
    renderTo: "containerGraph",
    type: "bar",
    events: {
      redraw: true,
    },
  },
  title: {
    text: "Tickets per DV",
    style: {
      color: "#FFF",
    },
  },
  xAxis: {
    categories: [],
    crosshair: true,
    labels: {
      style: {
        fontSize: "1.2em",
        color: "#FFF",
        fill: "#FFF",
      },
    },
  },
  legend: { enabled: false },
  yAxis: {
    min: 0,
    title: {
      text: "# of Tickets",
      style: {
        color: "#FFF",
      },
    },
    labels: {
      style: {
        fontSize: "1.2em",
        color: "#FFF",
        fill: "#FFF",
      },
    },
    allowDecimals: false,
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
  series: [],
  dataSorting: {
    enabled: true,
  },
};

let lineOptions = {
  chart: {
    renderTo: "top5LineChart",
    type: "line",
  },
  title: {
    text: "Monthly Ticket Snapshot",
    align: "center",
  },
  subtitle: {
    text: "current year",
    align: "left",
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
      text: " Tickets",
    },
    plotLines: [
      {
        value: 0,
        width: 1,
        color: "#808080",
      },
    ],
    allowDecimals: false,
  },
  tooltip: {
    valuePrefix: "",
    valueSuffix: " Tickets",
  },
  legend: {
    layout: "horizontal",
    align: "right",
    verticalAlign: "top",
    borderWidth: 0,
    marginTop: 5,
    marginBottom: 5,
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
  series: [],
};

// Set Datatables time settings
$.fn.dataTable.moment("MM/DD/YYYY HH:mmZ");

// Populate Aircraft Drop Down
fetch(
  `${HOST_URL}/_api/web/lists/getbytitle('TailNumbers')/items?$top=5000&$orderby=Tail_x0020_Numbers%20asc`,
  {
    headers: { Accept: "application/json; odata=verbose" },
    credentials: "include",
  }
)
  .then((response) => response.json())
  .then((data) => {
    const items = data.d.results;
    const aircraftSelectInput = document.getElementById("tail_select");
    items.forEach((item) => {
      let opt = document.createElement("option");
      opt.innerHTML = item.Tail_x0020_Numbers;
      aircraftSelectInput.appendChild(opt);
    });
    $(".selectpicker").selectpicker("refresh");
  })
  .catch((error) => {
    console.error("Error:", error);
  });

// Populate DV Drop Down
fetch(`${HOST_URL}/_api/web/lists/getbytitle('DVList')/items?$top=5000`, {
  headers: { Accept: "application/json; odata=verbose" },
  credentials: "include",
})
  .then((response) => response.json())
  .then((data) => {
    const items = data.d.results;
    const dvSelectInput = document.getElementById("dv_select");
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

// Populate year drop down
lineOptions.subtitle.text = currentYear;
const yearSelect = document.getElementById("year_select");
for (let i = currentYear; i > 2018; i--) {
  const opt = document.createElement("option");
  opt.innerHTML = i;
  yearSelect.appendChild(opt);
}
document.getElementById("year_select").value = currentYear;
$(".selectpicker").selectpicker("refresh");

const getListOfDvsWithTickets = async (startDate, endDate, listOfTails) => {
  let listOfDvs = [];
  let tailsProvided = false;
  if (listOfTails) {
    if (listOfTails.length !== 0) tailsProvided = true;
  }
  const response = await fetch(
    `${HOST_URL}/_api/web/lists/getbytitle('${TICKETS_LIST_NAME}')/items?$select=DV,Tail_Number,Created&$filter=Created le datetime'${encodeURIComponent(
      endDate
    )}' and Created ge datetime'${encodeURIComponent(
      startDate
    )}'&top=5000&$orderby=DV asc`,
    {
      headers: { Accept: "application/json; odata=verbose" },
      credentials: "include",
    }
  );
  const data = await response.json();
  const items = data.d.results;
  for (let item in items) {
    if (!listOfDvs.includes(items[item].DV) && items[item].DV !== null) {
      if (tailsProvided && !listOfTails.includes(items[item].Tail_Number))
        continue;
      listOfDvs.push(items[item].DV);
    }
  }
  return listOfDvs;
};

const getTotalTicketsPerDv = async (
  startDate,
  endDate,
  listOfDvs,
  listOfTails
) => {
  let ticketsForAllDvs = [];
  let totalTicketCount = 0;
  for (let dv in listOfDvs) {
    const ticketsForDv = await fetchTickets(
      startDate,
      endDate,
      listOfDvs[dv],
      listOfTails
    );
    totalTicketCount += ticketsForDv;
    if (ticketsForDv) ticketsForAllDvs.push(ticketsForDv);
  }
  document.getElementById("total_tickets").innerHTML = totalTicketCount;
  barGraphOptions.series.push({
    name: "Tickets",
    data: ticketsForAllDvs,
    color: "#00bc8c",
    borderWidth: 0,
  });
  return ticketsForAllDvs;
};

const fetchTickets = async (startDate, endDate, DV, listOfTails) => {
  let tailsProvided = false;
  const fetchUrl = `${HOST_URL}/_api/web/lists/getbytitle('${TICKETS_LIST_NAME}')/items?$top=5000&$filter=DV eq '${encodeURIComponent(
    DV
  )}' and Created le datetime'${encodeURIComponent(
    endDate
  )}' and Created ge datetime'${encodeURIComponent(
    startDate
  )}'&$orderby=DV asc`;
  if (listOfTails) {
    if (listOfTails.length !== 0) tailsProvided = true;
  }
  const response = await fetch(fetchUrl, {
    headers: { Accept: "application/json; odata=verbose" },
    credentials: "include",
  });
  const data = await response.json();
  const items = data.d.results;
  const totalTickets = data.d.results.length;

  for (let item in items) {
    if (tailsProvided) {
      if (!listOfTails.includes(items[item].Tail_Number)) {
        console.log("didnt find the tail");
        continue;
      }
    }

    console.log("but i kept going");

    // add them to the ticket table
    const dateOpened = convertDateToTicketHTMLString(items[item].Date_Opened);
    const dateUpdated = convertDateToTicketHTMLString(items[item].Update_Date);
    const missionHref =
      items[item].Mission_Number !== null ||
      items[item].Mission_Number !== undefined
        ? `<a href="./viewMission.html?mission=${items[item].Mission_Number}">${items[item].Mission_Number}</a>`
        : "N/A";
    const ticketHref = `<a href="./viewTicket.html?ticket=${items[item].GNOC_Ticket_Number}">${items[item].GNOC_Ticket_Number}</a>`;

    $("#overviewTickets")
      .DataTable()
      .row.add([
        ticketHref,
        dateOpened,
        items[item].Tail_Number,
        missionHref,
        items[item].DV,
        items[item].Impact_Level,
        items[item].Category,
        items[item].Status,
        items[item].Issue_Description,
        items[item].Last_Reported_Action,
        dateUpdated,
      ])
      .draw();
  }

  if (totalTickets) barGraphOptions.xAxis.categories.push(DV);

  return totalTickets;
};

const getCCIRTotal = async (startDate, endDate, Dv) => {
  let fetchUrl;
  if (Dv)
    fetchUrl = `${HOST_URL}/_api/web/lists/getbytitle('${CCIR_LIST_NAME}')/items?$top=5000&$filter=DV eq '${encodeURIComponent(
      Dv
    )}' and Created le datetime'${encodeURIComponent(
      endDate
    )}' and Created ge datetime'${encodeURIComponent(startDate)}'`;
  else
    fetchUrl = `${HOST_URL}/_api/web/lists/getbytitle('${CCIR_LIST_NAME}')/items?$top=5000&$filter=Created le datetime'${encodeURIComponent(
      endDate
    )}' and Created ge datetime'${encodeURIComponent(startDate)}'`;

  const response = await fetch(fetchUrl, {
    headers: { Accept: "application/json; odata=verbose" },
    credentials: "include",
  });
  const data = await response.json();
  const items = data.d.results;
  const totalCCIRs = items.length;

  return totalCCIRs;
};

const getMissionsAndLegsTotal = async (startDate, endDate, Dv) => {
  let fetchUrl;
  if (Dv)
    fetchUrl = `${HOST_URL}/_api/web/lists/getbytitle('${MISSION_LIST_NAME}')/items?$top=5000&$filter=DV eq '${encodeURIComponent(
      Dv
    )}' and Created le datetime'${encodeURIComponent(
      endDate
    )}' and Created ge datetime'${encodeURIComponent(startDate)}'`;
  else
    fetchUrl = `${HOST_URL}/_api/web/lists/getbytitle('${MISSION_LIST_NAME}')/items?$top=5000&$filter=Created le datetime'${encodeURIComponent(
      endDate
    )}' and Created ge datetime'${encodeURIComponent(startDate)}'`;
  const response = await fetch(fetchUrl, {
    headers: { Accept: "application/json; odata=verbose" },
    credentials: "include",
  });
  const data = await response.json();
  const items = data.d.results;
  let totalMissions = [];
  for (let item in items) {
    if (!totalMissions.includes(items[item].Mission_Number))
      totalMissions.push(items[item].Mission_Number);
  }

  return { missions: totalMissions.length, legs: items.length };
};

const getStatTotals = async (startDate, endDate, listOfDvs) => {
  let totalCCIRs = 0;
  let totalMissions = 0;
  let totalLegs = 0;
  if (!listOfDvs) {
    totalCCIRs += await getCCIRTotal(startDate, endDate);
    const missionAndLegsTotal = await getMissionsAndLegsTotal(
      startDate,
      endDate
    );
    totalMissions += missionAndLegsTotal.missions;
    totalLegs += missionAndLegsTotal.legs;
  } else {
    for (let dv in listOfDvs) {
      totalCCIRs += await getCCIRTotal(startDate, endDate, listOfDvs[dv]);
      const missionAndLegsTotal = await getMissionsAndLegsTotal(
        startDate,
        endDate,
        listOfDvs[dv]
      );
      totalMissions += missionAndLegsTotal.missions;
      totalLegs += missionAndLegsTotal.legs;
    }
  }

  document.getElementById("total_ccirs").innerHTML = totalCCIRs;
  document.getElementById("total_missions").innerHTML = totalMissions;
  document.getElementById("total_legs").innerHTML = totalLegs;

  return;
};

const gatherData = async (startDate, endDate, listOfDvs, listOfTails) => {
  const loadingIndicator = document.getElementById("loading_results");
  loadingIndicator.style.display = "block";

  console.log(startDate, endDate, listOfDvs, listOfTails);
  if (!$.fn.DataTable.isDataTable("#overviewTickets")) {
    $("#overviewTickets").DataTable({
      dom: "Bfrtip",
      buttons: ["copy", "csv", "excel", "pdf", "print"],
      columnDefs: [
        { width: "150px", targets: [0, 1, 10] },
        { width: "300px", targets: [8] },
      ],
      order: [[0, "desc"]],
    });
  } else {
    $("#overviewTickets").DataTable().clear().draw();
  }

  if (!listOfDvs)
    listOfDvs = await getListOfDvsWithTickets(startDate, endDate, listOfTails);
  if (listOfDvs) {
    if (listOfDvs.length === 0)
      listOfDvs = await getListOfDvsWithTickets(
        startDate,
        endDate,
        listOfTails
      );
  }
  const ticketsPerDv = await getTotalTicketsPerDv(
    startDate,
    endDate,
    listOfDvs,
    listOfTails
  );
  const statTotals = await getStatTotals(startDate, endDate, listOfDvs);

  let counter = 0;
  for (let ticketCount in ticketsPerDv) {
    if (ticketsPerDv[ticketCount] === 0) counter++;
  }

  if (counter == ticketsPerDv.length)
    document.getElementById("containerGraph").innerHTML = "No Data Found";
  else new Highcharts.Chart(barGraphOptions);

  loadingIndicator.style.display = "none";
};
gatherData(chartStartDateISO, chartEndDateISO);

/* Event Handlers */
document.querySelector("#tail_select").addEventListener("change", (event) => {
  console.log("Tail changed");
  barGraphOptions.series = [];
  barGraphOptions.xAxis.categories = [];
  let selectedTails;
  if ($("#tail_select").val() !== "") selectedTails = $("#tail_select").val();

  let selectedDvs;
  if ($("#dv_select").val() !== "") selectedDvs = $("#dv_select").val();

  const startDate = `${document.getElementById("start_date").value}T00:00:00Z`;
  const endDate = `${document.getElementById("end_date").value}T23:59:59Z`;

  gatherData(startDate, endDate, selectedDvs, selectedTails);
});

document.querySelector("#dv_select").addEventListener("change", (event) => {
  console.log("dv changed");
  barGraphOptions.series = [];
  barGraphOptions.xAxis.categories = [];
  let selectedTails;
  if ($("#tail_select").val() !== "") selectedTails = $("#tail_select").val();

  let selectedDvs;
  if ($("#dv_select").val() !== "") selectedDvs = $("#dv_select").val();

  const startDate = `${document.getElementById("start_date").value}T00:00:00Z`;
  const endDate = `${document.getElementById("end_date").value}T23:59:59Z`;

  gatherData(startDate, endDate, selectedDvs, selectedTails);
});

document.querySelector("#start_date").addEventListener("change", (event) => {
  barGraphOptions.series = [];
  barGraphOptions.xAxis.categories = [];
  let selectedTails;
  if ($("#tail_select").val() !== "") selectedTails = $("#tail_select").val();

  let selectedDvs;
  if ($("#dv_select").val() !== "") selectedDvs = $("#dv_select").val();

  const startDate = `${document.getElementById("start_date").value}T00:00:00Z`;
  const endDate = `${document.getElementById("end_date").value}T23:59:59Z`;

  gatherData(startDate, endDate, selectedDvs, selectedTails);
});

document.querySelector("#end_date").addEventListener("change", (event) => {
  barGraphOptions.series = [];
  barGraphOptions.xAxis.categories = [];
  let selectedTails;
  if ($("#tail_select").val() !== "") selectedTails = $("#tail_select").val();

  let selectedDvs;
  if ($("#dv_select").val() !== "") selectedDvs = $("#dv_select").val();

  const startDate = `${document.getElementById("start_date").value}T00:00:00Z`;
  const endDate = `${document.getElementById("end_date").value}T23:59:59Z`;

  gatherData(startDate, endDate, selectedDvs, selectedTails);
});

// const runLineChart = () => {};
// runLineChart();

// $("#tail_select").on("change", function (e) {
//   // User has selected a different aircraft
//   uniqueDVs = [];
//   allTicketCount = [];
//   barGraphOptions.series = [];
//   barGraphOptions.xAxis.categories = [];
//   var tails = undefined;
//   if ($("#tail_select").val() != "") {
//     tails = $("#tail_select").val();
//   }

//   var dvs = undefined;
//   if ($("#dv_select").val() != "") {
//     dvs = $("#dv_select").val();
//   }
//   var selected = $(this).val();
//   var startDate = $("#start_date").val() + "T00:00:00Z";
//   var endDate = $("#end_date").val() + "T23:59:59Z";
//   runChart(dvs, startDate, endDate, tails);
// });

// $("#year_select").on("change", function (e) {
//   var selected = $(this).val();
//   lineOptions.subtitle.text = selected;
//   lineOptions.series = [];

//   runLineChart(selected);
// });

// $("#dv_select").on("change", function () {
//   // User has selected a different DV
//   uniqueDVs = [];
//   allTicketCount = [];
//   barGraphOptions.series = [];
//   barGraphOptions.xAxis.categories = [];
//   var tails = undefined;
//   if ($("#tail_select").val() != "") {
//     tails = $("#tail_select").val();
//   }

//   var dvs = undefined;
//   if ($("#dv_select").val() != "") {
//     dvs = $("#dv_select").val();
//   }
//   var startDate = $("#start_date").val() + "T00:00:00Z";
//   var endDate = $("#end_date").val() + "T23:59:59Z";
//   runChart(dvs, startDate, endDate, tails);
// });

// $("#start_date").change(function () {
//   var tails = undefined;
//   if ($("#tail_select").val() != "") {
//     tails = $("#tail_select").val();
//   }

//   var dvs = undefined;
//   if ($("#dv_select").val() != "") {
//     dvs = $("#dv_select").val();
//   }
//   uniqueDVs = [];
//   allTicketCount = [];
//   barGraphOptions.series = [];
//   barGraphOptions.xAxis.categories = [];
//   var startDate = $("#start_date").val() + "T00:00:00Z";
//   var endDate = $("#end_date").val() + "T23:59:59Z";
//   runChart(dvs, startDate, endDate, tails);
// });

// $("#end_date").change(function () {
//   var tails = undefined;
//   if ($("#tail_select").val() != "") {
//     tails = $("#tail_select").val();
//   }

//   var dvs = undefined;
//   if ($("#dv_select").val() != "") {
//     dvs = $("#dv_select").val();
//   }
//   uniqueDVs = [];
//   allTicketCount = [];
//   barGraphOptions.series = [];
//   barGraphOptions.xAxis.categories = [];
//   var startDate = $("#start_date").val() + "T00:00:00Z";
//   var endDate = $("#end_date").val() + "T23:59:59Z";
//   runChart(dvs, startDate, endDate, tails);
// });

// On page load, settings are blank.

// runChart(undefined, start_date, end_date, undefined);

// var total_overall_tickets = 0;
// function runChart(listOfDvs, startDate, endDate, listOfTails) {
//   // Clear the tickets table is we've already made one, else lets make one.
//   if (!$.fn.DataTable.isDataTable("#overviewTickets")) {
//     $("#overviewTickets").DataTable({
//       dom: "Bfrtip",
//       buttons: ["copy", "csv", "excel", "pdf", "print"],
//       columnDefs: [
//         { width: "150px", targets: [0, 1, 10] },
//         { width: "300px", targets: [8] },
//       ],
//       order: [[0, "desc"]],
//     });
//   } else {
//     $("#overviewTickets").DataTable().clear().draw();
//   }

//   var dvs = [];
//   var ticketsPerDv = [];
//   var dvCheck = false;
//   if (listOfDvs === undefined) {
//     var noDVS = 1;
//     dvs = getAllDvs(startDate, endDate);
//   } else {
//     dvs = listOfDvs;
//     dvCheck = true;
//   }
//   total_overall_tickets = 0;
//   ticketsPerDv = getTicketsPerDV(dvs, startDate, endDate, listOfTails, dvCheck);
//   if (noDVS) getStatTotals(undefined, startDate, endDate);
//   else getStatTotals(dvs, startDate, endDate);

//   var counter = 0;
//   for (var i = 0; i < ticketsPerDv.length; i++) {
//     if (ticketsPerDv[i] == 0) {
//       counter++;
//     }
//   }

//   if (counter == ticketsPerDv.length) {
//     $("#containerGraph").text("No Data Found");
//   } else {
//     var chart = new Highcharts.Chart(barGraphOptions);
//   }
//   //alert(options.series[1].data);
// }

// function getTicketsPerDV(dvArray, startDate, endDate, tails, dvCheck) {
//   var searchText;
//   for (var i = 0; i < dvArray.length; i++) {
//     searchText = dvArray[i];
//     var _count = fetchTicketCount(
//       searchText,
//       startDate,
//       endDate,
//       tails,
//       dvCheck
//     );
//     total_overall_tickets += _count;
//     allTicketCount.push(_count);
//   }
//   $("#total_tickets").text(total_overall_tickets);
//   barGraphOptions.series.push({
//     name: "Tickets",
//     data: allTicketCount,
//   });
//   return allTicketCount;
// }

// function fetchTicketCount(searchItem, startDate, endDate, tails, dvCheck) {
//   var date_specified = 0;
//   var tails_specified = 0;

//   if (startDate === undefined && endDate === undefined && tails === undefined) {
//     // no date no tail
//     var urlLoad =
//       "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('Tickets')/items?$select=DV,Created,GNOC_Ticket_Number,Date_Opened,Tail_Number,Mission_Number,DV_Impact,Impact_Level,Category,Status,Issue_Description,Last_Reported_Action,Update_Date,CCIR,CCIR_Number,CSO&$top=5000&$filter=DV eq '" +
//       encodeURI(searchItem) +
//       "' and Created le '" +
//       endDate +
//       "' and Created ge '" +
//       startDate +
//       "'&$orderby=DV%20asc";
//   }
//   if (startDate !== undefined && endDate !== undefined && tails == undefined) {
//     // date no tail
//     date_specified = 1;
//     var urlLoad =
//       "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('Tickets')/items?$select=DV,Created,GNOC_Ticket_Number,Date_Opened,Tail_Number,Mission_Number,DV_Impact,Impact_Level,Category,Status,Issue_Description,Last_Reported_Action,Update_Date,CCIR,CCIR_Number,CSO&$top=5000&$filter=DV eq '" +
//       encodeURIComponent(searchItem) +
//       "'and Created le '" +
//       endDate +
//       "' and Created ge '" +
//       startDate +
//       "'&$orderby=DV%20asc";
//   }
//   if (startDate !== undefined && endDate !== undefined && tails !== undefined) {
//     // date and tail
//     date_specified = 1;
//     tails_specified = 1;
//     var urlLoad =
//       "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('Tickets')/items?$select=DV,Created,GNOC_Ticket_Number,Date_Opened,Tail_Number,Mission_Number,DV_Impact,Impact_Level,Category,Status,Issue_Description,Last_Reported_Action,Update_Date,CCIR,CCIR_Number,CSO&$top=5000&$filter=DV eq '" +
//       encodeURIComponent(searchItem) +
//       "'and Created le '" +
//       endDate +
//       "' and Created ge '" +
//       startDate +
//       "'&$orderby=DV%20asc";
//   }
//   var myTicketCount = 0;
//   $.ajax({
//     url: urlLoad,
//     async: false,
//     method: "GET",
//     headers: {
//       Accept: "application/json;odata=verbose",
//     },
//     success: function (myData) {
//       if (myData.d.results.length > 0) {
//         if (date_specified == 0 && tails_specified == 0) {
//           // just get all from current DVs
//           /*options.series.push({
//                         name: searchItem,
//                         data: [total]
//                       });*/
//           barGraphOptions.xAxis.categories.push(searchItem);
//           myTicketCount = myData.d.results.length;
//         } else if (date_specified == 1 && tails_specified == 0) {
//           // date specified without tail or DV
//           var total = 0;
//           var arrayOfTimes = [];
//           var allResults = myData.d.results;
//           for (var i = 0; i < Number(allResults.length); i++) {
//             var currentCreateDate = allResults[i].Created;
//             if (arrayOfTimes.includes(currentCreateDate)) {
//               // dont wanna push any duplicates
//             } else {
//               if (
//                 currentCreateDate <= endDate &&
//                 currentCreateDate >= startDate
//               ) {
//                 arrayOfTimes.push(currentTime);
//                 var dateOpened = convertTheDate(allResults[i].Date_Opened, 1);
//                 var dateUpdated = convertTheDate(allResults[i].Update_Date, 1);
//                 if (checkPermissions("VklFVyBNSVNTSU9O", false, false)) {
//                   var missionhref =
//                     '<a href="./viewMission.html?mission=' +
//                     allResults[i].Mission_Number +
//                     '">' +
//                     allResults[i].Mission_Number +
//                     "</a>";
//                 } else {
//                   var missionhref = allResults[i].Mission_Number;
//                 }
//                 if (
//                   allResults[i].Mission_Number == "N/A" ||
//                   allResults[i].Mission_Number == null
//                 ) {
//                   missionhref = "N/A";
//                 }
//                 var href =
//                   '<a href="./viewTicket.html?ticket=' +
//                   allResults[i].GNOC_Ticket_Number +
//                   '">' +
//                   allResults[i].GNOC_Ticket_Number +
//                   "</a>";

//                 $("#overviewTickets")
//                   .DataTable()
//                   .row.add([
//                     href,
//                     dateOpened,
//                     allResults[i].Tail_Number,
//                     missionhref,
//                     allResults[i].DV,
//                     allResults[i].Impact_Level,
//                     allResults[i].Category,
//                     allResults[i].Status,
//                     allResults[i].Issue_Description,
//                     allResults[i].Last_Reported_Action,
//                     dateUpdated,
//                   ])
//                   .draw();
//                 total++;
//               }
//             }
//           }
//           if (total != 0) {
//             /*options.series.push({
//                           name: searchItem,
//                           data: [total]
//                         });*/
//             barGraphOptions.xAxis.categories.push(searchItem);
//           }

//           myTicketCount = total;
//         } else if (date_specified == 1 && tails_specified == 1) {
//           // Tail is specified
//           var total = 0;
//           var arrayOfTimes = [];
//           var allResults = myData.d.results;
//           for (var i = 0; i < Number(allResults.length); i++) {
//             var currentTail = allResults[i].Tail_Number;
//             var currentTime = allResults[i].Created;

//             if (
//               tails.includes(currentTail) &&
//               currentTime <= endDate &&
//               currentTime >= startDate
//             ) {
//               if (arrayOfTimes.includes(currentTime)) {
//               } else {
//                 arrayOfTimes.push(currentTime);
//                 var dateOpened = convertTheDate(allResults[i].Date_Opened, 1);
//                 var dateUpdated = convertTheDate(allResults[i].Update_Date, 1);
//                 var href =
//                   '<a href="./viewTicket.html?ticket=' +
//                   allResults[i].GNOC_Ticket_Number +
//                   '">' +
//                   allResults[i].GNOC_Ticket_Number +
//                   "</a>";
//                 var missionhref =
//                   '<a href="./viewMission.html?mission=' +
//                   allResults[i].Mission_Number +
//                   '">' +
//                   allResults[i].Mission_Number +
//                   "</a>";
//                 $("#overviewTickets")
//                   .DataTable()
//                   .row.add([
//                     href,
//                     dateOpened,
//                     allResults[i].Tail_Number,
//                     missionhref,
//                     allResults[i].DV,
//                     allResults[i].Impact_Level,
//                     allResults[i].Category,
//                     allResults[i].Status,
//                     allResults[i].Issue_Description,
//                     allResults[i].Last_Reported_Action,
//                     dateUpdated,
//                     allResults[i].CCIR_Number,
//                     allResults[i].CSO,
//                   ])
//                   .draw();
//                 total++;
//               }
//             }
//           }
//           if (total != 0) {
//             /*options.series.push({
//                           name: searchItem,
//                           data: [total]
//                         });*/
//             barGraphOptions.xAxis.categories.push(searchItem);
//           }
//           myTicketCount = total;
//         }
//       } else if (dvCheck == true) {
//         barGraphOptions.xAxis.categories.push(searchItem);
//       }
//     },
//     error: function (data) {
//       //alert("Error: " + JSON.stringify(data));
//     },
//   });

//   return myTicketCount;
// }

// // function getStatTotals(dv, start, end, tails) {
// //   var totalCCIR = 0;
// //   var totalMission = 0;
// //   var totalLeg = 0;
// //   if (dv !== undefined) {
// //     for (var i = 0; i < dv.length; i++) {
// //       totalCCIR += getCCIRTotal(dv[i], start, end);
// //       totalMission += getMissionTotal(dv[i], start, end);
// //       totalLeg += getLegTotal(dv[i], start, end);
// //     }
// //   } else {
// //     totalCCIR += getCCIRTotal(undefined, start, end);
// //     totalMission += getMissionTotal(undefined, start, end);
// //     totalLeg += getLegTotal(undefined, start, end);
// //   }

// //   $("#total_ccirs").text(totalCCIR);
// //   $("#total_missions").text(totalMission);
// //   $("#total_legs").text(totalLeg);
// // }

// function getCCIRTotal(dv, start, end) {
//   var total = 0;
//   if (dv !== undefined)
//     var urlLoad =
//       "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('CCIR')/items?$top=5000&$filter=DV eq '" +
//       encodeURI(dv) +
//       "' and Created le '" +
//       end +
//       "' and Created ge '" +
//       start +
//       "'";
//   else
//     var urlLoad =
//       "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('CCIR')/items?$top=5000&$filter=Created le '" +
//       end +
//       "' and Created ge '" +
//       start +
//       "'";
//   $.ajax({
//     url: urlLoad,
//     async: false,
//     method: "GET",
//     headers: {
//       Accept: "application/json;odata=verbose",
//     },
//     success: function (data) {
//       if (data.d.results.length > 0) {
//         total = Number(data.d.results.length);
//       }
//     },
//   });

//   return total;
// }

// function getMissionTotal(dv, start, end) {
//   var missions = [];
//   var total = 0;
//   if (dv !== undefined)
//     var urlLoad =
//       "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('Missions')/items?$top=5000&$filter=DV eq '" +
//       encodeURI(dv) +
//       "' and Created le '" +
//       end +
//       "' and Created ge '" +
//       start +
//       "'";
//   else
//     var urlLoad =
//       "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('Missions')/items?$top=5000&$filter=Created le '" +
//       end +
//       "' and Created ge '" +
//       start +
//       "'";

//   $.ajax({
//     url: urlLoad,
//     async: false,
//     method: "GET",
//     headers: {
//       Accept: "application/json;odata=verbose",
//     },
//     success: function (data) {
//       var allResults = data.d.results;
//       if (data.d.results.length > 0) {
//         for (var i = 0; i < Number(allResults.length); i++) {
//           if (!missions.includes(allResults[i].Mission_Number))
//             missions.push(allResults[i].Mission_Number);
//         }
//       }
//     },
//   });
//   total = missions.length;
//   return total;
// }

// function getLegTotal(dv, start, end) {
//   var total = 0;
//   if (dv !== undefined)
//     var urlLoad =
//       "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('Missions')/items?$top=5000&$filter=DV eq '" +
//       encodeURI(dv) +
//       "' and Created le '" +
//       end +
//       "' and Created ge '" +
//       start +
//       "'";
//   else
//     var urlLoad =
//       "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('Missions')/items?$top=5000&$filter=Created le '" +
//       end +
//       "' and Created ge '" +
//       start +
//       "'";

//   $.ajax({
//     url: urlLoad,
//     async: false,
//     method: "GET",
//     headers: {
//       Accept: "application/json;odata=verbose",
//     },
//     success: function (data) {
//       if (data.d.results.length > 0) {
//         total = Number(data.d.results.length);
//       }
//     },
//   });

//   return total;
// }

// function runLineChart(year) {
//   var dvList = ["POTUS", "VPOTUS", "SECDEF", "SECSTATE", "CJCS"]; // Top 5
//   var startDate;
//   var endDate;
//   if (year === undefined) {
//     var now = new Date();
//     year = now.getFullYear();
//     startDate = year + "-01-01T23:59:59Z";
//     endDate = year + "-12-31T23:59:59Z";
//   } else {
//     startDate = year + "-01-01T23:59:59Z";
//     endDate = year + "-12-31T23:59:59Z";
//   }

//   // Now, per DV, per month we need ticket counts my guy:

//   for (var i = 0; i < dvList.length; i++) {
//     var searchItem = dvList[i];
//     var urlLoad =
//       "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('Tickets')/items?$select=DV,Created&$top=5000&$filter=DV eq '" +
//       encodeURI(searchItem) +
//       "'";
//     $.ajax({
//       url: urlLoad,
//       async: false,
//       method: "GET",
//       headers: {
//         Accept: "application/json;odata=verbose",
//       },
//       success: function (data) {
//         var total = 0;
//         var arrayOfTimes = [];
//         var allResults = data.d.results;
//         if (Number(allResults.length) > 0) {
//           //alert("success");

//           for (var n = 0; n < Number(allResults.length); n++) {
//             // so we put all the times of this DV's tickets in an array for post processing
//             var currentTime = allResults[n].Created;

//             if (arrayOfTimes.includes(currentTime)) {
//               // this is to make sure no duplicates are included.
//             } else {
//               arrayOfTimes.push(currentTime);
//             }
//           }

//           var yearlyTicketNumbers = [];
//           // Now we need to loop, per month.
//           for (var j = 1; j < 13; j++) {
//             total = 0;
//             if (j < 10) {
//               var currentMonth = "0" + j;
//             } else {
//               var currentMonth = j;
//             }

//             var startDate = year + "-" + currentMonth + "-01T23:59:59Z";
//             var endDate = year + "-" + currentMonth + "-31T23:59:59Z";

//             for (var k = 0; k < arrayOfTimes.length; k++) {
//               if (arrayOfTimes[k] <= endDate && arrayOfTimes[k] >= startDate) {
//                 total++;
//               }
//             }
//             yearlyTicketNumbers.push(total);
//           }
//           lineOptions.series.push({
//             name: searchItem,
//             data: yearlyTicketNumbers,
//           });
//         }
//       },
//       error: function (data) {
//         //alert("Error: " + JSON.stringify(data));
//       },
//     });
//   }
//   var lineChart = new Highcharts.Chart(lineOptions);
// }
