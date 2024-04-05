// utils/dateUtils.js
export const getDateRange = (selectedTimeRange) => {
  let startDate = null;
  let endDate = null;

  switch (selectedTimeRange) {
    case "today":
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      break;
    case "thisWeek":
      startDate = new Date();
      startDate.setDate(startDate.getDate() - startDate.getDay());
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      break;
    case "thisMonth":
      startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      break;
    case "thisYear":
      startDate = new Date(new Date().getFullYear(), 0, 1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
      break;
    default:
      // "allTime"
      startDate = null;
      endDate = null;
  }

  return { startDate, endDate };
};
