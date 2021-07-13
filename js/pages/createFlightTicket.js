import { HOST_URL } from "../modules/constants.js";
import { insertIntoList } from "../modules/utility.js";
import permissionsCheck from "../modules/userPermissionsCheck.js";
const MISSION_LIST_NAME = "Missions";
feather.replace();
permissionsCheck("Q1JFQVRFIEZMSUdIVCBUSUNLRVQ=");

//generate calendar objects
$("#datetimepicker1").datetimepicker({
  format: "MM/DD/YYYY, HH:mm",
});

$("#datetimepicker2").datetimepicker({
  format: "MM/DD/YYYY, HH:mm",
});

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
populateIataDropDown();

// populate Aircraft Drop Down
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
    const dvSelectInput = document.getElementById("tail_number");
    items.forEach((item) => {
      let opt = document.createElement("option");
      opt.innerHTML = item.Tail_x0020_Numbers;
      dvSelectInput.appendChild(opt);
    });
    $(".selectpicker").selectpicker("refresh");
  })
  .catch((error) => {
    console.error("Error:", error);
  });

// Create Ticket
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

  insertIntoList(MISSION_LIST_NAME, ticketProperties, () => {
    alert("Ticket created successfully.");
    location.reload();
  }),
    (error) => {
      alert("An error has occured. Please try again.");
      console.error(error);
    };
});

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

// fetch mission information
const fetchMissionInfo = async (missionNumber) => {
  const response = await fetch(
    `${HOST_URL}/_api/web/lists/getbytitle('Missions')/items?$filter=Mission_Number eq '${missionNumber}'&$top=1&$orderby=Created desc`,
    {
      headers: { Accept: "application/json; odata=verbose" },
      credentials: "include",
    }
  );
  const data = await response.json();
  const item = data.d.results[0] || "";
  if (item === "") return false;

  const dvSelect = document.getElementById("dv_select");
  dvSelect.value = item.DV;
  $(".selectpicker").selectpicker("refresh");

  const tailNumberInput = document.getElementById("tail_number");
  tailNumberInput.value = item.Tail_Number;
  $(".selectpicker").selectpicker("refresh");

  const departureIataSelect = document.getElementById("departure_iata");
  departureIataSelect.value = item.Arrival_IATA;
  $(".selectpicker").selectpicker("refresh");

  const locationInformation = await getLocationInformation(item.Arrival_IATA);
  const departureLocationInput = document.getElementById("departure_location");
  departureLocationInput.value = locationInformation;
  return true;
};

/* Event handlers */
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

document
  .querySelector("#mission_number")
  .addEventListener("change", async (event) => {
    const enteredMissionNumber = event.target.value;
    fetchMissionInfo(enteredMissionNumber);
  });
