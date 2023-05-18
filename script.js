/**********************************/
// UPDATE CLOCK
/**********************************/
const timer = {
    work: 25,
    shortBreak: 5,
    longBreak: 15,
    longBreakInterval: 4,
    sessions: 0,
};

const modeButtons = document.querySelector("#mode-buttons");
modeButtons.addEventListener("click", function handleMode(event) {
    const { mode } = event.target.dataset;

    if (!mode) return;

    switchMode(mode);
    stopTimer();
});

function switchMode(mode) {
    timer.mode = mode;
    timer.remainingTime = {
        total: timer[mode] * 60,
        minutes: timer[mode],
        seconds: 0,
    };

    document
        .querySelectorAll("button[data-mode]")
        .forEach((e) => e.classList.remove("active"));
    document.querySelector(`[data-mode="${mode}"]`).classList.add("active");
    document.body.style.backgroundColor = `var(--${mode})`;

    // Update the progress bar
    document
        .getElementById("progress-bar")
        .setAttribute("max", timer.remainingTime.total);

    updateClock();
}

function updateClock() {
    const { remainingTime } = timer;
    const minutes = `${remainingTime.minutes}`.padStart(2, "0");
    const seconds = `${remainingTime.seconds}`.padStart(2, "0");

    const min = document.getElementById("minutes");
    const sec = document.getElementById("seconds");
    min.textContent = minutes;
    sec.textContent = seconds;

    // Update the progress bar
    const progress = document.getElementById("progress-bar");
    progress.value = timer[timer.mode] * 60 - timer.remainingTime.total;

    // Timer in the page title
    const text = timer.mode === "work" ? "Get back to work" : "Take a break !";
    document.title = `${minutes}:${seconds} - ${text}`;
}

document.addEventListener("DOMContentLoaded", () => {
    // Verified in the browser can use notification
    if ("Notification" in window) {
        // Verified if user accept the notification or denied
        if (
            Notification.permission !== "granted" &&
            Notification.permission !== "denied"
        ) {
            // Ask the permission now
            Notification.requestPermission().then(function (permission) {
                // If user accept Notification
                if (permission === "granted") {
                    // Create a new notification to announce the user
                    new Notification(
                        "Awesome! You will be notified at the start of each session"
                    );
                }
            });
        }
    }

    switchMode("work");
});

/**********************************/
// START CLOCK
/**********************************/

let interval;

const startButton = document.getElementById("start-btn");
startButton.addEventListener("click", () => {
    const { action } = startButton.dataset;
    if (action === "start") {
        startTimer();
    } else {
        stopTimer();
    }
});

function startTimer() {
    let { total } = timer.remainingTime;
    const endTime = Date.parse(new Date()) + total * 1000;

    startButton.dataset.action = "stop";
    startButton.textContent = "stop";

    // Begin the timer automaticaly
    if (timer.mode === "work") timer.sessions++;

    interval = setInterval(function () {
        timer.remainingTime = getRemainingTime(endTime);
        updateClock();

        total = timer.remainingTime.total;
        if (total <= 0) {
            clearInterval(interval);

            // Begin the timer automaticaly
            switch (timer.mode) {
                case "work":
                    if (timer.sessions % timer.longBreakInterval === 0) {
                        switchMode("longBreak");
                    } else {
                        switchMode("shortBreak");
                    }
                    break;
                default:
                    switchMode("work");
            }

            if (Notification.permission === "granted") {
                const text =
                    timer.mode === "work"
                        ? "Get back to work!"
                        : "Take a break!";
                new Notification(text);
            }

            startTimer();
        }
    }, 1000);
}

function getRemainingTime(endTime) {
    const currentTime = Date.parse(new Date());
    const difference = endTime - currentTime;

    const total = Number.parseInt(difference / 1000, 10);
    const minutes = Number.parseInt((total / 60) % 60, 10);
    const seconds = Number.parseInt(total % 60, 10);

    return {
        total,
        minutes,
        seconds,
    };
}

/**********************************/
// STOP CLOCK
/**********************************/

function stopTimer() {
    clearInterval(interval);

    startButton.dataset.action = "start";
    startButton.textContent = "start";
}

/**********************************/
// PLAY AND STOP THE TIMER WITH THE BUTTON
/**********************************/

window.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        const { action } = startButton.dataset;
        if (action === "start") {
            startTimer();
        } else {
            stopTimer();
        }
    }
});

window.addEventListener("keydown", function (event) {
    if (event.keyCode == 32) {
        event.preventDefault();
        const { action } = startButton.dataset;
        if (action === "start") {
            startTimer();
        } else {
            stopTimer();
        }
    }
});

/**********************************/
// RESET THE PAGE
/**********************************/

const resetButton = document.getElementById("reset-btn");
resetButton.addEventListener("click", () => {
    stopTimer();
    window.location.reload();
});
