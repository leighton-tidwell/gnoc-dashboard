import { HOST_URL } from "../modules/constants.js";
import { convertDateToTicketHTMLString } from "../modules/utility.js";
import permissionsCheck from "../modules/userPermissionsCheck.js";
const MISSIONS_LIST_NAME = "Missions";
feather.replace();
permissionsCheck("VklFVyBGTElHSFQgVElDS0VUUw==");

// Populate Tickets Table
fetch(
  `${HOST_URL}/_api/web/lists/getbytitle('${MISSIONS_LIST_NAME}')/items?$top=500&$orderby=Created desc`,
  {
    headers: { Accept: "application/json; odata=verbose" },
    credentials: "include",
  }
)
  .then((response) => response.json())
  .then((data) => {
    // Create Missions Table
    $.fn.dataTable.moment("MM/DD/YYYY HH:mm");

    $("#listTickets").DataTable({
      dom: "Bfrtip",
      buttons: ["copy", "csv", "excel", "pdf", "print"],
      order: [[7, "desc"]],
    });

    const loader = document.getElementById("missions_loader");
    loader.style.display = "none";

    const items = data.d.results;
    items.forEach((item) => {
      const href = `<a href="./viewFlightTicket.html?ticket=${item.Id}">${item.Mission_Number}</a>`;
      const departureDate = convertDateToTicketHTMLString(item.Departure_Date);
      const arrivalDate = convertDateToTicketHTMLString(item.Arrival_Date);

      $("#listTickets")
        .DataTable()
        .row.add([
          href,
          item.Tail_Number,
          item.DV,
          item.Departure_IATA,
          item.Departure_Location,
          item.Arrival_IATA,
          item.Arrival_Location,
          departureDate,
          arrivalDate,
        ])
        .draw();
    });
  })
  .catch((error) => {
    console.error("Error:", error);
  });
