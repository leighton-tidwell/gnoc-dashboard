import { HOST_URL } from "../modules/constants.js";
import permissionsCheck from "../modules/userPermissionsCheck.js";
import { daysIntoYear, insertIntoList } from "../modules/utility.js";
const TICKETS_LIST_NAME = "Tickets";
const CCIR_LIST_NAME = "CCIR";
const MISSION_LIST_NAME = "Missions";
feather.replace();
permissionsCheck("TU9STklORyBTTElERVM=");

let now = new Date();
let now3, month3, lastDay3, startDate3, endDate3;
now.setMonth(now.getMonth() - 1);
let lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
let month = ("0" + (now.getMonth() + 1)).slice(-2);
let startDate = now.getFullYear() + "-" + month + "-01T00:00:00Z";
let endDate = now.getFullYear() + "-" + month + "-" + lastDay + "T23:59:59Z";
let options = { month: "long" };
console.log(startDate + " -(INITIAL)  " + endDate);
let previousMonths = [0, 0, now.toLocaleDateString("en-US", options)];

$(function () {
  $("#selected_date").val(now.getFullYear() + "-" + month);
  $("#selected_date").on("change", function (e) {
    let dateVal = $(this).val();
    let dateSplit = dateVal.split("-");
    let dateMonth = Number(dateSplit[1]) - 1;
    let dateYear = dateSplit[0];

    now = new Date(dateYear, dateMonth, 1, 0, 0, 0);
    lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    month = ("0" + (now.getMonth() + 1)).slice(-2);
    startDate = now.getFullYear() + "-" + month + "-01T00:00:00Z";
    endDate = now.getFullYear() + "-" + month + "-" + lastDay + "T23:59:59Z";
    previousMonths = [0, 0, now.toLocaleDateString("en-US", options)];

    console.log("Start Date and End Date 1: " + startDate + " - " + endDate);
  });

  $(document).on("click", "#genAllPdf", function () {
    let dateVal = $("#selected_date").val();
    let dateSplit = dateVal.split("-");
    let dateMonth = Number(dateSplit[1]) - 1;
    let dateYear = dateSplit[0];

    // Lets set the date up for the 3 months:
    now3 = new Date(dateYear, dateMonth, 1, 0, 0, 0);
    now3.setMonth(now3.getMonth() - 2);
    month3 = ("0" + (now3.getMonth() + 1)).slice(-2);
    startDate3 = now3.getFullYear() + "-" + month3 + "-01T00:00:00Z";

    now3 = new Date(dateYear, dateMonth, 1, 0, 0, 0); // reset the date
    now3.setMonth(now3.getMonth() - 1);
    lastDay3 = new Date(now3.getFullYear(), now3.getMonth() + 1, 0).getDate();
    month3 = ("0" + (now3.getMonth() + 1)).slice(-2);
    endDate3 =
      now3.getFullYear() + "-" + month3 + "-" + lastDay3 + "T23:59:59Z";

    console.log("Start Date & End Date 3: " + startDate3 + " - " + endDate3);
    // the above is probably not the most efficient way to do this lol - but for now it works.

    let $this = $(this);
    let loadingText =
      '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';
    if ($(this).html() !== loadingText) {
      $this.data("original-text", $(this).html());
      $this.html(loadingText);
      $this.attr("disabled", true);
    }

    dataGrab();
    generatePDF();
  });

  feather.replace();
});

// Globals
let ticketData;
let ticketData3Months;
let ccirData;
let missionData;
let missionData3Months;
let dvTotalCCIRs = { VPOTUS: 0, SECSTATE: 0, SECDEF: 0, CJCS: 0 };
let dvTotalTickets = { VPOTUS: 0, SECSTATE: 0, SECDEF: 0, CJCS: 0 };
let dvMissionImpact = { VPOTUS: 0, SECSTATE: 0, SECDEF: 0, CJCS: 0 };
let dvMissionImpact3Months = {
  VPOTUS: [0, 0, 0],
  SECSTATE: [0, 0, 0],
  SECDEF: [0, 0, 0],
  CJCS: [0, 0, 0],
};
let legsPerDv = { VPOTUS: 0, SECSTATE: 0, SECDEF: 0, CJCS: 0 };
let legsPerDv3Months = {
  VPOTUS: [0, 0, 0],
  SECSTATE: [0, 0, 0],
  SECDEF: [0, 0, 0],
  CJCS: [0, 0, 0],
};
let legsPerAc = { VPOTUS: {}, SECSTATE: {}, SECDEF: {}, CJCS: {} };
let missionsPerDV = { VPOTUS: 0, SECSTATE: 0, SECDEF: 0, CJCS: 0 };
let missionsPerDv3Months = {
  VPOTUS: [0, 0, 0],
  SECSTATE: [0, 0, 0],
  SECDEF: [0, 0, 0],
  CJCS: [0, 0, 0],
};
let percentMissionsIssues = { VPOTUS: 0, SECSTATE: 0, SECDEF: 0, CJCS: 0 };
let percentMissionIssues3Months = {
  VPOTUS: [0, 0, 0],
  SECSTATE: [0, 0, 0],
  SECDEF: [0, 0, 0],
  CJCS: [0, 0, 0],
};
let legImpactPer3Months = { VPOTUS: {}, SECSTATE: {}, SECDEF: {}, CJCS: {} };
let ticketCategories3Months = {
  VPOTUS: [0, 0, 0],
  SECSTATE: [0, 0, 0],
  SECDEF: [0, 0, 0],
  CJCS: [0, 0, 0],
};
let ticketCategories = [];
let dvTicketCategories = {
  VPOTUS: [[], [], []],
  SECSTATE: [[], [], []],
  SECDEF: [[], [], []],
  CJCS: [[], [], []],
};
let ticketCategoryNumbers = [];
let tailsWithTickets = [];
let tailsNoImpact = [];
let tailsLowImpact = [];
let tailsMedImpact = [];
let tailsHighImpact = [];
function dataGrab() {
  let dvs = ["VPOTUS", "SECSTATE", "SECDEF", "CJCS"];
  grabAllTickets();
  grabAllMissions();
  totalCCIRS();
  dvTotalTicketCount();
  dvTotalMissionImpact();
  legsPerDvCount();
  missionsPerDvCount();
  for (let i = 0; i < dvs.length; i++) {
    legsPerAcCount(dvs[i]);
  }
  for (let i = 0; i < dvs.length; i++) {
    percentMissionsIssuesCount(dvs[i]);
  }
  ticketsByCategoryFunc();
  ticketsByTail();
  grabAllData3Months();
  //dvTotalTicketCount3Months()
  for (let i = 0; i < dvs.length; i++) {
    legsWithIssues3Months(dvs[i]);
  }
  for (let i = 0; i < dvs.length; i++) {
    legsImpact3Months(dvs[i]);
  }
  for (let i = 0; i < dvs.length; i++) {
    dvTicketCatFunc(dvs[i]);
  }
}

function grabAllTickets() {
  // First lets pull ALL of the tickets TOTAL
  let urlLoad =
    "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('Tickets')/items?$top=5000&$filter=Created le '" +
    endDate +
    "' and Created ge '" +
    startDate +
    "'";
  $.ajax({
    url: urlLoad,
    async: false,
    method: "GET",
    headers: {
      Accept: "application/json;odata=verbose",
    },
    success: function (data) {
      ticketData = data.d.results;
    },
  });
}

function grabAllMissions() {
  let urlLoad =
    "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('Missions')/items?$top=5000&$filter=Created le '" +
    endDate +
    "' and Created ge '" +
    startDate +
    "'";
  $.ajax({
    url: urlLoad,
    async: false,
    method: "GET",
    headers: {
      Accept: "application/json;odata=verbose",
    },
    success: function (data) {
      missionData = data.d.results;
    },
  });
}

function totalCCIRS() {
  // First lets pull ALL of the CCIRs TOTAL
  let urlLoad =
    "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('CCIR')/items?$top=5000&$filter=Date le '" +
    endDate +
    "' and Date ge '" +
    startDate +
    "'";
  $.ajax({
    url: urlLoad,
    async: false,
    method: "GET",
    headers: {
      Accept: "application/json;odata=verbose",
    },
    success: function (data) {
      let allResults = data.d.results;
      ccirData = data.d.results;
      if (allResults.length > 0) {
        for (let i = 0; i < allResults.length; i++) {
          // looping through all results
          let currentTime = allResults[i].Created;
          if (allResults[i].DV == "VPOTUS") {
            dvTotalCCIRs.VPOTUS++;
          } else if (allResults[i].DV == "SECSTATE") {
            dvTotalCCIRs.SECSTATE++;
          } else if (allResults[i].DV == "SECDEF") {
            dvTotalCCIRs.SECDEF++;
          } else if (allResults[i].DV == "CJCS") {
            dvTotalCCIRs.CJCS++;
          }
        }
      }
    },
  });
}

function dvTotalTicketCount() {
  let total = 0;
  for (let i = 0; i < ticketData.length; i++) {
    if (ticketData[i].DV == "VPOTUS") dvTotalTickets.VPOTUS++;
    if (ticketData[i].DV == "SECSTATE") dvTotalTickets.SECSTATE++;
    if (ticketData[i].DV == "SECDEF") dvTotalTickets.SECDEF++;
    if (ticketData[i].DV == "CJCS") dvTotalTickets.CJCS++;
  }
}

function dvTotalMissionImpact() {
  let total = 0;
  for (let i = 0; i < ticketData.length; i++) {
    if (
      ticketData[i].DV == "VPOTUS" &&
      ticketData[i].Leg != "N/A" &&
      ticketData[i].Impact_Level != "None"
    ) {
      dvMissionImpact.VPOTUS++;
    }
    if (
      ticketData[i].DV == "SECSTATE" &&
      ticketData[i].Leg != "N/A" &&
      ticketData[i].Impact_Level != "None"
    ) {
      dvMissionImpact.SECSTATE++;
    }
    if (
      ticketData[i].DV == "SECDEF" &&
      ticketData[i].Leg != "N/A" &&
      ticketData[i].Impact_Level != "None"
    ) {
      dvMissionImpact.SECDEF++;
    }
    if (
      ticketData[i].DV == "CJCS" &&
      ticketData[i].Leg != "N/A" &&
      ticketData[i].Impact_Level != "None"
    ) {
      dvMissionImpact.CJCS++;
    }
  }
}

function legsPerDvCount() {
  let total = 0;
  for (let i = 0; i < missionData.length; i++) {
    if (missionData[i].DV == "VPOTUS") legsPerDv.VPOTUS++;
    if (missionData[i].DV == "SECSTATE") legsPerDv.SECSTATE++;
    if (missionData[i].DV == "SECDEF") legsPerDv.SECDEF++;
    if (missionData[i].DV == "CJCS") legsPerDv.CJCS++;
  }
}

function missionsPerDvCount() {
  let total = 0;
  let missions = [];
  for (let i = 0; i < missionData.length; i++) {
    if (
      missionData[i].DV == "VPOTUS" &&
      !missions.includes(missionData[i].Mission_Number)
    ) {
      missionsPerDV.VPOTUS++;
      missions.push(missionData[i].Mission_Number);
    }
    if (
      missionData[i].DV == "SECSTATE" &&
      !missions.includes(missionData[i].Mission_Number)
    ) {
      missionsPerDV.SECSTATE++;
      missions.push(missionData[i].Mission_Number);
    }
    if (
      missionData[i].DV == "SECDEF" &&
      !missions.includes(missionData[i].Mission_Number)
    ) {
      missionsPerDV.SECDEF++;
      missions.push(missionData[i].Mission_Number);
    }
    if (
      missionData[i].DV == "CJCS" &&
      !missions.includes(missionData[i].Mission_Number)
    ) {
      missionsPerDV.CJCS++;
      missions.push(missionData[i].Mission_Number);
    }
  }
}

function legsPerAcCount(dv) {
  for (let i = 0; i < missionData.length; i++) {
    if (missionData[i].DV == dv) {
      if (!legsPerAc[dv][missionData[i].Tail_Number])
        legsPerAc[dv][missionData[i].Tail_Number] = 1;
      else legsPerAc[dv][missionData[i].Tail_Number]++;
    }
  }
}

function percentMissionsIssuesCount(dv) {
  // first get count of mission legs
  let missionCounter = {};
  let totalMissions = 0;
  let unsuccess = 0;
  for (let j = 0; j < missionData.length; j++) {
    if (missionData[j].DV == dv) {
      if (!missionCounter[missionData[j].Mission_Number]) {
        missionCounter[missionData[j].Mission_Number] = 1;
      } else {
        missionCounter[missionData[j].Mission_Number]++;
      }
      totalMissions++;
    }
  }

  for (let j = 0; j < ticketData.length; j++) {
    if (ticketData[j].DV == dv && ticketData[j].Leg != "N/A") {
      unsuccess++;
    }
  }

  let success = totalMissions - unsuccess;
  let percentile = success / totalMissions;
  if (success != 0) {
    percentMissionsIssues[dv] = percentile;
    percentMissionIssues3Months[dv][2] = percentile;
  }
}

function searchMission(mission) {
  for (let i = 0; i < missionData.length; i++) {
    if (missionData[i].Mission_Number == mission) return true;
  }
  return false;
}

function ticketsByCategoryFunc() {
  for (let i = 0; i < ticketData.length; i++) {
    // Add ticket category
    if (!ticketCategories.includes(ticketData[i].Category)) {
      ticketCategories.push(ticketData[i].Category);
    }
  }

  for (let i = 0; i < ticketCategories.length; i++) {
    let count = 0;
    for (let j = 0; j < ticketData.length; j++) {
      if (ticketData[j].Category == ticketCategories[i]) count++;
    }
    ticketCategoryNumbers.push(count);
  }
}

function totalTicketsByCategoryFunc() {
  let total = 0;
  for (let i = 0; i < ticketCategoryNumbers.length; i++) {
    total = total + ticketCategoryNumbers[i];
  }
  return total;
}

function ticketsByTail() {
  for (let i = 0; i < ticketData.length; i++) {
    if (
      !tailsWithTickets.includes(ticketData[i].Tail_Number) &&
      ticketData[i].Tail_Number != null
    ) {
      tailsWithTickets.push(ticketData[i].Tail_Number);
    }
  }

  for (let i = 0; i < tailsWithTickets.length; i++) {
    let none = 0;
    let low = 0;
    let med = 0;
    let high = 0;
    for (let j = 0; j < ticketData.length; j++) {
      if (ticketData[j].Tail_Number == tailsWithTickets[i]) {
        if (ticketData[j].Impact_Level == "None") none++;
        if (ticketData[j].Impact_Level == "Low") low++;
        if (ticketData[j].Impact_Level == "Medium") med++;
        if (ticketData[j].Impact_Level == "High") high++;
      }
    }
    tailsNoImpact.push(none);
    tailsLowImpact.push(low);
    tailsMedImpact.push(med);
    tailsHighImpact.push(high);
  }
}

function grabAllData3Months() {
  // We are getting the tickets from the 2 months prior to last month so that we can have a 3 month setting of tickets. We've already done calculations on the past month so only need to
  // do calculations on the months prior to that.

  let urlLoad =
    "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('Tickets')/items?$top=5000&$filter=Created le '" +
    endDate3 +
    "' and Created ge '" +
    startDate3 +
    "'";
  $.ajax({
    url: urlLoad,
    async: false,
    method: "GET",
    headers: {
      Accept: "application/json;odata=verbose",
    },
    success: function (data) {
      ticketData3Months = data.d.results;
    },
  });

  // lets get the missions
  urlLoad =
    "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('Missions')/items?$top=5000&$filter=Created le '" +
    endDate3 +
    "' and Created ge '" +
    startDate3 +
    "'";
  $.ajax({
    url: urlLoad,
    async: false,
    method: "GET",
    headers: {
      Accept: "application/json;odata=verbose",
    },
    success: function (data) {
      missionData3Months = data.d.results;
    },
  });
}

function legsWithIssues3Months(dv) {
  let d = new Date(now);
  d.setMonth(d.getMonth() - 2);
  let m = ("0" + (d.getMonth() + 1)).slice(-2);
  let strt = d.getFullYear() + "-" + m + "-01T00:00:00Z";
  let lday = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  let end = d.getFullYear() + "-" + m + "-" + lday + "T23:59:59Z";

  // first get count of mission legs
  let missionCounter = {};
  let totalMissions = [0, 0];
  let unsuccess = [0, 0];
  for (let i = 0; i < 2; i++) {
    let options = { month: "long" };
    previousMonths[i] = d.toLocaleDateString("en-US", options);
    for (let j = 0; j < missionData3Months.length; j++) {
      if (
        missionData3Months[j].Created < end &&
        missionData3Months[j].Created > strt &&
        missionData3Months[j].DV == dv
      ) {
        if (!missionCounter[missionData3Months[j].Mission_Number]) {
          missionCounter[missionData3Months[j].Mission_Number] = 1;
        } else {
          missionCounter[missionData3Months[j].Mission_Number]++;
        }
        totalMissions[i]++;
        legsPerDv3Months[dv][i]++;
      }
    }

    for (let j = 0; j < ticketData3Months.length; j++) {
      if (
        ticketData3Months[j].DV == dv &&
        ticketData3Months[j].Created < end &&
        ticketData3Months[j].Created > strt &&
        ticketData3Months[j].Leg != "N/A"
      ) {
        unsuccess[i]++;
      }
    }

    let success = totalMissions[i] - unsuccess[i];
    let percentile = success / totalMissions[i];
    if (success != 0) percentMissionIssues3Months[dv][i] = percentile;

    d.setMonth(d.getMonth() + 1);
    m = ("0" + (d.getMonth() + 1)).slice(-2);
    strt = d.getFullYear() + "-" + m + "-01T00:00:00Z";
    lday = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    end = d.getFullYear() + "-" + m + "-" + lday + "T23:59:59Z";
  }
}

function legsImpact3Months(dv) {
  let d = new Date(now);
  d.setMonth(d.getMonth() - 2);
  let m = ("0" + (d.getMonth() + 1)).slice(-2);
  let strt = d.getFullYear() + "-" + m + "-01T00:00:00Z";
  let lday = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  let end = d.getFullYear() + "-" + m + "-" + lday + "T23:59:59Z";

  let totalMissions = [0, 0, 0];
  let noImpact = [0, 0, 0];
  let impact = [0, 0, 0];

  for (let i = 0; i < missionData.length; i++) {
    if (missionData[i].DV == dv) {
      totalMissions[2]++;
    }
  }

  for (let i = 0; i < ticketData.length; i++) {
    if (
      ticketData[i].DV == dv &&
      ticketData[i].Impact_Level == "None" &&
      ticketData[i].Leg != "N/A"
    ) {
      // no impact ticket on leg
      if (totalMissions[2] != 0) totalMissions[2]--;
      noImpact[2]++;
    } else if (
      ticketData[i].DV == dv &&
      ticketData[i].Impact_Level != "None" &&
      ticketData[i].Leg != "N/A"
    ) {
      // impact ticket
      if (totalMissions[2] != 0) totalMissions[2]--;
      impact[2]++;
    }
  }

  legImpactPer3Months[dv][previousMonths[2]] = [
    noImpact[2],
    impact[2],
    totalMissions[2],
  ];

  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < missionData3Months.length; j++) {
      if (
        missionData3Months[j].Created < end &&
        missionData3Months[j].Created > strt &&
        missionData3Months[j].DV == dv
      ) {
        totalMissions[i]++;
      }
    }
    for (let j = 0; j < ticketData3Months.length; j++) {
      if (
        ticketData3Months[j].Created < end &&
        ticketData3Months[j].Created > strt
      ) {
        if (
          ticketData3Months[j].DV == dv &&
          ticketData3Months[j].Impact_Level == "None" &&
          ticketData3Months[j].Leg != "N/A"
        ) {
          // no impact ticket on leg
          if (totalMissions[i] != 0) totalMissions[i]--;
          noImpact[i]++;
        } else if (
          ticketData3Months[j].DV == dv &&
          ticketData3Months[j].Impact_Level != "None" &&
          ticketData3Months[j].Leg != "N/A"
        ) {
          // impact ticket
          if (totalMissions[i] != 0) totalMissions[i]--;
          impact[i]++;
        }
      }
    }

    legImpactPer3Months[dv][previousMonths[i]] = [
      noImpact[i],
      impact[i],
      totalMissions[i],
    ];
    d.setMonth(d.getMonth() + 1);
    m = ("0" + (d.getMonth() + 1)).slice(-2);
    strt = d.getFullYear() + "-" + m + "-01T00:00:00Z";
    lday = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    end = d.getFullYear() + "-" + m + "-" + lday + "T23:59:59Z";
  }
}

function dvTicketCatFunc(dv) {
  let currentCategories = [];
  let ccirNum = [];
  let noCcirNum = [];

  for (let i = 0; i < ticketData.length; i++) {
    if (ticketData[i].DV == dv) {
      if (!currentCategories.includes(ticketData[i].Category)) {
        currentCategories.push(ticketData[i].Category);
        ccirNum.push(0);
        noCcirNum.push(0);
      }
      if (ticketData[i].CCIR)
        ccirNum[currentCategories.indexOf(ticketData[i].Category)]++;
      if (!ticketData[i].CCIR)
        noCcirNum[currentCategories.indexOf(ticketData[i].Category)]++;
    }
  }

  dvTicketCategories[dv][0] = currentCategories;
  dvTicketCategories[dv][1] = ccirNum;
  dvTicketCategories[dv][2] = noCcirNum;
}

function generatePDF() {
  let pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "GNOC";
  pptx.suject = "MONTHLY METRICS";

  /* BEGIN TITLE SLIDE */

  pptx.defineSlideMaster({
    title: "TITLE_SLIDE",
    background: { color: "FFFFFF" },
    objects: [
      {
        placeholder: {
          options: {
            name: "body",
            type: "body",
            x: 0,
            y: 2.75,
            w: "100%",
            h: 2.0,
            fontSize: 72,
            bold: true,
            align: "center",
            color: "262699",
            fontFace: "Arial",
            shadow: {
              type: "outer",
              color: "696969",
              blur: 3,
              offset: 2,
              angle: 45,
            },
          },
          text: "TITLE HERE",
        },
      },
      {
        placeholder: {
          options: {
            name: "date",
            type: "body",
            x: 3.67,
            y: 6.28,
            w: 6,
            h: 0.51,
            fontSize: 24,
            bold: true,
            align: "center",
            color: "262699",
            fontFace: "Arial",
          },
          text: "TITLE HERE",
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
            fontSize: 16,
            bold: true,
            italic: true,
            align: "center",
            color: "000000",
            fontFace: "Century Schoolbook",
          },
        },
      },
      { rect: { x: 5.6, y: 0, w: 2.3, h: 0.29, fill: { color: "00B050" } } },
      {
        text: {
          text: "For Official Use Only (FOUO)",
          options: {
            x: 5.6,
            y: 0,
            w: 2.3,
            h: 0.29,
            fontSize: 11,
            bold: true,
            color: "ffffff",
            fontFace: "Arial",
          },
        },
      },
      { rect: { x: 0.7, y: 1.3, w: 12.1, h: 0.05, fill: { color: "0C2D83" } } },
      { rect: { x: 0.7, y: 7.0, w: 12.1, h: 0.05, fill: { color: "0C2D83" } } },
      { image: { x: 0.7, y: 0.2, w: 1.0, h: 1.0, path: "./img/89cs.png" } },
      { image: { x: 11.8, y: 0.2, w: 1.0, h: 1.0, path: "./img/samfox.jpg" } },
    ],
  });

  let slide = pptx.addSlide({ masterName: "TITLE_SLIDE" });
  let options = {
    timeZone: "UTC",
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  let parsedate1 = new Date(startDate);
  let parsedate2 = new Date(endDate);
  slide.addText("GNOC METRICS REPORT", { placeholder: "body" });
  slide.addText(
    parsedate1.toLocaleDateString("en-US", options) +
      " - " +
      parsedate2.toLocaleDateString("en-US", options),
    { placeholder: "date" }
  );

  /* END TITLE SLIDE START OTHER SLIDES */

  /* BEGIN SLIDE 2. DV MONTHLY SUMMARY */
  pptx.defineSlideMaster({
    title: "MASTER_SLIDE",
    background: { color: "FFFFFF" },
    objects: [
      {
        placeholder: {
          options: {
            name: "title",
            type: "title",
            x: 0,
            y: 0.45,
            w: "100%",
            h: 1.0,
            fontSize: 36,
            bold: true,
            italic: true,
            align: "center",
            color: "262699",
            fontFace: "Arial",
          },
          text: "TITLE HERE",
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
            fontSize: 16,
            bold: true,
            italic: true,
            align: "center",
            color: "000000",
            fontFace: "Century Schoolbook",
          },
        },
      },
      { rect: { x: 5.6, y: 0, w: 2.3, h: 0.29, fill: { color: "00B050" } } },
      {
        text: {
          text: "For Official Use Only (FOUO)",
          options: {
            x: 5.6,
            y: 0,
            w: 2.3,
            h: 0.29,
            fontSize: 11,
            bold: true,
            color: "ffffff",
            fontFace: "Arial",
          },
        },
      },
      { rect: { x: 0.7, y: 1.3, w: 12.1, h: 0.05, fill: { color: "0C2D83" } } },
      { rect: { x: 0.7, y: 7.0, w: 12.1, h: 0.05, fill: { color: "0C2D83" } } },
      { image: { x: 0.7, y: 0.2, w: 1.0, h: 1.0, path: "./img/89cs.png" } },
      { image: { x: 11.8, y: 0.2, w: 1.0, h: 1.0, path: "./img/samfox.jpg" } },
    ],
  });

  slide = pptx.addSlide({ masterName: "MASTER_SLIDE" });
  slide.addText("DV Monthly Summary", { placeholder: "title" });
  slide.addShape(pptx.shapes.RECTANGLE, {
    h: "2.58",
    w: "3.4",
    x: "0.27",
    y: "1.51",
    fill: { color: "FFFFFF" },
    line: { color: "000000" },
  });
  slide.addShape(pptx.shapes.RECTANGLE, {
    h: "2.58",
    w: "6.0",
    x: "3.67",
    y: "1.51",
    fill: { color: "FFFFFF" },
    line: { color: "000000" },
  });
  slide.addShape(pptx.shapes.RECTANGLE, {
    h: "2.58",
    w: "3.4",
    x: "9.67",
    y: "1.51",
    fill: { color: "FFFFFF" },
    line: { color: "000000" },
  });
  slide.addShape(pptx.shapes.RECTANGLE, {
    h: "2.58",
    w: "6.4",
    x: "0.27",
    y: "4.09",
    fill: { color: "FFFFFF" },
    line: { color: "000000" },
  });
  slide.addShape(pptx.shapes.RECTANGLE, {
    h: "2.58",
    w: "6.4",
    x: "6.67",
    y: "4.09",
    fill: { color: "FFFFFF" },
    line: { color: "000000" },
  });
  slide.addText("Total Tickets", {
    h: "0.34",
    w: "1.24",
    x: "0.55",
    y: "2.21",
    fontSize: 14,
    align: "center",
  });
  slide.addText(String(ticketData.length), {
    shape: pptx.shapes.ROUNDED_RECTANGLE,
    h: "0.55",
    w: "1.03",
    x: "0.66",
    y: "2.52",
    align: "center",
    fontSize: 18,
    bold: true,
    fill: { color: "FFFFFF" },
    line: { color: "000000" },
  }); // Total Tickets
  slide.addText("Total CCIRs", {
    h: "0.34",
    w: "1.24",
    x: "2.06",
    y: "2.21",
    fontSize: 14,
    align: "center",
  });
  slide.addText(String(ccirData.length), {
    shape: pptx.shapes.ROUNDED_RECTANGLE,
    h: "0.55",
    w: "1.03",
    x: "2.16",
    y: "2.52",
    align: "center",
    fontSize: 18,
    bold: true,
    fill: { color: "FFFFFF" },
    line: { color: "000000" },
  }); // Total CCIR
  slide.addText(
    String(
      dvTotalTickets.VPOTUS +
        dvTotalTickets.SECSTATE +
        dvTotalTickets.SECDEF +
        dvTotalTickets.CJCS
    ),
    {
      h: "0.4",
      w: "0.95",
      x: "10.89",
      y: "2.6",
      align: "center",
      fontSize: 18,
      bold: true,
    }
  ); // Total VIPSAM Tickets

  /* Missions w DV Impact data */
  let missionsWithDVImpactData = [
    {
      name: "Legs With DV Impact",
      labels: ["VPOTUS", "SECSTATE", "SECDEF", "CJCS"],
      values: [
        dvMissionImpact.VPOTUS,
        dvMissionImpact.SECSTATE,
        dvMissionImpact.SECDEF,
        dvMissionImpact.CJCS,
      ],
    },
  ];
  // S2 Missions w DV Impact
  let missionsWithDVImpactChart = {
    x: "3.67",
    y: "1.51",
    w: "6.0",
    h: "2.59",
    barDir: "bar",
    showTitle: true,
    title: "Legs With DV Impact",
    valAxisMajorUnit: 1.0,
    chartColors: ["ED7D31", "FFC000", "70AD47", "4472C4"],
  };
  slide.addChart(
    pptx.charts.BAR,
    missionsWithDVImpactData,
    missionsWithDVImpactChart
  );
  /* END MISSIONS w DV Impact Chart */

  /* Total VIPSAM Tickets Chart */
  let totalVipsamTicketsData = [
    {
      name: "Total VIPSAM Tickets",
      labels: ["VPOTUS", "SECSTATE", "SECDEF", "CJCS"],
      values: [
        dvTotalTickets.VPOTUS,
        dvTotalTickets.SECSTATE,
        dvTotalTickets.SECDEF,
        dvTotalTickets.CJCS,
      ],
    },
  ];
  let totalVipsamTicketsChart = {
    x: 9.67,
    y: 1.51,
    w: 3.4,
    h: 2.58,
    legendPos: "b",
    showLegend: true,
    showPercent: false,
    showValue: true,
    showTitle: true,
    titleAlign: "center",
    titlePos: { x: 0, y: 0 },
    title: "Total VIPSAM Tickets",
    chartColors: ["ED7D31", "FFC000", "70AD47", "4472C4"],
    holeSize: 70,
  };
  slide.addChart(
    pptx.charts.DOUGHNUT,
    totalVipsamTicketsData,
    totalVipsamTicketsChart
  );
  /* End TOTAL VIPSAM tickets chart */

  /* Percent of Missions Without Issues Chart */
  let percentMissionsIssuesData = [
    {
      name: "Percentage of Legs Without Issues",
      labels: ["VPOTUS", "SECSTATE", "SECDEF", "CJCS"],
      values: [
        percentMissionsIssues.VPOTUS,
        percentMissionsIssues.SECSTATE,
        percentMissionsIssues.SECDEF,
        percentMissionsIssues.CJCS,
      ],
    },
  ];

  let percentMissionsIssuesChart = {
    x: 0.27,
    y: 4.1,
    w: 6.4,
    h: 2.57,
    barDir: "col",
    showLegend: false,
    showTitle: true,
    showPercent: true,
    valAxisMaxVal: 1,
    valAxisMajorUnit: 0.2,
    showValue: true,
    dataLabelFormatCode: "#%",
    valAxisLabelFormatCode: "#%",
    chartColors: ["ED7D31", "FFC000", "70AD47", "4472C4"],
    title: "Percentage of Missions Without Issues",
  };
  slide.addChart(
    pptx.charts.BAR,
    percentMissionsIssuesData,
    percentMissionsIssuesChart
  );
  /* END Percent of Missions Without Issues */

  /* Legs Per DV Chart */
  let legsPerDvData = [
    {
      name: "Legs Per DV",
      labels: ["VPOTUS", "SECSTATE", "SECDEF", "CJCS"],
      values: [
        legsPerDv.VPOTUS,
        legsPerDv.SECSTATE,
        legsPerDv.SECDEF,
        legsPerDv.CJCS,
      ],
    },
  ];

  let legsPerDvChart = {
    x: 6.67,
    y: 4.1,
    w: 6.4,
    h: 2.59,
    barDir: "col",
    showLegend: false,
    showTitle: true,
    showValue: true,
    chartColors: ["ED7D31", "FFC000", "70AD47", "4472C4"],
    title: "Legs Per DV",
  };
  slide.addChart(pptx.charts.BAR, legsPerDvData, legsPerDvChart);
  /* END Legs Per DV */
  /* END SLIDE 2 MONTHLY DV SUMMARY */

  /* BEGIN SLIDE 3 MONTHLY TICKET SUMMARY */
  pptx.defineSlideMaster({
    title: "MASTER_SLIDE",
    background: { color: "FFFFFF" },
    objects: [
      {
        placeholder: {
          options: {
            name: "title",
            type: "title",
            x: 0,
            y: 0.45,
            w: "100%",
            h: 1.0,
            fontSize: 36,
            bold: true,
            italic: true,
            align: "center",
            color: "262699",
            fontFace: "Arial",
          },
          text: "TITLE HERE",
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
            fontSize: 16,
            bold: true,
            italic: true,
            align: "center",
            color: "000000",
            fontFace: "Century Schoolbook",
          },
        },
      },
      { rect: { x: 5.6, y: 0, w: 2.3, h: 0.29, fill: { color: "00B050" } } },
      {
        text: {
          text: "For Official Use Only (FOUO)",
          options: {
            x: 5.6,
            y: 0,
            w: 2.3,
            h: 0.29,
            fontSize: 11,
            bold: true,
            color: "ffffff",
            fontFace: "Arial",
          },
        },
      },
      { rect: { x: 0.7, y: 1.3, w: 12.1, h: 0.05, fill: { color: "0C2D83" } } },
      { rect: { x: 0.7, y: 7.0, w: 12.1, h: 0.05, fill: { color: "0C2D83" } } },
      { image: { x: 0.7, y: 0.2, w: 1.0, h: 1.0, path: "./img/89cs.png" } },
      { image: { x: 11.8, y: 0.2, w: 1.0, h: 1.0, path: "./img/samfox.jpg" } },
    ],
  });

  slide = pptx.addSlide({ masterName: "MASTER_SLIDE" });
  slide.addText("Monthly Ticket Summary", { placeholder: "title" });
  slide.addShape(pptx.shapes.RECTANGLE, {
    h: "5.16",
    w: "8.7",
    x: "0.27",
    y: "1.51",
    fill: { color: "FFFFFF" },
    line: { color: "000000" },
  });
  slide.addShape(pptx.shapes.RECTANGLE, {
    h: "5.16",
    w: "4.1",
    x: "8.97",
    y: "1.51",
    fill: { color: "FFFFFF" },
    line: { color: "000000" },
  });
  slide.addText(String(totalTicketsByCategoryFunc()), {
    h: "0.51",
    w: "0.57",
    x: "10.73",
    y: "3.84",
    align: "center",
    fontSize: 18,
    bold: true,
  }); // Total Tickets by Category

  /* Tickets by Tail Data */
  // None, low, med, high
  let ticketsByTailData = [
    {
      name: "None",
      labels: tailsWithTickets,
      values: tailsNoImpact,
    },
    {
      name: "Low",
      labels: tailsWithTickets,
      values: tailsLowImpact,
    },
    {
      name: "Medium",
      labels: tailsWithTickets,
      values: tailsMedImpact,
    },
    {
      name: "High",
      labels: tailsWithTickets,
      values: tailsHighImpact,
    },
  ];

  // tickets by tail chart
  let ticketsByTailChart = {
    x: 0.26,
    y: 1.51,
    w: 8.7,
    h: 5.16,
    barDir: "bar",
    barGrouping: "stacked",

    catAxisOrientation: "maxMin",
    catAxisLabelColor: "000000",
    catAxisLabelFontFace: "Helvetica Neue",
    catAxisLabelFontSize: 12,
    catAxisLabelFontBold: true,
    valAxisLabelFontBold: true,
    showLegend: true,

    dataLabelColor: "FFFFFF",
    showValue: true,

    titleColor: "33CF22",
    titleFontFace: "Helvetica Neue",
    titleFontSize: 24,
    chartColors: ["70AD47", "FFC000", "ED7D31", "FF0000"],
  };
  slide.addChart(pptx.charts.BAR, ticketsByTailData, ticketsByTailChart);

  /* End Tickets by Tail Data */

  /* Tickets By Category Data */

  let ticketsByCategoryData = [
    {
      name: "Total Tickets by Category",
      labels: ticketCategories,
      values: ticketCategoryNumbers,
    },
  ];

  // tickets by category chart
  let ticketsByCategoryChart = {
    x: 8.97,
    y: 1.51,
    w: 4.1,
    h: 5.16,
    legendPos: "b",
    showLegend: true,
    showPercent: false,
    showValue: true,
    showTitle: true,
    titleAlign: "center",
    titlePos: { x: 0, y: 0 },
    title: "Total Tickets by Category",
    holeSize: 70,
  };
  slide.addChart(
    pptx.charts.DOUGHNUT,
    ticketsByCategoryData,
    ticketsByCategoryChart
  );

  /* End Tickets by Category Data */

  /* END SLIDE 3 MONTHLY TICKET SUMMARY */
  let dvs = ["VPOTUS", "SECSTATE", "SECDEF", "CJCS"];
  let dvColors = {
    VPOTUS: ["BDD7EE", "DBDBDB", "ED7D31"],
    SECSTATE: ["BDD7EE", "DBDBDB", "FFC000"],
    SECDEF: ["BDD7EE", "DBDBDB", "70AD47"],
    CJCS: ["BDD7EE", "DBDBDB", "4472C4"],
  };
  for (let i = 0; i < dvs.length; i++) {
    /* BEGIN SLIDE 4 VPOTUS */
    pptx.defineSlideMaster({
      title: "MASTER_SLIDE",
      background: { color: "FFFFFF" },
      objects: [
        {
          placeholder: {
            options: {
              name: "title",
              type: "title",
              x: 0,
              y: 0.45,
              w: "100%",
              h: 1.0,
              fontSize: 31,
              bold: true,
              align: "center",
              color: "0C2D83",
              fontFace: "Arial",
            },
            text: "TITLE HERE",
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
              fontSize: 16,
              bold: true,
              italic: true,
              align: "center",
              color: "000000",
              fontFace: "Century Schoolbook",
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
    });

    slide = pptx.addSlide({ masterName: "MASTER_SLIDE" });
    slide.addText(String(dvs[i]), { placeholder: "title" });
    slide.addShape(pptx.shapes.RECTANGLE, {
      h: "2.59",
      w: "3.09",
      x: "0.27",
      y: "1.51",
      fill: { color: "FFFFFF" },
      line: { color: "000000" },
    });
    slide.addShape(pptx.shapes.RECTANGLE, {
      h: "2.59",
      w: "4.31",
      x: "3.36",
      y: "1.51",
      fill: { color: "FFFFFF" },
      line: { color: "000000" },
    });
    slide.addShape(pptx.shapes.RECTANGLE, {
      h: "2.59",
      w: "5.37",
      x: "7.67",
      y: "1.51",
      fill: { color: "FFFFFF" },
      line: { color: "000000" },
    });
    slide.addShape(pptx.shapes.RECTANGLE, {
      h: "2.59",
      w: "6.4",
      x: "0.27",
      y: "4.1",
      fill: { color: "FFFFFF" },
      line: { color: "000000" },
    });
    slide.addShape(pptx.shapes.RECTANGLE, {
      h: "2.59",
      w: "6.4",
      x: "6.65",
      y: "4.1",
      fill: { color: "FFFFFF" },
      line: { color: "000000" },
    });
    slide.addText("Total Tickets", {
      h: "0.34",
      w: "1.24",
      x: "0.44",
      y: "2.06",
      fontSize: 14,
      align: "center",
    });
    slide.addText(String(dvTotalTickets[dvs[i]]), {
      shape: pptx.shapes.ROUNDED_RECTANGLE,
      h: "0.55",
      w: "1.03",
      x: "0.55",
      y: "2.37",
      align: "center",
      fontSize: 18,
      bold: true,
      fill: { color: "FFFFFF" },
      line: { color: "000000" },
    }); // Total Tickets 3 months
    slide.addText("Total CCIRs", {
      h: "0.34",
      w: "1.24",
      x: "1.95",
      y: "2.06",
      fontSize: 14,
      align: "center",
    });
    slide.addText(String(dvTotalCCIRs[dvs[i]]), {
      shape: pptx.shapes.ROUNDED_RECTANGLE,
      h: "0.55",
      w: "1.03",
      x: "2.05",
      y: "2.37",
      align: "center",
      fontSize: 18,
      bold: true,
      fill: { color: "FFFFFF" },
      line: { color: "000000" },
    }); // Total CCIR 3 months

    /* DV Data */
    /* Percent of Legs without Issues Chart */
    let percentLegsIssuesDataVpotus = [
      {
        name: "Percentage of Legs Without Issues",
        labels: [
          String(previousMonths[0]),
          String(previousMonths[1]),
          String(previousMonths[2]),
        ],
        values: percentMissionIssues3Months[dvs[i]],
      },
    ];

    let percentLegsIssuesChartVpotus = {
      x: 3.36,
      y: 1.51,
      w: 4.31,
      h: 2.59,
      barDir: "col",
      showLegend: false,
      showTitle: true,
      showPercent: true,
      valAxisMaxVal: 1,
      valAxisMajorUnit: 0.2,
      showValue: true,
      dataLabelFormatCode: "#%",
      valAxisLabelFormatCode: "#%",
      title: "Percentage of Legs Without Issues",
      chartColors: [dvColors[dvs[i]][2]],
    };
    slide.addChart(
      pptx.charts.BAR,
      percentLegsIssuesDataVpotus,
      percentLegsIssuesChartVpotus
    );
    /* END Percent of Missions Without Issues */
    /* Legs Per AC Chart */
    let templable = [];
    let tempvalue = [];
    for (let ac in legsPerAc[dvs[i]]) {
      templable.push(ac);
    }
    for (let ac in legsPerAc[dvs[i]]) {
      tempvalue.push(legsPerAc[dvs[i]][ac]);
    }
    let legsPerAcDataVpotus = [
      {
        name: "Total Legs per AC",
        labels: templable,
        values: tempvalue,
      },
    ];

    let legsPeracChartVpotus = {
      x: 7.66,
      y: 1.51,
      w: 5.37,
      h: 2.59,
      barDir: "col",
      showLegend: false,
      showTitle: true,
      showValue: true,
      valAxisMajorUnit: 1.0,
      title: "Total Legs per AC",
      chartColors: [dvColors[dvs[i]][2]],
    };
    slide.addChart(pptx.charts.BAR, legsPerAcDataVpotus, legsPeracChartVpotus);
    /* END Legs Per AC */

    /* Legs with Impact */
    // None, low, med, high
    let legsWithImpactVpotusData = [
      {
        name: "Legs without Issues",
        labels: previousMonths,
        values: [
          legImpactPer3Months[dvs[i]][previousMonths[0]][2],
          legImpactPer3Months[dvs[i]][previousMonths[1]][2],
          legImpactPer3Months[dvs[i]][previousMonths[2]][2],
        ],
      },
      {
        name: "Legs without DV Impact",
        labels: previousMonths,
        values: [
          legImpactPer3Months[dvs[i]][previousMonths[0]][0],
          legImpactPer3Months[dvs[i]][previousMonths[1]][0],
          legImpactPer3Months[dvs[i]][previousMonths[2]][0],
        ],
      },
      {
        name: "Legs w/ DV Impact",
        labels: previousMonths,
        values: [
          legImpactPer3Months[dvs[i]][previousMonths[0]][1],
          legImpactPer3Months[dvs[i]][previousMonths[1]][1],
          legImpactPer3Months[dvs[i]][previousMonths[2]][1],
        ],
      },
    ];

    // tickets by tail chart
    let legsWithImpactVpotusChart = {
      x: 0.26,
      y: 4.1,
      w: 6.39,
      h: 2.57,
      barDir: "bar",
      barGrouping: "stacked",

      catAxisOrientation: "maxMin",
      catAxisLabelColor: "000000",
      catAxisLabelFontFace: "Helvetica Neue",
      catAxisLabelFontSize: 12,
      catAxisLabelFontBold: true,
      valAxisLabelFontBold: true,
      showLegend: true,
      legendPos: "b",

      dataLabelColor: "FFFFFF",
      showValue: true,

      titleColor: "33CF22",
      titleFontFace: "Helvetica Neue",
      titleFontSize: 24,
      chartColors: dvColors[dvs[i]],
    };
    slide.addChart(
      pptx.charts.BAR,
      legsWithImpactVpotusData,
      legsWithImpactVpotusChart
    );

    /* End Tickets by Tail Data */
    /* Tickets per Category Chart */
    let ticketPerCatDataVpotus = [
      {
        name: "Issues with No CCIR",
        labels: dvTicketCategories[dvs[i]][0],
        values: dvTicketCategories[dvs[i]][2],
      },
      {
        name: "Issues with CCIR",
        labels: dvTicketCategories[dvs[i]][0],
        values: dvTicketCategories[dvs[i]][1],
      },
    ];

    let ticketPerCatChartVpotus = {
      x: 6.65,
      y: 4.1,
      w: 6.39,
      h: 2.59,
      barDir: "col",
      barGrouping: "stacked",
      showLegend: true,
      legendPos: "b",
      showTitle: true,
      showValue: true,
      valAxisMajorUnit: 1.0,
      title: "Ticket Categories",
      chartColors: [dvColors[dvs[i]][1], dvColors[dvs[i]][2]],
    };
    slide.addChart(
      pptx.charts.BAR,
      ticketPerCatDataVpotus,
      ticketPerCatChartVpotus
    );
    /* END Legs Per AC */
    /* END VPOTUS DATA */

    /* END SLIDE 4 VPOTUS */
  }

  /* SLIDE 5 CONTACT INFO */

  pptx.defineSlideMaster({
    title: "END_SLIDE",
    background: { color: "FFFFFF" },
    objects: [
      {
        placeholder: {
          options: {
            name: "title",
            type: "title",
            x: 0,
            y: 0.45,
            w: "100%",
            h: 1.0,
            fontSize: 31,
            bold: true,
            align: "center",
            color: "0C2D83",
            fontFace: "Arial",
          },
          text: "TITLE HERE",
        },
      },
      {
        placeholder: {
          options: {
            name: "body",
            type: "body",
            x: 0,
            y: 3.3,
            w: "100%",
            h: 2.0,
            fontSize: 24,
            align: "center",
            color: "000000",
            fontFace: "Arial",
          },
          text: "TITLE HERE",
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
            fontSize: 16,
            bold: true,
            italic: true,
            align: "center",
            color: "000000",
            fontFace: "Century Schoolbook",
          },
        },
      },
      { rect: { x: 5.6, y: 0, w: 2.3, h: 0.29, fill: { color: "00B050" } } },
      {
        text: {
          text: "For Official Use Only (FOUO)",
          options: {
            x: 5.6,
            y: 0,
            w: 2.3,
            h: 0.29,
            fontSize: 11,
            bold: true,
            color: "ffffff",
            fontFace: "Arial",
          },
        },
      },
      { rect: { x: 0.7, y: 1.3, w: 12.1, h: 0.05, fill: { color: "0C2D83" } } },
      { rect: { x: 0.7, y: 7.0, w: 12.1, h: 0.05, fill: { color: "0C2D83" } } },
      { image: { x: 0.7, y: 0.2, w: 1.0, h: 1.0, path: "./img/89cs.png" } },
      { image: { x: 11.8, y: 0.2, w: 1.0, h: 1.0, path: "./img/samfox.jpg" } },
    ],
  });

  slide = pptx.addSlide({ masterName: "END_SLIDE" });
  options = {
    timeZone: "UTC",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  parsedate1 = new Date(startDate);
  parsedate2 = new Date(endDate);
  slide.addText("Contact Information", { placeholder: "title" });
  slide.addText(
    "If you have any questions regarding this report, please contact the org box at 89CS.SCOV.VIP.COMM@us.af.mil or via DSN 858-2411.",
    { placeholder: "body" }
  );

  /* END SLIDE 5 CONTACT INFO */

  pptx.writeFile("Monthly Metrics " + month + "");
}
