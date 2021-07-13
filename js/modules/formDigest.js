import { HOST_URL } from "./constants.js";

const getFormDigest = () => {
  $.support.cors = true;
  let _formDigest;
  $.ajax({
    url: `${HOST_URL}/_api/contextinfo`,
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


export const FORM_DIGEST = getFormDigest();