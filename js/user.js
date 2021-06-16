var user = {};

getUser();

function getUser() {
  var name;
  $.ajax({
    url: "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/currentuser",
    async: false,
    method: "GET",
    headers: {
      "Accept": "application/json;odata=verbose"
    },
    success: function (data) {
      user.email = data.d.Email;
      user.name = data.d.Title;
      var urlLoad = "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('Permissions')/items?$filter=user eq '" + user.email + "'";
      $.ajax({
        url: urlLoad,
        async: false,
        method: "GET",
        headers: {
          "Accept": "application/json;odata=verbose"
        },
        success: function (data) {
          var allResults = data.d.results;
          if (Number(allResults.length) > 0) {
            user.permission = allResults[0].permission;
            var urlLoad = "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('accessGroups')/items?$filter=group_id eq '" + user.permission + "'";
            $.ajax({
              url: urlLoad,
              async: false,
              method: "GET",
              headers: {
                "Accept": "application/json;odata=verbose"
              },
              success: function (data) {
                var allResults = data.d.results;
                if (Number(allResults.length) > 0) {
                  user.accessList = allResults[0].access_list.split(",");
                }
              }
            });
          }
          else {
            // User not found, add them to db:
            var itemType = GetItemTypeForListName("permissions");
            var digest = getFormDigest();
            var itemProperties = { 'user': user.email };
            itemProperties["__metadata"] = { "type": itemType };
            $.ajax({
              url: "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('permissions')/items",
              type: "POST",
              contentType: "application/json;odata=verbose",
              data: JSON.stringify(itemProperties),
              headers: {
                "Accept": "application/json;odata=verbose",
                "X-RequestDigest": digest
              },
              success: function (data) {
                console.log("User added successfully.");
                location.reload();
              },
              error: function (data) {
                console.log("User already in database.");
              }
            });
          }
        }
      });
    },
    error: function (data) {
      //alert("Error: " + JSON.stringify(data));
    }
  });
}

// Item is the item being checked
// div to hide if necessary
// redirect if necessary to redirect page
function checkPermissions(item, div, redirect) {
  var granted = false;
  if (user.accessList.includes(atob(item)) || user.accessList == "ALL") {
    // perm granted
    granted = true;
    return granted;
  }
  else if (redirect == true) {
    window.location.replace("./index.html");
  }
  else if (div) {
    $("#" + div + "").remove();
  }
  return granted;
}

// Get List Item Type metadata
function GetItemTypeForListName(name) {
  return "SP.Data." + name.charAt(0).toUpperCase() + name.split(" ").join("").slice(1) + "ListItem";
}

// Get Digest for Auth purposes
function getFormDigest() {
  console.log("Getting Form Digest..");
  $.support.cors = true;
  var _formDigest;
  $.ajax({
    url: "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/contextinfo",
    type: "POST",
    dataType: "json",

    headers: { "Accept": "application/json; odata=verbose" },
    xhrFields: { withCredentials: true },
    async: false,
    success: function (data) {
      _formDigest = data.d.GetContextWebInformation.FormDigestValue;
      console.log(data.d.GetContextWebInformation.FormDigestValue);
      console.log("Form Digest Done");

    },
    error: function () {
      console.log("Error Occured");
    }
  });

  return _formDigest;
}

// Check Night mode preference
function checkNightMode() {
  if ($.cookie('nightmode') == 'true') {
    localStorage.setItem('nightMode', 'true');
    nightmode = true;
    console.log("cookie true");
    $('link[href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.5.3/css/bootstrap.min.css"]').attr('href', 'https://cdnjs.cloudflare.com/ajax/libs/bootswatch/4.5.3/darkly/bootstrap.min.css');
    $('link[href="./css/global.css"]').attr('href', './css/nightMode.css');
    $(".sidebar").removeClass("bg-light");
    $(".sidebar").addClass("bg-dark");
    $(".nav-link.active").removeClass("active").addClass("bg-secondary");
    $("footer").removeClass("bg-light").addClass("bg-dark");
    $("#nightMode").html('<span data-feather="sun" style="width:23px;height:23px;"></span>');
    feather.replace();
  }
  else {
    localStorage.setItem('nightMode', 'false');
    console.log("cookie false");
    nightmode = false;
    $('link[href="https://cdnjs.cloudflare.com/ajax/libs/bootswatch/4.5.3/darkly/bootstrap.min.css"]').attr('href', 'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.5.3/css/bootstrap.min.css');
    $('link[href="./css/nightMode.css"]').attr('href', './css/global.css');
    $(".sidebar").addClass("bg-light");
    $(".sidebar").removeClass("bg-dark");
    $(".nav-link.bg-secondary").addClass("active").removeClass("bg-secondary");
    $("footer").addClass("bg-light").removeClass("bg-dark");
    $("#nightMode").html('<span data-feather="moon" style="width:23px;height:23px;"></span>');
    feather.replace();
  }
}