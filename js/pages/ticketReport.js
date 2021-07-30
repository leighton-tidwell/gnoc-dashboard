import { HOST_URL } from "../modules/constants.js";
import { convertDateToTicketHTMLString } from "../modules/utility.js";
import permissionsCheck from "../modules/userPermissionsCheck.js";
const TICKETS_LIST_NAME = "Tickets";
const MASTER_TICKETS_LIST = "masterTickets";
const UPDATE_LIST = "ticketUpdates";
permissionsCheck("MjQgSE9VUiBSRVBPUlQ=");
feather.replace();

var now = new Date();
var yesterday = new Date();
var day = ("0" + now.getDate()).slice(-2);
yesterday.setDate(now.getDate() - 1);
var previousDay = ("0" + yesterday.getDate()).slice(-2);
var month = ("0" + (now.getMonth() + 1)).slice(-2);
var previousMonth = ("0" + (yesterday.getMonth() + 1)).slice(-2);

var startDate =
  now.getFullYear() + "-" + previousMonth + "-" + previousDay + "T13:00:00Z";
var endDate = now.getFullYear() + "-" + month + "-" + day + "T13:00:00Z";

// Set start and end date
document.getElementById("start_date").innerHTML = startDate;
document.getElementById("end_date").innerHTML = endDate;

// Create Modified Ticket Table
$("#listModifiedTickets").DataTable({
  dom: "Pfrtip",
  columnDefs: [
    { width: "200px", targets: [0] },
    { width: "50px", targets: [1] },
    { width: "400px", targets: [6] },
  ],
  searching: false,
  paging: false,
  info: false,
  order: [[0, "desc"]],
});

// Create Open Ticket Table
$("#listOpenTickets").DataTable({
  dom: "Pfrtip",
  columnDefs: [
    { width: "200px", targets: [0] },
    { width: "50px", targets: [1] },
    { width: "100px", targets: [2] },
    { width: "400px", targets: [5] },
  ],
  order: [[0, "desc"]],
  searching: false,
  paging: false,
  info: false,
});

// Create Fixed Ticket Table
$("#listFixedTickets").DataTable({
  dom: "Pfrtip",
  columnDefs: [
    { width: "200px", targets: [0] },
    { width: "50px", targets: [1] },
    { width: "100px", targets: [2] },
    { width: "400px", targets: [5] },
  ],
  order: [[0, "desc"]],
  searching: false,
  paging: false,
  info: false,
});

// Create Closed Ticket Table
$("#listClosedTickets").DataTable({
  dom: "Pfrtip",
  columnDefs: [
    { width: "200px", targets: [0] },
    { width: "50px", targets: [1] },
    { width: "400px", targets: [5, 6] },
  ],
  searching: false,
  paging: false,
  info: false,
  order: [[0, "desc"]],
});

const grabAllTickets = async (startDate, endDate) => {
  const response = await fetch(
    `${HOST_URL}/_api/web/lists/getbytitle('${TICKETS_LIST_NAME}')/items?$top=5000&$filter=Created le '${endDate}' and Created ge '${startDate}'`,
    {
      headers: { Accept: "application/json; odata=verbose" },
      credentials: "include",
    }
  );
  const data = await response.json();
  const items = data.d.results || [];
  return items;
};

const grabAllUpdatedTickets = async (startDate, endDate) => {
  const response = await fetch(
    `${HOST_URL}/_api/web/lists/getbytitle('${TICKETS_LIST_NAME}')/items?$top=5000&$filter=Update_Date le '${endDate}' and Update_Date ge '${startDate}'`,
    {
      headers: { Accept: "application/json; odata=verbose" },
      credentials: "include",
    }
  );
  const data = await response.json();
  const items = data.d.results || [];
  return items;
};

const grabAllUpdates = async (startDate, endDate) => {
  const response = await fetch(
    `${HOST_URL}/_api/web/lists/getbytitle('${UPDATE_LIST}')/items?$top=5000&$filter=Created le '${endDate}' and Created ge '${startDate}'`,
    {
      headers: { Accept: "application/json; odata=verbose" },
      credentials: "include",
    }
  );
  const data = await response.json();
  const items = data.d.results || [];
  return items;
};

const generateUpdatedTicketTable = async (ticketList) => {
  for (let ticket in ticketList) {
    const ticketHref = `<a href="./viewTicket.html?ticket=${ticketList[ticket].GNOC_Ticket_Number}">${ticketList[ticket].GNOC_Ticket_Number}</a>`;
    const missionHref =
      ticketList[ticket].Mission_Number == null
        ? "N/A"
        : `<a href="./viewMission.html?mission=${ticketList[ticket].Mission_Number}">${ticketList[ticket].Mission_Number}</a>`;
    if (
      ticketList[ticket].Last_Reported_Action !== null &&
      ticketList[ticket].Status != "FIXED" &&
      ticketList[ticket].Status != "CLOSED"
    ) {
      $("#listModifiedTickets")
        .DataTable()
        .row.add([
          ticketHref,
          ticketList[ticket].Tail_Number,
          missionHref,
          ticketList[ticket].DV,
          ticketList[ticket].Impact_Level,
          ticketList[ticket].Status,
          ticketList[ticket].Last_Reported_Action,
        ])
        .draw();
    }
  }
};

const generateFixedTicketTable = async (updateList) => {
  for (let update in updateList) {
    const updateMessage = updateList[update].update;
    const searchString = `GNOC set ticket #${updateList[update].ticket_number} to FIXED.`;
    if (updateMessage !== searchString) continue;

    const response = await fetch(
      `${HOST_URL}/_api/web/lists/getbytitle('${TICKETS_LIST_NAME}')/items?$top=5000&$filter=GNOC_Ticket_Number eq '${updateList[update].ticket_number}'`,
      {
        headers: { Accept: "application/json; odata=verbose" },
        credentials: "include",
      }
    );
    const data = await response.json();
    const item = data.d.results[0] || "";
    if (!item) continue;

    const ticketHref = `<a href="./viewTicket.html?ticket=${item.GNOC_Ticket_Number}">${item.GNOC_Ticket_Number}</a>`;
    const missionHref =
      item.Mission_Number == null
        ? "N/A"
        : `<a href="./viewMission.html?mission=${item.Mission_Number}">${item.Mission_Number}</a>`;

    $("#listFixedTickets")
      .DataTable()
      .row.add([
        ticketHref,
        item.Tail_Number,
        missionHref,
        item.DV,
        item.Impact_Level,
        item.Issue_Description,
        item.Last_Reported_Action,
      ])
      .draw();
  }
};

const generateOpenTicketTable = async (ticketList) => {
  for (let ticket in ticketList) {
    const ticketHref = `<a href="./viewTicket.html?ticket=${ticketList[ticket].GNOC_Ticket_Number}">${ticketList[ticket].GNOC_Ticket_Number}</a>`;
    const missionHref =
      ticketList[ticket].Mission_Number == null
        ? "N/A"
        : `<a href="./viewMission.html?mission=${ticketList[ticket].Mission_Number}">${ticketList[ticket].Mission_Number}</a>`;
    const ccir = ticketList[ticket].CCIR == false ? "No" : "Yes";

    $("#listOpenTickets")
      .DataTable()
      .row.add([
        ticketHref,
        ticketList[ticket].Tail_Number,
        missionHref,
        ticketList[ticket].DV,
        ticketList[ticket].Impact_Level,
        ticketList[ticket].Issue_Description,
        ccir,
      ])
      .draw();
  }
};

const generateClosedTicketTable = async (updateList) => {
  for (let update in updateList) {
    const updateMessage = updateList[update].update;
    const searchString = `GNOC set ticket #${updateList[update].ticket_number} to CLOSED.`;
    if (updateMessage !== searchString) continue;

    const response = await fetch(
      `${HOST_URL}/_api/web/lists/getbytitle('${TICKETS_LIST_NAME}')/items?$top=5000&$filter=GNOC_Ticket_Number eq '${updateList[update].ticket_number}'`,
      {
        headers: { Accept: "application/json; odata=verbose" },
        credentials: "include",
      }
    );
    const data = await response.json();
    const item = data.d.results[0] || "";
    if (!item) continue;

    const ticketHref = `<a href="./viewTicket.html?ticket=${item.GNOC_Ticket_Number}">${item.GNOC_Ticket_Number}</a>`;
    const missionHref =
      item.Mission_Number == null
        ? "N/A"
        : `<a href="./viewMission.html?mission=${item.Mission_Number}">${item.Mission_Number}</a>`;

    $("#listClosedTickets")
      .DataTable()
      .row.add([
        ticketHref,
        item.Tail_Number,
        missionHref,
        item.DV,
        item.Impact_Level,
        item.Issue_Description,
        item.Last_Reported_Action,
      ])
      .draw();
  }
};

const generateTables = async (startDate, endDate) => {
  const [listOfTickets, listOfUpdatedTickets, updateList] = await Promise.all([
    grabAllTickets(startDate, endDate),
    grabAllUpdatedTickets(startDate, endDate),
    grabAllUpdates(startDate, endDate),
  ]);

  await Promise.all([
    generateOpenTicketTable(listOfTickets),
    generateFixedTicketTable(updateList),
    generateClosedTicketTable(updateList),
    generateUpdatedTicketTable(listOfUpdatedTickets),
  ]);
};

generateTables(startDate, endDate);

const generateCanvas = (i, doc, deferred) => {
  if (i == 0) i = "header";
  if (i == 1) i = "modified";
  if (i == 2) i = "open";
  if (i == 3) i = "fixed";
  if (i == 4) i = "closed";
  html2canvas(document.getElementById(i), {
    quality: 4,
    scale: 5,
    onrendered: (canvas) => {
      let img = canvas.toDataURL();
      //console.log(doc.internal.pageSize.getWidth());
      //console.log(doc.internal.pageSize.getHeight());

      let width = doc.getImageProperties(img);
      //console.log(canvas.width + " x " + canvas.height);
      doc.text(45, 60, $("#header").text());
      doc.addImage(
        img,
        "PNG",
        40,
        70,
        canvas.width * 0.35,
        canvas.height * 0.35
      );
      doc.addPage();

      deferred.resolve();
    },
  });
};

/* Event Handlers */

// Generate PDF
document.querySelector("#genpdf").addEventListener("click", (event) => {
  let deferreds = [];
  const doc = new jsPDF("p", "pt", "letter");
  for (let i = 1; i < 5; i++) {
    let deferred = $.Deferred();
    deferreds.push(deferred.promise());
    generateCanvas(i, doc, deferred);
  }

  $.when.apply($, deferreds).then(function () {
    // executes after adding all images
    doc.save($("#header").text().trim() + ".pdf");
  });
});
