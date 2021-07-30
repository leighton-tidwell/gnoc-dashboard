import { HOST_URL } from "../modules/constants.js";
import { updateListItem } from "../modules/utility.js";
import permissionsCheck from "../modules/userPermissionsCheck.js";
const ACCESS_LIST_NAME = "accessGroups";
const PERMISSIONS_LIST_NAME = "permissions";
permissionsCheck("TU9STklORyBTTElERVM=");
feather.replace();

const getAccessGroups = async () => {
  const response = await fetch(
    `${HOST_URL}/_api/web/lists/getbytitle('${ACCESS_LIST_NAME}')/items?$top=5000`,
    {
      headers: { Accept: "application/json; odata=verbose" },
      credentials: "include",
    }
  );
  const data = await response.json();
  const items = data.d.results || [];

  return items;
};

const getPersonnelList = async () => {
  const response = await fetch(
    `${HOST_URL}/_api/web/lists/getbytitle('${PERMISSIONS_LIST_NAME}')/items?$orderby=user asc`,
    {
      headers: { Accept: "application/json; odata=verbose" },
      credentials: "include",
    }
  );
  const data = await response.json();
  const items = data.d.results || [];

  return items;
};

const processAccessGroups = async (accessGroupsList) => {
  const accessGroupTable = document.getElementById("access_groups_list");
  for (let group in accessGroupsList) {
    const currentGroup = accessGroupsList[group];
    let newGroup = document.createElement("tr");
    newGroup.innerHTML = `<th scope="row">${currentGroup.group_id}</td><td>${currentGroup.group_name}</td><td>${currentGroup.access_list}</td>`;
    accessGroupTable.appendChild(newGroup);
  }
};

const processUserList = async (userList, selectOptions) => {
  const userListTable = document.getElementById("permissions_list");
  for (let user in userList) {
    const currentUser = userList[user];
    let newUser = document.createElement("tr");
    newUser.innerHTML = `<th scope="row">${currentUser.user}</th><td><select class="form-control" id="permissions-${currentUser.ID}">${selectOptions}</td>`;
    userListTable.appendChild(newUser);
    document.getElementById(`permissions-${currentUser.ID}`).value =
      currentUser.permission;
  }
};

const processSelectOptions = async (accessGroups) => {
  let returnOptions = ``;
  for (let group in accessGroups) {
    const currentGroup = accessGroups[group];
    returnOptions += `<option value="${currentGroup.group_id}">${currentGroup.group_name}</option>`;
  }
  return returnOptions;
};

const processAllData = async () => {
  const [personnelList, accessGroups] = await Promise.all([
    getPersonnelList(),
    getAccessGroups(),
  ]);
  const selectOptions = await processSelectOptions(accessGroups);
  await Promise.all([
    processUserList(personnelList, selectOptions),
    processAccessGroups(accessGroups),
  ]);
  addLinkListeners();
};

processAllData();

/* Event Handlers */

const addLinkListeners = () => {
  document.querySelectorAll("[id^='permissions-']").forEach((item) => {
    item.addEventListener("change", (event) => {
      const updateId = event.target.id.split("-")[1];
      const updateValue = event.target.value;

      const userProperties = { permission: updateValue };
      updateListItem(
        PERMISSIONS_LIST_NAME,
        updateId,
        userProperties,
        () => {},
        (error) => console.error(error)
      );
    });
  });
};
