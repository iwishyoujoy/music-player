
let now_playing = document.getElementById(`now-playing`);
let track_cover = document.querySelector(`#track-cover`);
let track_name = document.querySelector(`#track-name`);
let track_artist = document.querySelector(`#track-artist`);

let visualizer_container = document.querySelector(".visualizer-container");
let play_pause_btn = document.querySelector(`#play-pause-track`);
let next_btn = document.querySelector(`#next-track`);
let prev_btn = document.querySelector(`#prev-track`);

let seek_slider = document.querySelector(`#seek-slider`);
let volume_slider = document.querySelector(`#volume-slider`);
let curr_time = document.querySelector('#current-time');
let total_duration = document.querySelector('#total-duration');
let randomIcon = document.querySelector('#random-icon');
let curr_track = document.createElement('audio');

let track_index = 0;
let isPlaying = false;
let isRandom = false;
let updateTimer;

let MEDIA_ELEMENT_NODES = new WeakMap();
let MEDIA_ELEMENT_ANALYZER = new WeakMap();

const music_list = [
    {
        img : 'images/pinkwhite.jpg',
        name : 'Pink + White',
        artist : 'Frank Ocean',
        music : 'music/Frank_Ocean_-_Pink_+_White.mp3'
    },
    {
        img : 'images/afterthestorm.jpg',
        name : 'After the Storm',
        artist : 'Kali Uchis',
        music : 'music/Kali_Uchis_(feat._Tyler__The_Creator_&_Bootsy_Collins)_-_After_The_Storm.mp3'
    },
    {
        img : 'images/maslindo.jpg',
        name : 'Mas Lindo',
        artist : 'Psalm Trees',
        music : 'music/mas_lindo.mp3'
    },
    {
        img : 'images/itwasagoodday.jpg',
        name : 'It Was a Good Day',
        artist : 'Ice Cube',
        music : 'music/07._Ice_Cube__-_It_Was_A_Good_Day.mp3'
    }
];

function loadTrack(track_index){
    clearInterval(updateTimer);
    reset();

    curr_track.src = music_list[track_index].music;
    curr_track.load();

    track_cover.style.backgroundImage = "url(" + music_list[track_index].img + ")";
    track_name.textContent = music_list[track_index].name;
    track_artist.textContent = music_list[track_index].artist;
    now_playing.textContent = "Playing music " + (track_index + 1) + " of " + music_list.length;

    updateTimer = setInterval(setUpdate, 1000);

    curr_track.addEventListener('ended', nextTrack);
}

function reset(){
    curr_time.textContent = "00:00";
    total_duration.textContent = "00:00";
    seek_slider.value = 0;
    resetStrokes();
}
function randomTrack(){
    let randomTrack = Math.floor(Math.random() * music_list.length);
    loadTrack(randomTrack);
    playTrack();
}
function repeatTrack(){
    loadTrack(track_index);
    playTrack();
}
function playPauseTrack(){
    isPlaying ? pauseTrack() : playTrack();
}
function playTrack(){
    getStrokesMoving();
    curr_track.play();
    isPlaying = true;
    track_cover.classList.add('rotate');
    play_pause_btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" id="Filled" viewBox="0 0 24 24" fill="rgb(67,54,60)" width="20" height="20"><path d="M6.5,0A3.5,3.5,0,0,0,3,3.5v17a3.5,3.5,0,0,0,7,0V3.5A3.5,3.5,0,0,0,6.5,0Z"/><path d="M17.5,0A3.5,3.5,0,0,0,14,3.5v17a3.5,3.5,0,0,0,7,0V3.5A3.5,3.5,0,0,0,17.5,0Z"/></svg>`;
}
function pauseTrack(){
    resetStrokes();
    curr_track.pause();
    isPlaying = false;
    track_cover.classList.remove('rotate');
    play_pause_btn.innerHTML = `<svg className="center-button-svg" xmlns="http://www.w3.org/2000/svg" id="Filled" viewBox="0 0 24 24"
             fill="rgb(67,54,60)" width="20" height="20">
            <path
                d="M20.492,7.969,10.954.975A5,5,0,0,0,3,5.005V19a4.994,4.994,0,0,0,7.954,4.03l9.538-6.994a5,5,0,0,0,0-8.062Z"/>
        </svg>`;
    console.log("hello");
}
function nextTrack(){
    if(track_index < music_list.length - 1 && isRandom === false){
        track_index += 1;
    }else if(track_index < music_list.length - 1 && isRandom === true){
        track_index = Number.parseInt(Math.random() * music_list.length);
    }else{
        track_index = 0;
    }
    loadTrack(track_index);
    playTrack();
}
function prevTrack(){
    if(track_index > 0){
        track_index -= 1;
    }else{
        track_index = music_list.length -1;
    }
    loadTrack(track_index);
    playTrack();
}
function seekTo(){
    curr_track.currentTime = curr_track.duration * (seek_slider.value / 100);
}
function setVolume(){
    curr_track.volume = volume_slider.value / 100;
}
function setUpdate(){
    let seekPosition = 0;
    if(!isNaN(curr_track.duration)){
        seekPosition = curr_track.currentTime * (100 / curr_track.duration);
        seek_slider.value = seekPosition;

        let currentMinutes = Math.floor(curr_track.currentTime / 60);
        let currentSeconds = Math.floor(curr_track.currentTime - currentMinutes * 60);
        let durationMinutes = Math.floor(curr_track.duration / 60);
        let durationSeconds = Math.floor(curr_track.duration - durationMinutes * 60);

        if(currentSeconds < 10) {currentSeconds = "0" + currentSeconds; }
        if(durationSeconds < 10) { durationSeconds = "0" + durationSeconds; }
        if(currentMinutes < 10) {currentMinutes = "0" + currentMinutes; }
        if(durationMinutes < 10) { durationMinutes = "0" + durationMinutes; }

        curr_time.textContent = currentMinutes + ":" + currentSeconds;
        total_duration.textContent = durationMinutes + ":" + durationSeconds;
    }
}

function resetStrokes(){
    visualizer_container.innerHTML = "";
}

function getStrokesMoving() {

    let NBR_OF_BARS = 50;
    let audio = curr_track;
    let ctx = new AudioContext();
    let audioSource;
    let analyzer;

    if (MEDIA_ELEMENT_NODES.has(audio)) {
        audioSource = MEDIA_ELEMENT_NODES.get(audio);
        analyzer = MEDIA_ELEMENT_ANALYZER.get(audio);

    } else {
        audioSource = ctx.createMediaElementSource(audio);
        analyzer = ctx.createAnalyser();
        audioSource.connect(analyzer);
        audioSource.connect(ctx.destination);
        MEDIA_ELEMENT_NODES.set(audio, audioSource);
        MEDIA_ELEMENT_ANALYZER.set(audio, analyzer);
    }

    let frequencyData = new Uint8Array(analyzer.frequencyBinCount);
    analyzer.getByteFrequencyData(frequencyData);

    for( let i = 0; i < NBR_OF_BARS; i++ ) {
        const bar = document.createElement("DIV");
        bar.setAttribute("id", "bar" + i);
        bar.setAttribute("class", "visualizer-container__bar");
        visualizer_container.appendChild(bar);

    }
    function renderFrame() {
        analyzer.getByteFrequencyData(frequencyData);
        for( let i = 0; i < NBR_OF_BARS; i++ ) {
            let index = (i + 10) * 2;
            let fd = frequencyData[index];
            let bar = document.querySelector("#bar" + i);
            if( !bar ) {
                continue;
            }
            let barHeight = Math.max(1, fd/10 || 0);
            bar.style.height = barHeight + "px";
        }
        window.requestAnimationFrame(renderFrame);
    }
    renderFrame();
}

document.addEventListener("DOMContentLoaded", function(){
    loadTrack(track_index);
});