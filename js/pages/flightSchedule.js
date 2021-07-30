import { HOST_URL } from "../modules/constants.js";
import permissionsCheck from "../modules/userPermissionsCheck.js";
import {
  getESTOffset,
  daysIntoYear,
  convertDateToHTMLString,
  updateListItem,
} from "../modules/utility.js";
const MISSION_LIST_NAME = "Missions";
const PRIMARY_A2G2_LIST_NAME = "primarya2g2";
feather.replace();
permissionsCheck("RkxJR0hUIFNDSEVEVUxF");

let checkRowTimer;
const estTimeOffset = getESTOffset();

setTimeout(function () {
  location.reload();
}, 3600000); // keep it from becoming a stale session

$(document).on("click", "#sanitize", function () {
  var $this = $(this);
  var loadingText = "UNSANITIZE";
  if ($(this).html() !== loadingText) {
    // SANITIZE
    $this.data("original-text", $(this).html());
    $this.html(loadingText);
    $this.removeClass("btn-danger").addClass("btn-success");
    $("#flights tr:gt(0)").each(function () {
      var this_row = $(this);
      var dv = this_row.find("td:eq(0)");
      dv.html(btoa(dv.html()));
    });
  } else {
    // UNSANITIZE
    $this.data("original-text", $(this).html());
    $this.html("SANITIZE");
    $this.removeClass("btn-success").addClass("btn-danger");
    $("#flights tr:gt(0)").each(function () {
      var this_row = $(this);
      var dv = this_row.find("td:eq(0)");
      dv.html(atob(dv.html()));
    });
  }
});

$(document).on("click", "#primaryclick", function () {
  changePrimary();
});

$(document).on("click", "#showPast", function () {
  var $this = $(this);
  if ($(this).html() != "HIDE PAST FLIGHTS") {
    $this.data("original-text", $(this).html());
    $this.html("HIDE PAST FLIGHTS");
    showPastFlights();
  } else {
    $this.data("original-text", $(this).html());
    $this.html("SHOW PAST FLIGHTS");
    showPastFlights();
  }
});

$(document).on("click", "#minmax", function () {
  var $this = $(this);
  if ($.cookie("fullscreen") == "false") {
    $.cookie("fullscreen", "true");
    $(this).html(
      '<span data-feather="minimize-2" style="width:23px;height:23px;"></span>'
    );
    feather.replace();
    checkFullScreen();
  } else {
    $.cookie("fullscreen", "false");
    $(this).html(
      '<span data-feather="maximize-2" style="width:23px;height:23px;"></span>'
    );
    feather.replace();
    checkFullScreen();
  }
});

feather.replace();

const updateDay = () => {
  const currentDate = new Date();
  const currentOffset = currentDate.getTimezoneOffset() * 60000;
  currentDate.setTime(currentDate.getTime() + currentOffset);

  const julianDay = daysIntoYear(currentDate);
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const todaysDateDiv = document.getElementById("todaysDate");
  todaysDateDiv.innerHTML = currentDate.toLocaleDateString("en-US", options);

  const julianDateDiv = document.getElementById("todaysJulian");
  julianDateDiv.innerHTML = `(J DAY: ${julianDay})`;
};
updateDay();
setInterval(updateDay, 60000); // set a timer to check for day update every hour.

const updateClock = () => {
  let currentTime = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
  });
  currentTime = new Date(currentTime);
  // Operating System Clock Hours for 12h clock
  let currentHoursAP = currentTime.getHours();
  // Operating System Clock Hours for 24h clock
  let currentHours = currentTime.getHours();
  // Operating System Clock Minutes
  let currentMinutes = currentTime.getMinutes();
  // Operating System Clock Seconds
  let currentSeconds = currentTime.getSeconds();
  // Adding 0 if Minutes & Seconds is More or Less than 10
  currentMinutes = (currentMinutes < 10 ? "0" : "") + currentMinutes;
  currentSeconds = (currentSeconds < 10 ? "0" : "") + currentSeconds;

  document.querySelector(".sec").innerHTML = currentSeconds;
  document.querySelector(".min").innerHTML = currentMinutes;
  document.querySelector(".hours").innerHTML = currentHours;

  currentTime = new Date();
  let offset = currentTime.getTimezoneOffset() * 60000;
  currentTime.setTime(currentTime.getTime() + offset);
  // Operating System Clock Hours for 12h clock
  currentHoursAP = currentTime.getHours();
  // Operating System Clock Hours for 24h clock
  currentHours = currentTime.getHours();
  // Operating System Clock Minutes
  currentMinutes = currentTime.getMinutes();
  // Operating System Clock Seconds
  currentSeconds = currentTime.getSeconds();
  // Adding 0 if Minutes & Seconds is More or Less than 10
  currentMinutes = (currentMinutes < 10 ? "0" : "") + currentMinutes;
  currentSeconds = (currentSeconds < 10 ? "0" : "") + currentSeconds;

  document.querySelector(".zsec").innerHTML = currentSeconds;
  document.querySelector(".zmin").innerHTML = currentMinutes;
  document.querySelector(".zhours").innerHTML = currentHours;

  currentTime = new Date().toLocaleString("en-US", {
    timeZone: "America/Los_Angeles",
  });
  currentTime = new Date(currentTime);
  // Operating System Clock Hours for 12h clock
  currentHoursAP = currentTime.getHours();
  // Operating System Clock Hours for 24h clock
  currentHours = currentTime.getHours();
  // Operating System Clock Minutes
  currentMinutes = currentTime.getMinutes();
  // Operating System Clock Seconds
  currentSeconds = currentTime.getSeconds();
  // Adding 0 if Minutes & Seconds is More or Less than 10
  currentMinutes = (currentMinutes < 10 ? "0" : "") + currentMinutes;
  currentSeconds = (currentSeconds < 10 ? "0" : "") + currentSeconds;

  document.querySelector(".msec").innerHTML = currentSeconds;
  document.querySelector(".mmin").innerHTML = currentMinutes;
  document.querySelector(".mhours").innerHTML = currentHours;
};
setInterval(updateClock, 1000);

let currentFlights = [];
const getFlightTickets = () => {
  return new Promise((resolve) => {
    // Get all of the tickets:
    fetch(
      `${HOST_URL}/_api/web/lists/getbytitle('${MISSION_LIST_NAME}')/items?$top=30&$orderby=Departure_Date%20desc`,
      {
        headers: { Accept: "application/json; odata=verbose" },
        credentials: "include",
      }
    )
      .then((response) => response.json())
      .then((data) => {
        const items = data.d.results;
        if (items.length === 0) return;
        const currentDate = new Date();
        const currentDateString = currentDate.toISOString();

        let tomorrowsDate = new Date();
        tomorrowsDate.setDate(tomorrowsDate.getDate() + 1);
        const tomorrowsDateString = tomorrowsDate.toISOString();
        items.forEach((item) => {
          if (currentFlights.includes(item.Id)) return;
          currentFlights.push(item.Id);
          const departureTime = item.Departure_Date;
          const arrivalTime = item.Arrival_Date;
          if (
            departureTime < tomorrowsDateString &&
            arrivalTime > currentDateString
          ) {
            const currentMissionId = item.Id;
            const flightScheduleTable = document.getElementById("flightsBody");
            let rowContent = "";

            const departureTimeString = convertDateToHTMLString(
              item.Departure_Date
            );
            const arrivalTimeString = convertDateToHTMLString(
              item.Arrival_Date
            );
            let classText = "";

            if (
              item.DV === "VPOTUS" ||
              item.DV === "SECSTATE" ||
              item.DV === "SECDEF" ||
              item.DV === "POTUS" ||
              item.DV === "CJCS"
            ) {
              classText = `class="bg-primary font-weight-bold"`;
            }
            rowContent = `<tr id="${currentMissionId}"><td ${classText}>${item.DV}</td><td><a href="viewFlightTicket.html?ticket=${currentMissionId}">${item.Mission_Number}</a><td>${item.Tail_Number}</td><td>${item.Departure_Location}</td><td>${item.Arrival_Location}</td><td>${departureTimeString}<br /><span class="isodateDep">${item.Departure_Date}</span></td><td>${arrivalTimeString}<br /><span class="isodateArr">${item.Arrival_Date}</span></td></tr>`;

            const newRow = flightScheduleTable.insertRow(0);
            newRow.innerHTML = rowContent;
          }
        });
        resolve("Tickets Loaded");
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  });
};
setInterval(getFlightTickets, 60000);

const updateFlights = async () => {
  const grabFlightTickets = await getFlightTickets();
  [...document.getElementsByClassName("isodateArr")].forEach((element) => {
    let countDownDate = new Date(element.innerHTML);
    let countDownTime = countDownDate.getTime();
    countDownDate.addHours(estTimeOffset);
    countDownTime = countDownDate.getTime();

    let currentDate = new Date();
    const timeOffset = currentDate.getTimezoneOffset() * 60000;
    currentDate.setTime(currentDate.getTime() + timeOffset);

    let differenceInTime = countDownTime - currentDate;

    const countDownTimer = setInterval(() => {
      if (differenceInTime <= 0) {
        element.innerHTML = "ARRIVED";
        element.classList.add("font-weight-bold");
      } else {
        differenceInTime = differenceInTime - 1000;
        const hours = Math.floor(differenceInTime / 3600000);
        const minutes = Math.floor(
          (differenceInTime - hours * 3600000) / 60000
        );
        const minutesString = (minutes < 10 ? "0" : "") + minutes;
        const seconds = Math.floor(
          (differenceInTime - hours * 3600000 - minutes * 60000) / 1000
        );
        const secondsString = (seconds < 10 ? "0" : "") + seconds;
        const dateString = `${hours}:${minutesString}:${secondsString}`;
        element.innerHTML = dateString;
      }
    }, 1000);
  });
  [...document.getElementsByClassName("isodateDep")].forEach((element) => {
    let countDownDate = new Date(element.innerHTML);
    let countDownTime = countDownDate.getTime();
    countDownDate.addHours(estTimeOffset);
    countDownTime = countDownDate.getTime();

    let currentDate = new Date();
    const timeOffset = currentDate.getTimezoneOffset() * 60000;
    currentDate.setTime(currentDate.getTime() + timeOffset);

    let differenceInTime = countDownTime - currentDate;

    const countDownTimer = setInterval(() => {
      if (differenceInTime <= 0) {
        element.innerHTML = "DEPARTED";
        element.classList.add("font-weight-bold");
        element.parentNode.classList.remove("departedRow");
      } else {
        differenceInTime = differenceInTime - 1000;
        const hours = Math.floor(differenceInTime / 3600000);
        const minutes = Math.floor(
          (differenceInTime - hours * 3600000) / 60000
        );
        const minutesString = (minutes < 10 ? "0" : "") + minutes;
        const seconds = Math.floor(
          (differenceInTime - hours * 3600000 - minutes * 60000) / 1000
        );
        const secondsString = (seconds < 10 ? "0" : "") + seconds;
        const dateString = `${hours}:${minutesString}:${secondsString}`;
        element.innerHTML = dateString;
        if (hours == "0" && +minutes <= 59)
          element.parentNode.classList.add("departedRow");
      }
    }, 1000);
  });
};
updateFlights();

const showPastFlights = () => {
  if (!checkRowTimer) return (checkRowTimer = setInterval(checkRows(), 1000));
  clearInterval(checkRowTimer);
  checkRowTimer = null;
  [...document.querySelectorAll("#flights tr")].forEach((row) => {
    row.style.display = "";
  });
};

const checkRows = () => {
  [...document.querySelectorAll("table > tbody > tr")].forEach((row) => {
    if (row.innerHTML.includes("ARRIVED")) {
      row.classList.add("table-success");
      row.style.display = "none";
    }

    if (row.innerHTML.includes("DEPARTED")) {
      row.classList.add("table-secondary");
      row.classList.remove("table-primary");
    }
  });
};
checkRowTimer = setInterval(checkRows, 1000);

const getPrimaryA2G2 = () => {
  fetch(
    `${HOST_URL}/_api/web/lists/getbytitle('${PRIMARY_A2G2_LIST_NAME}')/items`,
    {
      headers: { Accept: "application/json; odata=verbose" },
      credentials: "include",
    }
  )
    .then((response) => response.json())
    .then((data) => {
      const items = data.d.results;
      if (items.length !== 0) return;
      if (items[0].Title === "ADW")
        return (document.getElementsById("primary").innerHTML =
          "Andrews is Primary");
      return (document.getElementById("primary").innerHTML =
        "McChord is Primary");
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};
getPrimaryA2G2();

const updatePrimary = (primary) => {
  var itemProperties = { Title: primary };

  updateListItem(
    PRIMARY_A2G2_LIST_NAME,
    "1",
    itemProperties,
    () => {
      console.log("Primary updated.");
    },
    (error) => {
      console.error("Error: ", error);
    }
  );
};

Date.prototype.addHours = function (h) {
  this.setTime(this.getTime() + h * 60 * 60 * 1000);
  return this;
};

const changePrimary = () => {
  const currentPrimary = document.getElementById("primary").innerText;
  if (currentPrimary == "Andrews is Primary") {
    document.getElementById("primary").innerText = "McChord is Primary";
    updatePrimary("MCC");
  } else {
    document.getElementById("primary").innerText = "Andrews is Primary";
    updatePrimary("ADW");
  }
};

function checkFullScreen() {
  // Fall back for if those do not work
  if (!$.cookie("fullscreen")) {
    $.cookie("fullscreen", "false");
    console.log("cookie made");
  } else if ($.cookie("fullscreen") == "false") {
    console.log("Cookie is false");
    $(".sidebar").addClass("d-none");
    $(".sidebar").addClass("d-md-block");
    $(".sidebar").show();
    $("footer").show();
    $("main").addClass("col-md-9");
    $("main").addClass("col-lg-10");
    $("main").removeClass("col-md-12");
    $("#minmax").html(
      '<span data-feather="maximize-2" style="width:23px;height:23px;"></span>'
    );
    feather.replace();
  } else if ($.cookie("fullscreen") == "true") {
    console.log("cookie is true");
    $(".sidebar").removeClass("d-none");
    $(".sidebar").removeClass("d-md-block");
    $(".sidebar").hide();
    $("footer").hide();
    $("main").removeClass("col-md-9");
    $("main").removeClass("col-lg-10");
    $("main").addClass("col-md-12");
    $("#minmax").html(
      '<span data-feather="minimize-2" style="width:23px;height:23px;"></span>'
    );
    feather.replace();
  }
}
checkFullScreen();
