import { HOST_URL } from "../modules/constants.js";
import { insertIntoList, removeFromList } from "../modules/utility.js";
import permissionsCheck from "../modules/userPermissionsCheck.js";
const CONTACT_LIST_NAME = "contactList";
permissionsCheck("Q09OVEFDVCBMSVNU");

// Load all contacts
fetch(
  `${HOST_URL}/_api/web/lists/getbytitle('${CONTACT_LIST_NAME}')/items?$top=500&$orderby=Created desc`,
  {
    headers: { Accept: "application/json; odata=verbose" },
    credentials: "include",
  }
)
  .then((response) => response.json())
  .then((data) => {
    // Create Contact Table
    $("#listContacts").DataTable({
      dom: "Bfrtip",
      buttons: ["copy", "csv", "excel", "pdf", "print"],
      columnDefs: [
        { width: "4px", targets: [5] },
        { width: "300px", targets: [4] },
        { orderable: false, targets: [5] },
      ],
      order: [[0, "asc"]],
      paging: false,
    });

    const loader = document.getElementById("contacts_loader");
    loader.style.display = "none";

    const items = data.d.results;
    items.forEach((item) => {
      // looping through all results
      const deleteHref = `<a href="javascript: void(0)" id="delete-${item.Id}"><span id="delete-${item.Id}" data-feather="x-circle"></span></a>`;
      $("#listContacts")
        .DataTable()
        .row.add([
          item.Title,
          item.commercial_phone,
          item.dsn,
          item.cell,
          item.other,
          deleteHref,
        ])
        .draw();
    });

    addLinkListeners();
    feather.replace();
  })
  .catch((error) => {
    console.error("Error:", error);
  });

/* event handlers */
document.querySelector("#add_contact").addEventListener("click", (event) => {
  const enteredName = document.getElementById("name").value;
  const enteredCommPhone = document.getElementById("comm_phone").value;
  const enteredDsn = document.getElementById("dsn").value;
  const enteredCell = document.getElementById("cell_phone").value;
  const enteredOther = document.getElementById("other").value;

  const contactProperties = {
    Title: enteredName,
    commercial_phone: enteredCommPhone,
    dsn: enteredDsn,
    cell: enteredCell,
    other: enteredOther,
  };

  insertIntoList(
    CONTACT_LIST_NAME,
    contactProperties,
    (data) => {
      const newContactId = data.d.ID;
      const deleteHref = `<a href="javascript: void(0)" id="delete-${newContactId}"><span id="delete-${newContactId}" data-feather="x-circle"></span></a>`;
      $("#listContacts")
        .DataTable()
        .row.add([
          enteredName,
          enteredCommPhone,
          enteredDsn,
          enteredCell,
          enteredOther,
          deleteHref,
        ])
        .draw();
      feather.replace();
      document.getElementById("name").value = "";
      document.getElementById("comm_phone").value = "";
      document.getElementById("dsn").value = "";
      document.getElementById("cell_phone").value = "";
      document.getElementById("other").value = "";
      document
        .querySelector(`#delete-${newContactId}`)
        .addEventListener("click", (event) => {
          const deleteId = event.target.id.split("-")[1];
          const currentButton = event.currentTarget;

          removeFromList(
            CONTACT_LIST_NAME,
            deleteId,
            () => {
              currentButton.parentNode.parentNode.remove();
            },
            (error) => {
              console.error("Error:", error);
            }
          );
        });
      alert("Contact added successfully.");
      feather.replace();
    },
    (error) => {
      alert("An error has occured. Please try again.");
      console.error(error);
    }
  );
});

const addLinkListeners = () => {
  document.querySelectorAll("[id^='delete-']").forEach((item) => {
    item.addEventListener("click", (event) => {
      const deleteId = event.target.id.split("-")[1];
      const currentButton = event.currentTarget;

      removeFromList(
        CONTACT_LIST_NAME,
        deleteId,
        () => {
          currentButton.parentNode.parentNode.remove();
        },
        (error) => {
          console.error("Error:", error);
        }
      );
    });
  });
};
