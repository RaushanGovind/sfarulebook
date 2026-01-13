// ----------------------------
// GLOBAL STATE
// ----------------------------
let currentIndex = 0;

// Load last opened chapter if exists
const savedIndex = localStorage.getItem("currentIndex");
if (savedIndex !== null) currentIndex = Number(savedIndex);


// ----------------------------
// DOM ELEMENTS
// ----------------------------
const menuEl = document.getElementById("menu");
const lessonEl = document.getElementById("lesson");

const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");

const toggleSidebarBtn = document.getElementById("toggle-sidebar");
const toggleThemeBtn = document.getElementById("toggle-theme");

const settingsModal = document.getElementById("settings-modal");
const settingsBtn = document.getElementById("settings-btn");
const closeModalBtn = settingsModal?.querySelector(".close");


// ----------------------------
// SETTINGS CONTROLS
// ----------------------------
const bgColorInput = document.getElementById("bg-color");
const textColorInput = document.getElementById("text-color");
const sidebarBgInput = document.getElementById("sidebar-bg");
const sidebarTextInput = document.getElementById("sidebar-text");

const fontFamilySelect = document.getElementById("font-family");
const fontSizeSlider = document.getElementById("font-size");
const fontSizeValue = document.getElementById("font-size-value");

const saveSettingsBtn = document.getElementById("save-settings");
const resetSettingsBtn = document.getElementById("reset-settings");


// ----------------------------
// RENDER LESSON CONTENT
// ----------------------------
function loadLesson(index) {
    if (!window.lessons || !window.lessons[index]) return;

    const lesson = window.lessons[index];

    // ⛔ No title displayed in content area
    lessonEl.innerHTML = `
        <div class="lesson-body">
            ${lesson.content || ""}
        </div>
    `;

    currentIndex = index;
    localStorage.setItem("currentIndex", currentIndex);

    updateNavButtons();
    highlightActiveMenu();
}


// ----------------------------
// SIDEBAR MENU
// ----------------------------
function buildMenu() {
    menuEl.innerHTML = "";

    window.lessons.forEach((lesson, i) => {
        const item = document.createElement("div");
        item.className = "menu-item";
        item.dataset.index = i;

        item.innerHTML = `
            <span>${i + 1}. ${lesson.title || "Chapter"}</span>
        `;

        item.addEventListener("click", () => loadLesson(i));
        menuEl.appendChild(item);
    });

    highlightActiveMenu();
}

function highlightActiveMenu() {
    document
        .querySelectorAll(".menu-item")
        .forEach(item => item.classList.remove("active"));

    const active = document.querySelector(
        `.menu-item[data-index="${currentIndex}"]`
    );

    if (active) active.classList.add("active");
}


// ----------------------------
// NAVIGATION BUTTONS
// ----------------------------
function updateNavButtons() {
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === window.lessons.length - 1;
}

prevBtn.addEventListener("click", () => {
    if (currentIndex > 0) loadLesson(currentIndex - 1);
});

nextBtn.addEventListener("click", () => {
    if (currentIndex < window.lessons.length - 1)
        loadLesson(currentIndex + 1);
});


// ----------------------------
// SIDEBAR TOGGLE
// ----------------------------
toggleSidebarBtn.addEventListener("click", () => {
    document.querySelector(".sidebar").classList.toggle("hidden");
});


// ----------------------------
// DARK MODE
// ----------------------------
toggleThemeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem(
        "darkMode",
        document.body.classList.contains("dark") ? "1" : "0"
    );
});

function restoreTheme() {
    if (localStorage.getItem("darkMode") === "1") {
        document.body.classList.add("dark");
    }
}


// ----------------------------
// SETTINGS — APPLY STYLES
// ----------------------------
function applySettings(settings) {
    document.body.style.backgroundColor = settings.bgColor;
    document.body.style.color = settings.textColor;

    document.querySelector(".sidebar").style.backgroundColor = settings.sidebarBg;
    document.querySelector(".sidebar").style.color = settings.sidebarText;

    document.body.style.fontFamily = settings.fontFamily;
    document.body.style.fontSize = settings.fontSize + "px";

    // update controls display
    bgColorInput.value = settings.bgColor;
    textColorInput.value = settings.textColor;
    sidebarBgInput.value = settings.sidebarBg;
    sidebarTextInput.value = settings.sidebarText;

    fontFamilySelect.value = settings.fontFamily;
    fontSizeSlider.value = settings.fontSize;
    fontSizeValue.textContent = settings.fontSize + "px";
}


// ----------------------------
// DEFAULT SETTINGS
// ----------------------------
const defaultSettings = {
    bgColor: "#ffffff",
    textColor: "#1f2937",
    sidebarBg: "#f3f4f6",
    sidebarText: "#374151",
    fontFamily: "Arial, sans-serif",
    fontSize: 16
};


// ----------------------------
// LOAD SAVED SETTINGS
// ----------------------------
function loadSettings() {
    const saved = localStorage.getItem("sfaReaderSettings");

    if (saved) {
            applySettings(JSON.parse(saved));
    } else {
        applySettings(defaultSettings);
    }
}


// ----------------------------
// SAVE SETTINGS
// ----------------------------
saveSettingsBtn.addEventListener("click", () => {
    const settings = {
        bgColor: bgColorInput.value,
        textColor: textColorInput.value,
        sidebarBg: sidebarBgInput.value,
        sidebarText: sidebarTextInput.value,
        fontFamily: fontFamilySelect.value,
        fontSize: Number(fontSizeSlider.value)
    };

    localStorage.setItem("sfaReaderSettings", JSON.stringify(settings));
    applySettings(settings);
});


// ----------------------------
// RESET SETTINGS
// ----------------------------
resetSettingsBtn.addEventListener("click", () => {
    localStorage.removeItem("sfaReaderSettings");
    applySettings(defaultSettings);
});


// ----------------------------
// FONT SIZE SLIDER LIVE PREVIEW
// ----------------------------
fontSizeSlider.addEventListener("input", () => {
    fontSizeValue.textContent = fontSizeSlider.value + "px";
});


// ----------------------------
// SETTINGS MODAL
// ----------------------------
settingsBtn.addEventListener("click", () => {
    settingsModal.style.display = "block";
});

closeModalBtn.addEventListener("click", () => {
    settingsModal.style.display = "none";
});

window.addEventListener("click", (e) => {
    if (e.target === settingsModal) {
        settingsModal.style.display = "none";
    }
});


// ----------------------------
// INIT APP
// ----------------------------
document.addEventListener("DOMContentLoaded", () => {

    if (!window.lessons || window.lessons.length === 0) {
        lessonEl.innerHTML = "<h2>No chapters loaded</h2>";
        return;
    }

    buildMenu();
    restoreTheme();
    loadSettings();
    loadLesson(currentIndex);
});

