var isChromium = window.chrome;
var winNav = window.navigator;
var vendorName = winNav.vendor;
var isOpera = typeof window.opr !== "undefined";
var isIEedge = winNav.userAgent.indexOf("Edge") > -1;
var isIOSChrome = winNav.userAgent.match("CriOS");

if (isIOSChrome) {
    // is Google Chrome on IOS
} else if (
    isChromium !== null &&
    typeof isChromium !== "undefined" &&
    vendorName === "Google Inc." &&
    isOpera === false &&
    isIEedge === false
) {
    // is Google Chrome
    console.log("Browser is google chrome.");
} else {
    alert("This browser is unsupported, please use Google Chrome.");
}

var uniqueDVs = [];
var allTicketCount = [];
var nightmode;

/* High Charts Configs */
var options = {
    chart: {
        renderTo: 'containerGraph',
        type: 'bar',
        events: {
            redraw: true
        }
    },
    title: {
        text: 'Tickets per DV'
    },
    xAxis: {
        categories: [],
        crosshair: true,
        labels: {
            style: {
                fontSize: '1.2em',
                color: '#000',
                fill: '#000'
            }
        }
    },
    legend: { enabled: false },
    yAxis: {
        min: 0,
        title: {
            text: '# of Tickets'
        },
        labels: {
            style: {
                fontSize: '1.2em',
                color: '#000',
                fill: '#000'
            }
        },
        allowDecimals: false
    },
    lang: {
        noData: "No Data Found"
    },
    noData: {
        style: {
            fontWeight: 'bold',
            fontSize: '15px',
            color: '#303030'
        }
    },
    series: [],
    dataSorting: {
        enabled: true
    }
};

/*if($.cookie('nightmode') == 'true'){
  options.xAxis.labels.style.color = "#fff";
}*/

var lineOptions = {
    chart: {
        renderTo: 'top5LineChart',
        type: 'line'
    },
    title: {
        text: 'Monthly Ticket Snapshot',
        align: 'center',
    },
    subtitle: {
        text: 'current year',
        align: 'left'
    },
    xAxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    },
    yAxis: {
        title: {
            text: ' Tickets'
        },
        plotLines: [{
            value: 0,
            width: 1,
            color: '#808080'
        }],
        allowDecimals: false
    },
    tooltip: {
        valuePrefix: '',
        valueSuffix: ' Tickets'
    },
    legend: {
        layout: 'horizontal',
        align: 'right',
        verticalAlign: 'top',
        borderWidth: 0,
        marginTop: 5,
        marginBottom: 5
    },
    lang: {
        noData: "No Data Found"
    },
    noData: {
        style: {
            fontWeight: 'bold',
            fontSize: '15px',
            color: '#303030'
        }
    },
    series: []
};

// Get Digest for Auth purposes
var hostUrl = "https://intelshare.intelink.gov/sites/89cs/GNOC/";
function getFormDigest() {
    $.support.cors = true;
    var _formDigest;
    $.ajax({
        url: hostUrl + "/_api/contextinfo",
        type: "POST",
        dataType: "json",

        headers: { "Accept": "application/json; odata=verbose" },
        xhrFields: { withCredentials: true },
        async: false,
        success: function (data) {
            _formDigest = data.d.GetContextWebInformation.FormDigestValue;
        },
        error: function () {
            console.log("Error Occured");
        }
    });

    return _formDigest;
}

var digest = getFormDigest();

// Get List Item Type metadata
function GetItemTypeForListName(name) {
    return "SP.Data." + name.charAt(0).toUpperCase() + name.split(" ").join("").slice(1) + "ListItem";
}

$(function () {
    $.fn.dataTable.moment('MM/DD/YYYY HH:mmZ');
    // Global Functions

    // Check permissions of page:
    if (!checkPermissions("REFTSEJPQVJE", false, false)) {
        $("html").remove();
        window.location.replace("https://intelshare.intelink.gov/sites/89cs/GNOC/");
    }

    // Permissions of content if page true and let page content run
    if (checkPermissions("REFTSEJPQVJE", false, false)) {

        // page specific
        checkPermissions("RFYgREVUQUlMUw==", "dv_details_div", false);
        checkPermissions("T1BFTiBUSUNLRVRT", "open_tickets_div", false);

        // nav
        checkPermissions("REFTSEJPQVJE", "dashboard_div", false);
        checkPermissions("RkxJR0hUIFNDSEVEVUxF", "flight_schedule_div", false);
        if (!checkPermissions("Q1JFQVRFIFRUUw==", "create_tts_div", false) && !checkPermissions("Q1JFQVRFIE1BU1RFUiBUVFM=", "create_master_tts_div", false) && !checkPermissions("VElDS0VUIFNFVFRJTkdT", "ticket_settings_div", false) && !checkPermissions("VklFVyBUSUNLRVRT", "view_tickets_div", false)) {
            $("#tickets_header_div").remove();
        }
        checkPermissions("Q1JFQVRFIFRUUw==", "create_tts_div", false);
        checkPermissions("Q1JFQVRFIE1BU1RFUiBUVFM=", "create_master_tts_div", false);
        checkPermissions("VElDS0VUIFNFVFRJTkdT", "ticket_settings_div", false);
        checkPermissions("VklFVyBUSUNLRVRT", "view_tickets_div", false);
        if (!checkPermissions("Q1JFQVRFIEZMSUdIVCBUSUNLRVQ=", "create_flight_ticket_div", false) && !checkPermissions("VklFVyBGTElHSFQgVElDS0VUUw==", "view_flight_tickets_div", false) && !checkPermissions("VklFVyBNSVNTSU9OUw==", "view_missions_div", false)) {
            $("#flight_tickets_header_div").remove();
        }
        checkPermissions("Q1JFQVRFIEZMSUdIVCBUSUNLRVQ=", "create_flight_ticket_div", false);
        checkPermissions("Q1JFQVRFIEZMSUdIVCBUSUNLRVQ=", "create_flight_ticket_icon_div", false);
        checkPermissions("VklFVyBGTElHSFQgVElDS0VUUw==", "view_flight_tickets_div", false);
        checkPermissions("VklFVyBNSVNTSU9OUw==", "view_missions_div", false);
        if (!checkPermissions("QUREIEEgQ0NJUg==", "add_a_ccir_div", false) && !checkPermissions("VklFVyBDQ0lSUw==", "view_ccirs_div", false)) {
            $("#ccir_header_div").remove();
        }
        checkPermissions("QUREIEEgQ0NJUg==", "add_a_ccir_div", false);
        checkPermissions("QUREIEEgQ0NJUg==", "add_a_ccir_icon_div", false);
        checkPermissions("VklFVyBDQ0lSUw==", "view_ccirs_div", false);
        if (!checkPermissions("MjQgSE9VUiBSRVBPUlQ=", "24_hour_report_div", false)) {
            $("#reports_header_div").remove();
        }
        checkPermissions("MjQgSE9VUiBSRVBPUlQ=", "24_hour_report_div", false);
        checkPermissions("Q09OVEFDVCBMSVNU", "contact_list_div", false);
        checkPermissions("V0VFS0VORCBUSUNLRVQgUkVQT1JU", "weekend_report_div", false);
        checkPermissions("TU9STklORyBTTElERVM=", "morning_slides_div", false);
        checkPermissions("UEVSU09OTkVMIFNUQVRT", "personnel_stats_div", false);
        checkPermissions("TUVUUklDUw==", "monthly_metrics_div", false);
        checkPermissions("UEVSTUlTU0lPTlM=", "permissions_div", false);

        $('#tail_select').on('change', function (e) {
            // User has selected a different aircraft
            uniqueDVs = [];
            allTicketCount = [];
            options.series = [];
            options.xAxis.categories = [];
            var tails = undefined;
            if ($('#tail_select').val() != "") {
                tails = $('#tail_select').val();
            }

            var dvs = undefined;
            if ($('#dv_select').val() != "") {
                dvs = $('#dv_select').val();
            }
            var selected = $(this).val();
            var startDate = $('#start_date').val() + "T00:00:00Z";
            var endDate = $('#end_date').val() + "T23:59:59Z";
            runChart(dvs, startDate, endDate, tails);
        });

        $("#year_select").on('change', function (e) {
            var selected = $(this).val();
            lineOptions.subtitle.text = selected;
            lineOptions.series = [];

            runLineChart(selected);
        });

        // Populate Aircraft Drop Down
        var urlLoad = "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('TailNumbers')/items?$top=5000&$orderby=Tail_x0020_Numbers%20asc";
        $.ajax({
            url: urlLoad,
            async: false,
            method: "GET",
            headers: {
                "Accept": "application/json;odata=verbose"
            },
            success: function (data) {
                var total = 0;
                var allResults = data.d.results;
                if (Number(allResults.length) > 0) {
                    var select = document.getElementById('tail_select');
                    for (var i = 0; i < Number(allResults.length); i++) {
                        // looping through all results
                        var opt = document.createElement('option');
                        opt.innerHTML = allResults[i].Tail_x0020_Numbers;
                        select.appendChild(opt);
                    }
                    $('.selectpicker').selectpicker('refresh');
                }
            },
            error: function (data) {
                //alert("Error: " + JSON.stringify(data));
            }
        });

        $('#dv_select').on('change', function () {
            // User has selected a different DV
            uniqueDVs = [];
            allTicketCount = [];
            options.series = [];
            options.xAxis.categories = [];
            var tails = undefined;
            if ($('#tail_select').val() != "") {
                tails = $('#tail_select').val();
            }

            var dvs = undefined;
            if ($('#dv_select').val() != "") {
                dvs = $('#dv_select').val();
            }
            var startDate = $('#start_date').val() + "T00:00:00Z";
            var endDate = $('#end_date').val() + "T23:59:59Z";
            runChart(dvs, startDate, endDate, tails);
        });

        $('#start_date').change(function () {
            var tails = undefined;
            if ($('#tail_select').val() != "") {
                tails = $('#tail_select').val();
            }

            var dvs = undefined;
            if ($('#dv_select').val() != "") {
                dvs = $('#dv_select').val();
            }
            uniqueDVs = [];
            allTicketCount = [];
            options.series = [];
            options.xAxis.categories = [];
            var startDate = $('#start_date').val() + "T00:00:00Z";
            var endDate = $('#end_date').val() + "T23:59:59Z";
            runChart(dvs, startDate, endDate, tails);
        });

        $('#end_date').change(function () {
            var tails = undefined;
            if ($('#tail_select').val() != "") {
                tails = $('#tail_select').val();
            }

            var dvs = undefined;
            if ($('#dv_select').val() != "") {
                dvs = $('#dv_select').val();
            }
            uniqueDVs = [];
            allTicketCount = [];
            options.series = [];
            options.xAxis.categories = [];
            var startDate = $('#start_date').val() + "T00:00:00Z";
            var endDate = $('#end_date').val() + "T23:59:59Z";
            runChart(dvs, startDate, endDate, tails);
        });

        /*$('#nightMode').click(function () {
          if (!$.cookie('nightmode')) {
            nightmode = true;
            $.cookie('nightmode', 'true');
            console.log("cookie made");
          }
          var $this = $(this);
          if ($(this).html() == '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-sun" style="width:23px;height:23px;"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>') {
            console.log("currently night mode");
            $.cookie('nightmode', 'false');
            nightmode = false;
            checkNightMode();
          }
          else {
            console.log("currently day mode");
            $.cookie('nightmode', 'true');
            nightmode = true;
            checkNightMode();
          }
        });*/

        var now = new Date();
        var day = ("0" + now.getDate()).slice(-2);
        var month = ("0" + (now.getMonth() + 1)).slice(-2);

        var start_date = now.getFullYear() + "-" + (month) + "-01";
        var end_date = now.getFullYear() + "-" + (month) + "-" + (day);

        $('#start_date').val(start_date);
        $('#end_date').val(end_date);

        // Populate year drop down:
        var currYear = now.getFullYear();
        lineOptions.subtitle.text = currYear;
        var select = document.getElementById('year_select');
        for (var i = currYear; i > 2018; i--) {
            var opt = document.createElement('option');
            opt.innerHTML = i;
            select.appendChild(opt);
        }
        $("#year_select").val(currYear);
        $('.selectpicker').selectpicker('refresh');

        // Populate DV Drop down
        var urlLoad = "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('DVList')/items?$top=5000&$orderby=DV%20asc";
        $.ajax({
            url: urlLoad,
            async: false,
            method: "GET",
            headers: {
                "Accept": "application/json;odata=verbose"
            },
            success: function (data) {
                var total = 0;
                var allResults = data.d.results;
                if (Number(allResults.length) > 0) {
                    var select = document.getElementById('dv_select');
                    for (var i = 0; i < Number(allResults.length); i++) {
                        // looping through all results
                        var opt = document.createElement('option');
                        opt.innerHTML = allResults[i].DV;
                        select.appendChild(opt);
                    }
                    $('.selectpicker').selectpicker('refresh');
                }
            },
            error: function (data) {
                //alert("Error: " + JSON.stringify(data));
            }
        });
        /*var select = document.getElementById('dv_select');
        select.innerHTML = "<optgroup label=\"Top 5\"><option>VPOTUS</option><option>SECDEF</option><option>SECSTATE</option><option>CJCS</option></optgroup>";
        for (var i = 0; i < dvOptions.length; i++) {
          var opt = document.createElement('option');
          opt.innerHTML = dvOptions[i];
          select.appendChild(opt);
        }
        $('.selectpicker').selectpicker('refresh');*/


        // On page load, settings are blank.
        feather.replace();
        start_date = now.getFullYear() + "-" + (month) + "-01" + "T00:00:00Z";
        end_date = now.getFullYear() + "-" + (month) + "-" + (day) + "T23:59:59Z";
        //checkNightMode();
        runChart(undefined, start_date, end_date, undefined);
        runLineChart();
    }
});


function checkNightMode() {
    if ($.cookie('nightmode') == 'true') {
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


var total_overall_tickets = 0;
function runChart(listOfDvs, startDate, endDate, listOfTails) {

    // Clear the tickets table is we've already made one, else lets make one.
    if (!$.fn.DataTable.isDataTable('#overviewTickets')) {
        $('#overviewTickets').DataTable({
            dom: 'Bfrtip',
            buttons: [
                'copy', 'csv', 'excel', 'pdf', 'print'
            ],
            "columnDefs": [
                { "width": "150px", targets: [0, 1, 10] },
                { "width": "300px", targets: [8] }
            ],
            "order": [[0, "desc"]]
        });
    }
    else {
        $('#overviewTickets').DataTable().clear().draw();
    }

    var dvs = [];
    var ticketsPerDv = [];
    var dvCheck = false;
    if (listOfDvs === undefined) {
        var noDVS = 1;
        dvs = getAllDvs(startDate, endDate);
    } else {
        dvs = listOfDvs;
        dvCheck = true;
    }
    total_overall_tickets = 0;
    ticketsPerDv = getTicketsPerDV(dvs, startDate, endDate, listOfTails, dvCheck);
    if (noDVS)
        getStatTotals(undefined, startDate, endDate);
    else
        getStatTotals(dvs, startDate, endDate);

    var counter = 0;
    for (var i = 0; i < ticketsPerDv.length; i++) {
        if (ticketsPerDv[i] == 0) {
            counter++;
        }
    }

    if (counter == ticketsPerDv.length) {
        $("#containerGraph").text("No Data Found");
    }
    else {
        var chart = new Highcharts.Chart(options);
    }
    //alert(options.series[1].data);

}

// Function below get ALL dvs/tickets
function getAllDvs(startDate, endDate) {
    var urlLoad = "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('Tickets')/items?$select=DV,Created&$filter=Created le '" + endDate + "' and Created ge '" + startDate + "'&top=5000&$orderby=DV%20asc";
    total_overall_tickets = 0;
    var allResults = getDvItems(urlLoad);
    return uniqueDVs;
}

function getDvItems(urlLoad) {
    var allResults = allResults || [];
    $.ajax({
        url: urlLoad,
        async: false,
        method: "GET",
        headers: {
            "Accept": "application/json;odata=verbose"
        },
        success: function (data) {
            allResults = data.d.results;
            for (var i = 0; i < Number(allResults.length); i++) {
                if (allResults[i].DV !== null && jQuery.inArray(allResults[i].DV, uniqueDVs) == -1) {
                    uniqueDVs.push(allResults[i].DV);
                }
            }
            if (data.d.__next) {
                urlLoad = data.d.__next;
                getDvItems(urlLoad);
            }
        },
        error: function (data) {
            //alert("Error: " + JSON.stringify(data));
        }
    });
    return allResults;
}

function getTicketsPerDV(dvArray, startDate, endDate, tails, dvCheck) {
    var searchText;
    for (var i = 0; i < dvArray.length; i++) {
        searchText = dvArray[i];
        var _count = fetchTicketCount(searchText, startDate, endDate, tails, dvCheck);
        total_overall_tickets += _count;
        allTicketCount.push(_count);
    }
    $("#total_tickets").text(total_overall_tickets);
    options.series.push({
        name: 'Tickets',
        data: allTicketCount
    });
    return allTicketCount;
}

function fetchTicketCount(searchItem, startDate, endDate, tails, dvCheck) {

    var date_specified = 0;
    var tails_specified = 0;

    if (startDate === undefined && endDate === undefined && tails === undefined) {
        // no date no tail
        var urlLoad = "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('Tickets')/items?$select=DV,Created,GNOC_Ticket_Number,Date_Opened,Tail_Number,Mission_Number,DV_Impact,Impact_Level,Category,Status,Issue_Description,Last_Reported_Action,Update_Date,CCIR,CCIR_Number,CSO&$top=5000&$filter=DV eq '" + encodeURI(searchItem) + "' and Created le '" + endDate + "' and Created ge '" + startDate + "'&$orderby=DV%20asc";
    }
    if (startDate !== undefined && endDate !== undefined && tails == undefined) {
        // date no tail
        date_specified = 1;
        var urlLoad = "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('Tickets')/items?$select=DV,Created,GNOC_Ticket_Number,Date_Opened,Tail_Number,Mission_Number,DV_Impact,Impact_Level,Category,Status,Issue_Description,Last_Reported_Action,Update_Date,CCIR,CCIR_Number,CSO&$top=5000&$filter=DV eq '" + encodeURIComponent(searchItem) + "'and Created le '" + endDate + "' and Created ge '" + startDate + "'&$orderby=DV%20asc";
    }
    if (startDate !== undefined && endDate !== undefined && tails !== undefined) {
        // date and tail
        date_specified = 1;
        tails_specified = 1;
        var urlLoad = "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('Tickets')/items?$select=DV,Created,GNOC_Ticket_Number,Date_Opened,Tail_Number,Mission_Number,DV_Impact,Impact_Level,Category,Status,Issue_Description,Last_Reported_Action,Update_Date,CCIR,CCIR_Number,CSO&$top=5000&$filter=DV eq '" + encodeURIComponent(searchItem) + "'and Created le '" + endDate + "' and Created ge '" + startDate + "'&$orderby=DV%20asc";

    }
    var myTicketCount = 0;
    $.ajax({
        url: urlLoad,
        async: false,
        method: "GET",
        headers: {
            "Accept": "application/json;odata=verbose"
        },
        success: function (myData) {
            if (myData.d.results.length > 0) {
                if (date_specified == 0 && tails_specified == 0) {
                    // just get all from current DVs
                    /*options.series.push({
                        name: searchItem,
                        data: [total]
                      });*/
                    options.xAxis.categories.push(searchItem);
                    myTicketCount = myData.d.results.length;
                }
                else if (date_specified == 1 && tails_specified == 0) {
                    // date specified without tail or DV
                    var total = 0;
                    var arrayOfTimes = [];
                    var allResults = myData.d.results;
                    for (var i = 0; i < Number(allResults.length); i++) {
                        var currentCreateDate = allResults[i].Created;
                        if (arrayOfTimes.includes(currentCreateDate)) {
                            // dont wanna push any duplicates
                        }
                        else {
                            if (currentCreateDate <= endDate && currentCreateDate >= startDate) {
                                arrayOfTimes.push(currentTime);
                                var dateOpened = convertTheDate(allResults[i].Date_Opened, 1);
                                var dateUpdated = convertTheDate(allResults[i].Update_Date, 1);
                                if (checkPermissions("VklFVyBNSVNTSU9O", false, false)) {
                                    var missionhref = "<a href=\"./viewMission.html?mission=" + allResults[i].Mission_Number + "\">" + allResults[i].Mission_Number + "</a>";
                                }
                                else {
                                    var missionhref = allResults[i].Mission_Number;
                                }
                                if (allResults[i].Mission_Number == "N/A" || allResults[i].Mission_Number == null) {
                                    missionhref = "N/A";
                                }
                                var href = "<a href=\"./viewTicket.html?ticket=" + allResults[i].GNOC_Ticket_Number + "\">" + allResults[i].GNOC_Ticket_Number + "</a>";

                                $('#overviewTickets').DataTable().row.add([href, dateOpened, allResults[i].Tail_Number, missionhref, allResults[i].DV, allResults[i].Impact_Level, allResults[i].Category, allResults[i].Status, allResults[i].Issue_Description, allResults[i].Last_Reported_Action, dateUpdated]).draw();
                                total++;
                            }
                        }
                    }
                    if (total != 0) {
                        /*options.series.push({
                          name: searchItem,
                          data: [total]
                        });*/
                        options.xAxis.categories.push(searchItem);
                    }

                    myTicketCount = total;
                }
                else if (date_specified == 1 && tails_specified == 1) {
                    // Tail is specified 
                    var total = 0;
                    var arrayOfTimes = [];
                    var allResults = myData.d.results;
                    for (var i = 0; i < Number(allResults.length); i++) {
                        var currentTail = allResults[i].Tail_Number;
                        var currentTime = allResults[i].Created;

                        if (tails.includes(currentTail) && currentTime <= endDate && currentTime >= startDate) {
                            if (arrayOfTimes.includes(currentTime)) {
                            }
                            else {
                                arrayOfTimes.push(currentTime);
                                var dateOpened = convertTheDate(allResults[i].Date_Opened, 1);
                                var dateUpdated = convertTheDate(allResults[i].Update_Date, 1);
                                var href = "<a href=\"./viewTicket.html?ticket=" + allResults[i].GNOC_Ticket_Number + "\">" + allResults[i].GNOC_Ticket_Number + "</a>";
                                var missionhref = "<a href=\"./viewMission.html?mission=" + allResults[i].Mission_Number + "\">" + allResults[i].Mission_Number + "</a>";
                                $('#overviewTickets').DataTable().row.add([href, dateOpened, allResults[i].Tail_Number, missionhref, allResults[i].DV, allResults[i].Impact_Level, allResults[i].Category, allResults[i].Status, allResults[i].Issue_Description, allResults[i].Last_Reported_Action, dateUpdated, allResults[i].CCIR_Number, allResults[i].CSO]).draw();
                                total++;
                            }
                        }
                    }
                    if (total != 0) {
                        /*options.series.push({
                          name: searchItem,
                          data: [total]
                        });*/
                        options.xAxis.categories.push(searchItem);
                    }
                    myTicketCount = total;
                }
            }
            else if (dvCheck == true) {
                options.xAxis.categories.push(searchItem);
            }
        },
        error: function (data) {
            //alert("Error: " + JSON.stringify(data));
        }
    });

    return myTicketCount;
}

function getStatTotals(dv, start, end, tails) {
    var totalCCIR = 0;
    var totalMission = 0;
    var totalLeg = 0;
    if (dv !== undefined) {
        for (var i = 0; i < dv.length; i++) {
            totalCCIR += getCCIRTotal(dv[i], start, end);
            totalMission += getMissionTotal(dv[i], start, end);
            totalLeg += getLegTotal(dv[i], start, end);
        }
    }
    else {
        totalCCIR += getCCIRTotal(undefined, start, end);
        totalMission += getMissionTotal(undefined, start, end);
        totalLeg += getLegTotal(undefined, start, end);
    }

    $("#total_ccirs").text(totalCCIR);
    $("#total_missions").text(totalMission);
    $("#total_legs").text(totalLeg);
}

function getCCIRTotal(dv, start, end) {
    var total = 0;
    if (dv !== undefined)
        var urlLoad = "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('CCIR')/items?$top=5000&$filter=DV eq '" + encodeURI(dv) + "' and Created le '" + end + "' and Created ge '" + start + "'";
    else
        var urlLoad = "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('CCIR')/items?$top=5000&$filter=Created le '" + end + "' and Created ge '" + start + "'";
    $.ajax({
        url: urlLoad,
        async: false,
        method: "GET",
        headers: {
            "Accept": "application/json;odata=verbose"
        },
        success: function (data) {
            if (data.d.results.length > 0) {
                total = Number(data.d.results.length);
            }
        }
    });

    return total;
}

function getMissionTotal(dv, start, end) {
    var missions = [];
    var total = 0;
    if (dv !== undefined)
        var urlLoad = "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('Missions')/items?$top=5000&$filter=DV eq '" + encodeURI(dv) + "' and Created le '" + end + "' and Created ge '" + start + "'";
    else
        var urlLoad = "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('Missions')/items?$top=5000&$filter=Created le '" + end + "' and Created ge '" + start + "'";

    $.ajax({
        url: urlLoad,
        async: false,
        method: "GET",
        headers: {
            "Accept": "application/json;odata=verbose"
        },
        success: function (data) {
            var allResults = data.d.results;
            if (data.d.results.length > 0) {
                for (var i = 0; i < Number(allResults.length); i++) {
                    if (!missions.includes(allResults[i].Mission_Number))
                        missions.push(allResults[i].Mission_Number);
                }
            }
        }
    });
    total = missions.length;
    return total;
}

function getLegTotal(dv, start, end) {
    var total = 0;
    if (dv !== undefined)
        var urlLoad = "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('Missions')/items?$top=5000&$filter=DV eq '" + encodeURI(dv) + "' and Created le '" + end + "' and Created ge '" + start + "'";
    else
        var urlLoad = "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('Missions')/items?$top=5000&$filter=Created le '" + end + "' and Created ge '" + start + "'";

    $.ajax({
        url: urlLoad,
        async: false,
        method: "GET",
        headers: {
            "Accept": "application/json;odata=verbose"
        },
        success: function (data) {
            if (data.d.results.length > 0) {
                total = Number(data.d.results.length);
            }
        }
    });

    return total;
}

function convertTheDate(dateVar, offset) {
    // date conversion
    var convertDate = new Date(dateVar);
    var month = convertDate.getUTCMonth();
    month = ("0" + (convertDate.getMonth() + 1)).slice(-2)

    var date = convertDate.getDate();
    if (convertDate.getDate() < 10)
        date = "0" + convertDate.getDate();

    var minutes = convertDate.getUTCMinutes();
    if (convertDate.getUTCMinutes() < 10)
        minutes = "0" + convertDate.getUTCMinutes();

    var t = new Date();
    if (offset == 1) {
        var currentoffset = convertDate.getTimezoneOffset() * 60000;
        convertDate.setTime(convertDate.getTime() + currentoffset);
    }
    var hours = convertDate.getHours();

    if (convertDate.getHours() < 10)
        hours = "0" + hours;

    var dateString = month + "/" + date + "/" + convertDate.getUTCFullYear() + " " + hours + ":" + minutes + "Z";
    return dateString;
}

function removeDuplicates(list) {
    var result = [];
    $.each(list, function (i, e) {
        if ($.inArray(e, result) == -1) result.push(e);
    });
    return result.sort();
}

function runLineChart(year) {
    var dvList = ["POTUS", "VPOTUS", "SECDEF", "SECSTATE", "CJCS"]; // Top 5
    var startDate;
    var endDate;
    if (year === undefined) {
        var now = new Date();
        year = now.getFullYear();
        startDate = year + "-01-01T23:59:59Z";
        endDate = year + "-12-31T23:59:59Z";
    }
    else {
        startDate = year + "-01-01T23:59:59Z";
        endDate = year + "-12-31T23:59:59Z";
    }

    // Now, per DV, per month we need ticket counts my guy:

    for (var i = 0; i < dvList.length; i++) {
        var searchItem = dvList[i];
        var urlLoad = "https://intelshare.intelink.gov/sites/89cs/GNOC/_api/web/lists/getbytitle('Tickets')/items?$select=DV,Created&$top=5000&$filter=DV eq '" + encodeURI(searchItem) + "'";
        $.ajax({
            url: urlLoad,
            async: false,
            method: "GET",
            headers: {
                "Accept": "application/json;odata=verbose"
            },
            success: function (data) {
                var total = 0;
                var arrayOfTimes = [];
                var allResults = data.d.results;
                if (Number(allResults.length) > 0) {
                    //alert("success");

                    for (var n = 0; n < Number(allResults.length); n++) {
                        // so we put all the times of this DV's tickets in an array for post processing
                        var currentTime = allResults[n].Created;

                        if (arrayOfTimes.includes(currentTime)) {
                            // this is to make sure no duplicates are included.
                        }
                        else {

                            arrayOfTimes.push(currentTime);
                        }
                    }

                    var yearlyTicketNumbers = [];
                    // Now we need to loop, per month.
                    for (var j = 1; j < 13; j++) {
                        total = 0;
                        if (j < 10) {
                            var currentMonth = "0" + j;
                        }
                        else {
                            var currentMonth = j;
                        }

                        var startDate = year + "-" + currentMonth + "-01T23:59:59Z";
                        var endDate = year + "-" + currentMonth + "-31T23:59:59Z";

                        for (var k = 0; k < arrayOfTimes.length; k++) {
                            if (arrayOfTimes[k] <= endDate && arrayOfTimes[k] >= startDate) {
                                total++;
                            }
                        }
                        yearlyTicketNumbers.push(total);
                    }
                    lineOptions.series.push({
                        name: searchItem,
                        data: yearlyTicketNumbers
                    });
                }
            },
            error: function (data) {
                //alert("Error: " + JSON.stringify(data));
            }
        });
    }
    var lineChart = new Highcharts.Chart(lineOptions);
}