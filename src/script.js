"use strict";

const slotsContainerEl = document.querySelector("#slots_container");
const audiosContainerEl = document.querySelector("#audios_continer");
const newSamplesBtnEl = document.querySelector("#newSamplesBtn");

const slots = {};
const addSlot = (id, label, tags, src, key) =>
  (slots[id] = {
    label,
    tags,
    src,
    key,
    locked: false,
    loading: false,
  });

addSlot("slot01", "kick", ["kick"], "sounds/kick.wav", "A");
addSlot("slot02", "snare", ["snare"], "sounds/snare.wav", "S");
addSlot("slot03", "closed hh", ["closed", "hihat"], "sounds/hihat.wav", "D");
addSlot("slot04", "open hh", ["open", "hihat"], "sounds/openhat.wav", "F");

const keyToSlot = {};

for (let [slot, props] of Object.entries(slots)) {
  keyToSlot["Key" + props.key] = slot;

  //add elements to the DOM
  slotsContainerEl.innerHTML += `
  <div data-slot="${slot}" class="slot">
    <div class="slot__key">${props.key}
    </div>${props.label}
  </div>
  `;

  audiosContainerEl.innerHTML += `<audio data-slot="${slot}" src="${props.src}"></audio>`;
}

const isAnySlotLoading = () => {
  for (let [_, props] of Object.entries(slots)) {
    if (props.loading) return true;
  }
  return false;
};

async function getRandomSampleUrl(tags) {
  console.log(`getRandomSampleUrl(${tags})`);
  const tagsQuery = tags.map((tag) => "tag:" + tag).join("%20");

  const res = await fetch(
    `https://freesound.org/apiv2/search/text/?token=E1OojwrkSjrxZYsv1rdfzFh8Iqn8Pt50gBsSITJD&page_size=50&filter=${tagsQuery}%20ac_single_event:true%20ac_loop:false%20avg_rating:%5B3%20TO%20%2A%5D&fields=id,name,previews`
  );

  const data = await res.json();
  const urls = data.results;
  const url =
    urls[Math.floor(Math.random() * urls.length)].previews["preview-hq-ogg"];

  console.log(tags, url);
  return url;
}

async function newSampleInSlot(slot) {
  newSamplesBtnEl.disabled = isAnySlotLoading();
  const slotEl = document.querySelector(`div[data-slot="${slot}"]`);
  const audioEl = document.querySelector(`audio[data-slot="${slot}"]`);
  const oldInnerHTML = slotEl.innerHTML;

  slotEl.innerHTML = "Loading";
  slots[slot].loading = true;

  const src = await getRandomSampleUrl(slots[slot].tags);
  audioEl.src = src;
  slotEl.innerHTML = oldInnerHTML;
  slots[slot].loading = false;
  newSamplesBtnEl.disabled = isAnySlotLoading();
}

function newSamplesInAllSlots() {
  for (let [slot, props] of Object.entries(slots)) {
    if (props.locked) continue;
    console.log(slot);
    newSampleInSlot(slot);
  }
}

newSamplesInAllSlots();

function playSound(slot) {
  if (slots[slot].loading) return;

  const audioEl = document.querySelector(`audio[data-slot="${slot}"]`);
  const slotEl = document.querySelector(`div[data-slot="${slot}"]`);

  slotEl.classList.add("playing");

  setTimeout(() => slotEl.classList.remove("playing"), 0);

  audioEl.currentTime = 0;
  audioEl.play();
}

const slotsEls = document.querySelectorAll("div[data-slot]");
slotsEls.forEach((slotEl) => {
  slotEl.addEventListener("click", () =>
    playSound(slotEl.getAttribute("data-slot"))
  );
});

newSamplesBtnEl.addEventListener("click", () => {
  newSamplesInAllSlots();
});

window.addEventListener("keydown", (e) => {
  playSound(keyToSlot[e.code]);
  console.log(e.code);
});
