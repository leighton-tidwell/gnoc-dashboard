import { HOST_URL } from "../modules/constants.js";
import { convertDateToTicketHTMLString } from "../modules/utility.js";
import permissionsCheck from "../modules/userPermissionsCheck.js";
const CCIR_LIST_NAME = "CCIR";
feather.replace();
permissionsCheck("VklFVyBDQ0lSUw==");

// Set up data tables with moment
$.fn.dataTable.moment("MM/DD/YYYY HH:mm");

// Populate CCIR Table
fetch(
  `${HOST_URL}/_api/web/lists/getbytitle('${CCIR_LIST_NAME}')/items?$top=5000&$orderby=Created desc`,
  {
    headers: { Accept: "application/json; odata=verbose" },
    credentials: "include",
  }
)
  .then((response) => response.json())
  .then((data) => {
    $("#listCCIRs").DataTable({
      dom: "Bfrtip",
      buttons: ["copy", "csv", "excel", "pdf", "print"],
      columnDefs: [
        { width: "350px", targets: [8] },
        { width: "100px", targets: [1] },
        { width: "150px", targets: [4, 5] },
        { width: "50px", targets: [6] },
      ],
      order: [[0, "desc"]],
    });

    const loader = document.getElementById("ccir_loader");
    loader.style.display = "none";

    const items = data.d.results;
    items.forEach((ccir) => {
      const ticketHref =
        ccir.GNOC_Ticket_Number == null
          ? "N/A"
          : `<a href="./viewTicket.html?ticket=${ccir.GNOC_Ticket_Number}">${ccir.GNOC_Ticket_Number}</a>`;
      const ccirId = ccir.Id;
      const ccirDv = ccir.DV;
      const ccirOgoOfficer = ccir.OGO_Duty_Officer;
      const ccirImpact = ccir.Impact_Level;
      const ccirRemarks = ccir.Remarks;
      const ccirAircraft = `${ccir.Tail_Number} (${ccir.AC_Type})`;
      const ccirNumber = `<a href="viewCCIR.html?ccir=${ccirId}">${ccirId}</a>`;
      const ccirDate = convertDateToTicketHTMLString(ccir.Date);
      const ccirMission = ccir.Mission_Number;

      $("#listCCIRs")
        .DataTable()
        .row.add([
          ccirNumber,
          ccirAircraft,
          ccirMission,
          ccirDv,
          ccirDate,
          ticketHref,
          ccirOgoOfficer,
          ccirImpact,
          ccirRemarks,
        ])
        .draw();
    });
  })
  .catch((error) => {
    console.error("Error:", error);
  });
