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
    style: {
      color: "#FFF",
    },
  },
  subtitle: {
    text: "current year",
    align: "left",
    style: {
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
      text: " Tickets",
      style: {
        color: "#FFF",
      },
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
    itemStyle: {
      color: "#FFF",
    },
  },
  lang: {
    noData: "No Data Found",
  },
  noData: {
    style: {
      fontWeight: "bold",
      fontSize: "15px",
      color: "#FFF",
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
  if (i == currentYear) $("#year_select").val(currentYear);
  $(".selectpicker").selectpicker("refresh");
}

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
      if (!listOfTails.includes(items[item].Tail_Number)) continue;
    }

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

  const [ticketsPerDv, statTotals] = await Promise.all([
    getTotalTicketsPerDv(startDate, endDate, listOfDvs, listOfTails),
    getStatTotals(startDate, endDate, listOfDvs),
  ]);

  let counter = 0;
  for (let ticketCount in ticketsPerDv) {
    if (ticketsPerDv[ticketCount] === 0) counter++;
  }

  if (counter == ticketsPerDv.length)
    document.getElementById("containerGraph").innerHTML = "No Data Found";
  else new Highcharts.Chart(barGraphOptions);

  loadingIndicator.style.display = "none";
  return;
};

const getDaysInMonth = (month, year) => {
  return new Date(year, month, 0).getDate();
};

const dvTicketAmountsPerMonth = async (selectedYear, Dv) => {
  // Looping through month
  let dvMonthlyTicketTotals = [];
  for (let month = 1; month < 13; month++) {
    const filterStartDate = `${selectedYear}-${
      month < 10 ? "0" + month : month
    }-01T00:00:00Z`;
    const filterEndDate = `${selectedYear}-${
      month < 10 ? "0" + month : month
    }-${getDaysInMonth(month, selectedYear)}T23:59:59Z`;
    const fetchUrl = `${HOST_URL}/_api/web/lists/getbytitle('${TICKETS_LIST_NAME}')/items?$top=5000&$filter=DV eq '${encodeURIComponent(
      Dv
    )}' and Created le datetime'${encodeURIComponent(
      filterEndDate
    )}' and Created ge datetime'${encodeURIComponent(filterStartDate)}'`;
    const response = await fetch(fetchUrl, {
      headers: { Accept: "application/json; odata=verbose" },
      credentials: "include",
    });
    const data = await response.json();
    if (data.d) {
      const itemsLength = data.d.results.length;
      dvMonthlyTicketTotals.push(itemsLength);
    } else dvMonthlyTicketTotals.push(0);
  }
  return dvMonthlyTicketTotals;
};

const runLineChart = async (selectedYear) => {
  const loadingIndicator = document.getElementById("loading_results");
  loadingIndicator.style.display = "block";

  const staticDvList = ["POTUS", "VPOTUS", "SECDEF", "SECSTATE", "CJCS"]; // Top 5 DVs only
  const startDate = `${selectedYear}-01-01T00:00:00Z`;
  const endDate = `${selectedYear}-12-31T23:59:59Z`;
  const lineChartColors = [
    "#00bc8c",
    "#BD002F",
    "#BD8E00",
    "#227D92",
    "#515397",
  ];

  for (let dv in staticDvList) {
    const dvMonthlyTicketTotals = await dvTicketAmountsPerMonth(
      selectedYear,
      staticDvList[dv]
    );
    lineOptions.series.push({
      name: staticDvList[dv],
      data: dvMonthlyTicketTotals,
      color: lineChartColors[dv],
    });
  }
  const lineChart = new Highcharts.Chart(lineOptions);

  loadingIndicator.style.display = "none";

  return;
};

const runInitialCharts = async () => {
  return await Promise.all([
    gatherData(chartStartDateISO, chartEndDateISO),
    runLineChart(currentYear),
  ]);
};
runInitialCharts();

/* Event Handlers */
document.querySelector("#tail_select").addEventListener("change", (event) => {
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

document.querySelector("#year_select").addEventListener("change", (event) => {
  const selectedYear = event.target.value;
  lineOptions.subtitle.text = selectedYear;
  lineOptions.series = [];
  runLineChart(selectedYear);
});
