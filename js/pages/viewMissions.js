import { HOST_URL } from "../modules/constants.js";
import { convertDateToTicketHTMLString } from "../modules/utility.js";
import permissionsCheck from "../modules/userPermissionsCheck.js";
const MISSIONS_LIST_NAME = "Missions";
feather.replace();
permissionsCheck("VklFVyBNSVNTSU9OUw==");

fetch(
  `${HOST_URL}/_api/web/lists/getbytitle('${MISSIONS_LIST_NAME}')/items?$top=1000&$orderby=Created desc`,
  {
    headers: { Accept: "application/json; odata=verbose" },
    credentials: "include",
  }
)
  .then((response) => response.json())
  .then(async (data) => {
    // Create Missions Table
    $.fn.dataTable.moment("MM/DD/YYYY HH:mm");

    $("#listMissions").DataTable({
      dom: "Bfrtip",
      buttons: ["copy", "csv", "excel", "pdf", "print"],
      order: [[4, "desc"]],
    });

    const loader = document.getElementById("missions_loader");
    loader.style.display = "none";

    /*
          arrayOfMissions SETUP:
          MISSION NUMBER, DVS, START DATE, LAST DATE   TAILS
                0         1       2          3          4
        */
    let arrayOfMissions = [];
    const items = data.d.results;
    for (const item of items) {
      if (
        item.Mission_Number === null ||
        item.Mission_Number === undefined ||
        item.Mission_Number === "N/A"
      )
        continue;

      const currentMission = item.Mission_Number;
      const doesMissionExist = await asyncSome(
        arrayOfMissions,
        currentMission,
        async (i, search) => {
          if (i === null) return false;
          if (i.includes(search)) return true;
          return false;
        }
      );

      if (!doesMissionExist) {
        // does mission already exist? If not, lets add it to the array.
        arrayOfMissions.push([
          currentMission,
          [item.DV],
          item.Departure_Date,
          item.Arrival_Date,
          [item.Tail_Number],
        ]);
        continue;
      }

      const rowOfMission = await findRow(arrayOfMissions, currentMission);

      const dvExists = await asyncSome(
        arrayOfMissions[rowOfMission][1],
        item.DV,
        async (i, search) => {
          if (i === null) return false;
          if (i.includes(search)) return true;
          return false;
        }
      );
      if (!dvExists) arrayOfMissions[rowOfMission][1].push(item.DV);

      // See if the found departure date is before the currently stored departure date
      const storedDepartureDate = new Date(arrayOfMissions[rowOfMission][2]);
      const currentDepartureDate = new Date(item.Departure_Date);
      if (currentDepartureDate.getTime() < storedDepartureDate.getTime())
        arrayOfMissions[rowOfMission][2] = item.Departure_Date;

      // see if the found Arrival date is before the currently stored arrival date
      const storedArrivalDate = new Date(arrayOfMissions[rowOfMission][3]);
      const currentArrivalDate = new Date(item.Arrival_Date);
      if (storedArrivalDate.getTime() < currentArrivalDate.getTime())
        arrayOfMissions[rowOfMission][3] = item.Arrival_Date;

      // Update tails of mission if necessary
      const tailExists = await asyncSome(
        arrayOfMissions[rowOfMission][4],
        item.Tail_Number,
        async (i, search) => {
          if (i === null) return false;
          if (i.includes(search)) return true;
          return false;
        }
      );
      if (!tailExists) arrayOfMissions[rowOfMission][4].push(item.Tail_Number);
    }

    // Add data to a table
    arrayOfMissions.map((mission) => {
      const currentMissionNumber = mission[0];
      const listOfDvs = mission[1];
      const startDateOfMission = mission[2];
      const endDateOfMission = mission[3];
      const listOfTails = mission[4];

      const href = `<a href="viewMission.html?mission=${currentMissionNumber}">${currentMissionNumber}</a>`;
      const formattedDvString = listOfDvs.join(", ");
      const formattedTailString = listOfTails.join(", ");
      const formattedStartString =
        convertDateToTicketHTMLString(startDateOfMission);
      const formattedEndString =
        convertDateToTicketHTMLString(endDateOfMission);

      $("#listMissions")
        .DataTable()
        .row.add([
          href,
          formattedTailString,
          formattedDvString,
          formattedStartString,
          formattedEndString,
        ])
        .draw();
    });
  })
  .catch((error) => {
    console.error("Error:", error);
  });

const asyncSome = async (arr, search, predicate) => {
  for (let e of arr) {
    if (await predicate(e, search)) return true;
  }
  return false;
};

const findRow = async (arr, search) => {
  let location = false;
  arr.map((item, i) => {
    if (item[0].includes(search)) location = i;
  });
  return location;
};
