"use strict";

const updateSamplesBtnEl = document.querySelector("#updateSamplesBtn");

let isLoading = false;

const slots = [
  { id: "slot01", name: "kick", tags: ["kick"], locked: false },
  { id: "slot02", name: "snare", tags: ["snare"], locked: false },
  {
    id: "slot03",
    name: "closed hh",
    tags: ["closed", "hihat"],
    locked: false,
  },
  {
    id: "slot04",
    name: "open hh",
    tags: ["open", "hihat"],
    locked: false,
  },
];

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

updateSamples(slots);

function removeTransition(e) {
  console.log("transition end");

  // if (e.propertyName !== "transform") return;
  e.target.classList.remove("playing");
}

function playSound(e) {
  if (isLoading) return;

  const audioEl = document.querySelector(`audio[data-key="${e.keyCode}"]`);
  const slotEl = document.querySelector(`div[data-key="${e.keyCode}"]`);

  if (!audioEl) return;

  slotEl.classList.add("playing");
  audioEl.currentTime = 0;
  audioEl.play();
}

const slotsElements = document.querySelectorAll(".slot");
slotsElements.forEach((slotEl) =>
  slotEl.addEventListener("transitionend", removeTransition)
);

updateSamplesBtnEl.addEventListener("click", () => {
  updateSamples(slots);
});

window.addEventListener("keydown", playSound);
