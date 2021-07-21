import { HOST_URL } from "../modules/constants.js";
import {
  updateListItem,
  removeFromList,
  getUrlParameter,
  convertDateToTicketHTMLString,
  insertIntoList,
} from "../modules/utility.js";
import permissionsCheck from "../modules/userPermissionsCheck.js";
const MASTER_TICKETS_LIST = "masterTickets";
const TICKET_LIST = "Tickets";
const UPDATE_LIST = "ticketUpdates";
permissionsCheck("VklFVyBNQVNURVIgVFRT");
feather.replace();

// To get ticket Number from URL
const ticketNumber = getUrlParameter("ticket");

// Global Variables
let ticketStatus;
let ticketUpdateIds = [];

const populateTicketDropDown = async () => {
  // Populate ticket drop down
  const response = await fetch(
    `${HOST_URL}/_api/web/lists/getbytitle('${TICKET_LIST}')/items?$select=GNOC_Ticket_Number&$top=200&$orderby=Created desc`,
    {
      headers: { Accept: "application/json; odata=verbose" },
      credentials: "include",
    }
  );
  const data = await response.json();
  const ticketDropDown = document.getElementById("ticket_select");
  const items = data.d.results;
  items.forEach((item) => {
    let ticketOption = document.createElement("option");
    ticketOption.innerHTML = item.GNOC_Ticket_Number;
    ticketDropDown.appendChild(ticketOption);
  });
  $(".selectpicker").selectpicker("refresh");
  return true;
};

const generateTimeline = () => {
  const enteredTicketNumber = document.getElementById("ticket_number").value;
  fetch(
    `${HOST_URL}/_api/web/lists/getbytitle('${UPDATE_LIST}')/items?$select=Id,Created,ticket_number,update,update_date,Author/Name&$orderby=Created%20desc&$filter=ticket_number eq '${enteredTicketNumber}'&$expand=Author`,
    {
      headers: { Accept: "application/json; odata=verbose" },
      credentials: "include",
    }
  )
    .then((response) => response.json())
    .then((data) => {
      const results = data.d.results || [];
      results.forEach((update, i) => {
        const updateDate = update.Created;
        const updateText = update.update;
        const updateId = update.Id;

        const authorName = update.Author.Name.split("|");
        const fullName = authorName[2];
        let nameArray = fullName.split(".");
        if (!nameArray[2]) nameArray[2] = nameArray[1];
        const htmlName = `${nameArray[0].toUpperCase()} ${nameArray[2].toUpperCase()}`;

        const ticketLogContainer = document.getElementById("ticket_update_log");
        const updateListItem = document.createElement("li");

        ticketUpdateIds.push(updateId); // add update Id to be referenced later
        let classList = [];
        if (i === 0) classList = ["list-group-item", "active"];
        else classList = ["list-group-item"];
        updateListItem.classList.add(...classList);

        if (
          updateText.includes("GNOC created ticket") ||
          updateText.includes("GNOC set ticket")
        ) {
          updateListItem.innerHTML = `<b>${convertDateToTicketHTMLString(
            updateDate
          )}</b> - ${updateText}`;
        } else {
          updateListItem.innerHTML = `<b>${convertDateToTicketHTMLString(
            updateDate
          )} - ${htmlName}:</b> ${updateText}`;
        }
        ticketLogContainer.appendChild(updateListItem);
      });
    })
    .catch((error) => console.error("Error: ", error));
};

const populateTicketInformation = async () => {
  await populateTicketDropDown();
  // Populate the ticket information
  fetch(
    `${HOST_URL}/_api/web/lists/getbytitle('${MASTER_TICKETS_LIST}')/items?$select=Author/Name,Title,ticket_list,issue_description,status,Created&$filter=Id eq '${ticketNumber}'&$expand=Author`,
    {
      headers: { Accept: "application/json; odata=verbose" },
      credentials: "include",
    }
  )
    .then((response) => response.json())
    .then((data) => {
      const result = data.d.results[0] || "";
      if (!result) return;

      const ticketNumberInput = document.getElementById("ticket_number");
      ticketNumberInput.value = result.Title;

      if (result.ticket_list) {
        $("#ticket_select").val(result.ticket_list.split(",")); // select-picker wants jquery here..
        generateTicketCards(result.ticket_list.split(","));
      }

      const issueDescriptionText = document.getElementById("issue_description");
      issueDescriptionText.value = result.issue_description;

      const statusDropDown = document.getElementById("status");
      statusDropDown.value = result.status;
      ticketStatus = result.status;

      $(".selectpicker").selectpicker("refresh");

      const authorName = result.Author.Name.split("|");
      const fullName = authorName[2];
      let nameArray = fullName.split(".");
      if (!nameArray[2]) nameArray[2] = nameArray[1];
      const htmlName = `${nameArray[0].toUpperCase()} ${nameArray[2].toUpperCase()}`;
      const authorSpan = document.getElementById("createdBy");
      authorSpan.innerHTML = `Created by: <b>${htmlName}</b>`;

      generateTimeline();
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};
populateTicketInformation();

// Add ticket cards for each ticket assigned to master ticket:
const generateTicketCards = (ticketList) => {
  const ticketBodyDiv = document.getElementById("ticket_body");
  for (const ticket in ticketList) {
    let ticketCard = document.createElement("div");
    ticketCard.className = "card";
    ticketCard.innerHTML = `<div class="card-header">
                              <b>
                                <a href="viewTicket.html?ticket=${ticketList[ticket]}">Ticket #${ticketList[ticket]}</a>
                              </b>
                            </div>
                            `;
    fetch(
      `${HOST_URL}/_api/web/lists/getbytitle('${TICKET_LIST}')/items?$filter=GNOC_Ticket_Number eq '${ticketList[ticket]}'`,
      {
        headers: { Accept: "application/json; odata=verbose" },
        credentials: "include",
      }
    )
      .then((response) => response.json())
      .then((data) => {
        const result = data.d.results[0] || "";
        if (!result) return;

        const openDate = convertDateToTicketHTMLString(result.Date_Opened);
        const dvImpact =
          result.Impact_Level === null ? "N/A" : result.Impact_Level;
        const lastReportedAction =
          result.Last_Reported_Action === null
            ? "N/A"
            : result.Last_Reported_Action;
        const ccir = result.CCIR_Number === null ? "N/A" : result.CCIR_Number;

        ticketCard.innerHTML += `<div class="card-body">
                                  <div class="row">
                                    <div class="col">
                                      <div class="form-group row">
                                        <label for="status" class="col-sm-4 col-form-label">Status</label>
                                        <div class="col-sm-8">
                                          <input type="text" class="form-control" id="status" value="${result.Status}" disabled />
                                        </div>
                                      </div>
                                      <div class="form-group row">
                                        <label for="open_date" class="col-sm-4 col-form-label">Open Date</label>
                                        <div class="col-sm-8">
                                          <input type="text" class="form-control" id="open_date" value="${openDate}" disabled />
                                        </div>
                                      </div>
                                      <div class="form-group row">
                                        <label for="ticket_number" class="col-sm-4 col-form-label">Ticket Number</label>
                                        <div class="col-sm-8">
                                          <input type="text" class="form-control" id="ticket_number" value="${ticketList[ticket]}" disabled />
                                        </div>
                                      </div>
                                      <div class="form-group row">
                                        <label for="dv_select" class="col-sm-4 col-form-label">DV</label>
                                        <div class="col-sm-8">
                                          <input type="text" class="form-control" id="dv_select" value="${result.DV}" disabled />
                                        </div>
                                      </div>
                                      <div class="form-group row">
                                        <label for="impact_level" class="col-sm-4 col-form-label">Impact Level</label>
                                        <div class="col-sm-8">
                                          <input type="text" class="form-control" id="impact_level" value="${dvImpact}" disabled />
                                        </div>
                                      </div>
                                      <div class="form-group row">
                                        <label for="mission_number" class="col-sm-4 col-form-label">Mission Number</label>
                                        <div class="col-sm-8">
                                          <input type="text" class="form-control" id="mission_number" value="${result.Mission_Number}" disabled />
                                        </div>
                                      </div>
                                      <div class="form-group row">
                                        <label for="cso" class="col-sm-4 col-form-label">CSO</label>
                                        <div class="col-sm-8">
                                          <input type="text" class="form-control" id="cso" value="${result.CSO}" disabled />
                                        </div>
                                      </div>
                                      <div class="form-group row">
                                        <label for="ccir_number" class="col-sm-4 col-form-label">CCIR Number</label>
                                        <div class="col-sm-8">
                                          <input type="text" class="form-control" id="ccir_number" value="${ccir}" disabled />
                                        </div>
                                      </div>
                                      <div class="form-group row">
                                        <label for="tail_number" class="col-sm-4 col-form-label">Tail Number</label>
                                        <div class="col-sm-8">
                                          <input type="text" class="form-control" id="tail_number" value="${result.Tail_Number}" disabled />
                                        </div>
                                      </div>
                                    </div>
                                    <div class="row col-md-6">
                                      <div class="col">
                                        <div class="form-group row">
                                          <label for="category" class="col-sm-4 col-form-label">Category</label>
                                          <div class="col-sm-8">
                                            <input type="text" class="form-control" id="category" value="${result.Category}" disabled/>
                                          </div>
                                        </div>
                                        <div class="form-group row">
                                          <label for="sub_category" class="col-sm-4 col-form-label">Sub Category</label>
                                          <div class="col-sm-8">
                                            <input type="text" class="form-control" id="sub_category" value="${result.Sub_Category}" disabled/>
                                          </div>
                                        </div>
                                        <div class="form-group row">
                                          <label for="issue_description" class="col-sm-4 col-form-label">Initial Description</label>
                                          <div class="col-sm-8">
                                            <textarea class="form-control" id="issue_description" disabled rows="10">${result.Issue_Description}</textarea>
                                          </div>
                                        </div>
                                        <div class="form-group row">
                                          <label for="update_text" class="col-sm-4 col-form-label">Most Recent Update</label>
                                          <div class="col-sm-8">
                                            <textarea class="form-control" id="update_text" disabled rows="10">${lastReportedAction}</textarea>
                                          </div>
                                        </div>
                                      </div>`;
      })
      .catch((error) => {
        console.error("Error: ", error);
      });

    ticketBodyDiv.appendChild(ticketCard);
    const lineBreak = document.createElement("br");
    ticketBodyDiv.appendChild(lineBreak);
  }
};

/* Event Handlers */

// Update Ticket
document.querySelector("#ticket_submit").addEventListener("click", (event) => {
  const enteredTicketNumber = document.getElementById("ticket_number").value;
  const selectedTicketNumbers = `${$("#ticket_select").val()}`;
  const enteredUpdate = document.getElementById("update").value;
  const enteredStatus = document.getElementById("status").value;

  // Disable button so user can not double click.
  const LOADING_TEXT =
    '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';
  event.target.disabled = true;
  event.target.innerHTML = LOADING_TEXT;

  const ticketProperties = {
    Title: enteredTicketNumber,
    ticket_list: selectedTicketNumbers,
    status: enteredStatus,
  };

  // Start by updating the ticket:
  updateListItem(
    MASTER_TICKETS_LIST,
    ticketNumber,
    ticketProperties,
    () => {
      // Now lets add an update if applicable
      if (!enteredUpdate) {
        alert("Ticket successfully updated.");
        return location.reload();
      }

      const updateProperties = {
        ticket_number: enteredTicketNumber,
        update: enteredUpdate,
      };
      insertIntoList(
        UPDATE_LIST,
        updateProperties,
        () => {
          document.getElementById("update").value = "";
          alert("Ticket successfully updated.");
          return location.reload();
        },
        (error) => {
          console.error("Error:", error);
        }
      );
    },
    (error) => {
      console.error("Error:", error);
    }
  );
});

// Delete Ticket
document.querySelector("#deleteTicket").addEventListener("click", (event) => {
  const enteredTicketNumber = document.getElementById("ticket_number").value;

  // Disable button so user can not double click.
  const LOADING_TEXT =
    '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';
  event.target.disabled = true;
  event.target.innerHTML = LOADING_TEXT;

  removeFromList(
    MASTER_TICKETS_LIST,
    ticketNumber,
    () => {
      // now to remove the updates
      for (let i = 0; i < ticketUpdateIds.length; i++) {
        removeFromList(
          UPDATE_LIST,
          ticketUpdateIds[i],
          () => {},
          (error) => console.error("Error: ", error)
        );
      }
      alert("Ticket deleted successfully.");
      location.replace("./viewTickets.html");
    },
    (error) => {
      console.error("Error: ", error);
    }
  );
});
