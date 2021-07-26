import { HOST_URL } from "../modules/constants.js";
import {
  updateListItem,
  removeFromList,
  getUrlParameter,
} from "../modules/utility.js";
import permissionsCheck from "../modules/userPermissionsCheck.js";
const MISSION_LIST_NAME = "Missions";
permissionsCheck("VklFVyBGTElHSFQgVElDS0VU");
feather.replace();

const missionNumber = getUrlParameter("ticket");

// generate calendar objects
$("#datetimepicker1").datetimepicker({
  format: "MM/DD/YYYY, HH:mm",
});
$("#datetimepicker2").datetimepicker({
  format: "MM/DD/YYYY, HH:mm",
});

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

// Populate IATA dropdowns
let iataList = [];
let iataFetchUrl = `${HOST_URL}/_api/web/lists/getbytitle('Airports_Codes')/items?$select=gps_code&$top=1000&$orderby=Title%20asc`;
const getIataList = async () => {
  const response = await fetch(iataFetchUrl, {
    headers: { Accept: "application/json; odata=verbose" },
    credentials: "include",
  });
  const data = await response.json();
  iataList = [...iataList, ...data.d.results];
  if (!data.d.__next) return true;
  iataFetchUrl = data.d.__next;
  return await getIataList();
};

const populateIataDropDown = async () => {
  const fetchIataStatus = await getIataList();
  const arrivalSelect = document.getElementById("arrival_iata");
  const departureSelect = document.getElementById("departure_iata");
  const formLoader = document.getElementById("ticket_form_loader");
  formLoader.style.display = "none";
  arrivalSelect.disabled = false;
  departureSelect.disabled = false;
  iataList.map((item) => {
    let opt = document.createElement("option");
    opt.innerHTML = item.gps_code;
    arrivalSelect.appendChild(opt);
  });
  iataList.map((item) => {
    let opt = document.createElement("option");
    opt.innerHTML = item.gps_code;
    departureSelect.appendChild(opt);
  });
  $(".selectpicker").selectpicker("refresh");
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

// get IATA location information
const getLocationInformation = async (iata) => {
  const identSearchResponse = await fetch(
    `${HOST_URL}/_api/web/lists/getbytitle('Airports_Codes')/items?$filter=ident eq '${iata}'&$top=1`,
    {
      headers: { Accept: "application/json; odata=verbose" },
      credentials: "include",
    }
  );
  const identSearchData = await identSearchResponse.json();
  if (identSearchData.d.results[0]) {
    const result = identSearchData.d.results[0];
    const country = result.iso_country;
    const region = result.iso_region;
    const municipality = result.municipality;
    const locationName = result.name;
    if (country === "US") {
      const state = region.split("-")[1];
      if (
        locationName.includes("Air Base") ||
        locationName.includes("Air Force Base")
      ) {
        return `${locationName}, ${state}`;
      } else {
        return `${municipality}, ${state}`;
      }
    } else {
      if (
        locationName.includes("Air Base") ||
        locationName.includes("Air Force Base")
      ) {
        return `${locationName}, ${country}`;
      } else {
        return `${municipality}, ${country}`;
      }
    }
  }

  // we didnt find it by FAA identifier, now lets search gps_codes
  const gpsSearchResponse = await fetch(
    `${HOST_URL}/_api/web/lists/getbytitle('Airports_Codes')/items?$filter=gps_code eq '${iata}'&$top=1`,
    {
      headers: { Accept: "application/json; odata=verbose" },
      credentials: "include",
    }
  );
  const gpsSearchData = await gpsSearchResponse.json();
  if (gpsSearchData.d.results[0]) {
    const result = gpsSearchData.d.results[0];
    const country = result.iso_country;
    const region = result.iso_region;
    const municipality = result.municipality;
    const locationName = result.name;
    if (country === "US") {
      const state = region.split("-")[1];
      if (
        locationName.includes("Air Base") ||
        locationName.includes("Air Force Base")
      ) {
        return `${locationName}, ${state}`;
      } else {
        return `${municipality}, ${state}`;
      }
    } else {
      if (
        locationName.includes("Air Base") ||
        locationName.includes("Air Force Base")
      ) {
        return `${locationName}, ${country}`;
      } else {
        return `${municipality}, ${country}`;
      }
    }
  }

  // result was not found at all.. returning blank string
  return "";
};

const populateMissionFields = async () => {
  await Promise.all([
    populateDvDropDown(),
    populateAircraftDropDown(),
    populateIataDropDown(),
  ]);

  fetch(
    `${HOST_URL}/_api/web/lists/getbytitle('${MISSION_LIST_NAME}')/items?$filter= Id eq '${missionNumber}'`,
    {
      headers: { Accept: "application/json; odata=verbose" },
      credentials: "include",
    }
  )
    .then((response) => response.json())
    .then((data) => {
      const result = data.d.results[0] || "";
      if (!result) return;
      const missionNumberField = document.getElementById("mission_number");
      missionNumberField.value = result.Mission_Number;

      const dvSelect = document.getElementById("dv_select");
      dvSelect.value = result.DV;

      $("#datetimepicker1").datetimepicker("date", result.Departure_Date);

      $("#datetimepicker2").datetimepicker("date", result.Arrival_Date);

      const tailNumberSelect = document.getElementById("tail_number");
      tailNumberSelect.value = result.Tail_Number;

      const departureIataSelect = document.getElementById("departure_iata");
      departureIataSelect.value = result.Departure_IATA;

      const departureLocationField =
        document.getElementById("departure_location");
      departureLocationField.value = result.Departure_Location;

      const arrivalIataSelect = document.getElementById("arrival_iata");
      arrivalIataSelect.value = result.Arrival_IATA;

      const arrivalLocationField = document.getElementById("arrival_location");
      arrivalLocationField.value = result.Arrival_Location;

      $(".selectpicker").selectpicker("refresh");
    })
    .catch((error) => console.error(error));
};
populateMissionFields();

/* Event Handlers */

// Update Ticket
document.querySelector("#ticket_submit").addEventListener("click", (event) => {
  const enteredMissionNumber = document
    .getElementById("mission_number")
    .value.toUpperCase();
  const enteredTailNumber = document.getElementById("tail_number").value;
  const selectedDv = document.getElementById("dv_select").value;
  const enteredDepartureIata = document.getElementById("departure_iata").value;
  const enteredDepartureLocation = document
    .getElementById("departure_location")
    .value.toUpperCase();
  const enteredArrivalIata = document.getElementById("arrival_iata").value;
  const enteredArrivalLocation = document
    .getElementById("arrival_location")
    .value.toUpperCase();
  const enteredDepartureDate = $("#datetimepicker1")
    .datetimepicker("viewDate")
    .toISOString();
  const enteredArrivalDate = $("#datetimepicker2")
    .datetimepicker("viewDate")
    .toISOString();

  // Disable button so user can not double click.
  const LOADING_TEXT =
    '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';
  event.target.disabled = true;
  event.target.innerHTML = LOADING_TEXT;

  const ticketProperties = {
    Mission_Number: enteredMissionNumber,
    Tail_Number: enteredTailNumber,
    DV: selectedDv,
    Departure_IATA: enteredDepartureIata,
    Departure_Date: enteredDepartureDate,
    Departure_Location: enteredDepartureLocation,
    Arrival_IATA: enteredArrivalIata,
    Arrival_Date: enteredArrivalDate,
    Arrival_Location: enteredArrivalLocation,
  };

  updateListItem(
    MISSION_LIST_NAME,
    missionNumber,
    ticketProperties,
    () => {
      alert("Ticket updated successfully.");
      location.reload();
    },
    (error) => {
      alert("An error has occured. Please try again.");
      console.error(error);
    }
  );
});

// Delete Ticket
document
  .querySelector("#deleteFlightTicket")
  .addEventListener("click", (event) => {
    // Disable button so user can not double click.
    const LOADING_TEXT =
      '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';
    event.target.disabled = true;
    event.target.innerHTML = LOADING_TEXT;

    removeFromList(
      MISSION_LIST_NAME,
      missionNumber,
      () => {
        alert("Ticket deleted successfully.");
        location.reload();
      },
      (error) => {
        alert("An error has occured. Please try again.");
        console.error(error);
      }
    );
  });

// Get Location Information
document
  .querySelector("#departure_iata")
  .addEventListener("change", async (event) => {
    const enteredIata = event.target.value;
    const location = await getLocationInformation(enteredIata);
    const departureLocationInput =
      document.getElementById("departure_location");
    departureLocationInput.value = location;
  });

document
  .querySelector("#arrival_iata")
  .addEventListener("change", async (event) => {
    const enteredIata = event.target.value;
    const location = await getLocationInformation(enteredIata);
    const arrivalLocationInput = document.getElementById("arrival_location");
    arrivalLocationInput.value = location;
  });
