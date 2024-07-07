export const getURL = (path = "") => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL &&
    process.env.NEXT_PUBLIC_SITE_URL.trim() !== ""
      ? process.env.NEXT_PUBLIC_SITE_URL
      : process?.env?.NEXT_PUBLIC_VERCEL_URL &&
        process.env.NEXT_PUBLIC_VERCEL_URL.trim() !== ""
      ? process.env.NEXT_PUBLIC_VERCEL_URL
      : "http://localhost:3000/";
  url = url.replace(/\/+$/, "");
  url = url.includes("http") ? url : `https://${url}`;
  path = path.replace(/^\/+/, "");
  return path ? `${url}/${path}` : url;
};

export const postData = async ({ url, data }) => {
  const res = await fetch(url, {
    method: "POST",
    headers: new Headers({ "Content-Type": "application/json" }),
    credentials: "same-origin",
    body: JSON.stringify(data),
  });
  return res.json();
};

export const toDateTime = (secs) => {
  var t = new Date(+0);
  t.setSeconds(secs);
  return t;
};

export const calculateTrialEndUnixTimestamp = (trialPeriodDays) => {
  if (
    trialPeriodDays === null ||
    trialPeriodDays === undefined ||
    trialPeriodDays < 2
  ) {
    return undefined;
  }
  const currentDate = new Date();
  const trialEnd = new Date(
    currentDate.getTime() + (trialPeriodDays + 1) * 24 * 60 * 60 * 1000
  );
  return Math.floor(trialEnd.getTime() / 1000);
};

const toastKeyMap = {
  status: ["status", "status_description"],
  error: ["error", "error_description"],
};

const getToastRedirect = (
  path,
  toastType,
  toastName,
  toastDescription = "",
  disableButton = false,
  arbitraryParams = ""
) => {
  const [nameKey, descriptionKey] = toastKeyMap[toastType];
  let redirectPath = `${path}?${nameKey}=${encodeURIComponent(toastName)}`;
  if (toastDescription) {
    redirectPath += `&${descriptionKey}=${encodeURIComponent(
      toastDescription
    )}`;
  }
  if (disableButton) {
    redirectPath += `&disable_button=true`;
  }
  if (arbitraryParams) {
    redirectPath += `&${arbitraryParams}`;
  }
  return redirectPath;
};

export const getStatusRedirect = (
  path,
  statusName,
  statusDescription = "",
  disableButton = false,
  arbitraryParams = ""
) =>
  getToastRedirect(
    path,
    "status",
    statusName,
    statusDescription,
    disableButton,
    arbitraryParams
  );

export const getErrorRedirect = (
  path,
  errorName,
  errorDescription = "",
  disableButton = false,
  arbitraryParams = ""
) =>
  getToastRedirect(
    path,
    "error",
    errorName,
    errorDescription,
    disableButton,
    arbitraryParams
  );
