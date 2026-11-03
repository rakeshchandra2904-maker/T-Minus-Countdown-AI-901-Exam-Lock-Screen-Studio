// State Management
const state = {
  goalName: "AI-901 Exam",
  targetDate: "2026-11-23",
  reminderTime: "09:00",
  deviceRatio: "phone", // 'phone' (9:16) or 'laptop' (16:9)
  theme: "cyber",       // 'cyber', 'pastel', 'sunset', 'monochrome'
  showSimClock: true,
  cleanTop: true,
  includeSubtitle: true,
  milestones: [
    { prefix: "T-14", daysBefore: 14, text: "Start study guide", checked: false },
    { prefix: "T-7",  daysBefore: 7,  text: "Foundry hands-on practice", checked: false },
    { prefix: "T-3",  daysBefore: 3,  text: "Take practice test",  checked: false },
    { prefix: "T-1",  daysBefore: 1,  text: "Revise and check ID", checked: false },
    { prefix: "T-0",  daysBefore: 0,  text: "AI-901 exam day",   checked: false }
  ]
};
window.state = state;

// DOM Elements
const navTabs = document.querySelectorAll('.nav-tab');
const tabPanes = document.querySelectorAll('.tab-pane');
const goalNameInput = document.getElementById('goal-name');
const targetDateInput = document.getElementById('target-date');
const reminderTimeInput = document.getElementById('reminder-time');
const daysRemainingBadge = document.getElementById('days-remaining-badge');
const planTitleDisplay = document.getElementById('plan-title-display');
const milestonesContainer = document.getElementById('milestones-container');
const btnGenerateMilestones = document.getElementById('btn-generate-milestones');
const btnSaveToDesigner = document.getElementById('btn-save-to-designer');
const btnCopyPrompt1 = document.getElementById('btn-copy-gemini-prompt-1');
const btnCopyPrompt2 = document.getElementById('btn-copy-gemini-prompt-2');
const btnCopyWriteup = document.getElementById('btn-copy-writeup');
const btnDownloadWallpaper = document.getElementById('btn-download-wallpaper');
const btnDownloadIcs = document.getElementById('btn-download-ics');

// Designer Elements
const deviceBtns = document.querySelectorAll('.device-btn');
const themeCards = document.querySelectorAll('.theme-card');
const chkShowSimClock = document.getElementById('chk-show-sim-clock');
const chkCleanTop = document.getElementById('chk-clean-top');
const chkIncludeWatermark = document.getElementById('chk-include-watermark');
const deviceMockupFrame = document.getElementById('device-mockup-frame');
const previewCardTitle = document.getElementById('preview-card-title');
const previewCardSubtitle = document.getElementById('preview-card-subtitle');
const previewMilestonesList = document.getElementById('preview-milestones-list');
const simClockContainer = document.getElementById('sim-clock-container');
const exportCanvas = document.getElementById('export-canvas');
const toastEl = document.getElementById('toast');
const subWriteupEl = document.getElementById('sub-writeup');

// Utility: Show Toast
function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  setTimeout(() => toastEl.classList.remove('show'), 3200);
}

// Utility: Copy to Clipboard
function copyText(text, successMsg = "Copied to clipboard!") {
  navigator.clipboard.writeText(text).then(() => {
    showToast(successMsg);
  }).catch(() => {
    showToast("Failed to copy. Please manually copy.");
  });
}

// Compute Milestone Date object
function getMilestoneDateObj(targetDateStr, daysBefore) {
  const target = new Date(targetDateStr + "T00:00:00");
  const d = new Date(target);
  d.setDate(target.getDate() - daysBefore);
  return d;
}

// Format Date string: "Nov 9"
function formatMilestoneDate(d) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Check if a milestone date is in the past
function isMilestonePast(targetDateStr, daysBefore) {
  const d = getMilestoneDateObj(targetDateStr, daysBefore);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

// Count Words strictly (split by whitespace)
function countWords(str) {
  return str.trim().split(/\s+/).filter(Boolean).length;
}

// Check if any milestone exceeds 4 words
function hasOverlimitMilestones() {
  return state.milestones.some(m => countWords(m.text) > 4);
}

// Compute Countdown Hero Text & Dates
function getCountdownInfo() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(state.targetDate + "T00:00:00");
  const diffTime = target - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  let heroText = "";
  if (diffDays === 0) {
    heroText = "EXAM DAY";
  } else if (diffDays < 0) {
    heroText = "DEADLINE PASSED";
  } else {
    heroText = `${diffDays} DAYS LEFT`;
  }

  const examDateStr = target.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const todayStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const subText = `Exam: ${examDateStr} · Updated ${todayStr}`;

  return { heroText, subText, diffDays, examDateStr, todayStr };
}

// Calculate Days Remaining for Badge
function updateDaysRemaining() {
  const countdown = getCountdownInfo();
  if (countdown.diffDays === 0) {
    daysRemainingBadge.textContent = "Exam Day Today";
  } else if (countdown.diffDays > 0) {
    daysRemainingBadge.textContent = `${countdown.diffDays} Days Remaining`;
  } else {
    daysRemainingBadge.textContent = `Deadline Passed (${Math.abs(countdown.diffDays)}d ago)`;
  }
}

// Dynamic Template Updating: Writeup & Gemini Prompts
function updateDynamicContent() {
  // Update pitch template
  if (subWriteupEl) {
    const formattedDate = new Date(state.targetDate + "T00:00:00").toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const milestonesStr = state.milestones.map(m => `${m.prefix} ${m.text}`).join('; ');
    const deviceStr = state.deviceRatio === 'phone' ? 'phone' : 'laptop';
    subWriteupEl.textContent = `My deadline: ${state.goalName} on ${formattedDate}. I planned backward with T-minus milestones: ${milestonesStr}. I designed a ${deviceStr} lock screen with clean space for the clock. [DESCRIBE WHAT YOU ACTUALLY DID IN GEMINI].`;
  }

  // Update Gemini prompts in Step III
  const promptPushEl = document.getElementById('prompt-push');
  const promptCalEl = document.getElementById('prompt-cal');
  const promptStandupEl = document.getElementById('prompt-standup');

  const formattedMonthDay = new Date(state.targetDate + "T00:00:00").toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const timeFormatted = state.reminderTime ? state.reminderTime : "09:00";

  if (promptPushEl) {
    promptPushEl.textContent = `Every day at ${timeFormatted} until ${formattedMonthDay}, check the ${state.goalName} countdown in this chat, and send a push notification with any milestone scheduled for today or tomorrow. If no milestone is scheduled, give me a 1-sentence motivation tip.`;
  }
  if (promptCalEl) {
    promptCalEl.textContent = `Add each milestone from our countdown above to my Google Calendar on its scheduled date, with an email reminder notification set for ${timeFormatted}.`;
  }
  if (promptStandupEl) {
    promptStandupEl.textContent = `Act as my executive accountability coach. Every morning, ask me if I completed yesterday's milestone for ${state.goalName} and what my single top priority is for today's countdown.`;
  }
}

// Render Milestones in Editor
function renderMilestoneEditor() {
  milestonesContainer.innerHTML = '';
  state.milestones.forEach((m, idx) => {
    const row = document.createElement('div');
    row.className = 'milestone-row';

    const wordCount = countWords(m.text);
    const wordClass = wordCount > 4 ? 'over' : '';
    const dateObj = getMilestoneDateObj(state.targetDate, m.daysBefore);
    const dateFormatted = formatMilestoneDate(dateObj);
    const isPast = isMilestonePast(state.targetDate, m.daysBefore);

    row.innerHTML = `
      <div class="milestone-badge">${m.prefix}</div>
      <div class="milestone-date ${isPast ? 'overdue' : ''}">
        ${dateFormatted}${isPast ? ' <span class="overdue-tag">Overdue</span>' : ''}
      </div>
      <input type="text" class="milestone-desc-input" data-index="${idx}" value="${m.text}" placeholder="Milestone description" />
      <div class="milestone-wordcount ${wordClass}">${wordCount}/4 words</div>
    `;

    // Listen to changes
    const input = row.querySelector('.milestone-desc-input');
    input.addEventListener('input', (e) => {
      state.milestones[idx].text = e.target.value;
      const count = countWords(e.target.value);
      const countEl = row.querySelector('.milestone-wordcount');
      countEl.textContent = `${count}/4 words`;
      if (count > 4) {
        countEl.classList.add('over');
      } else {
        countEl.classList.remove('over');
      }
      renderPreview();
      updateDynamicContent();
    });

    milestonesContainer.appendChild(row);
  });

  planTitleDisplay.textContent = `T-Minus Countdown: ${state.goalName}`;
  updateDaysRemaining();
  updateDynamicContent();
}

// Render Preview on Phone / Laptop Frame
function renderPreview() {
  const countdown = getCountdownInfo();

  // Update hero countdown & date subtext
  const heroEl = document.getElementById('preview-countdown-hero');
  const subEl = document.getElementById('preview-countdown-sub');
  if (heroEl) heroEl.textContent = countdown.heroText;
  if (subEl) subEl.textContent = countdown.subText;

  previewCardTitle.textContent = `T-MINUS COUNTDOWN: ${state.goalName.toUpperCase()}`;
  previewCardSubtitle.style.display = state.includeSubtitle ? 'block' : 'none';

  // Toggle sim clock container
  simClockContainer.style.display = state.showSimClock ? 'block' : 'none';

  // Render milestones list with Date before description
  previewMilestonesList.innerHTML = '';
  state.milestones.forEach((m, idx) => {
    const dateObj = getMilestoneDateObj(state.targetDate, m.daysBefore);
    const dateFormatted = formatMilestoneDate(dateObj);

    const item = document.createElement('div');
    item.className = `milestone-item ${m.checked ? 'checked' : ''}`;
    item.innerHTML = `
      <div class="milestone-checkbox">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
      </div>
      <div class="milestone-prefix">${m.prefix}</div>
      <div class="milestone-date-label">${dateFormatted}</div>
      <div class="milestone-text">${m.text}</div>
    `;

    item.addEventListener('click', () => {
      state.milestones[idx].checked = !state.milestones[idx].checked;
      renderPreview();
    });

    previewMilestonesList.appendChild(item);
  });
}

// Tab Switching
navTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const targetTab = tab.getAttribute('data-tab');
    navTabs.forEach(t => t.classList.remove('active'));
    tabPanes.forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`tab-${targetTab}`).classList.add('active');
  });
});

btnSaveToDesigner.addEventListener('click', () => {
  document.querySelector('.nav-tab[data-tab="designer"]').click();
});

// Device Ratio Switching
deviceBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    deviceBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.deviceRatio = btn.getAttribute('data-ratio');
    if (state.deviceRatio === 'phone') {
      deviceMockupFrame.classList.remove('laptop-frame');
      deviceMockupFrame.classList.add('phone-frame');
    } else {
      deviceMockupFrame.classList.remove('phone-frame');
      deviceMockupFrame.classList.add('laptop-frame');
    }
    renderPreview();
    updateDynamicContent();
  });
});

// Theme Switching
themeCards.forEach(card => {
  card.addEventListener('click', () => {
    themeCards.forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    const theme = card.getAttribute('data-theme');
    state.theme = theme;
    deviceMockupFrame.className = `device-frame ${state.deviceRatio === 'phone' ? 'phone-frame' : 'laptop-frame'} theme-${theme}`;
  });
});

// Display Options Toggles
chkShowSimClock.addEventListener('change', (e) => {
  state.showSimClock = e.target.checked;
  renderPreview();
});

chkCleanTop.addEventListener('change', (e) => {
  state.cleanTop = e.target.checked;
  const card = document.getElementById('lockscreen-card');
  if (!state.cleanTop) {
    card.style.marginTop = '1rem';
  } else {
    card.style.marginTop = 'auto';
  }
});

chkIncludeWatermark.addEventListener('change', (e) => {
  state.includeSubtitle = e.target.checked;
  renderPreview();
});

// Goal / Target Date / Reminder Time Inputs
goalNameInput.addEventListener('input', (e) => {
  state.goalName = e.target.value.trim() || "AI-901 Exam";
  planTitleDisplay.textContent = `T-Minus Countdown: ${state.goalName}`;
  renderPreview();
  updateDynamicContent();
});

targetDateInput.addEventListener('change', (e) => {
  state.targetDate = e.target.value || "2026-11-23";
  renderMilestoneEditor();
  renderPreview();
  updateDynamicContent();
});

if (reminderTimeInput) {
  reminderTimeInput.addEventListener('change', (e) => {
    state.reminderTime = e.target.value || "09:00";
    updateDynamicContent();
  });
}

// Auto-Generate Milestones based on Questionnaire
btnGenerateMilestones.addEventListener('click', () => {
  const goal = state.goalName.toLowerCase();

  let m14 = "Start study guide";
  let m7  = "Foundry hands-on practice";
  let m3  = "Take practice test";
  let m1  = "Revise and check ID";
  let m0  = "AI-901 exam day";

  if (goal.includes("exam") || goal.includes("study") || goal.includes("cert") || goal.includes("901")) {
    m14 = "Start study guide";
    m7  = "Foundry hands-on practice";
    m3  = "Take practice test";
    m1  = "Revise and check ID";
    m0  = "AI-901 exam day";
  } else if (goal.includes("thanksgiving") || goal.includes("party") || goal.includes("gathering")) {
    m14 = "Confirm guest list";
    m7  = "Buy pantry ingredients";
    m3  = "Clean dining space";
    m1  = "Prep marinade pies";
    m0  = "Host Thanksgiving celebration";
  } else if (goal.includes("handshake") || goal.includes("mission") || goal.includes("challenge")) {
    m14 = "Draft project scope";
    m7  = "Design lock screen";
    m3  = "Schedule calendar reminders";
    m1  = "Proofread submission materials";
    m0  = "Submit Handshake mission";
  } else {
    m14 = "Draft scope outline";
    m7  = "Complete core build";
    m3  = "Test all deliverables";
    m1  = "Final polish review";
    m0  = "Deliver target goal";
  }

  state.milestones = [
    { prefix: "T-14", daysBefore: 14, text: m14, checked: false },
    { prefix: "T-7",  daysBefore: 7,  text: m7,  checked: false },
    { prefix: "T-3",  daysBefore: 3,  text: m3,  checked: false },
    { prefix: "T-1",  daysBefore: 1,  text: m1,  checked: false },
    { prefix: "T-0",  daysBefore: 0,  text: m0,  checked: false }
  ];

  renderMilestoneEditor();
  renderPreview();
  updateDynamicContent();
  showToast("Auto-generated milestones (each under 5 words)!");
});

// Copy Prompts
btnCopyPrompt1.addEventListener('click', () => {
  const prompt = `I am planning for ${state.goalName} on ${state.targetDate}. Ask me three quick questions about my schedule, then build a simple plan working backward from my target date with clear "T-minus" milestones, such as T-14, T-7, T-3, and T-1 days. Keep each milestone description under five words.`;
  copyText(prompt, "Copied Gemini Planning Prompt!");
});

btnCopyPrompt2.addEventListener('click', () => {
  const isPhone = state.deviceRatio === 'phone';
  const format = isPhone ? "vertical 9:16 phone lock screen" : "horizontal 16:9 laptop wallpaper";
  const prompt = `Generate a high-resolution ${format} titled "T-MINUS COUNTDOWN: ${state.goalName.toUpperCase()}" featuring only the biggest milestones from our chat earlier with checkboxes:
- [ ] T-14: ${state.milestones[0].text}
- [ ] T-7: ${state.milestones[1].text}
- [ ] T-3: ${state.milestones[2].text}
- [ ] T-1: ${state.milestones[3].text}
- [ ] T-0: ${state.milestones[4].text}

Color palette and vibe: ${state.theme === 'cyber' ? 'Obsidian cosmic glassmorphism with neon cyan accents' : state.theme === 'pastel' ? 'Warm beige and sage green botanical minimalist' : state.theme === 'sunset' ? 'Deep purple to glowing warm sunset gradient' : 'Clean monochrome dark Swiss typography'}. Leave clean space at the top for my clock or icons.`;
  copyText(prompt, "Copied Gemini Image Prompt!");
});

if (btnCopyWriteup) {
  btnCopyWriteup.addEventListener('click', () => {
    const text = subWriteupEl.textContent;
    copyText(text, "Copied Submission Pitch Template!");
  });
}

// Copy Small Buttons
document.querySelectorAll('.copy-small-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.getAttribute('data-copy-target');
    const text = document.getElementById(targetId).textContent;
    copyText(text, "Prompt copied to clipboard!");
  });
});

// Dynamic .ICS Generator (Floating local time, timed 09:00 - 09:30, VALARM PT0S)
function generateIcsContent() {
  const targetDateObj = new Date(state.targetDate + "T00:00:00");
  
  // Parse reminder time (HH:MM)
  const timeVal = state.reminderTime || "09:00";
  const [remH, remM] = timeVal.split(":").map(Number);
  const startHStr = String(remH).padStart(2, '0');
  const startMStr = String(remM).padStart(2, '0');
  
  // 30 minute duration
  const startTotalMinutes = remH * 60 + remM;
  const endTotalMinutes = startTotalMinutes + 30;
  const endH = Math.floor(endTotalMinutes / 60) % 24;
  const endM = endTotalMinutes % 60;
  const endHStr = String(endH).padStart(2, '0');
  const endMStr = String(endM).padStart(2, '0');

  let icsLines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Handshake x Google Gemini//Countdown Lock Screen Studio//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${state.goalName} Countdown`
  ];

  state.milestones.forEach((m, idx) => {
    const d = new Date(targetDateObj);
    d.setDate(targetDateObj.getDate() - m.daysBefore);
    const y = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dtstart = `${y}${mo}${day}T${startHStr}${startMStr}00`;
    const dtend = `${y}${mo}${day}T${endHStr}${endMStr}00`;

    icsLines.push("BEGIN:VEVENT");
    icsLines.push(`UID:milestone-${m.prefix.toLowerCase()}-${Date.now()}-${idx}@countdown.app`);
    icsLines.push(`DTSTAMP:20261103T100000Z`);
    icsLines.push(`DTSTART:${dtstart}`);
    icsLines.push(`DTEND:${dtend}`);
    icsLines.push(`SUMMARY:${m.prefix}: ${m.text}`);
    icsLines.push(`DESCRIPTION:${state.goalName} Milestone (${m.prefix}). Keep focused on your countdown!`);
    icsLines.push("BEGIN:VALARM");
    icsLines.push("ACTION:DISPLAY");
    icsLines.push(`DESCRIPTION:Reminder: ${m.prefix} - ${m.text}`);
    icsLines.push("TRIGGER:PT0S"); // Fires at scheduled start time on milestone day
    icsLines.push("END:VALARM");
    icsLines.push("END:VEVENT");
  });

  icsLines.push("END:VCALENDAR");
  return icsLines.join("\r\n");
}
window.generateIcsContent = generateIcsContent;

btnDownloadIcs.addEventListener('click', () => {
  if (hasOverlimitMilestones()) {
    showToast("Cannot export calendar: each milestone must be at most 4 words.");
    return;
  }

  const ics = generateIcsContent();
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${state.goalName.replace(/\s+/g, '_')}_milestones.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast("Downloaded .ICS Calendar file!");
});

// Canvas High-Res Wallpaper Exporter
function renderCanvasWallpaper() {
  if (hasOverlimitMilestones()) {
    showToast("Cannot export wallpaper: each milestone must be at most 4 words.");
    return;
  }

  const isPhone = state.deviceRatio === 'phone';
  const width = isPhone ? 1080 : 1920;
  const height = isPhone ? 1920 : 1080;

  exportCanvas.width = width;
  exportCanvas.height = height;
  const ctx = exportCanvas.getContext('2d');

  // Background according to theme
  if (state.theme === 'cyber') {
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#060810');
    bgGrad.addColorStop(0.5, '#12142a');
    bgGrad.addColorStop(1, '#050a18');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Glowing orbs
    const radial = ctx.createRadialGradient(width * 0.8, height * 0.15, 50, width * 0.8, height * 0.15, 600);
    radial.addColorStop(0, 'rgba(139, 92, 246, 0.35)');
    radial.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, width, height);

    const radial2 = ctx.createRadialGradient(width * 0.2, height * 0.7, 50, width * 0.2, height * 0.7, 700);
    radial2.addColorStop(0, 'rgba(0, 242, 254, 0.25)');
    radial2.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radial2;
    ctx.fillRect(0, 0, width, height);
  } else if (state.theme === 'pastel') {
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, '#faf7f2');
    bgGrad.addColorStop(0.5, '#f0ede6');
    bgGrad.addColorStop(1, '#dce5da');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);
  } else if (state.theme === 'sunset') {
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, '#160826');
    bgGrad.addColorStop(0.4, '#4a113f');
    bgGrad.addColorStop(0.75, '#8c1f4b');
    bgGrad.addColorStop(1, '#f97316');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, width, height);
  }

  // Draw Card
  // Requirement:
  // - Top 40% on phone must be completely empty: height * 0.40 = 768px.
  // - Right half on laptop must be completely empty: width * 0.50 = 960px.
  let cardX, cardY, cardW, cardH;
  if (isPhone) {
    cardW = 960;
    cardH = 1040;
    cardX = (width - cardW) / 2;
    cardY = 780; // Greater than 768px, ensuring top 40% is completely empty
  } else {
    cardW = 820; // Well below 960px, so right half is completely empty
    cardH = 950;
    cardX = 70;
    cardY = 65;
  }

  // Draw rounded card
  const r = 36;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cardX + r, cardY);
  ctx.lineTo(cardX + cardW - r, cardY);
  ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW, cardY + r);
  ctx.lineTo(cardX + cardW, cardY + cardH - r);
  ctx.quadraticCurveTo(cardX + cardW, cardY + cardH, cardX + cardW - r, cardY + cardH);
  ctx.lineTo(cardX + r, cardY + cardH);
  ctx.quadraticCurveTo(cardX, cardY + cardH, cardX, cardY + cardH - r);
  ctx.lineTo(cardX, cardY + r);
  ctx.quadraticCurveTo(cardX, cardY, cardX + r, cardY);
  ctx.closePath();

  if (state.theme === 'pastel') {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.strokeStyle = 'rgba(100, 130, 110, 0.35)';
  } else {
    ctx.fillStyle = 'rgba(16, 22, 38, 0.72)';
    ctx.strokeStyle = state.theme === 'sunset' ? 'rgba(249, 115, 22, 0.4)' : 'rgba(0, 242, 254, 0.4)';
  }
  ctx.lineWidth = 3;
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Card Content & Typography (all text sizes >= 28px)
  const textPrimary = state.theme === 'pastel' ? '#27382b' : '#ffffff';
  const textAccent = state.theme === 'pastel' ? '#3b6647' : (state.theme === 'sunset' ? '#fb923c' : '#00f2fe');
  const textSecondary = state.theme === 'pastel' ? '#5a6b5e' : '#94a3b8';

  const countdown = getCountdownInfo();

  // 1. Badge
  ctx.font = 'bold 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = textAccent;
  ctx.fillText('COUNTDOWN TRACKER', cardX + 48, cardY + 55);

  // 2. Large Hero Countdown Line: "N DAYS LEFT" / "EXAM DAY" / "DEADLINE PASSED"
  ctx.font = 'bold 58px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = textAccent;
  ctx.fillText(countdown.heroText, cardX + 48, cardY + 120);

  // 3. Small Text: "Exam: <Mon D> · Updated <today's date>"
  ctx.font = '500 28px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = textSecondary;
  ctx.fillText(countdown.subText, cardX + 48, cardY + 165);

  // 4. Card Title
  ctx.font = 'bold 34px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = textPrimary;
  const titleText = `T-MINUS COUNTDOWN: ${state.goalName.toUpperCase()}`;
  ctx.fillText(titleText, cardX + 48, cardY + 225, cardW - 96);

  // 5. Subtitle (if enabled)
  if (state.includeSubtitle) {
    ctx.font = '500 28px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = textSecondary;
    ctx.fillText('Work backward. Stay focused. Succeed on exam day.', cardX + 48, cardY + 270, cardW - 96);
  }

  // 6. Milestones List: "T-14  Nov 9  Start study guide"
  const startMilestoneY = cardY + 345;
  const gapY = isPhone ? 130 : 120;

  state.milestones.forEach((m, i) => {
    const curY = startMilestoneY + (i * gapY);

    // Checkbox box
    const cbSize = 34;
    const cbX = cardX + 48;
    const cbY = curY - 26;

    ctx.save();
    ctx.lineWidth = 3;
    ctx.strokeStyle = textAccent;
    ctx.strokeRect(cbX, cbY, cbSize, cbSize);

    if (m.checked) {
      ctx.fillStyle = textAccent;
      ctx.fillRect(cbX, cbY, cbSize, cbSize);

      // Checkmark tick
      ctx.strokeStyle = state.theme === 'pastel' ? '#ffffff' : '#000000';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cbX + 8, cbY + 18);
      ctx.lineTo(cbX + 15, cbY + 25);
      ctx.lineTo(cbX + 27, cbY + 9);
      ctx.stroke();
    }
    ctx.restore();

    // Prefix: T-14
    ctx.font = 'bold 28px "JetBrains Mono", monospace';
    ctx.fillStyle = textAccent;
    ctx.fillText(m.prefix, cbX + 54, curY);

    // Date: Nov 9
    const dateObj = getMilestoneDateObj(state.targetDate, m.daysBefore);
    const dateFormatted = formatMilestoneDate(dateObj);
    ctx.font = '600 28px "JetBrains Mono", monospace';
    ctx.fillStyle = textSecondary;
    ctx.fillText(dateFormatted, cbX + 145, curY);

    // Description text: Start study guide
    ctx.font = '500 28px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = m.checked ? (state.theme === 'pastel' ? '#8a9a8d' : '#64748b') : textPrimary;
    ctx.fillText(m.text, cbX + 275, curY, cardW - 340);

    // Strike-through if checked
    if (m.checked) {
      const textWidth = ctx.measureText(m.text).width;
      ctx.save();
      ctx.strokeStyle = m.checked ? (state.theme === 'pastel' ? '#8a9a8d' : '#64748b') : textPrimary;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cbX + 275, curY - 10);
      ctx.lineTo(cbX + 275 + Math.min(textWidth, cardW - 350), curY - 10);
      ctx.stroke();
      ctx.restore();
    }
  });

  // Download Trigger
  const a = document.createElement('a');
  a.download = `LockScreen_${state.goalName.replace(/\s+/g, '_')}_${state.deviceRatio}.png`;
  a.href = exportCanvas.toDataURL('image/png');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast("High-resolution wallpaper PNG downloaded!");
}

btnDownloadWallpaper.addEventListener('click', renderCanvasWallpaper);

// Missing or broken image handler
function handleGalleryImageError(img) {
  const parent = img.parentElement;
  if (!parent) return;
  img.style.display = 'none';
  if (!parent.querySelector('.image-missing-placeholder')) {
    const placeholder = document.createElement('div');
    placeholder.className = 'image-missing-placeholder';
    placeholder.innerHTML = `
      <div class="placeholder-icon">🖼️</div>
      <div class="placeholder-text">Add your exported lock screen here</div>
    `;
    parent.appendChild(placeholder);
  }
}
window.handleGalleryImageError = handleGalleryImageError;

// Bind missing-image listener to handle missing assets with zero page errors
document.querySelectorAll('.gallery-img-container img').forEach(function (img) {
  if (img.complete && img.naturalWidth === 0) handleGalleryImageError(img);
  img.addEventListener('error', function () { handleGalleryImageError(img); });
});

// Initial Load
renderMilestoneEditor();
renderPreview();
updateDynamicContent();
