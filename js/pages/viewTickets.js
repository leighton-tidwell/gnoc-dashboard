import { HOST_URL } from "../modules/constants.js";
import { convertDateToTicketHTMLString } from "../modules/utility.js";
import permissionsCheck from "../modules/userPermissionsCheck.js";
const MASTER_TICKETS_LIST_NAME = "masterTickets";
const TICKETS_LIST_NAME = "Tickets";
feather.replace();
permissionsCheck("VklFVyBUSUNLRVRT");

// const options = {
//   valueNames: [
//     "ticket_number",
//     "date_opened",
//     "tail_number",
//     "mission_number",
//     "dv",
//     "dv_impact",
//     "category",
//     "status",
//     "issue_description",
//     "latest_update",
//     "update_date",
//   ],
//   item: "<tr><td class='ticket_number'></td><td class='date_opened'></td><td class='tail_number'></td><td class='mission_number'></td><td class='dv'></td><td class='dv_impact'></td><td class='category'></td><td class='status'></td><td class='issue_description'></td><td class='latest_update'></td><td class='update_date'></td></tr>",
// };
// const ticketList = new List("listTickets", options);

// Populate Tickets Table
fetch(
  `${HOST_URL}/_api/web/lists/getbytitle('${TICKETS_LIST_NAME}')/items?$top=500&$orderby=Created desc`,
  {
    headers: { Accept: "application/json; odata=verbose" },
    credentials: "include",
  }
)
  .then((response) => response.json())
  .then((data) => {
    // Create Ticket Table
    $.fn.dataTable.moment("MM/DD/YYYY HH:mmZ");
    $("#listTickets").DataTable({
      dom: "Bfrtip",
      buttons: ["copy", "csv", "excel", "pdf", "print"],
      columnDefs: [
        { width: "150px", targets: [0] },
        { width: "135px", targets: [1] },
        { width: "300px", targets: [8] },
      ],
      order: [[0, "desc"]],
      pageLength: 10,
      processing: true,
      language: {
        processing: "Loading...",
      },
    });

    const loader = document.getElementById("tickets_loader");
    loader.style.display = "none";

    const items = data.d.results;
    items.forEach((item) => {
      const href = `<a href="./viewTicket.html?ticket=${item.GNOC_Ticket_Number}">${item.GNOC_Ticket_Number}</a>`;
      const missionHref =
        item.Mission_Number != null || item.Mission_Number != "N/A"
          ? `<a href="./viewMission.html?mission=${item.Mission_Number}">${item.Mission_Number}</a>`
          : "N/A";
      const dateString = convertDateToTicketHTMLString(item.Date_Opened);
      const updateDateString = convertDateToTicketHTMLString(item.Update_Date);

      $("#listTickets")
        .DataTable()
        .row.add([
          href,
          dateString,
          item.Tail_Number,
          missionHref,
          item.DV,
          item.Impact_Level,
          item.Category,
          item.Status,
          item.Issue_Description,
          item.Last_Reported_Action,
          updateDateString,
        ])
        .draw();
    });
  })
  .catch((error) => {
    console.error("Error:", error);
  });

// Get All of the master Tickets
fetch(
  `${HOST_URL}/_api/web/lists/getbytitle('${MASTER_TICKETS_LIST_NAME}')/items?$top=200`,
  {
    headers: { Accept: "application/json; odata=verbose" },
    credentials: "include",
  }
)
  .then((response) => response.json())
  .then((data) => {
    // Create Master Ticket Table
    $("#listMasterTickets").DataTable({
      dom: "Bfrtip",
      buttons: ["copy", "csv", "excel", "pdf", "print"],
      columnDefs: [{ width: "300px", targets: [2, 3] }],
      order: [[0, "desc"]],
      pageLength: 2,
    });

    const loader = document.getElementById("master_tickets_loader");
    loader.style.display = "none";

    const items = data.d.results;
    items.forEach((item) => {
      const ticketNumber = `<a href="./viewMasterTTS.html?ticket=${item.Id}">${item.Title}</a>`;
      const dateString = convertDateToTicketHTMLString(item.Created);
      let href = "";
      if (item.ticket_list != null) {
        const tickets_attached = item.ticket_list.split(",");
        for (let j = 0; j < tickets_attached.length; j++) {
          href = `${href}<a href="./viewTicket.html?ticket=${tickets_attached[j]}">${tickets_attached[j]}</a>, `;
        }
      }

      $("#listMasterTickets")
        .DataTable()
        .row.add([
          ticketNumber,
          dateString,
          href,
          item.issue_description,
          item.status,
        ])
        .draw();
    });
  })
  .catch((error) => {
    console.error("Error:", error);
  });

// function convertDate(date, offset) {
//   var convertDate = new Date(date);
//   var month = convertDate.getUTCMonth();
//   month = ("0" + (convertDate.getMonth() + 1)).slice(-2)

//   var date = convertDate.getDate();
//   if (convertDate.getDate() < 10)
//     date = "0" + convertDate.getDate();

//   var minutes = convertDate.getUTCMinutes();
//   if (convertDate.getUTCMinutes() < 10)
//     minutes = "0" + convertDate.getUTCMinutes();

//   var t = new Date();
//   if (offset == 1) {
//     var currentoffset = convertDate.getTimezoneOffset() * 60000;
//     convertDate.setTime(convertDate.getTime() + currentoffset);
//   }
//   var hours = convertDate.getHours();

//   if (convertDate.getHours() < 10)
//     hours = "0" + hours;

//   return dateString = month + "/" + date + "/" + convertDate.getFullYear() + " " + hours + ":" + minutes + "Z";
// }
