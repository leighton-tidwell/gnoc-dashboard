import { HOST_URL } from "../modules/constants.js";
import {
  daysIntoYear,
  insertIntoList,
  convertDateToISOString,
} from "../modules/utility.js";
import permissionsCheck from "../modules/userPermissionsCheck.js";
const TICKETS_LIST_NAME = "Tickets";
const UPDATES_LIST_NAME = "ticketUpdates";
feather.replace();
permissionsCheck("Q1JFQVRFIFRUUw==");

// Check if a ticket number exists
const checkIfTicketNumberExists = async (ticketNumber) => {
  const response = await fetch(
    `${HOST_URL}/_api/web/lists/getbytitle('${TICKETS_LIST_NAME}')/items?$select=GNOC_Ticket_Number&$filter=GNOC_Ticket_Number eq '${ticketNumber}'`,
    {
      headers: {
        Accept: "application/json; odata=verbose",
        "Access-Control-Allow-Headers": "*",
      },
      credentials: "include",
    }
  );
  const data = await response.json();
  const found = data.d.results.length !== 0 ? true : false;

  return found;
};

// Generate The Ticket Number
const generateTicketNumber = async () => {
  const currentYear = new Date().getUTCFullYear();
  let lastNumberOfTicket = 1;
  let ticketNumber = ``;

  // Checking to see if a ticket with this number already exists.
  // If there is, we will increment it by 1 until we reach one that
  // does not exist.
  while (true) {
    ticketNumber = `ADWN-${currentYear}-${(
      "00" + daysIntoYear(new Date())
    ).slice(-3)}-000${lastNumberOfTicket}`;
    const exists = await checkIfTicketNumberExists(ticketNumber);
    if (exists) lastNumberOfTicket++;
    else break;
  }
  return (document.getElementById("ticket_number").value = ticketNumber);
};
generateTicketNumber();

// Create Mission Table
// $.fn.dataTable.moment('MM/DD/YYYY HH:mmZ');
// $('#legs_current_mission').DataTable({
//   dom: 'Pfrtip',
//   "order": [[0, "desc"]],
//   searching: false,
//   paging: false,
//   info: false,
// });

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

// Get mission information
document
  .querySelector("#mission_number")
  .addEventListener("change", (event) => {
    const enteredMissionNumber = event.target.value;
    fetchMissionInfo(enteredMissionNumber);
  });

// Populate Ticket Categories
fetch(
  `${HOST_URL}/_api/web/lists/getbytitle('Ticket_Categories')/items?$orderby=Category%20asc`,
  {
    headers: { Accept: "application/json; odata=verbose" },
    credentials: "include",
  }
)
  .then((response) => response.json())
  .then((data) => {
    const items = data.d.results;
    const ticketCategoryInput = document.getElementById("category");
    items.forEach((item, i) => {
      let opt = document.createElement("option");
      opt.innerHTML = item.Category;
      ticketCategoryInput.appendChild(opt);

      if (i === 0) ticketCategoryInput.value = item.Category;
    });
    $(".selectpicker").selectpicker("refresh");
  })
  .catch((error) => {
    console.error("Error:", error);
  });

// Enable and disable CCIR input box depending on if user has designated a CCIR or not.
document.querySelector("#ccir").addEventListener("change", (event) => {
  const ccirEnteredValue = event.target.value;
  const ccirNumberInput = document.getElementById("ccir_number");
  if (ccirEnteredValue == 0) {
    ccirNumberInput.disabled = true;
    ccirNumberInput.value = "";
  } else ccirNumberInput.disabled = false;
});

// Create Ticket
document.querySelector("#ticket_submit").addEventListener("click", (event) => {
  const enteredTicketNumber = document.getElementById("ticket_number").value;
  const enteredDV = document.getElementById("dv_select").value;
  const currentDate = new Date();
  const enteredTailNumber = document.getElementById("tail_number").value;
  const enteredMissionNumber = document.getElementById("mission_number").value;
  const enteredImpactLevel = document.getElementById("impact_level").value;

  let dvImpact = "false";
  if (enteredImpactLevel !== "None") dvImpact = "true";

  const enteredTicketCategory = document.getElementById("category").value;
  const enteredSubCategory = document.getElementById("sub_category").value;
  const STATUS = "ASSIGNED";
  const enteredIssueDescription =
    document.getElementById("issue_description").value;
  const enteredCCIRNumber = document.getElementById("ccir_number").value;
  const enteredCSO = document.getElementById("cso").value;
  const enteredLeg = document.getElementById("leg").value;

  // if user did not enter data into the required fields, alert them.
  if (
    enteredTailNumber === "" ||
    enteredTicketCategory === "" ||
    enteredSubCategory === "" ||
    enteredIssueDescription === ""
  )
    return alert(
      "One or more required field does not contain data. Please try again."
    );

  // Disable button so user can not double click.
  const LOADING_TEXT =
    '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';
  event.target.disabled = true;
  event.target.innerHTML = LOADING_TEXT;

  // Check to make sure ticket was not created while page was idled.
  while (true) {
    if (checkIfTicketNumberExists(ticketNumber)) {
      lastNumberOfTicket++;
      ticketNumber =
        "ADWN-" +
        currentYear +
        "-" +
        ("00" + daysIntoYear(new Date())).slice(-3) +
        "-000" +
        lastNumberOfTicket;
    } else {
      break;
    }
  }

  // Set up sharepoint push action
  const ticketProperties = {
    GNOC_Ticket_Number: enteredTicketNumber,
    DV: enteredDV,
    Tail_Number: enteredTailNumber,
    Mission_Number: enteredMissionNumber,
    DV_Impact: dvImpact,
    Impact_Level: enteredImpactLevel,
    Category: enteredTicketCategory,
    Sub_Category: enteredSubCategory,
    Status: STATUS,
    Issue_Description: enteredIssueDescription,
    CCIR_Number: enteredCCIRNumber,
    CSO: enteredCSO,
    Leg: enteredLeg,
  };

  insertIntoList(TICKETS_LIST_NAME, ticketProperties, () => {
    // now add update to updates list
    const updateText = `GNOC created ticket #${enteredTicketNumber}.`;
    const updateProperties = {
      ticket_number: enteredTicketNumber,
      update: updateText,
    };
    insertIntoList(UPDATES_LIST_NAME, updateProperties, () => {
      alert("Ticket successfully created.");
      location.reload();
    });
  }),
    (error) => {
      alert("An error has occured. Please try again.");
      console.error(error);
    };
});

Date.prototype.addHours = function (h) {
  this.setTime(this.getTime() + h * 60 * 60 * 1000);
  return this;
};

const fetchMissionInfo = (missionToSearch) => {
  // Show mission information table
  const missionInformationTable = document.getElementById(
    "mission_information"
  );
  missionInformationTable.style.display = "block";

  const legInput = document.getElementById("leg");
  legInput.innerHTML = "";
  $(".selectpicker").selectpicker("refresh"); // obligatory refresh.. hate this

  let opt = document.createElement("option");
  opt.value = "N/A";
  opt.innerHTML = "N/A";
  legInput.appendChild(opt);
  legInput.value = "N/A";
  $(".selectpicker").selectpicker("refresh");

  // Clear the missions table
  const missionsTableBody = document.getElementById("missions-table-body");
  missionsTableBody.innerHTML = "";

  fetch(
    `${HOST_URL}/_api/web/lists/getbytitle('Missions')/items?$filter=Mission_Number eq '${missionToSearch}'&$orderby=Created%20asc`,
    {
      headers: { Accept: "application/json; odata=verbose" },
      credentials: "include",
    }
  )
    .then((response) => response.json())
    .then((data) => {
      const items = data.d.results;
      const itemsLength = items.length;
      const dvSelectInput = document.getElementById("dv_select");
      const tailNumberInput = document.getElementById("tail_number");
      if (itemsLength === 0) {
        dvSelectInput.value = "";
        tailNumberInput.value = "";
        missionInformationTable.style.display = "none";
        $(".selectpicker").selectpicker("refresh");
        return;
      }

      dvSelectInput.value = items[itemsLength - 1].DV;
      $(".selectpicker").selectpicker("refresh");

      tailNumberInput.value = items[itemsLength - 1].Tail_Number;
      $(".selectpicker").selectpicker("refresh");

      const currentTime = new Date();
      currentTime.addHours(currentTime.getTimezoneOffset() / 60);

      const legInput = document.getElementById("leg");
      items
        .forEach((item, i) => {
          let opt = document.createElement("option");
          const legNumber = i + 1;
          opt.value = legNumber;
          opt.innerHTML = legNumber;
          legInput.appendChild(opt);
          $(".selectpicker").selectpicker("refresh");

          if (
            item.Departure_Date < currentTime.toISOString() &&
            item.Arrival_Date > currentTime.toISOString()
          ) {
            legInput.value = legNumber;
            $(".selectpicker").selectpicker("refresh");
          }
          const fetchedDepartureDate = convertDateToISOString(
            item.Departure_Date
          );
          const fetchedArrivalDate = convertDateToISOString(item.Arrival_Date);
          const newMissionRowContent = `
          <td>${legNumber}</td>
          <td>${item.Tail_Number}</td>
          <td>${item.DV}</td>
          <td>${item.Departure_IATA}</td>
          <td>${item.Departure_Location}</td>
          <td>${item.Arrival_IATA}</td>
          <td>${item.Arrival_Location}</td>
          <td>${fetchedDepartureDate}</td>
          <td>${fetchedArrivalDate}</td>
        `;
          const newRow = missionsTableBody.insertRow(0);
          newRow.innerHTML = newMissionRowContent;
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    });
};
