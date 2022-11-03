"use strict";

const updateSamplesBtnEl = document.querySelector("#updateSamplesBtn");

let isLoading = false;

const slots = [
  {
    id: "slot01",
    kbd: 65,
    name: "kick",
    tags: ["kick"],
    locked: false,
  },
  {
    id: "slot02",
    kbd: 83,
    name: "snare",
    tags: ["snare"],
    locked: false,
  },
  {
    id: "slot03",
    kbd: 68,
    name: "closed hh",
    tags: ["closed", "hihat"],
    locked: false,
  },
  {
    id: "slot04",
    kbd: 70,
    name: "open hh",
    tags: ["open", "hihat"],
    locked: false,
  },
];

const keyToSlot = {
  KeyA: "01",
  KeyS: "02",
  KeyD: "03",
  KeyF: "04",
};

async function getRandomSample(tags) {
  const tagsQuery = tags.map((tag) => "tag:" + tag).join("%20");

  const res = await fetch(
    `https://freesound.org/apiv2/search/text/?token=E1OojwrkSjrxZYsv1rdfzFh8Iqn8Pt50gBsSITJD&page_size=50&filter=${tagsQuery}%20ac_single_event:true%20ac_loop:false%20avg_rating:%5B3%20TO%20%2A%5D&fields=id,name,previews`
  );

  const data = await res.json();
  const samples = data.results;
  const sample =
    samples[Math.floor(Math.random() * samples.length)].previews[
      "preview-hq-ogg"
    ];

  return sample;
}

function setIsLoading(isLoadingState) {
  isLoading = isLoadingState;
  updateSamplesBtnEl.disabled = isLoading;
}

async function updateSamples(slots) {
  setIsLoading(true);

  let promisesIDs = [];
  let promises = [];

  for (let slot of slots) {
    if (slot.locked) continue;

    promisesIDs.push(slot.id);
    promises.push(getRandomSample(slot.tags));
  }

  console.log(promises);

  let srcs = await Promise.all(promises);
  console.log("— AWAITED — ");

  console.log(srcs);

  for (let [i, id] of promisesIDs.entries()) {
    const audioEl = document.querySelector("#audio-" + id);
    audioEl.src = srcs[i];
  }

  setIsLoading(false);
}

// updateSamples(slots);

function playSound(slot) {
  if (isLoading) return;

  const audioEl = document.querySelector(`audio[data-slot="${slot}"]`);
  const slotEl = document.querySelector(`div[data-slot="${slot}"]`);

  if (!audioEl) return;

  slotEl.classList.add("playing");

  setTimeout(() => slotEl.classList.remove("playing"), 0);

  audioEl.currentTime = 0;
  audioEl.play();
}

const slotsElements = document.querySelectorAll("div[data-slot]");
slotsElements.forEach((slotEl) => {
  slotEl.addEventListener("click", () =>
    playSound(slotEl.getAttribute("data-slot"))
  );
});

updateSamplesBtnEl.addEventListener("click", () => {
  updateSamples(slots);
});

window.addEventListener("keydown", (e) => {
  playSound(keyToSlot[e.code]);
  console.log(e.code);
});
