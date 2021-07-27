import { HOST_URL } from "../modules/constants.js";
import { convertDateToTicketHTMLString } from "../modules/utility.js";
import permissionsCheck from "../modules/userPermissionsCheck.js";
const TICKETS_LIST_NAME = "Tickets";
const PERMISSIONS_LIST_NAME = "permissions";
const UPDATES_LIST_NAME = "ticketUpdates";
feather.replace();
permissionsCheck("UEVSU09OTkVMIFNUQVRT");

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

// Set up datatables with moment
$.fn.dataTable.moment("MM/DD/YYYY HH:mmZ");

const getPersonnelList = async () => {
  const response = await fetch(
    `${HOST_URL}/_api/web/lists/getbytitle('${PERMISSIONS_LIST_NAME}')/items?$orderby=user asc`,
    {
      headers: { Accept: "application/json; odata=verbose" },
      credentials: "include",
    }
  );
  const data = await response.json();
  const items = data.d.results || [];
  return items;
};

const processPersonnelListDropDown = async (personnelList) => {
  const operatorSelect = document.getElementById("operator");
  for (let person in personnelList) {
    const currentPerson = personnelList[person];

    let personOption = document.createElement("option");
    personOption.value = currentPerson.user;

    const namesOfPerson = currentPerson.user.split(".");
    const formattedNameOfPerson = `${namesOfPerson[0]} ${
      namesOfPerson[1].split("@")[0]
    }`.toUpperCase();
    personOption.innerHTML = formattedNameOfPerson;
    operatorSelect.appendChild(personOption);
  }
  $(".selectpicker").selectpicker("refresh");
  return true;
};

const grabOperatorTickets = async (selectedOperator, startDate, endDate) => {
  const response = await fetch(
    `${HOST_URL}/_api/web/lists/getbytitle('${TICKETS_LIST_NAME}')/items?$select=Author/EMail,DV,Created,GNOC_Ticket_Number,Date_Opened,Tail_Number,Mission_Number,DV_Impact,Impact_Level,Category,Status,Issue_Description,Last_Reported_Action,Update_Date,CCIR,CCIR_Number,CSO&$top=5000&$filter=Author/EMail eq '${selectedOperator}' and Created le '${endDate}' and Created ge '${startDate}'&$expand=Author`,
    {
      headers: { Accept: "application/json; odata=verbose" },
      credentials: "include",
    }
  );
  const data = await response.json();
  const items = data.d.results || [];
  return items;
};

const grabOperatorUpdates = async (selectedOperator, startDate, endDate) => {
  const response = await fetch(
    `${HOST_URL}/_api/web/lists/getbytitle('${UPDATES_LIST_NAME}')/items?$select=Author/EMail,ticket_number,update&$top=5000&$filter=Author/EMail eq '${selectedOperator}' and Created le '${endDate}' and Created ge '${startDate}'&$expand=Author`,
    {
      headers: { Accept: "application/json; odata=verbose" },
      credentials: "include",
    }
  );
  const data = await response.json();
  const items = data.d.results || [];
  return items;
};

const processTotalStats = async (startDate, endDate) => {
  const listOfOperators = await getPersonnelList();
  await processPersonnelListDropDown(listOfOperators);

  // Generate DataTable object
  if (!$.fn.DataTable.isDataTable("#operators")) {
    $("#operators").DataTable({
      dom: "Bfrtip",
      buttons: ["copy", "csv", "excel", "pdf", "print"],
      columnDefs: [],
      order: [[3, "desc"]],
    });
  } else {
    $("#operators").DataTable().clear().draw();
  }

  // Loop through operators
  for (let operator in listOfOperators) {
    const operatorStats = await processStatsFor(
      listOfOperators[operator].user,
      startDate,
      endDate,
      true
    );
    const operatorName = listOfOperators[operator].user;
    const operatorNamesArray = operatorName.split(".");
    const formattedNameOfPerson = `${operatorNamesArray[0]} ${
      operatorNamesArray[1].split("@")[0]
    }`.toUpperCase();
    $("#operators")
      .DataTable()
      .row.add([
        formattedNameOfPerson,
        operatorStats.opened,
        operatorStats.updated,
        operatorStats.fixed,
        operatorStats.closed,
      ])
      .draw();
  }

  const formLoader = document.getElementById("total_loader");
  formLoader.style.display = "none";
};

processTotalStats(chartStartDateISO, chartEndDateISO);

const processStatsFor = async (
  selectedOperator,
  startDate,
  endDate,
  skipPopulate
) => {
  if (!selectedOperator) return;

  const [operatorTickets, operatorUpdates] = await Promise.all([
    grabOperatorTickets(selectedOperator, startDate, endDate),
    grabOperatorUpdates(selectedOperator, startDate, endDate),
  ]);
  if (!skipPopulate) {
    // clear operator table to make it obvious we are selecting one operator
    if ($.fn.DataTable.isDataTable("#operators"))
      $("#operators").DataTable().clear().draw();

    // set total ticket number
    document.getElementById("total_tickets").innerHTML = operatorTickets.length;

    for (let ticket in operatorTickets) {
      const currentTicket = operatorTickets[ticket];
      const ticketNumber = currentTicket.GNOC_Ticket_Number;
      const ticketHref = `<a href="./viewTicket.html?ticket=${ticketNumber}">${ticketNumber}</a>`;
      const dateOpened = convertDateToTicketHTMLString(
        currentTicket.Date_Opened
      );
      const ticketTailNumber = currentTicket.Tail_Number || "N/A";
      const ticketMissionNumber = currentTicket.Mission_Number || "N/A";
      const ticketDv = currentTicket.DV;
      const ticketStatus = currentTicket.Status;
      const ticketSummary = currentTicket.Issue_Description;

      $("#ticketsTable")
        .DataTable()
        .row.add([
          dateOpened,
          ticketNumber,
          ticketTailNumber,
          ticketMissionNumber,
          ticketDv,
          ticketStatus,
          ticketSummary,
        ])
        .draw();
    }
  }

  // Establish Update stats
  let userStats = { opened: 0, closed: 0, fixed: 0, updated: 0 };
  for (let update in operatorUpdates) {
    const currentUpdate = operatorUpdates[update];
    const updateString = currentUpdate.update;
    const updatedTicket = currentUpdate.ticket_number;

    const createdString = `GNOC created ticket #${updatedTicket}.`;
    const openString = `GNOC set ticket #${updatedTicket} to OPEN.`;
    const fixedString = `GNOC set ticket #${updatedTicket} to FIXED.`;
    const closedString = `GNOC set ticket #${updatedTicket} to CLOSED.`;
    const assignedString = `GNOC set ticket #${updatedTicket} to ASSIGNED.`;

    if (updateString === createdString) {
      userStats.opened++;
      continue;
    }

    if (updateString === closedString) {
      userStats.closed++;
      continue;
    }

    if (updateString === fixedString) {
      userStats.fixed++;
      continue;
    }

    if (updateString !== assignedString && updateString !== createdString) {
      userStats.updated++;
      continue;
    }
  }

  if (skipPopulate) return userStats;

  // set stats
  document.getElementById("total_updates").innerHTML = userStats.updated;
  document.getElementById("total_closed").innerHTML = userStats.closed;

  const formLoader = document.getElementById("operator_loader");
  formLoader.style.display = "none";
};

/* Event Handlers */

// Change the Dates
document.querySelector("#start_date").addEventListener("change", (event) => {
  const startDate = `${document.getElementById("start_date").value}T00:00:00Z`;
  const endDate = `${document.getElementById("end_date").value}T23:59:59Z`;
  const selectedOperator = document.getElementById("operator").value;

  const formLoader = document.getElementById("total_loader");
  formLoader.style.display = "block";

  const operatorLoader = document.getElementById("operator_loader");
  operatorLoader.style.display = "block";

  $("#ticketsTable").DataTable().clear().draw();

  processStatsFor(selectedOperator, startDate, endDate);
  processTotalStats(startDate, endDate);
});

document.querySelector("#end_date").addEventListener("change", (event) => {
  const startDate = `${document.getElementById("start_date").value}T00:00:00Z`;
  const endDate = `${document.getElementById("end_date").value}T23:59:59Z`;
  const selectedOperator = document.getElementById("operator").value;

  const formLoader = document.getElementById("total_loader");
  formLoader.style.display = "block";

  const operatorLoader = document.getElementById("operator_loader");
  operatorLoader.style.display = "block";

  $("#ticketsTable").DataTable().clear().draw();

  processStatsFor(selectedOperator, startDate, endDate);
  processTotalStats(startDate, endDate);
});

// Change Operator
document.querySelector("#operator").addEventListener("change", (event) => {
  const startDate = `${document.getElementById("start_date").value}T00:00:00Z`;
  const endDate = `${document.getElementById("end_date").value}T23:59:59Z`;
  const selectedOperator = document.getElementById("operator").value;

  const operatorLoader = document.getElementById("operator_loader");
  operatorLoader.style.display = "block";

  $("#ticketsTable").DataTable().clear().draw();

  processStatsFor(selectedOperator, startDate, endDate);
});
