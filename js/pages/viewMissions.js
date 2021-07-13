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

//           for (var i = 0; i < Number(allResults.length); i++) {
//             // looping through all results
//             var currentTime = allResults[i].Created;

//             if (
//               !arrayOfTimes.includes(currentTime) &&
//               allResults[i].Mission_Number != null &&
//               allResults[i].Mission_Number !== undefined &&
//               allResults[i].Mission_Number != "N/A"
//             ) {
//               // this is to make sure no duplicates are included.
//               // Now lets add each mission to array
//               /*
//                       ARRAY SETUP:
//                       MISSION NUMBER, DVS, START DATE, LAST DATE   TAILS
//                              0         1       2          3          4
//                   */
//               var currentMission = allResults[i].Mission_Number;
//               if (!exists(arrayOfMissions, currentMission)) {
//                 // Mission hasnt been included yet.
//                 arrayOfMissions.push([
//                   currentMission,
//                   [allResults[i].DV],
//                   allResults[i].Departure_Date,
//                   allResults[i].Arrival_Date,
//                   [allResults[i].Tail_Number],
//                 ]);
//                 // arrayOfMissions[row][1].push(dv);
//               } else {
//                 // lets check if the DV needs to be updated:
//                 var missionRow = findRow(arrayOfMissions, currentMission);
//                 if (!exists(arrayOfMissions[missionRow][1], allResults[i].DV)) {
//                   arrayOfMissions[missionRow][1].push(allResults[i].DV);
//                 }

//                 // Lets see if the date we found now is before the departure date
//                 var currentDep = new Date(arrayOfMissions[missionRow][2]);
//                 var foundDep = new Date(allResults[i].Departure_Date);
//                 if (foundDep.getTime() < currentDep.getTime())
//                   arrayOfMissions[missionRow][2] = allResults[i].Departure_Date;

//                 // Lets see if the date we found is after the arrival date
//                 var currentArr = new Date(arrayOfMissions[missionRow][3]);
//                 var foundArr = new Date(allResults[i].Arrival_Date);
//                 if (currentArr.getTime() < foundArr.getTime())
//                   arrayOfMissions[missionRow][3] = allResults[i].Arrival_Date;

//                 // Lets check if the tail numbers need to be added to:
//                 if (
//                   !exists(
//                     arrayOfMissions[missionRow][4],
//                     allResults[i].Tail_Number
//                   )
//                 ) {
//                   arrayOfMissions[missionRow][4].push(
//                     allResults[i].Tail_Number
//                   );
//                 }
//               }
//               /*var href = "<a href=\"./viewFlightTicket.html?ticket=" + allResults[i].Id + "\">" + allResults[i].Mission_Number + "</a>";
//                   var depDate = convertDate(allResults[i].Departure_Date);
//                   var arrDate = convertDate(allResults[i].Arrival_Date);*/

//               //$('#listTickets').DataTable().row.add([href, allResults[i].Tail_Number, allResults[i].DV, allResults[i].Departure_IATA, allResults[i].Departure_Location, allResults[i].Arrival_IATA, allResults[i].Arrival_Location, depDate, arrDate]).draw();
//               arrayOfTimes.push(currentTime);
//             }
//           }
//           for (var i = 0; i < arrayOfMissions.length; i++) {
//             var mission = arrayOfMissions[i][0];
//             var dvs = arrayOfMissions[i][1];
//             var start = arrayOfMissions[i][2];
//             var end = arrayOfMissions[i][3];
//             var tails = arrayOfMissions[i][4];

//             var href =
//               '<a href="viewMission.html?mission=' +
//               mission +
//               '">' +
//               mission +
//               "</a>";
//             var dvString = "";
//             if (dvs.length > 1) {
//               for (var j = 0; j < dvs.length; j++) {
//                 if (j == 0) {
//                   dvString = dvs[j];
//                 } else {
//                   dvString = dvString + ", " + dvs[j];
//                 }
//               }
//             } else {
//               dvString = dvs[0];
//             }

//             var tailString = "";
//             if (tails.length > 1) {
//               for (var j = 0; j < tails.length; j++) {
//                 if (j == 0) {
//                   tailString = tails[j];
//                 } else {
//                   tailString = tailString + ", " + tails[j];
//                 }
//               }
//             } else {
//               tailString = tails[0];
//             }

//             $("#listMissions")
//               .DataTable()
//               .row.add([
//                 href,
//                 tailString,
//                 dvString,
//                 convertDate(start),
//                 convertDate(end),
//               ])
//               .draw();
//           }
//         }
//       },
//       error: function (data) {
//         //alert("Error: " + JSON.stringify(data));
//       },
//     });
//   }
//   feather.replace();
// });

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
