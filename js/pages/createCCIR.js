import { HOST_URL } from "../modules/constants.js";
import { insertIntoList } from "../modules/utility.js";
import permissionsCheck from "../modules/userPermissionsCheck.js";
const CCIR_LIST_NAME = "CCIR";
feather.replace();
permissionsCheck("QUREIEEgQ0NJUg==");

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
    const aircraftSelectInput = document.getElementById("tail_number");
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

// generate calendar objects
$("#datetimepicker1").datetimepicker({
  format: "MM/DD/YYYY, HH:mm",
});

/* Event Handler */
// Create Ticket
document
  .querySelector("#ticket_submit")
  .addEventListener("click", async (event) => {
    // Disable button so user can not double click.
    const LOADING_TEXT =
      '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';
    event.target.disabled = true;
    event.target.innerHTML = LOADING_TEXT;

    const enteredTicketNumber = document.getElementById("ticket_number").value;
    const selectedDv = document.getElementById("dv_select").value;
    const selectedTailNumber = document.getElementById("tail_number").value;
    const selectedAircraftType = document.getElementById("ac_type").value;
    const selectedImpact = document.getElementById("impact_level").value;
    const enteredMissionNumber =
      document.getElementById("mission_number").value;
    const enteredRemarks = document.getElementById("remarks").value;
    const enteredHotrep = document.getElementById("hotrep_number").value;
    const enteredOgoOfficer = document.getElementById("ogo_officer").value;
    const enteredDate = $("#datetimepicker1")
      .datetimepicker("viewDate")
      .toISOString();

    const ccirProperties = {
      HOTREP_Number: enteredHotrep,
      AC_Type: selectedAircraftType,
      Tail_Number: selectedTailNumber,
      Mission_Number: enteredMissionNumber,
      DV: selectedDv,
      Date: enteredDate,
      GNOC_Ticket_Number: enteredTicketNumber,
      OGO_Duty_Officer: enteredOgoOfficer,
      Impact_Level: selectedImpact,
      Remarks: enteredRemarks,
    };

    insertIntoList(
      CCIR_LIST_NAME,
      ccirProperties,
      () => {
        alert("CCIR added successfully.");
        location.reload();
      },
      (error) => {
        alert("An error occured. Please try again.");
        console.error(error);
      }
    );
  });
