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
const BEAM_LIST_NAME = "Viasat_Beams";
feather.replace();
permissionsCheck("REFTSEJPQVJE");

let barGraphOptions = {
  chart: {
    renderTo: "containerGraph",
    type: "bar",
    events: {
      redraw: true,
    },
  },
  title: {
    text: "Tickets per Beam",
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

// Set Datatables time settings
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

const getListOfBeamsWithTickets = async (startDate, endDate) => {
  let listOfBeams = [];
  let listOfTickets = [];

  const response = await fetch(
    `${HOST_URL}/_api/web/lists/getbytitle('${TICKETS_LIST_NAME}')/items?$filter=Created le datetime'${encodeURIComponent(
      endDate
    )}' and Created ge datetime'${encodeURIComponent(
      startDate
    )}'&top=5000&$orderby=Beam asc`,
    {
      headers: { Accept: "application/json; odata=verbose" },
      credentials: "include",
    }
  );

  const data = await response.json();
  const items = data.d.results || [];
  for (let item in items) {
    if (items[item].Beam !== null && items[item].Beam !== undefined) {
      listOfTickets.push(items[item]);
      if (!listOfBeams.includes(items[item].Beam))
        listOfBeams.push(items[item].Beam);
    }
  }

  return [listOfBeams, listOfTickets];
};

const getTicketsForBeam = async (startDate, endDate, selectedBeam) => {
  const response = await fetch(
    `${HOST_URL}/_api/web/lists/getbytitle('${TICKETS_LIST_NAME}')/items?$filter=Beam eq '${encodeURIComponent(
      selectedBeam
    )}' and Created le datetime'${encodeURIComponent(
      endDate
    )}' and Created ge datetime'${encodeURIComponent(startDate)}'&top=5000`,
    {
      headers: { Accept: "application/json; odata=verbose" },
      credentials: "include",
    }
  );

  const data = await response.json();
  const items = data.d.results || [];

  if (items.length) barGraphOptions.xAxis.categories.push(selectedBeam);

  return items.length;
};

const createTicketTable = async (listOfTickets) => {
  for (let ticket in listOfTickets) {
    const currentTicket = listOfTickets[ticket];
    const dateOpened = convertDateToTicketHTMLString(currentTicket.Date_Opened);
    const missionHref =
      currentTicket.Mission_Number !== null ||
      currentTicket.Mission_Number !== undefined
        ? `<a href="./viewMission.html?mission=${currentTicket.Mission_Number}">${currentTicket.Mission_Number}</a>`
        : "N/A";
    const ticketHref = `<a href="./viewTicket.html?ticket=${currentTicket.GNOC_Ticket_Number}">${currentTicket.GNOC_Ticket_Number}</a>`;
    $("#beamTickets")
      .DataTable()
      .row.add([
        ticketHref,
        dateOpened,
        currentTicket.Tail_Number,
        missionHref,
        currentTicket.DV,
        currentTicket.Impact_Level,
        currentTicket.Category,
        currentTicket.Status,
        currentTicket.Issue_Description,
        currentTicket.Beam,
      ])
      .draw();
  }
};

const getTicketTotalsPerBeam = async (startDate, endDate, listOfBeams) => {
  let ticketsForAllBeams = [];
  for (let beam in listOfBeams) {
    const ticketsForBeam = await getTicketsForBeam(
      startDate,
      endDate,
      listOfBeams[beam]
    );
    if (ticketsForBeam) ticketsForAllBeams.push(ticketsForBeam);
  }

  barGraphOptions.series.push({
    name: "Tickets",
    data: ticketsForAllBeams,
    color: "#00bc8c",
    borderWidth: 0,
  });

  return ticketsForAllBeams;
};

const gatherData = async (startDate, endDate) => {
  if (!$.fn.DataTable.isDataTable("#beamTickets")) {
    $("#beamTickets").DataTable({
      dom: "Bfrtip",
      buttons: ["copy", "csv", "excel", "pdf", "print"],
      order: [[0, "desc"]],
    });
  } else {
    $("#beamTickets").DataTable().clear().draw();
  }

  const [listOfBeams, listOfTickets] = await getListOfBeamsWithTickets(
    startDate,
    endDate
  );
  await Promise.all([
    createTicketTable(listOfTickets),
    getTicketTotalsPerBeam(startDate, endDate, listOfBeams),
  ]);

  if (listOfTickets.length === 0)
    document.getElementById("containerGraph").innerHTML = "No Data Found";
  else new Highcharts.Chart(barGraphOptions);
};

gatherData(chartStartDateISO, chartEndDateISO);

/* Event Handlers */

document.querySelector("#start_date").addEventListener("change", (event) => {
  barGraphOptions.series = [];
  barGraphOptions.xAxis.categories = [];

  const startDate = `${document.getElementById("start_date").value}T00:00:00Z`;
  const endDate = `${document.getElementById("end_date").value}T23:59:59Z`;

  gatherData(startDate, endDate);
});

document.querySelector("#end_date").addEventListener("change", (event) => {
  barGraphOptions.series = [];
  barGraphOptions.xAxis.categories = [];

  const startDate = `${document.getElementById("start_date").value}T00:00:00Z`;
  const endDate = `${document.getElementById("end_date").value}T23:59:59Z`;

  gatherData(startDate, endDate);
});
