import { HOST_URL } from "../modules/constants.js";
import { insertIntoList, removeFromList } from "../modules/utility.js";
import { checkPermissions } from "../user.js";
import permissionsCheck from "../modules/userPermissionsCheck.js";
const DV_LIST_NAME = "DVList";
const TICKET_CATEGORIES_LIST_NAME = "Ticket_Categories";
const TICKET_CATEGORIES_INSERT_NAME = "Ticket_x005f_Categories";
const TAIL_NUMBER_LIST = "TailNumbers";
permissionsCheck("VElDS0VUIFNFVFRJTkdT");

// Populate DV List
fetch(
  `${HOST_URL}/_api/web/lists/getbytitle('${DV_LIST_NAME}')/items?$top=5000&$orderby=DV asc`,
  {
    headers: { Accept: "application/json; odata=verbose" },
    credentials: "include",
  }
)
  .then((response) => response.json())
  .then((data) => {
    const dvListContainer = document.getElementById("dv_list");
    const items = data.d.results;

    items.forEach((dv) => {
      let dvListItem = document.createElement("li");
      dvListItem.classList.add("list-group-item");
      dvListItem.setAttribute("id", `dv-${dv.Id}`);
      dvListItem.innerHTML = `${dv.DV}<a href="javascript: void(0);" class="float-right" id="delete-dv-${dv.Id}"><span data-feather="trash-2"></span></a>`;
      dvListContainer.appendChild(dvListItem);
    });

    addLinkListeners();
    feather.replace();
  })
  .catch((error) => {
    console.error("Error:", error);
  });

document.querySelector("#add_dv").addEventListener("click", (event) => {
  const enteredDv = document.getElementById("dv").value;
  if (!enteredDv) return alert("Please enter a DV.");

  // Disable button to prevent double clicking
  const LOADING_TEXT =
    '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';
  event.target.disabled = true;
  event.target.innerHTML = LOADING_TEXT;

  const dvProperties = {
    DV: enteredDv.toUpperCase(),
  };

  insertIntoList(
    DV_LIST_NAME,
    dvProperties,
    () => {
      event.target.disabled = false;
      event.target.innerHTML = "Add DV";
      document.getElementById("dv").value = "";
      alert("DV added successfully.");
    },
    (error) => {
      console.error("Error: ", error);
    }
  );
});

// Populate Category List
fetch(
  `${HOST_URL}/_api/web/lists/getbytitle('${TICKET_CATEGORIES_LIST_NAME}')/items?$top=5000&$orderby=Category asc`,
  {
    headers: { Accept: "application/json; odata=verbose" },
    credentials: "include",
  }
)
  .then((response) => response.json())
  .then((data) => {
    const categoryListContainer = document.getElementById("category_list");
    const items = data.d.results;

    items.forEach((category) => {
      let categoryListItem = document.createElement("li");
      categoryListItem.classList.add("list-group-item");
      categoryListItem.setAttribute("id", `category-${category.Id}`);
      categoryListItem.innerHTML = `${category.Category}<a href="javascript: void(0);" class="float-right" id="delete-category-${category.Id}"><span data-feather="trash-2"></span></a>`;
      categoryListContainer.appendChild(categoryListItem);
    });

    addLinkListeners();
    feather.replace();
  })
  .catch((error) => {
    console.error("Error:", error);
  });

// add category add click handler
document.querySelector("#add_category").addEventListener("click", (event) => {
  const enteredCategory = document.getElementById("category").value;
  if (!enteredCategory) return alert("Please enter a category.");

  // Disable button to prevent double clicking
  const LOADING_TEXT =
    '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';
  event.target.disabled = true;
  event.target.innerHTML = LOADING_TEXT;

  const categoryProperties = { Category: enteredCategory };

  insertIntoList(
    TICKET_CATEGORIES_LIST_NAME,
    categoryProperties,
    () => {
      event.target.disabled = false;
      event.target.innerHTML = "Add Category";
      document.getElementById("category").value = "";
      alert("Category added successfully.");
    },
    (error) => {
      console.error("Error: ", error);
    },
    true
  );
});

// Populate Aircraft list
fetch(
  `${HOST_URL}/_api/web/lists/getbytitle('${TAIL_NUMBER_LIST}')/items?$top=5000&$orderby=Tail_x0020_Numbers asc`,
  {
    headers: { Accept: "application/json; odata=verbose" },
    credentials: "include",
  }
)
  .then((response) => response.json())
  .then((data) => {
    const aircraftListContainer = document.getElementById("aircraft_list");
    const items = data.d.results;

    items.forEach((aircraft) => {
      let aircraftListItem = document.createElement("li");
      aircraftListItem.classList.add("list-group-item");
      aircraftListItem.setAttribute("id", `aircraft-${aircraft.Id}`);
      aircraftListItem.innerHTML = `${aircraft.Tail_x0020_Numbers}<a href="javascript: void(0);" class="float-right" id="delete-aircraft-${aircraft.Id}"><span data-feather="trash-2"></span></a>`;
      aircraftListContainer.appendChild(aircraftListItem);
    });

    addLinkListeners();
    feather.replace();
  })
  .catch((error) => {
    console.error("Error:", error);
  });

// add Tail add click handler
document.querySelector("#add_aircraft").addEventListener("click", (event) => {
  const enteredAircraft = document.getElementById("aircraft").value;
  if (!enteredAircraft) return alert("Please enter a tail number.");

  // Disable button to prevent double clicking
  const LOADING_TEXT =
    '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';
  event.target.disabled = true;
  event.target.innerHTML = LOADING_TEXT;

  const aircraftProperties = { Tail_x0020_Numbers: enteredAircraft };

  insertIntoList(
    TAIL_NUMBER_LIST,
    aircraftProperties,
    () => {
      event.target.disabled = false;
      event.target.innerHTML = "Add Aircraft";
      document.getElementById("aircraft").value = "";
      alert("Tail number added successfully.");
    },
    (error) => {
      console.error("Error: ", error);
    }
  );
});

// add event handlers
const addLinkListeners = () => {
  document.querySelectorAll("[id^='delete-']").forEach((item) => {
    const deleteType = item.id.split("-")[1];
    let list;
    if (deleteType === "dv") list = DV_LIST_NAME;
    if (deleteType === "category") list = TICKET_CATEGORIES_LIST_NAME;
    if (deleteType === "aircraft") list = TAIL_NUMBER_LIST;

    item.addEventListener("click", (event) => {
      const currentButton = event.currentTarget;
      const deleteId = currentButton.id.split("-")[2];

      removeFromList(
        list,
        deleteId,
        () => {
          currentButton.parentNode.remove();
        },
        (error) => {
          console.error("Error:", error);
        }
      );
    });
  });
};

// if (airport_check) {
//   //Populate IATA
//   var urlLoad =
//     "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('iata_list')/items?$top=5000&$orderby=Title%20asc";
//   $.ajax({
//     url: urlLoad,
//     async: false,
//     method: "GET",
//     headers: {
//       Accept: "application/json;odata=verbose",
//     },
//     success: function (data) {
//       var total = 0;
//       var allResults = data.d.results;
//       if (Number(allResults.length) > 0) {
//         var select = document.getElementById("iata_list");
//         for (var i = 0; i < Number(allResults.length); i++) {
//           // looping through all results
//           var opt = document.createElement("li");
//           opt.classList.add("list-group-item");
//           opt.setAttribute("id", "iata-" + allResults[i].Id + "");
//           opt.innerHTML =
//             allResults[i].Title +
//             '<a class="float-right" href="javascript: deleteIata(' +
//             allResults[i].Id +
//             ');"><span data-feather="trash-2"></span></a>';
//           select.appendChild(opt);
//         }
//       }
//     },
//     error: function (data) {
//       //alert("Error: " + JSON.stringify(data));
//     },
//   });
//   // add iata add click handler
//   $(document).on("click", "#add_iata", function () {
//     // Disable Button
//     var iata = $("#iata").val();
//     if (iata != "") {
//       var $this = $(this);
//       var loadingText =
//         '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Loading...';
//       if ($(this).html() !== loadingText) {
//         $this.data("original-text", $(this).html());
//         $this.html(loadingText);
//         $this.attr("disabled", true);
//       }

//       var itemProperties = { Title: iata.toUpperCase() };
//       CreateListItemWithDetails(
//         "iata_list",
//         hostUrl,
//         itemProperties,
//         function () {
//           alert("IATA successfully added.");
//           location.reload();
//         },
//         function () {
//           alert("An error has occured. Please try again.");
//         }
//       );
//     } else {
//       alert("IATA cannot be empty.");
//     }
//   });
// }

// $("#nightMode").click(function () {
//   if (!$.cookie("nightmode")) {
//     nightmode = true;
//     $.cookie("nightmode", "true");
//     console.log("cookie made");
//   }
//   var $this = $(this);
//   if (
//     $(this).html() ==
//     '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-sun" style="width:23px;height:23px;"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>'
//   ) {
//     console.log("currently night mode");
//     $.cookie("nightmode", "false");
//     nightmode = false;
//     checkNightMode();
//   } else {
//     console.log("currently day mode");
//     $.cookie("nightmode", "true");
//     nightmode = true;
//     checkNightMode();
//   }
// });
// checkNightMode();
// feather.replace();

// function CreateListItemWithDetails(
//   listName,
//   webUrl,
//   itemProperties,
//   success,
//   failure
// ) {
//   var itemType = GetItemTypeForListName(listName);
//   if (listName == "Ticket_Categories")
//     itemType = "SP.Data.Ticket_x005f_CategoriesListItem";

//   if (listName == "iata_list") itemType = "SP.Data.Iata_x005f_listListItem";

//   itemProperties["__metadata"] = { type: itemType };

//   $.ajax({
//     url: webUrl + "_api/web/lists/getbytitle('" + listName + "')/items",
//     type: "POST",
//     contentType: "application/json;odata=verbose",
//     data: JSON.stringify(itemProperties),
//     headers: {
//       Accept: "application/json;odata=verbose",
//       "X-RequestDigest": digest,
//     },
//     success: function (data) {
//       success(data);
//     },
//     error: function (data) {
//       failure(data);
//     },
//   });
// }

// // Get List Item Type metadata
// function GetItemTypeForListName(name) {
//   return (
//     "SP.Data." +
//     name.charAt(0).toUpperCase() +
//     name.split(" ").join("").slice(1) +
//     "ListItem"
//   );
// }

// function deleteDV(id) {
//   $.ajax({
//     url: hostUrl + "/_api/web/lists/getbytitle('DVList')/items(" + id + ")",
//     type: "POST",
//     contentType: "application/json;odata=verbose",
//     headers: {
//       Accept: "application/json;odata=verbose",
//       "X-RequestDigest": digest,
//       "IF-MATCH": "*",
//       "X-HTTP-Method": "DELETE",
//     },
//     success: function (data) {
//       $("#dv-" + id + "").hide("slow", function () {
//         $target.remove();
//       });
//     },
//     error: function (data) {
//       alert("An error has occured. Please try again.");
//     },
//   });
// }

// function deleteCategory(id) {
//   $.ajax({
//     url:
//       hostUrl +
//       "/_api/web/lists/getbytitle('Ticket_Categories')/items(" +
//       id +
//       ")",
//     type: "POST",
//     contentType: "application/json;odata=verbose",
//     headers: {
//       Accept: "application/json;odata=verbose",
//       "X-RequestDigest": digest,
//       "IF-MATCH": "*",
//       "X-HTTP-Method": "DELETE",
//     },
//     success: function (data) {
//       $("#category-" + id + "").hide("slow", function () {
//         $target.remove();
//       });
//     },
//     error: function (data) {
//       alert("An error has occured. Please try again.");
//     },
//   });
// }

// function deleteAircraft(id) {
//   $.ajax({
//     url:
//       hostUrl + "/_api/web/lists/getbytitle('TailNumbers')/items(" + id + ")",
//     type: "POST",
//     contentType: "application/json;odata=verbose",
//     headers: {
//       Accept: "application/json;odata=verbose",
//       "X-RequestDigest": digest,
//       "IF-MATCH": "*",
//       "X-HTTP-Method": "DELETE",
//     },
//     success: function (data) {
//       $("#tail-" + id + "").hide("slow", function () {
//         $target.remove();
//       });
//     },
//     error: function (data) {
//       alert("An error has occured. Please try again.");
//     },
//   });
// }

// function deleteIata(id) {
//   $.ajax({
//     url: hostUrl + "/_api/web/lists/getbytitle('iata_list')/items(" + id + ")",
//     type: "POST",
//     contentType: "application/json;odata=verbose",
//     headers: {
//       Accept: "application/json;odata=verbose",
//       "X-RequestDigest": digest,
//       "IF-MATCH": "*",
//       "X-HTTP-Method": "DELETE",
//     },
//     success: function (data) {
//       $("#iata-" + id + "").hide("slow", function () {
//         $target.remove();
//       });
//     },
//     error: function (data) {
//       alert("An error has occured. Please try again.");
//     },
//   });
// }
