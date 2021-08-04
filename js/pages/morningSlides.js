import { HOST_URL } from "../modules/constants.js";
import {
  convertDateToTicketHTMLString,
  insertIntoList,
} from "../modules/utility.js";
import permissionsCheck from "../modules/userPermissionsCheck.js";
const TICKETS_LIST_NAME = "Tickets";
const MISSION_LIST_NAME = "Missions";
const AIRCRAFT_LIST_NAME = "Tail_Numbers";
const UPDATE_LIST_NAME = "ticketUpdates";
feather.replace();
permissionsCheck("TU9STklORyBTTElERVM=");

var day = new Date();
if (day.getUTCDay() == 0) {
  // get weekend report
  var now;
  var yesterday = new Date(); // last friday
  const t = new Date().getDate() + (6 - new Date().getDay() - 1) - 7;
  yesterday.setDate(t);

  Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
  };
  now = new Date(yesterday);
  now = now.addDays(3);
  var day = ("0" + now.getDate()).slice(-2);
  var previousDay = ("0" + yesterday.getDate()).slice(-2);
  var month = ("0" + (now.getMonth() + 1)).slice(-2);
  var previousMonth = ("0" + (yesterday.getMonth() + 1)).slice(-2);
} else {
  // get yesterday report
  var now = new Date();
  var yesterday = new Date();
  var day = ("0" + now.getDate()).slice(-2);
  yesterday.setDate(now.getDate() - 1);
  var previousDay = ("0" + yesterday.getDate()).slice(-2);
  var month = ("0" + (now.getMonth() + 1)).slice(-2);
  var previousMonth = ("0" + (yesterday.getMonth() + 1)).slice(-2);
}

const startDate =
  now.getFullYear() + "-" + previousMonth + "-" + previousDay + "T13:00:00Z";
const endDate = now.getFullYear() + "-" + month + "-" + day + "T13:00:00Z";
const startOfDay = now.getFullYear() + "-" + month + "-" + day + "T00:00:00Z";
const endOfDay = now.getFullYear() + "-" + month + "-" + day + "T23:59:59Z";

// Set up global table variables

let openRows = [
  [
    {
      text: "Date Opened",
      options: { bold: true, fontSize: 12, color: "FFFFFF", fill: "4f81bd" },
    },
    {
      text: "DV",
      options: { bold: true, fontSize: 12, color: "FFFFFF", fill: "4f81bd" },
    },
    {
      text: "Mission",
      options: { bold: true, fontSize: 12, color: "FFFFFF", fill: "4f81bd" },
    },
    {
      text: "A/C",
      options: { bold: true, fontSize: 12, color: "FFFFFF", fill: "4f81bd" },
    },
    {
      text: "Ticket #",
      options: { bold: true, fontSize: 12, color: "FFFFFF", fill: "4f81bd" },
    },
    {
      text: "CCIR",
      options: { bold: true, fontSize: 12, color: "FFFFFF", fill: "4f81bd" },
    },
    {
      text: "DV Impact",
      options: { bold: true, fontSize: 12, color: "FFFFFF", fill: "4f81bd" },
    },
    {
      text: "Summary",
      options: { bold: true, fontSize: 12, color: "FFFFFF", fill: "4f81bd" },
    },
  ],
];

let fixedRows = [
  [
    {
      text: "Date Opened",
      options: { bold: true, fontSize: 12, color: "FFFFFF", fill: "4f81bd" },
    },
    {
      text: "DV",
      options: { bold: true, fontSize: 12, color: "FFFFFF", fill: "4f81bd" },
    },
    {
      text: "Mission",
      options: { bold: true, fontSize: 12, color: "FFFFFF", fill: "4f81bd" },
    },
    {
      text: "A/C",
      options: { bold: true, fontSize: 12, color: "FFFFFF", fill: "4f81bd" },
    },
    {
      text: "Ticket #",
      options: { bold: true, fontSize: 12, color: "FFFFFF", fill: "4f81bd" },
    },
    {
      text: "CCIR",
      options: { bold: true, fontSize: 12, color: "FFFFFF", fill: "4f81bd" },
    },
    {
      text: "DV Impact",
      options: { bold: true, fontSize: 12, color: "FFFFFF", fill: "4f81bd" },
    },
    {
      text: "Summary",
      options: { bold: true, fontSize: 12, color: "FFFFFF", fill: "4f81bd" },
    },
    {
      text: "Fix",
      options: { bold: true, fontSize: 12, color: "FFFFFF", fill: "4f81bd" },
    },
  ],
];

let dvsRows = [
  [
    {
      text: "DV",
      options: { bold: true, fontSize: 15, color: "FFFFFF", fill: "4f81bd" },
    },
    {
      text: "A/C",
      options: { bold: true, fontSize: 15, color: "FFFFFF", fill: "4f81bd" },
    },
    {
      text: "Departure",
      options: { bold: true, fontSize: 15, color: "FFFFFF", fill: "4f81bd" },
    },
    {
      text: "Arrival",
      options: { bold: true, fontSize: 15, color: "FFFFFF", fill: "4f81bd" },
    },
  ],
];

const grabOpenTickets = async () => {
  const response = await fetch(
    `${HOST_URL}/_api/web/lists/getbytitle('${TICKETS_LIST_NAME}')/items?$top=5000&$filter=Status eq 'New' or Status eq 'ASSIGNED'&$orderby=Created asc`,
    {
      headers: { Accept: "application/json; odata=verbose" },
      credentials: "include",
    }
  );
  const data = await response.json();
  const items = data.d.results || [];
  return items;
};

const processOpenTickets = async (listOfTickets) => {
  for (let ticket in listOfTickets) {
    const currentTicket = listOfTickets[ticket];

    const ticketNumber = currentTicket.GNOC_Ticket_Number;
    const ticketDateOpened = convertDateToTicketHTMLString(
      currentTicket.Date_Opened
    );
    const ticketDv = currentTicket.DV == null ? "N/A" : currentTicket.DV;
    const ticketTailNumber =
      currentTicket.Tail_Number == null ? "N/A" : currentTicket.Tail_Number;
    const ticketImpactLevel =
      currentTicket.Impact_Level == null ? "N/A" : currentTicket.Impact_Level;
    const ticketSummary =
      currentTicket.Issue_Description == null
        ? "N/A"
        : currentTicket.Issue_Description.replace(/\n/g, "");
    const ticketMissionNumber =
      currentTicket.Mission_Number == null
        ? "N/A"
        : currentTicket.Mission_Number;
    const ccirInbound = currentTicket.CCIR == false ? "No" : "Yes";

    const fill = ticket % 2 == 0 ? "d9d9d9" : "";

    openRows.push([
      {
        text: ticketDateOpened,
        options: {
          breakLine: false,
          autoFit: true,
          w: "100%",
          fill: fill,
        },
      },
      {
        text: ticketDv,
        options: {
          breakLine: false,
          autoFit: true,
          w: "100%",
          fill: fill,
        },
      },
      {
        text: ticketMissionNumber,
        options: {
          breakLine: false,
          autoFit: true,
          w: "100%",
          fill: fill,
        },
      },
      {
        text: ticketTailNumber,
        options: {
          breakLine: false,
          autoFit: true,
          w: "100%",
          fill: fill,
        },
      },
      {
        text: ticketNumber,
        options: {
          breakLine: false,
          autoFit: true,
          w: "100%",
          fill: fill,
        },
      },
      {
        text: ccirInbound,
        options: {
          breakLine: false,
          autoFit: true,
          w: "100%",
          fill: fill,
        },
      },
      {
        text: ticketImpactLevel,
        options: {
          breakLine: false,
          autoFit: true,
          w: "100%",
          fill: fill,
        },
      },
      {
        text: ticketSummary,
        options: {
          breakLine: false,
          autoFit: true,
          w: "100%",
          shrinkText: true,
          fill: fill,
        },
      },
    ]);
  }
};

const grabAllUpdates = async (startDate, endDate) => {
  const response = await fetch(
    `${HOST_URL}/_api/web/lists/getbytitle('${UPDATE_LIST_NAME}')/items?$top=5000&$filter=Created le '${endDate}' and Created ge '${startDate}'`,
    {
      headers: { Accept: "application/json; odata=verbose" },
      credentials: "include",
    }
  );
  const data = await response.json();
  const items = data.d.results || [];
  return items;
};

const processFixedTickets = async (updateList) => {
  for (let update in updateList) {
    const currentUpdate = updateList[update];
    const updateMessage = currentUpdate.update;
    const searchString = `GNOC set ticket #${updateList[update].ticket_number} to FIXED.`;
    if (updateMessage !== searchString) continue;

    const response = await fetch(
      `${HOST_URL}/_api/web/lists/getbytitle('${TICKETS_LIST_NAME}')/items?$top=5000&$filter=GNOC_Ticket_Number eq '${updateList[update].ticket_number}' and Status eq 'FIXED'`,
      {
        headers: { Accept: "application/json; odata=verbose" },
        credentials: "include",
      }
    );
    const data = await response.json();
    const item = data.d.results[0] || "";
    if (!item) continue;

    const ticketNumber = item.GNOC_Ticket_Number;
    const dateOpened = convertDateToTicketHTMLString(item.Date_Opened);
    const ticketDv = item.DV == null ? "N/A" : item.DV;
    const ticketTailNumber =
      item.Tail_Number == null ? "N/A" : item.Tail_Number;
    const ticketImpactLevel =
      item.Impact_Level == null ? "N/A" : item.Impact_Level;
    const ticketSummary =
      item.Issue_Description == null
        ? "N/A"
        : item.Issue_Description.replace(/\n/g, "");
    const ticketMissionNumber =
      item.Mission_Number == null ? "N/A" : item.Mission_Number;
    const ccirInbound = item.CCIR == false ? "No" : "Yes";
    const ticketFixAction = item.Last_Reported_Action.replace(/\n/g, "");

    const fill = fixedRows.length % 2 == 0 ? "d9d9d9" : "";
    fixedRows.push([
      {
        text: dateOpened,
        options: {
          breakLine: false,
          autoFit: true,
          w: "100%",
          fill: fill,
        },
      },
      {
        text: ticketDv,
        options: {
          breakLine: false,
          autoFit: true,
          w: "100%",
          fill: fill,
        },
      },
      {
        text: ticketMissionNumber,
        options: {
          breakLine: false,
          autoFit: true,
          w: "100%",
          fill: fill,
        },
      },
      {
        text: ticketTailNumber,
        options: {
          breakLine: false,
          autoFit: true,
          w: "100%",
          fill: fill,
        },
      },
      {
        text: ticketNumber,
        options: {
          breakLine: false,
          autoFit: true,
          w: "100%",
          fill: fill,
        },
      },
      {
        text: ccirInbound,
        options: {
          breakLine: false,
          autoFit: true,
          w: "100%",
          fill: fill,
        },
      },
      {
        text: ticketImpactLevel,
        options: {
          breakLine: false,
          autoFit: true,
          w: "100%",
          fill: fill,
        },
      },
      {
        text: ticketSummary,
        options: {
          breakLine: false,
          autoFit: true,
          w: "100%",
          shrinkText: true,
          fill: fill,
        },
      },
      {
        text: ticketFixAction,
        options: {
          breakLine: false,
          autoFit: true,
          w: "100%",
          shrinkText: true,
          fill: fill,
        },
      },
    ]);
  }
};

const getAllMissions = async (startOfDay, endOfDay) => {
  const response = await fetch(
    `${HOST_URL}/_api/web/lists/getbytitle('${MISSION_LIST_NAME}')/items?$top=5000&$filter=Created le '${endOfDay}' and Created ge '${startOfDay}'&$orderby=Departure_Date asc`,
    {
      headers: { Accept: "application/json; odata=verbose" },
      credentials: "include",
    }
  );
  const data = await response.json();
  const items = data.d.results || [];
  return items;
};

const getAllDvsFlying = async (listOfMissions) => {
  let listOfDvs = [];
  for (let mission in listOfMissions) {
    if (
      !listOfDvs.includes(listOfMissions[mission].DV) &&
      listOfMissions[mission].DV != null &&
      listOfMissions[mission].DV != "GDSS" &&
      listOfMissions[mission].DV != "DH"
    )
      listOfDvs.push(listOfMissions[mission].DV);
  }
  return listOfDvs.sort();
};

const getMissionsForDv = async (startOfDay, endOfDay, dv) => {
  const response = await fetch(
    `${HOST_URL}/_api/web/lists/getbytitle('${MISSION_LIST_NAME}')/items?$top=5000&$filter=Created le '${endOfDay}' and Created ge '${startOfDay}' and DV eq '${encodeURIComponent(
      dv
    )}'&$orderby=Departure_Date asc`,
    {
      headers: { Accept: "application/json; odata=verbose" },
      credentials: "include",
    }
  );
  const data = await response.json();
  const items = data.d.results || [];
  return items;
};

const getAircraftType = async (tailNumber) => {
  const response = await fetch(
    `${HOST_URL}/_api/web/lists/getbytitle('${AIRCRAFT_LIST_NAME}')/items?$filter=Tail_Number eq '${tailNumber}'`,
    {
      headers: { Accept: "application/json; odata=verbose" },
      credentials: "include",
    }
  );
  const data = await response.json();
  const items = data.d.results[0] || "UNKNOWN";
  return items.Aircraft_Model;
};

const processDvsFlying = async (startOfDay, endOfDay, listOfDvs) => {
  for (let dv in listOfDvs) {
    const currentDv = listOfDvs[dv];
    const dvsMissions = await getMissionsForDv(startOfDay, endOfDay, currentDv);
    console.log(currentDv);
    const tailNumber = dvsMissions[0].Tail_Number || "UNKNOWN";
    const aircraftType = await getAircraftType(tailNumber);
    const aircraftString = `${tailNumber} (${aircraftType})`;

    for (let mission in dvsMissions) {
      let currentRow = [];
      const currentMission = dvsMissions[mission];
      const fill = dv % 2 == 0 ? "d9d9d9" : "";

      if (mission == 0) {
        currentRow = [
          {
            text: currentDv,
            options: {
              rowspan: dvsMissions.length,
              breakLine: false,
              autoFit: true,
              w: "100%",
              bold: true,
              fill: fill,
            },
          },
          {
            text: aircraftString,
            options: {
              rowspan: dvsMissions.length,
              breakLine: false,
              autoFit: true,
              w: "100%",
              align: "center",
              fill: fill,
            },
          },
          {
            text: currentMission.Departure_Location,
            options: {
              breakLine: false,
              autoFit: true,
              w: "100%",
              fill: fill,
            },
          },
          {
            text: currentMission.Arrival_Location,
            options: {
              breakLine: false,
              autoFit: true,
              w: "100%",
              fill: fill,
            },
          },
        ];
      } else {
        currentRow = [
          {
            text: currentMission.Departure_Location,
            options: {
              breakLine: false,
              autoFit: true,
              w: "100%",
              fill: fill,
            },
          },
          {
            text: currentMission.Arrival_Location,
            options: {
              breakLine: false,
              autoFit: true,
              w: "100%",
              fill: fill,
            },
          },
        ];
      }
      dvsRows.push(currentRow);
    }
  }
};

const populateRows = async () => {
  const [listOfTickets, updateList, listOfMissions] = await Promise.all([
    grabOpenTickets(),
    grabAllUpdates(startDate, endDate),
    getAllMissions(startOfDay, endOfDay),
  ]);

  const listOfDvs = await getAllDvsFlying(listOfMissions);
  await Promise.all([
    processOpenTickets(listOfTickets),
    processFixedTickets(updateList),
    processDvsFlying(startOfDay, endOfDay, listOfDvs),
  ]);

  const formLoader = document.getElementById("powerpoint_loader");
  formLoader.style.display = "none";

  document.getElementById("genAllPdf").disabled = false;
  document.getElementById("genDvsPdf").disabled = false;
  document.getElementById("genOpenPdf").disabled = false;
  document.getElementById("genFixedPdf").disabled = false;
};

populateRows();

const generatePDF = (title, rows) => {
  var pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "GSOC";
  pptx.suject = "TICKET REPORT";
  var titles = ["DVS FLYING", "OPEN TICKETS", "FIXED TICKETS"];
  var rowChoice = [dvsRows, openRows, fixedRows];
  if (title == "ALL") {
    for (var i = 0; i < titles.length; i++) {
      title = titles[i];
      rows = rowChoice[i];
      pptx.defineSlideMaster({
        title: "" + title + "_SLIDE",
        background: { color: "FFFFFF" },
        objects: [
          {
            text: {
              text: "GSOC - " + title + "",
              options: {
                x: 0,
                y: 0.2,
                w: "100%",
                h: 1.0,
                fontSize: 31,
                bold: true,
                align: "center",
                color: "0C2D83",
                fontFace: "Arial",
              },
            },
          },
          {
            text: {
              text: "SAM FOX...PERFECTION is our Standard",
              options: {
                x: 0,
                y: "90%",
                w: "100%",
                h: 1.0,
                fontSize: 31,
                align: "center",
                bold: true,
                color: "0C2D83",
                fontFace: "Arial",
              },
            },
          },
          {
            rect: {
              x: 0,
              y: 1.3,
              w: "100%",
              h: 0.05,
              fill: { color: "0C2D83" },
            },
          },
          {
            rect: {
              x: 0,
              y: 7.0,
              w: "100%",
              h: 0.05,
              fill: { color: "0C2D83" },
            },
          },
          { image: { x: 0.7, y: 0.2, w: 1.0, h: 1.0, path: "./img/89cs.png" } },
          {
            image: {
              x: 11.8,
              y: 0.2,
              w: 1.0,
              h: 1.0,
              path: "./img/samfox.jpg",
            },
          },
        ],
        slideNumber: { x: 0.3, y: "95%" },
      });
      var slide = pptx.addSlide({ masterName: "" + title + "_SLIDE" });
      if (title == "OPEN TICKETS") {
        var tabOpts = {
          x: "1%",
          y: 1.5,
          h: 4.3,
          fill: "FFFFFF",
          fontSize: 10,
          color: "000000",
          autoPage: true,
          colW: [1.5, 1.0, 1.0, 0.8, 1.5, 0.5, 0.8, 6.0],
          rowH: [0.2],
          valign: "middle",
          autoPageRepeatHeader: true,
          newSlideStartY: 1.5,
          border: { type: "solid" },
        };
        slide.addTable(rows, tabOpts);
      }
      if (title == "FIXED TICKETS") {
        var tabOpts = {
          x: "1%",
          y: 1.5,
          h: 4.3,
          fill: "FFFFFF",
          fontSize: 10,
          color: "000000",
          autoPage: true,
          colW: [1.5, 1.0, 1.0, 0.8, 1.5, 0.5, 0.8, 3.0, 3.0],
          rowH: [0.2],
          valign: "middle",
          autoPageRepeatHeader: true,
          newSlideStartY: 1.5,
          border: { type: "solid" },
        };
        slide.addTable(rows, tabOpts);
      }
      if (title == "DVS FLYING") {
        var tabOpts = {
          x: "2.5%",
          y: 1.5,
          h: 4.3,
          fill: "FFFFFF",
          fontSize: 12,
          color: "000000",
          autoPage: true,
          colW: [2.5, 2.0, 4.0, 4.0],
          rowH: [0.2],
          valign: "middle",
          autoPageRepeatHeader: true,
          newSlideStartY: 1.5,
          border: { type: "solid" },
        };
        slide.addTable(rows, tabOpts);
      }
    }
  } else {
    pptx.defineSlideMaster({
      title: "" + title + "_SLIDE",
      background: { color: "FFFFFF" },
      objects: [
        {
          text: {
            text: "GSOC - " + title + "",
            options: {
              x: 4,
              y: 0.2,
              w: "70%",
              h: 1.0,
              fontSize: 31,
              bold: true,
              color: "0C2D83",
              fontFace: "Arial",
            },
          },
        },
        {
          text: {
            text: "SAM FOX...PERFECTION is our Standard",
            options: {
              x: 2.5,
              y: "90%",
              w: "70%",
              h: 1.0,
              fontSize: 31,
              bold: true,
              color: "0C2D83",
              fontFace: "Arial",
            },
          },
        },
        {
          rect: { x: 0, y: 1.3, w: "100%", h: 0.05, fill: { color: "0C2D83" } },
        },
        {
          rect: { x: 0, y: 7.0, w: "100%", h: 0.05, fill: { color: "0C2D83" } },
        },
        { image: { x: 0.7, y: 0.2, w: 1.0, h: 1.0, path: "./img/89cs.png" } },
        {
          image: { x: 11.8, y: 0.2, w: 1.0, h: 1.0, path: "./img/samfox.jpg" },
        },
      ],
      slideNumber: { x: 0.3, y: "95%" },
    });

    var slide = pptx.addSlide({ masterName: "" + title + "_SLIDE" });
    if (title == "OPEN TICKETS") {
      var tabOpts = {
        x: "1%",
        y: 1.5,
        h: 4.3,
        fill: "FFFFFF",
        fontSize: 10,
        color: "000000",
        autoPage: true,
        colW: [1.5, 1.0, 1.0, 0.8, 1.5, 0.5, 0.8, 6.0],
        rowH: [0.2],
        valign: "middle",
        autoPageRepeatHeader: true,
        newSlideStartY: 1.5,
        border: { type: "solid" },
      };
      slide.addTable(rows, tabOpts);
    }
    if (title == "FIXED TICKETS") {
      var tabOpts = {
        x: "1%",
        y: 1.5,
        h: 4.3,
        fill: "FFFFFF",
        fontSize: 10,
        color: "000000",
        autoPage: true,
        colW: [1.5, 1.0, 1.0, 0.8, 1.5, 0.5, 0.8, 3.0, 3.0],
        rowH: [0.2],
        valign: "middle",
        autoPageRepeatHeader: true,
        newSlideStartY: 1.5,
        border: { type: "solid" },
      };
      slide.addTable(rows, tabOpts);
    }
    if (title == "DVS FLYING") {
      var tabOpts = {
        x: "2.5%",
        y: 1.5,
        h: 4.3,
        fill: "FFFFFF",
        fontSize: 12,
        color: "000000",
        autoPage: true,
        colW: [2.5, 2.0, 4.0, 4.0],
        rowH: [0.2],
        valign: "middle",
        autoPageRepeatHeader: true,
        newSlideStartY: 1.5,
        border: { type: "solid" },
      };
      slide.addTable(rows, tabOpts);
    }
  }
  pptx.writeFile("Morning Slides");
};

/* Event Handlers */
document.querySelector("#genOpenPdf").addEventListener("click", (event) => {
  generatePDF("OPEN TICKETS", openRows);
});

document.querySelector("#genFixedPdf").addEventListener("click", (event) => {
  generatePDF("FIXED TICKETS", fixedRows);
});

document.querySelector("#genDvsPdf").addEventListener("click", (event) => {
  generatePDF("DVS FLYING", dvsRows);
});

document.querySelector("#genAllPdf").addEventListener("click", (event) => {
  generatePDF("ALL", openRows);
});
