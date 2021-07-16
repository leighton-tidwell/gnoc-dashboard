import { HOST_URL } from "./constants.js";
import { FORM_DIGEST } from "./formDigest.js";
import getItemTypeForListName from "./getItemType.js";

export const daysIntoYear = (date) => {
  return (
    (Date.UTC(date.getFullYear(), date.getUTCMonth(), date.getUTCDate()) -
      Date.UTC(date.getFullYear(), 0, 0)) /
    24 /
    60 /
    60 /
    1000
  );
};

export const removeFromList = (listName, id, success, failure) => {
  fetch(`${HOST_URL}/_api/web/lists/getbytitle('${listName}')/items('${id}')`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json;odata=verbose",
      "X-RequestDigest": FORM_DIGEST,
      "IF-MATCH": "*",
      "X-HTTP-Method": "DELETE",
    },
    credentials: "include",
  })
    .then((data) => success(data))
    .catch((error) => failure(error));
};

export const insertIntoList = (
  listName,
  itemProperties,
  success,
  failure,
  oddIdentifier
) => {
  const itemType = getItemTypeForListName(listName);
  if (!oddIdentifier) itemProperties["__metadata"] = { type: itemType };
  else
    itemProperties["__metadata"] = {
      type: `SP.Data.${listName.split("_").join("_x005f_")}ListItem`,
    };

  fetch(`${HOST_URL}/_api/web/lists/getbytitle('${listName}')/items`, {
    method: "POST",
    headers: {
      Accept: "application/json;odata=verbose",
      "Content-Type": "application/json;odata=verbose",
      "odata-version": "",
      "X-RequestDigest": FORM_DIGEST,
    },
    body: JSON.stringify(itemProperties),
    credentials: "include",
  })
    .then((data) => data.json())
    .then((result) => success(result))
    .catch((error) => failure(error));
};

export const updateListItem = (
  listName,
  itemId,
  itemProperties,
  success,
  failure
) => {
  const itemType = getItemTypeForListName(listName);
  itemProperties["__metadata"] = { type: itemType };

  fetch(
    `${HOST_URL}/_api/web/lists/getbytitle('${listName}')/items('${itemId}')`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json;odata=verbose",
        "X-RequestDigest": FORM_DIGEST,
        "IF-MATCH": "*",
        "X-HTTP-Method": "MERGE",
      },
      body: JSON.stringify(itemProperties),
      credentials: "include",
    }
  )
    .then((data) => success(data))
    .catch((error) => failure(error));
};

export const convertDateToISOString = (date) => {
  const dateToBeConverted = new Date(date);
  const month = ("0" + (dateToBeConverted.getMonth() + 1)).slice(-2);

  let dayOfMonth = dateToBeConverted.getDate();
  if (dateToBeConverted.getDate() < 10)
    dayOfMonth = `0${dateToBeConverted.getDate()}`;

  let minutes = dateToBeConverted.getUTCMinutes();
  if (dateToBeConverted.getUTCMinutes() < 10)
    minutes = `0${dateToBeConverted.getUTCMinutes()}`;

  let hours = dateToBeConverted.getHours();
  if (dateToBeConverted.getHours() < 10) hours = `0${hours}`;

  return `${month}/${dayOfMonth}/${dateToBeConverted.getUTCFullYear()} ${hours}:${minutes}Z`;
};

export const parseISOString = (s) => {
  const b = s.split(/\D+/);
  return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6]));
};

Date.prototype.addHours = function (h) {
  this.setTime(this.getTime() + h * 60 * 60 * 1000);
  return this;
};

export const convertDateToHTMLString = (date) => {
  const convertDate = parseISOString(date);
  const estTimeOffset = getESTOffset();
  //var convertDate = new Date(date);

  let month = convertDate.getUTCMonth();
  month = ("0" + (convertDate.getMonth() + 1)).slice(-2);

  let dayOfMonth = convertDate.getDate();
  if (convertDate.getDate() < 10) dayOfMonth = "0" + convertDate.getDate();

  let minutes = convertDate.getUTCMinutes();
  if (convertDate.getUTCMinutes() < 10)
    minutes = "0" + convertDate.getUTCMinutes();

  let hours = convertDate.addHours(estTimeOffset);
  hours = convertDate.getHours();

  if (convertDate.getHours() < 10) hours = "0" + hours;

  return (
    '<span class="hourCount">' +
    hours +
    '</span>:<span class="minCount">' +
    minutes +
    "</span>"
  );
};

export const convertDateToTicketHTMLString = (date) => {
  const convertDate = new Date(date);
  const estTimeOffset = getESTOffset();

  let month = convertDate.getUTCMonth();
  month = ("0" + (convertDate.getMonth() + 1)).slice(-2);

  let dayOfMonth = convertDate.getDate();
  if (convertDate.getDate() < 10) dayOfMonth = "0" + convertDate.getDate();

  let minutes = convertDate.getUTCMinutes();
  if (convertDate.getUTCMinutes() < 10)
    minutes = "0" + convertDate.getUTCMinutes();

  let hours = convertDate.addHours(estTimeOffset);
  hours = convertDate.getHours();

  if (convertDate.getHours() < 10) hours = "0" + hours;

  return `${month}/${dayOfMonth}/${convertDate.getFullYear()} ${hours}:${minutes}Z`;
};

export const getESTOffset = () => {
  const estTimeString = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
  });
  const estTime = new Date(estTimeString);

  const localTime = new Date();
  return estTime.getHours() - localTime.getHours();
};
