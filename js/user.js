import { HOST_URL } from "./modules/constants.js";
import { insertIntoList } from "./modules/utility.js";

let user = {};
export const getUser = () => {
  return new Promise((resolve) => {
    fetch(`${HOST_URL}/_api/web/currentuser`, {
      headers: { Accept: "application/json; odata=verbose" },
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        user.email = data.d.Email;
        user.name = data.d.Title;

        fetch(
          `${HOST_URL}/_api/web/lists/getbytitle('Permissions')/items?$filter=user eq '${user.email}'`,
          {
            headers: { Accept: "application/json; odata=verbose" },
            credentials: "include",
          }
        )
          .then((response) => response.json())
          .then((data) => {
            const items = data.d.results;
            if (items.length !== 0) {
              user.permission = items[0].permission;
              fetch(
                `${HOST_URL}/_api/web/lists/getbytitle('accessGroups')/items?$filter=group_id eq '${user.permission}'`,
                {
                  headers: { Accept: "application/json; odata=verbose" },
                  credentials: "include",
                }
              )
                .then((response) => response.json())
                .then((data) => {
                  const items = data.d.results;
                  if (items.length === 0) return;
                  user.accessList = items[0].access_list.split(",");
                  resolve(user);
                });
            } else {
              // User not found, add them to db:
              let itemProperties = { user: user.email };
              insertIntoList(
                "permissions",
                itemProperties,
                () => {
                  console.log("User added successfully.");
                  location.reload();
                  resolve("User Added");
                },
                () => {
                  console.error(
                    "An error has occured adding the user to the database."
                  );
                }
              );
            }
          });
      })
      .catch((error) => {
        console.error("Error:", error);
        resolve("Error");
      });
  });
};

// Item is the item being checked
// div to hide if necessary
// redirect if necessary to redirect page
export const checkPermissions = (user, item, div, redirect) => {
  if (user?.accessList.includes(atob(item)) || user.accessList == "ALL")
    return true;
  else if (redirect == true) {
    window.location.replace("./index.html");
  } else if (div) {
    $("#" + div + "").remove();
  }
  return false;
};

// Check Night mode preference
function checkNightMode() {
  if ($.cookie("nightmode") == "true") {
    localStorage.setItem("nightMode", "true");
    nightmode = true;
    console.log("cookie true");
    $(
      'link[href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.5.3/css/bootstrap.min.css"]'
    ).attr(
      "href",
      "https://cdnjs.cloudflare.com/ajax/libs/bootswatch/4.5.3/darkly/bootstrap.min.css"
    );
    $('link[href="./css/global.css"]').attr("href", "./css/nightMode.css");
    $(".sidebar").removeClass("bg-light");
    $(".sidebar").addClass("bg-dark");
    $(".nav-link.active").removeClass("active").addClass("bg-secondary");
    $("footer").removeClass("bg-light").addClass("bg-dark");
    $("#nightMode").html(
      '<span data-feather="sun" style="width:23px;height:23px;"></span>'
    );
    feather.replace();
  } else {
    localStorage.setItem("nightMode", "false");
    console.log("cookie false");
    nightmode = false;
    $(
      'link[href="https://cdnjs.cloudflare.com/ajax/libs/bootswatch/4.5.3/darkly/bootstrap.min.css"]'
    ).attr(
      "href",
      "https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.5.3/css/bootstrap.min.css"
    );
    $('link[href="./css/nightMode.css"]').attr("href", "./css/global.css");
    $(".sidebar").addClass("bg-light");
    $(".sidebar").removeClass("bg-dark");
    $(".nav-link.bg-secondary").addClass("active").removeClass("bg-secondary");
    $("footer").addClass("bg-light").removeClass("bg-dark");
    $("#nightMode").html(
      '<span data-feather="moon" style="width:23px;height:23px;"></span>'
    );
    feather.replace();
  }
}
