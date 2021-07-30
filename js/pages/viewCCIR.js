import { HOST_URL } from "../modules/constants.js";
import { updateListItem, getUrlParameter } from "../modules/utility.js";
import permissionsCheck from "../modules/userPermissionsCheck.js";
const CCIR_LIST_NAME = "CCIR";
feather.replace();
permissionsCheck("VklFVyBDQ0lS");

const ccirId = getUrlParameter("ccir");

// Populate DV Drop Down
const populateDvDropDown = async () => {
  const response = await fetch(
    `${HOST_URL}/_api/web/lists/getbytitle('DVList')/items?$top=5000`,
    {
      headers: { Accept: "application/json; odata=verbose" },
      credentials: "include",
    }
  );
  const data = await response.json();
  const items = data.d.results;
  const dvSelectInput = document.getElementById("dv_select");
  for (let item in items) {
    let opt = document.createElement("option");
    opt.innerHTML = items[item].DV;
    dvSelectInput.appendChild(opt);
  }
  $(".selectpicker").selectpicker("refresh");
  return;
};

// Populate Aircraft Drop Down
const populateAircraftDropDown = async () => {
  const response = await fetch(
    `${HOST_URL}/_api/web/lists/getbytitle('TailNumbers')/items?$top=5000&$orderby=Tail_x0020_Numbers%20asc`,
    {
      headers: { Accept: "application/json; odata=verbose" },
      credentials: "include",
    }
  );
  const data = await response.json();
  const items = data.d.results;
  const aircraftSelectInput = document.getElementById("tail_number");
  for (let item in items) {
    let opt = document.createElement("option");
    opt.innerHTML = items[item].Tail_x0020_Numbers;
    aircraftSelectInput.appendChild(opt);
  }
  $(".selectpicker").selectpicker("refresh");
  return;
};

// generate calendar objects
$("#datetimepicker1").datetimepicker({
  format: "MM/DD/YYYY, HH:mm",
});

const populateCCIRInformation = async () => {
  await Promise.all([populateDvDropDown(), populateAircraftDropDown()]);

  fetch(
    `${HOST_URL}/_api/web/lists/getbytitle('${CCIR_LIST_NAME}')/items?$filter= Id eq '${ccirId}'`,
    {
      headers: { Accept: "application/json; odata=verbose" },
      credentials: "include",
    }
  )
    .then((response) => response.json())
    .then((data) => {
      const result = data.d.results[0] || "";
      if (!result) return;
      const enteredTicketNumber = document.getElementById("ticket_number");
      enteredTicketNumber.value = result.GNOC_Ticket_Number;

      const selectedDv = document.getElementById("dv_select");
      selectedDv.value = result.DV;

      const selectedTailNumber = document.getElementById("tail_number");
      selectedTailNumber.value = result.Tail_Number;

      const selectedAircraftType = document.getElementById("ac_type");
      selectedAircraftType.value = result.AC_Type;

      const selectedImpact = document.getElementById("impact_level");
      selectedImpact.value = result.Impact_Level;

      const enteredMissionNumber = document.getElementById("mission_number");
      enteredMissionNumber.value = result.Mission_Number;

      const enteredRemarks = document.getElementById("remarks");
      enteredRemarks.value = result.Remarks;

      const enteredHotrep = document.getElementById("hotrep_number");
      enteredHotrep.value = result.HOTREP_Number;

      const enteredOgoOfficer = document.getElementById("ogo_officer");
      enteredOgoOfficer.value = result.OGO_Duty_Officer;

      $("#datetimepicker1").datetimepicker("date", result.Date);

      $(".selectpicker").selectpicker("refresh");
    })
    .catch((error) => console.error(error));
};
populateCCIRInformation();

/* Event Handlers */

// Update CCIR
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

    updateListItem(
      CCIR_LIST_NAME,
      ccirId,
      ccirProperties,
      () => {
        alert("CCIR updated successfully.");
        location.reload();
      },
      (error) => {
        alert("An error has occured. Please try again.");
        console.error("Error: ", error);
      }
    );
  });

// // Add Ticket Cards
// var ticket = $("#ticket_number").val();
// if (ticket != "") {
//   var select = document.getElementById("ticket_show");
//   var opt = document.createElement("div");
//   opt.className = "card";
//   opt.innerHTML =
//     '<div class="card-header"><b><a href="viewTicket.html?ticket=' +
//     ticket +
//     '">Ticket #' +
//     ticket +
//     "</a></b></div>";
//   var urlLoad =
//     "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('Tickets')/items?$filter=GNOC_Ticket_Number eq '" +
//     ticket +
//     "'";
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
//         var openDate = convertTheDate(allResults[0].Date_Opened);
//         var impact = allResults[0].Impact_Level;
//         if (impact == null) impact = "N/A";

//         var lastAction = allResults[0].Last_Reported_Action;
//         if (lastAction == null) lastAction = "N/A";

//         var ccir = allResults[0].CCIR_Number;
//         if (ccir == null) ccir = "N/A";

//         opt.innerHTML =
//           opt.innerHTML +
//           '<div class="card-body"><div class="row"><div class="col"><div class="form-group row"><label for="status" class="col-sm-4 col-form-label">Status</label><div class="col-sm-8"><input type="text" class="form-control" id="status" value="' +
//           allResults[0].Status +
//           '" disabled></div></div><div class="form-group row"><label for="open_date" class="col-sm-4 col-form-label">Open Date</label><div class="col-sm-8"><input type="text" class="form-control" id="open_date" value="' +
//           openDate +
//           '" disabled></div></div><div class="form-group row"><label for="ticket_number" class="col-sm-4 col-form-label">Ticket Number</label><div class="col-sm-8"><input type="text" class="form-control" id="ticket_number" value="' +
//           ticket +
//           '" disabled></div></div><div class="form-group row"><label for="dv_select" class="col-sm-4 col-form-label">DV</label><div class="col-sm-8"><input type="text" class="form-control" id="dv_select" value="' +
//           allResults[0].DV +
//           '" disabled></div></div><div class="form-group row"><label for="impact_level" class="col-sm-4 col-form-label">DV Impact</label><div class="col-sm-8"><input type=email" class="form-control" id="impact_level" value="' +
//           impact +
//           '" disabled></div></div><div class="form-group row"><label for="mission_number" class="col-sm-4 col-form-label">Mission Number</label><div class="col-sm-8"><input type="text" class="form-control" id="mission_number" value="' +
//           allResults[0].Mission_Number +
//           '" disabled></div></div><div class="form-group row"><label for="cso" class="col-sm-4 col-form-label">CSO Name</label><div class="col-sm-8"><input type="email" class="form-control" id="cso" value="' +
//           allResults[0].CSO +
//           '" disabled></div></div><div class="form-group row"><label for="ccir_number" class="col-sm-4 col-form-label">CCIR Number</label><div class="col-sm-8"><input type="email" class="form-control" id="ccir_number" value="' +
//           ccir +
//           '" disabled></div></div><div class="form-group row"><label for="tail_number" class="col-sm-4 col-form-label">Tail Number</label><div class="col-sm-8"><input type="email" class="form-control" id="tail_number" value="' +
//           allResults[0].Tail_Number +
//           '" disabled></div></div></div><div class="row col-md-6"><div class="col"><div class="form-group row"><label for="category" class="col-sm-4 col-form-label">Category</label><div class="col - sm - 8"><input type="email" class="form-control" id="category" value="' +
//           allResults[0].Category +
//           '" disabled></div></div><div class="form-group row"><label for="sub_category" class="col-sm-4 col-form-label">Sub Category</label><div class="col-sm-8"><input type="text" class="form-control" id="sub_category" value="' +
//           allResults[0].Sub_Category +
//           '" disabled></div></div><div class="form-group row"><label for="issue_description" class="col-sm-4 col-form-label">Initial Description</label><textarea disabled class="form-control col-sm-8" id="issue_description" rows="10">' +
//           allResults[0].Issue_Description +
//           '</textarea></div><div class="form-group row"><label for="issue_description" class="col-sm-4 col-form-label">Most Recent Update</label><textarea class="form-control col-sm-8" id="update_text" rows="10" disabled>' +
//           lastAction +
//           "</textarea></div></div></div></div></div><br />";
//         select.appendChild(opt);
//         var br = document.createElement("br");
//         select.appendChild(br);
//       }
//     },
//     error: function (data) {
//       //alert("Error: " + JSON.stringify(data));
//     },
//   });
// }
