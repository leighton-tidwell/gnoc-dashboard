import { HOST_URL } from "../modules/constants.js";
import {
  convertDateToTicketHTMLString,
  getUrlParameter,
} from "../modules/utility.js";
import permissionsCheck from "../modules/userPermissionsCheck.js";
const MISSIONS_LIST_NAME = "Missions";
feather.replace();
permissionsCheck("VklFVyBNSVNTSU9O");

// To get mission Number from URL
const missionNumber = getUrlParameter("mission");

// Set up data table object with moment
$.fn.dataTable.moment("MM/DD/YYYY HH:mm");

fetch(
  `${HOST_URL}/_api/web/lists/getbytitle('${MISSIONS_LIST_NAME}')/items?$top=1000&$orderby=Created desc&$filter=Mission_Number eq '${missionNumber}'`,
  {
    headers: { Accept: "application/json; odata=verbose" },
    credentials: "include",
  }
)
  .then((response) => response.json())
  .then((data) => {
    const results = data.d.results;
    // Create Ticket Table
    $("#listTickets").DataTable({
      dom: "Bfrtip",
      buttons: ["copy", "csv", "excel", "pdf", "print"],
      order: [[7, "desc"]],
    });

    results.forEach((mission) => {
      const missionHref = `<a href="./viewFlightTicket.html?ticket=${mission.Id}">${mission.Mission_Number}</a>`;
      const departureDate = convertDateToTicketHTMLString(
        mission.Departure_Date
      );
      const arrivalDate = convertDateToTicketHTMLString(mission.Arrival_Date);

      $("#listTickets")
        .DataTable()
        .row.add([
          missionHref,
          mission.Tail_Number,
          mission.DV,
          mission.Departure_IATA,
          mission.Departure_Location,
          mission.Arrival_IATA,
          mission.Arrival_Location,
          departureDate,
          arrivalDate,
        ])
        .draw();
    });
  })
  .catch((error) => console.error(error));

// Show tickets relevant to mission
const ticketBody = document.getElementById("ticket_body");
fetch(
  `${HOST_URL}/_api/web/lists/getbytitle('Tickets')/items?$top=1000&$orderby=Created desc&$filter=Mission_Number eq '${missionNumber}'`,
  {
    headers: { Accept: "application/json; odata=verbose" },
    credentials: "include",
  }
)
  .then((response) => response.json())
  .then((data) => {
    const results = data.d.results || [];
    results.forEach((ticket) => {
      let ticketCard = document.createElement("div");
      ticketCard.className = "card";
      ticketCard.innerHTML = `<div class="card-header">
                              <b>
                                <a href="viewTicket.html?ticket=${ticket.GNOC_Ticket_Number}">Ticket #${ticket.GNOC_Ticket_Number}</a>
                              </b>
                            </div>
                            `;
      const ticketOpenDate = convertDateToTicketHTMLString(ticket.Date_Opened);
      const ticketImpact =
        ticket.Impact_Level == null ? "N/A" : ticket.Impact_Level;
      const ticketLastAction =
        ticket.Last_Reported_Action == null
          ? "N/A"
          : ticket.Last_Reported_Action;
      const ticketCcir =
        ticket.CCIR_Number == null ? "N/A" : ticket.CCIR_Number;

      ticketCard.innerHTML += ticketCard.innerHTML += `<div class="card-body">
      <div class="row">
        <div class="col">
          <div class="form-group row">
            <label for="status" class="col-sm-4 col-form-label">Status</label>
            <div class="col-sm-8">
              <input type="text" class="form-control" id="status" value="${ticket.Status}" disabled />
            </div>
          </div>
          <div class="form-group row">
            <label for="open_date" class="col-sm-4 col-form-label">Open Date</label>
            <div class="col-sm-8">
              <input type="text" class="form-control" id="open_date" value="${ticketOpenDate}" disabled />
            </div>
          </div>
          <div class="form-group row">
            <label for="ticket_number" class="col-sm-4 col-form-label">Ticket Number</label>
            <div class="col-sm-8">
              <input type="text" class="form-control" id="ticket_number" value="${ticket.GNOC_Ticket_Number}" disabled />
            </div>
          </div>
          <div class="form-group row">
            <label for="dv_select" class="col-sm-4 col-form-label">DV</label>
            <div class="col-sm-8">
              <input type="text" class="form-control" id="dv_select" value="${ticket.DV}" disabled />
            </div>
          </div>
          <div class="form-group row">
            <label for="impact_level" class="col-sm-4 col-form-label">Impact Level</label>
            <div class="col-sm-8">
              <input type="text" class="form-control" id="impact_level" value="${ticketImpact}" disabled />
            </div>
          </div>
          <div class="form-group row">
            <label for="mission_number" class="col-sm-4 col-form-label">Mission Number</label>
            <div class="col-sm-8">
              <input type="text" class="form-control" id="mission_number" value="${ticket.Mission_Number}" disabled />
            </div>
          </div>
          <div class="form-group row">
            <label for="cso" class="col-sm-4 col-form-label">CSO</label>
            <div class="col-sm-8">
              <input type="text" class="form-control" id="cso" value="${ticket.CSO}" disabled />
            </div>
          </div>
          <div class="form-group row">
            <label for="ccir_number" class="col-sm-4 col-form-label">CCIR Number</label>
            <div class="col-sm-8">
              <input type="text" class="form-control" id="ccir_number" value="${ticketCcir}" disabled />
            </div>
          </div>
          <div class="form-group row">
            <label for="tail_number" class="col-sm-4 col-form-label">Tail Number</label>
            <div class="col-sm-8">
              <input type="text" class="form-control" id="tail_number" value="${ticket.Tail_Number}" disabled />
            </div>
          </div>
        </div>
        <div class="row col-md-6">
          <div class="col">
            <div class="form-group row">
              <label for="category" class="col-sm-4 col-form-label">Category</label>
              <div class="col-sm-8">
                <input type="text" class="form-control" id="category" value="${ticket.Category}" disabled/>
              </div>
            </div>
            <div class="form-group row">
              <label for="sub_category" class="col-sm-4 col-form-label">Sub Category</label>
              <div class="col-sm-8">
                <input type="text" class="form-control" id="sub_category" value="${ticket.Sub_Category}" disabled/>
              </div>
            </div>
            <div class="form-group row">
              <label for="issue_description" class="col-sm-4 col-form-label">Initial Description</label>
              <div class="col-sm-8">
                <textarea class="form-control" id="issue_description" disabled rows="10">${ticket.Issue_Description}</textarea>
              </div>
            </div>
            <div class="form-group row">
              <label for="update_text" class="col-sm-4 col-form-label">Most Recent Update</label>
              <div class="col-sm-8">
                <textarea class="form-control" id="update_text" disabled rows="10">${ticketLastAction}</textarea>
              </div>
            </div>
          </div>`;
      ticketBody.appendChild(ticketCard);
      const lineBreak = document.createElement("br");
      ticketBody.appendChild(lineBreak);
    });
  })
  .catch((error) => console.error(error));
