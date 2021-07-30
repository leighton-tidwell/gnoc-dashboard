import { HOST_URL } from "../modules/constants.js";
import {
  daysIntoYear,
  insertIntoList,
  convertDateToISOString,
} from "../modules/utility.js";
import permissionsCheck from "../modules/userPermissionsCheck.js";
const MASTER_TICKETS_LIST_NAME = "masterTickets";
const UPDATES_LIST_NAME = "ticketUpdates";
const TICKETS_LIST_NAME = "Tickets";
feather.replace();
permissionsCheck("Q1JFQVRFIE1BU1RFUiBUVFM=");

// Check if a ticket number exists
const checkIfTicketNumberExists = async (ticketNumber) => {
  const response = await fetch(
    `${HOST_URL}/_api/web/lists/getbytitle('${MASTER_TICKETS_LIST_NAME}')/items?$select=Title&$filter=Title eq '${ticketNumber}'`,
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
    ticketNumber = `ADWN-M-${currentYear}-${(
      "00" + daysIntoYear(new Date())
    ).slice(-3)}-000${lastNumberOfTicket}`;
    const exists = await checkIfTicketNumberExists(ticketNumber);
    if (exists) lastNumberOfTicket++;
    else break;
  }
  return (document.getElementById("ticket_number").value = ticketNumber);
};
generateTicketNumber();

// Populate Ticket Drop Down
fetch(
  `${HOST_URL}/_api/web/lists/getbytitle('${TICKETS_LIST_NAME}')/items?$select=GNOC_Ticket_Number&$top=200&$orderby=Created%20desc`,
  {
    headers: { Accept: "application/json; odata=verbose" },
    credentials: "include",
  }
)
  .then((response) => response.json())
  .then((data) => {
    const items = data.d.results;
    const ticketSelectInput = document.getElementById("ticket_select");
    items.forEach((item) => {
      let opt = document.createElement("option");
      opt.innerHTML = item.GNOC_Ticket_Number;
      ticketSelectInput.appendChild(opt);
    });
    $(".selectpicker").selectpicker("refresh");
  })
  .catch((error) => {
    console.error("Error:", error);
  });

document.querySelector("#ticket_submit").addEventListener("click", (event) => {
  // Disable button so user can not double click.
  const LOADING_TEXT =
    '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';
  event.target.disabled = true;
  event.target.innerHTML = LOADING_TEXT;

  const enteredTicketNumber = document.getElementById("ticket_number").value;
  const selectedTicketNumbers = `${$("#ticket_select").val()}`;
  const enteredIssueDescription =
    document.getElementById("issue_description").value;

  const itemProperties = {
    Title: enteredTicketNumber,
    ticket_list: selectedTicketNumbers,
    issue_description: enteredIssueDescription,
  };

  insertIntoList(MASTER_TICKETS_LIST_NAME, itemProperties, () => {
    const updateText = `GNOC created ticket #${enteredTicketNumber}.`;
    const updateItemProperties = {
      ticket_number: enteredTicketNumber,
      update: updateText,
    };

    insertIntoList(UPDATES_LIST_NAME, updateItemProperties, () => {
      alert("Ticket successfully created.");
      location.reload();
    });
  });
});
