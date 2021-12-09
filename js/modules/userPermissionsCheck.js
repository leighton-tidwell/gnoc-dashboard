import { getUser, checkPermissions } from "../user.js";

const runPermissionsCheck = (user, currentPage) => {
  return new Promise((checked) => {
    if (!checkPermissions(user, currentPage, false, true))
      return (window.location = "about:blank");
    checkPermissions(user, "REFTSEJPQVJE", "dashboard_div", false);
    checkPermissions(
      user,
      "RkxJR0hUIFNDSEVEVUxF",
      "flight_schedule_div",
      false
    );
    if (
      !checkPermissions(user, "Q1JFQVRFIFRUUw==", "create_tts_div", false) &&
      !checkPermissions(
        user,
        "Q1JFQVRFIE1BU1RFUiBUVFM=",
        "create_master_tts_div",
        false
      ) &&
      !checkPermissions(
        user,
        "VElDS0VUIFNFVFRJTkdT",
        "ticket_settings_div",
        false
      ) &&
      !checkPermissions(user, "VklFVyBUSUNLRVRT", "view_tickets_div", false)
    ) {
      const ticketsHeaderDiv = document.getElementById("tickets_header_div");
      ticketsHeaderDiv.parentNode.removeChild(ticketsHeaderDiv);
    }
    checkPermissions(user, "Q1JFQVRFIFRUUw==", "create_tts_div", false);
    checkPermissions(
      user,
      "Q1JFQVRFIE1BU1RFUiBUVFM=",
      "create_master_tts_div",
      false
    );
    checkPermissions(
      user,
      "VElDS0VUIFNFVFRJTkdT",
      "ticket_settings_div",
      false
    );
    checkPermissions(user, "VklFVyBUSUNLRVRT", "view_tickets_div", false);
    if (
      !checkPermissions(
        user,
        "Q1JFQVRFIEZMSUdIVCBUSUNLRVQ=",
        "create_flight_ticket_div",
        false
      ) &&
      !checkPermissions(
        user,
        "VklFVyBGTElHSFQgVElDS0VUUw==",
        "view_flight_tickets_div",
        false
      ) &&
      !checkPermissions(
        user,
        "VklFVyBNSVNTSU9OUw==",
        "view_missions_div",
        false
      )
    ) {
      const flightTicketsHeaderDiv = document.getElementById(
        "flight_tickets_header_div"
      );
      flightTicketsHeaderDiv.parentNode.removeChild(flightTicketsHeaderDiv);
    }
    checkPermissions(
      user,
      "Q1JFQVRFIEZMSUdIVCBUSUNLRVQ=",
      "create_flight_ticket_div",
      false
    );
    checkPermissions(
      user,
      "Q1JFQVRFIEZMSUdIVCBUSUNLRVQ=",
      "create_flight_ticket_icon_div",
      false
    );
    checkPermissions(
      user,
      "VklFVyBGTElHSFQgVElDS0VUUw==",
      "view_flight_tickets_div",
      false
    );
    checkPermissions(user, "VklFVyBNSVNTSU9OUw==", "view_missions_div", false);
    if (
      !checkPermissions(user, "QUREIEEgQ0NJUg==", "add_a_ccir_div", false) &&
      !checkPermissions(user, "VklFVyBDQ0lSUw==", "view_ccirs_div", false)
    ) {
      const ccirHeaderDiv = document.getElementById("ccir_header_div");
      ccirHeaderDiv.parentNode.removeChild(ccirHeaderDiv);
    }
    checkPermissions(user, "QUREIEEgQ0NJUg==", "add_a_ccir_div", false);
    checkPermissions(user, "QUREIEEgQ0NJUg==", "add_a_ccir_icon_div", false);
    checkPermissions(user, "VklFVyBDQ0lSUw==", "view_ccirs_div", false);
    if (
      !checkPermissions(
        user,
        "MjQgSE9VUiBSRVBPUlQ=",
        "24_hour_report_div",
        false
      )
    ) {
      const reportsHeaderDiv = document.getElementById("reports_header_div");
      reportsHeaderDiv.parentNode.removeChild(reportsHeaderDiv);
    }
    checkPermissions(user, "MjQgSE9VUiBSRVBPUlQ=", "24_hour_report_div", false);
    checkPermissions(user, "Q09OVEFDVCBMSVNU", "contact_list_div", false);
    checkPermissions(
      user,
      "V0VFS0VORCBUSUNLRVQgUkVQT1JU",
      "weekend_report_div",
      false
    );
    checkPermissions(user, "TU9STklORyBTTElERVM=", "morning_slides_div", false);
    checkPermissions(
      user,
      "UEVSU09OTkVMIFNUQVRT",
      "personnel_stats_div",
      false
    );
    checkPermissions(user, "TUVUUklDUw==", "monthly_metrics_div", false);
    checkPermissions(user, "UEVSTUlTU0lPTlM=", "permissions_div", false);

    // page specific
    // flight schedule
    if (atob(currentPage) == "FLIGHT SCHEDULE") {
      checkPermissions(user, "UFJJTUFSWQ==", "primary", false);
    }
    checked("checked");
  });
};

const permissionsCheck = async (currentPage) => {
  const user = await getUser();
  const status = await runPermissionsCheck(user, currentPage);
};

export default permissionsCheck;
