export const getWeekStructure = (year) => {
  const weeks = [];
  const startDate = new Date(year, 3, 1); // April 1 (month index 3)
  const endDate = new Date(year, 5, 30);  // June 30 (month index 5)

  // Start from the first Monday on or after April 1
  let day = new Date(startDate);
  while (day.getDay() !== 1) { // 1 is Monday
    day.setDate(day.getDate() + 1);
  }

  let weekIndex = 1;
  while (day <= endDate) {
    const weekStart = new Date(day);
    const label = weekStart.toLocaleDateString('default', {
      day: 'numeric',
      month: 'short',
    });
    weeks.push({
      index: weekIndex++,
      start: new Date(weekStart),
      label,
    });
    day.setDate(day.getDate() + 7);
  }

  return { year, weeks };
};
