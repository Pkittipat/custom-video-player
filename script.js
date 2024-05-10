const playPauseBtn = document.querySelector(".play-pause-btn");
const video = document.querySelector("video");
const videoContainer = document.querySelector(".video-container");
const theaterBtn = document.querySelector(".theater-btn");
const fullscreenBtn = document.querySelector(".full-screen-btn");
const miniPlayerBtn = document.querySelector(".mini-player-btn");
const muteBtn = document.querySelector(".mute-btn");
const volumeSlider = document.querySelector(".volume-slider");
const totalTimeElement = document.querySelector(".total-time");
const currentTimeElement = document.querySelector(".current-time");
const captionsBtn = document.querySelector(".captions-btn");
const previewImg = document.querySelector(".preview-img")
const thumbnailImg = document.querySelector(".thumbnail-img")
const timelineContainer = document.querySelector(".timeline-container");


playPauseBtn.addEventListener('click', togglePlay);
video.addEventListener('click', togglePlay);

function togglePlay() {
    console.log('click', video.pause)
    video.paused ? video.play() : video.pause()
}

video.addEventListener('play', (e) => {
    videoContainer.classList.remove("paused");
});

video.addEventListener('pause', () => {
    videoContainer.classList.add("paused")
});

video.addEventListener("enterpictureinpicture", () => {
    videoContainer.classList.add("mini-player");
});

video.addEventListener("leavepictureinpicture", () => {
    videoContainer.classList.remove("mini-player");
})

theaterBtn.addEventListener('click', () => {
    videoContainer.classList.toggle("theater");
});

fullscreenBtn.addEventListener('click', () => {
    if (document.fullscreenElement == null) {
        videoContainer.requestFullscreen();
    } else {
        document.exitFullscreen();
    };
});

miniPlayerBtn.addEventListener("click", () => {
    if (videoContainer.classList.contains("mini-player")) {
        document.exitPictureInPicture();
    } else {
        video.requestPictureInPicture();
    }
})

document.addEventListener("fullscreenchange", () => {
    console.log(document.fullscreenElement);
    videoContainer.classList.toggle("full-screen", document.fullscreenElement)
});

muteBtn.addEventListener('click', () => {
    video.muted = !video.muted;
})

volumeSlider.addEventListener('input', (e) => {
    video.volume = e.target.value;
    video.muted = e.target.value === 0;
});

video.addEventListener('volumechange', () => {
    let volumeLevel;
    if (video.muted || video.volume === 0) {
        volumeSlider.value = 0;
        volumeLevel = "muted";
    } else if (video.volume >= 0.5) {
        volumeLevel = "high";
    } else {
        volumeLevel = "low";
    }

    videoContainer.dataset.volumeLevel = volumeLevel;
})

video.addEventListener('loadeddata', () => {
    totalTimeElement.textContent = formatDuration(video.duration);
})

video.addEventListener('timeupdate', () => {
    currentTimeElement.textContent = formatDuration(video.currentTime)
    const percent = (video.currentTime * 100) / video.duration
    console.log(percent)
    timelineContainer.style.setProperty("--progress-position", percent / 100)
});

const leadingZeroFormatter = new Intl.NumberFormat(undefined, {
    minimumIntegerDigits: 2
});
function formatDuration(time) {
    const seconds = Math.floor(time % 60);
    const minutes = Math.floor(time / 60) % 60;
    const hours = Math.floor(time / 3600);
    if (hours === 0) {
        return `${minutes}:${leadingZeroFormatter.format(seconds)}`; 
    } else {
        return `${hours}:${leadingZeroFormatter.format(minutes)}:${leadingZeroFormatter.format(seconds)}`;
    }
}

// cations
const captions = video.textTracks[0]
captions.mode = "hidden"

captionsBtn.addEventListener('click', () => {
    const isHidden = captions.mode === "hidden";
    captions.mode = isHidden ? "showing" : "hidden";
    videoContainer.classList.toggle("captions", isHidden);
})

let isScrubbing = false;
let waspaused;

timelineContainer.addEventListener('mousemove', handleTimelineUpdate)

function handleTimelineUpdate(e) {
    const rect = timelineContainer.getBoundingClientRect()
    const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width
    const previewImgNumber = Math.max(
        1,
        Math.floor((percent * video.duration) / 10)
    )
    const previewImgSrc = `assets/previews/preview${previewImgNumber}.png`
    previewImg.src = previewImgSrc;
    timelineContainer.style.setProperty("--preview-position", percent)

    if (isScrubbing) {
        e.preventDefault();
        thumbnailImg.src = previewImgSrc
        timelineContainer.style.setProperty("--progress-position", percent);
    }
}

timelineContainer.addEventListener("mousedown", toggleScrubbing)
timelineContainer.addEventListener("mouseup", e => {
    if (isScrubbing) toggleScrubbing(e)
})
document.addEventListener("mousemove", e => {
    if (isScrubbing) handleTimelineUpdate(e)
})

function toggleScrubbing(e) {
    const rect =timelineContainer.getBoundingClientRect();
    const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;
    isScrubbing = (e.buttons & 1) === 1;
    videoContainer.classList.toggle("scrubbing", isScrubbing);
    if (isScrubbing) {
        waspaused = video.paused
        video.pause();
    } else {
        video.currentTime = percent * video.duration;
        if (!waspaused) video.play();
    }

    handleTimelineUpdate(e);
}