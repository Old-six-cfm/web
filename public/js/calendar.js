import { getMediaByDate, seedDefaultsIfEmpty } from "./media-service.js";

const monthLabel = document.getElementById("monthLabel");
const calendarGrid = document.getElementById("calendarGrid");
const prevBtn = document.getElementById("prevMonth");
const nextBtn = document.getElementById("nextMonth");

const viewDate = new Date(2026, 0, 1);

function formatDate(year, month, day) {
  const mm = String(month + 1).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  return `${year}-${mm}-${dd}`;
}

async function renderCalendar() {
  await seedDefaultsIfEmpty();

  calendarGrid.innerHTML = "";
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  monthLabel.textContent = `${year} 年 ${month + 1} 月`;

  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < startOffset; i += 1) {
    const blank = document.createElement("div");
    blank.className = "day-cell blank";
    calendarGrid.appendChild(blank);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const cell = document.createElement("a");
    const dateKey = formatDate(year, month, day);
    const items = await getMediaByDate(dateKey);

    cell.className = "day-cell";
    cell.href = `./date.html?date=${dateKey}`;
    cell.innerHTML = `<span>${day}</span><small>${items.length} 条</small>`;
    calendarGrid.appendChild(cell);
  }
}

prevBtn.addEventListener("click", () => {
  viewDate.setMonth(viewDate.getMonth() - 1);
  renderCalendar();
});

nextBtn.addEventListener("click", () => {
  viewDate.setMonth(viewDate.getMonth() + 1);
  renderCalendar();
});

renderCalendar();
