import { HOST_URL } from "../modules/constants.js";
import {
  updateListItem,
  removeFromList,
  getUrlParameter,
  convertDateToTicketHTMLString,
  insertIntoList,
  convertDateToISOString,
} from "../modules/utility.js";
import permissionsCheck from "../modules/userPermissionsCheck.js";
const TICKET_LIST = "Tickets";
const UPDATE_LIST = "ticketUpdates";
const MASTER_TICKETS_LIST = "masterTickets";
const ATTACHMENTS_LIST = "ticketAttachments";
const BEAM_LIST_NAME = "Viasat_Beams";
permissionsCheck("VklFVyBUSUNLRVQ");
feather.replace();

// Get files: https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('ticketAttachments')/items?$select=ticket_number,Attachments,AttachmentFiles&$expand=AttachmentFiles

const ticketNumber = getUrlParameter("ticket");
let ticketID, ticketStatus;
let ticketUpdateIds = [];
//$(":file").filestyle("dragdrop");

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

const populateTicketCategories = async () => {
  const response = await fetch(
    `${HOST_URL}/_api/web/lists/getbytitle('Ticket_Categories')/items?$orderby=Category%20asc`,
    {
      headers: { Accept: "application/json; odata=verbose" },
      credentials: "include",
    }
  );
  const data = await response.json();
  const items = data.d.results;
  const ticketCategoryInput = document.getElementById("category");
  for (let item in items) {
    let opt = document.createElement("option");
    opt.innerHTML = items[item].Category;
    ticketCategoryInput.appendChild(opt);
  }
  $(".selectpicker").selectpicker("refresh");
  return;
};

const populateFilesUploaded = () => {
  fetch(
    `${HOST_URL}/_api/web/lists/getbytitle('${ATTACHMENTS_LIST}')/items?$select=ticket_number,Attachments,AttachmentFiles&$expand=AttachmentFiles&$filter=ticket_number eq '${ticketNumber}'`,
    {
      headers: { Accept: "application/json; odata=verbose" },
      credentials: "include",
    }
  )
    .then((response) => response.json())
    .then((data) => {
      const results = data.d.results;
      if (!results) return;
      const addedFilesContainer = document.getElementById("add_files");
      const fileHref = document.createElement("span");
      fileHref.innerHTML = `<b>Uploaded Files:</b><br>`;
      addedFilesContainer.appendChild(fileHref);

      results.forEach((file) => {
        const fileName = file.AttachmentFiles.results[0].FileName;
        const fileDownloadLink = `https://intelshare.intelink.gov/${file.AttachmentFiles.results[0].ServerRelativeUrl}`;
        const additionalFile = document.createElement("span");
        additionalFile.innerHTML = `<a href="${fileDownloadLink}" target="_blank" download><span data-feather="file-text"></span>${fileName}</a>&nbsp;`;
        addedFilesContainer.appendChild(additionalFile);
      });
    })
    .catch((error) => console.error("Error: ", error));
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
          )} - ${htmlName}:</b> ${updateText}<span class="float-right" id="deleteUpdate"><a href="javascript:void(0);"><span id="delete-${updateId}" style="color:#fff" data-feather="trash-2"></a></span>`;
        }
        ticketLogContainer.appendChild(updateListItem);
        feather.replace();
      });
      addLinkListeners();
    })
    .catch((error) => console.error("Error: ", error));
};

const checkForMasterTicket = () => {
  fetch(
    `${HOST_URL}/_api/web/lists/getbytitle('${MASTER_TICKETS_LIST}')/items?$top=5000`,
    {
      headers: { Accept: "application/json; odata=verbose" },
      credentials: "include",
    }
  )
    .then((response) => response.json())
    .then((data) => {
      const results = data.d.results;
      if (!results) return;

      results.forEach((ticket) => {
        if (!ticket.ticket_list) return;
        const currentTicketsList = ticket.ticket_list.split(",");
        const masterTicketNumber = ticket.Title;
        const masterTicketId = ticket.Id;

        if (!currentTicketsList.includes(ticketNumber)) return;
        const ticketAlertContainer = document.getElementById("ticket_view");
        const ticketAlert = document.createElement("div");
        const classList = ["alert", "alert-info", "font-weight-bold"];
        ticketAlert.classList.add(...classList);
        ticketAlert.innerHTML = `<span data-feather="alert-circle">&nbsp;</span>This ticket is part of master ticket <a href="./viewMasterTTS.html?ticket=${masterTicketId}">${masterTicketNumber}.</a>`;

        ticketAlertContainer.prepend(ticketAlert);
        feather.replace();
      });
    })
    .catch((error) => console.error("Error: ", error));
};

const populateBeamDropDown = async () => {
  const response = await fetch(
    `${HOST_URL}/_api/web/lists/getbytitle('${BEAM_LIST_NAME}')/items?$orderby=Network asc`,
    {
      headers: { Accept: "application/json; odata=verbose" },
      credentials: "include",
    }
  );
  const data = await response.json();
  const items = data.d.results;
  const beamSelect = document.getElementById("beam");
  for (let item in items) {
    let opt = document.createElement("option");
    opt.innerHTML = items[item].Beam;
    beamSelect.appendChild(opt);
  }
  $(".selectpicker").selectpicker("refresh");
};

const populateTicketInformation = async () => {
  await populateBeamDropDown();
  await populateAircraftDropDown();
  await populateDvDropDown();
  await populateTicketCategories();

  const ticketTitleField = document.getElementById("ticket_title");
  ticketTitleField.value = ticketNumber;
  const ticketNumberField = document.getElementById("ticket_number");
  ticketNumberField.value = ticketNumber;

  fetch(
    `${HOST_URL}/_api/web/lists/getbytitle('${TICKET_LIST}')/items?$select=Author/Name,GNOC_Ticket_Number,Beam,Status,Date_Opened,DV,Impact_Level,Mission_Number,Leg,CSO,CCIR_Number,Tail_Number,Category,Sub_Category,Issue_Description,Id&$filter=GNOC_Ticket_Number eq '${ticketNumber}'&$expand=Author`,
    {
      headers: { Accept: "application/json; odata=verbose" },
      credentials: "include",
    }
  )
    .then((response) => response.json())
    .then((data) => {
      const result = data.d.results[0] || "";
      if (!result) return;
      const ticketStatusField = document.getElementById("status");
      ticketStatusField.value = result.Status;
      ticketStatus = result.Status;

      console.log(ticketStatus);

      const openDateField = document.getElementById("open_date");
      openDateField.value = convertDateToISOString(result.Date_Opened);

      const dvSelectField = document.getElementById("dv_select");
      dvSelectField.value = result.DV;
      if (!result.Impact_Level)
        document.getElementById("impact_level").value = "None";
      else document.getElementById("impact_level").value = result.Impact_Level;

      const missionNumberField = document.getElementById("mission_number");
      missionNumberField.value = result.Mission_Number;

      const csoField = document.getElementById("cso");
      csoField.value = result.CSO;

      const ccirField = document.getElementById("ccir");
      if (result.CCIR) ccirField.value = "Yes";
      else ccirField.value = "No";

      const ccirNumberField = document.getElementById("ccir_number");
      ccirNumberField.value = result.CCIR_Number;

      const tailNumberField = document.getElementById("tail_number");
      tailNumberField.value = result.Tail_Number;

      const categorySelect = document.getElementById("category");
      categorySelect.value = result.Category;

      const subCategoryField = document.getElementById("sub_category");
      subCategoryField.value = result.Sub_Category;

      const beamSelect = document.getElementById("beam");
      beamSelect.value = result.Beam;

      const issueDescriptionTextarea =
        document.getElementById("issue_description");
      issueDescriptionTextarea.value = result.Issue_Description;
      $(".selectpicker").selectpicker("refresh");

      const authorName = result.Author.Name.split("|");
      const fullName = authorName[2];
      let nameArray = fullName.split(".");
      if (!nameArray[2]) nameArray[2] = nameArray[1];
      const htmlName = `${nameArray[0].toUpperCase()} ${nameArray[2].toUpperCase()}`;
      const authorSpan = document.getElementById("createdBy");
      authorSpan.innerHTML = `Created by: <b>${htmlName}</b>`;

      ticketID = result.Id;
      //populateFilesUploaded();
      generateTimeline();
      checkForMasterTicket();
    })
    .catch((error) => console.error("Error: ", error));
};
populateTicketInformation();

const deleteUpdate = (id) => {};

/* Event Handlers */

document.querySelector("#ticket_submit").addEventListener("click", (event) => {
  const enteredTicketNumber = document.getElementById("ticket_number").value;
  const selectedDv = document.getElementById("dv_select").value;
  const selectedTailNumber = document.getElementById("tail_number").value;
  const enteredMissionNumber = document.getElementById("mission_number").value;
  const selectedLeg = document.getElementById("leg").value;
  const selectedImpactLevel = document.getElementById("impact_level").value;

  let enteredDvImpact;
  if (selectedImpactLevel === "None") enteredDvImpact = false;
  else enteredDvImpact = true;

  const selectedCategory = document.getElementById("category").value;
  const enteredSubCategory = document.getElementById("sub_category").value;
  const selectedStatus = document.getElementById("status").value;
  const selectedCcir = document.getElementById("ccir").value;

  let isCcir = false;
  if (selectedCcir === "Yes") isCcir = true;

  const enteredCcirNumber = document.getElementById("ccir_number").value;
  const enteredCso = document.getElementById("cso").value;
  const selectedBeam = document.getElementById("beam").value;

  // Disable button so user can not double click.
  const LOADING_TEXT =
    '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';
  event.target.disabled = true;
  event.target.innerHTML = LOADING_TEXT;

  const ticketProperties = {
    GNOC_Ticket_Number: enteredTicketNumber,
    DV: selectedDv,
    Tail_Number: selectedTailNumber,
    Mission_Number: enteredMissionNumber,
    DV_Impact: enteredDvImpact,
    Impact_Level: selectedImpactLevel,
    Category: selectedCategory,
    Sub_Category: enteredSubCategory,
    Status: selectedStatus,
    CCIR: isCcir,
    CCIR_Number: enteredCcirNumber,
    CSO: enteredCso,
    Leg: selectedLeg,
    Beam: selectedBeam,
  };

  updateListItem(
    TICKET_LIST,
    ticketID,
    ticketProperties,
    () => {
      // Now lets check if there is an update we an add
      const enteredUpdateText = document.getElementById("update_text").value;
      if (enteredUpdateText) {
        const updateProperties = {
          ticket_number: enteredTicketNumber,
          update: enteredUpdateText,
        };
        insertIntoList(
          UPDATE_LIST,
          updateProperties,
          () => {
            const todaysDate = new Date().toISOString();
            const reportedActionProperties = {
              Update_Date: todaysDate,
              Last_Reported_Action: enteredUpdateText,
            };
            updateListItem(
              TICKET_LIST,
              ticketID,
              reportedActionProperties,
              () => {
                document.getElementById("update_text").value = "";
                console.log(selectedStatus);
                if (selectedStatus != ticketStatus) {
                  const fixedTicketMessage = `GNOC set ticket #${enteredTicketNumber} to ${selectedStatus}.`;

                  const updateProperties = {
                    ticket_number: enteredTicketNumber,
                    update: fixedTicketMessage,
                  };
                  insertIntoList(UPDATE_LIST, updateProperties, () => {
                    alert("Ticket updated successfully.");
                    location.reload();
                    return;
                  });
                } else {
                  alert("Ticket updated successfully.");
                  location.reload();
                  return;
                }
              },
              (error) => console.error("Error: ", error)
            );
          },
          (error) => {
            console.error("Error: ", error);
          }
        );
      } else {
        console.log(selectedStatus);
        if (selectedStatus != ticketStatus) {
          const fixedTicketMessage = `GNOC set ticket #${enteredTicketNumber} to ${selectedStatus}.`;

          const updateProperties = {
            ticket_number: enteredTicketNumber,
            update: fixedTicketMessage,
          };
          insertIntoList(UPDATE_LIST, updateProperties, () => {
            alert("Ticket updated successfully.");
            location.reload();
            return;
          });
        }
        alert("Ticket updated successfully.");
        location.reload();
        return;
      }
    },
    (error) => {
      console.error("Error: ", error);
    }
  );
});

// Delete Ticket
document.querySelector("#deleteTicket").addEventListener("click", (event) => {
  // Disable button so user can not double click.
  const LOADING_TEXT =
    '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';
  event.target.disabled = true;
  event.target.innerHTML = LOADING_TEXT;

  removeFromList(
    TICKET_LIST,
    ticketID,
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

const addLinkListeners = () => {
  document.querySelectorAll("[id^='delete-']").forEach((item) => {
    item.addEventListener("click", (event) => {
      const deleteId = event.target.id.split("-")[1];
      const currentButton = event.currentTarget;

      removeFromList(
        UPDATE_LIST,
        deleteId,
        () => {
          currentButton.parentNode.parentNode.parentNode.remove();
        },
        (error) => {
          alert(
            "Update failed to delete, please fully refresh the page and try again."
          );
          console.error("Error: ", error);
        }
      );
    });
  });
};

// Upload a file
/*
      $(document).on("click", "#upload_files", function () {
        // Checking if document is uploaded
        if (document.getElementById("file_upload").files.length === 0) {
          alert("No file was selected.");
          return;
        } else {
          // reading uploaded file values and uploading each one
          var fileNameArr = document.getElementById("file_upload").files;
          console.log(fileNameArr);
          Array.prototype.forEach.call(fileNameArr, function (entry, index) {
            // first insert new value in the list
            var itemProperties = { ticket_number: ticket_number };
            CreateListItemWithDetails(
              "ticketAttachments",
              itemProperties,
              index
            ).then((id) => {
              var itemId = id;
              var filename = fileNameArr[index].name;
              var file = document.getElementById("file_upload").files[index];

              if (index == 0) {
                var alerts = true;
              }
              uploadFile("ticketAttachments", itemId, filename, file, alerts);
            });
          });
        }
      });


      function getFileBuffer(file) {
        var deferred = $.Deferred();
        var reader = new FileReader();
        reader.onload = function (e) {
          deferred.resolve(e.target.result);
        };
        reader.onerror = function (e) {
          deferred.reject(e.target.error);
        };
        reader.readAsArrayBuffer(file);
        return deferred.promise();
      }

      function uploadFile(listName, id, fileName, file, alerts) {
        var deferred = $.Deferred();
        getFileBuffer(file).then(
          function (buffer) {
            var bytes = new Uint8Array(buffer);
            var queryUrl =
              "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('" +
              listName +
              "')/items(" +
              id +
              ")/AttachmentFiles/add(FileName='" +
              fileName +
              "')";
            $.ajax({
              url: queryUrl,
              type: "POST",
              processData: false,
              contentType: "application/json;odata=verbose",
              data: buffer,
              headers: {
                Accept: "application/json;odata=verbose",
                "X-RequestDigest": digest,
                "content-length": buffer.byteLength,
              },
              success: onAttachmentSuccess(alerts),
              error: onAttachmentFailure,
            });
          },
          function (err) {
            deferred.reject(err);
          }
        );
        return deferred.promise();
      }
      function onAttachmentSuccess(alerts) {
        console.log("Success");
        if (alerts) {
          alert("File(s) have been uploaded successfully.");
          location.reload();
        }
      }
      function onAttachmentFailure() {
        console.log("An error occured.");
      }
      */
// Check if ticket is part of master ticket
/*
        var urlLoad = "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/search/query?querytext='" + ticket_number + " AND path:https://intelshare.intelink.gov/sites/89cs/GNOC/Lists/masterTickets/'";
        $.ajax({
          url: urlLoad,
          async: false,
          method: "GET",
          headers: {
            "Accept": "application/json;odata=verbose"
          },
          success: function (data) {
            var allResults = data.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results;
            console.log(data);
            if (Number(allResults.length) > 0) {
              var master_ticket = allResults[1].Cells.results[3].Value;
              var master_ticket_id = allResults[1].Cells.results[6].Value;
              master_ticket_id = master_ticket_id.split("=")[1];
              $("#ticket_view").prepend("<div class=\"alert alert-info font-weight-bold\" role=\"alert\"><span data-feather=\"alert-circle\">&nbsp;</span>This ticket is part of master ticket <a href=\"./viewMasterTTS.html?ticket=" + master_ticket_id + "\">#" + master_ticket + "</a></div>");
            }
          },
          error: function (data) {
            //alert("Error: " + JSON.stringify(data));
          }
        });*/
