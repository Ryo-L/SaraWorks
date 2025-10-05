/* National game logic with Start Screen budget parsing (supports B / M shorthand) */
/* COUNTRIES, CROPS, ERAS, TURN_COUNT defined */

// ★ 新機能：各国の形を10x10のグリッドで定義 (1が国土、0が領海外)
const COUNTRY_SHAPES = {
  usa: [
    [0,0,0,0,0,0,0,0,0,0],
    [0,1,1,1,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,1,1,1,0],
    [0,0,0,1,1,1,1,1,0,0],
    [0,0,0,0,1,1,1,0,1,0],
    [0,0,0,0,0,0,0,1,1,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0]
  ],
  china: [
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,1,1,1,1,1,0,0,0],
    [0,1,1,1,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,1,1,1,0],
    [0,0,0,1,1,1,1,1,0,0],
    [0,0,0,0,1,1,1,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0]
  ],
  india: [
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,1,1,1,0,0,0,0],
    [0,0,1,1,1,1,1,0,0,0],
    [0,0,1,1,1,1,1,1,0,0],
    [0,0,0,1,1,1,1,0,0,0],
    [0,0,0,0,1,1,0,0,0,0],
    [0,0,0,0,0,1,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0]
  ],
  brazil: [
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,1,1,1,0,0,0],
    [0,0,0,1,1,1,1,1,0,0],
    [0,0,1,1,1,1,1,1,0,0],
    [0,0,1,1,1,1,1,0,0,0],
    [0,0,0,1,1,1,1,0,0,0],
    [0,0,0,0,1,1,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0]
  ],
  egypt: [
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,1,1,0,0,0,0],
    [0,0,0,0,1,1,0,0,0,0],
    [0,0,0,0,0,1,0,0,0,0],
    [0,0,0,0,0,1,0,0,0,0],
    [0,0,0,0,1,1,0,0,0,0],
    [0,0,0,0,1,0,0,0,0,0],
    [0,0,0,0,1,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0]
  ],
  ireland: [
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,1,1,0,0,0,0],
    [0,0,0,1,1,1,1,0,0,0],
    [0,0,0,1,1,1,0,0,0,0],
    [0,0,0,0,1,1,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0]
  ]
};

const COUNTRIES = {
  usa: {name:'United States', startingBudget:200000000000, climate:'temperate', preferred:'corn', description:'Large temperate plains — corn and wheat thrive.', flag:'🇺🇸'},
  china: {name:'China', startingBudget:180000000000, climate:'varied', preferred:'rice', description:'Diverse climates — rice dominates irrigated regions.', flag:'🇨🇳'},
  india: {name:'India', startingBudget:120000000000, climate:'tropical', preferred:'rice', description:'Monsoon climates favor rice and diverse crops.', flag:'🇮🇳'},
  brazil: {name:'Brazil', startingBudget:90000000000, climate:'tropical', preferred:'cassava', description:'Large tropics; cassava and soybeans common.', flag:'🇧🇷'},
  egypt: {name:'Egypt', startingBudget:60000000000, climate:'arid', preferred:'barley', description:'Arid river valley — irrigation is crucial.', flag:'🇪🇬'},
  ireland: {name:'Ireland', startingBudget:15000000000, climate:'cool', preferred:'potato', description:'Cool wet climate — potatoes historically important.', flag:'🇮🇪'}
};

const CROPS = {
  rice:{name:'Rice',basePrice:400,yieldFactor:1.0},
  wheat:{name:'Wheat',basePrice:300,yieldFactor:0.95},
  potato:{name:'Potato',basePrice:200,yieldFactor:0.85},
  corn:{name:'Corn',basePrice:250,yieldFactor:1.05},
  barley:{name:'Barley',basePrice:180,yieldFactor:0.8},
  cassava:{name:'Cassava',basePrice:150,yieldFactor:0.7}
};

const ERAS = ['Stone Age','Bronze Age','Iron Age','Medieval Era','Industrial Revolution','Modern Era','Spacefaring'];
const TURN_COUNT = 10;
const MAP_SIZE = 10;

const $ = s => document.querySelector(s);
const elements = {
  startScreen: $('#start-screen'),
  countrySelectRadios: document.getElementsByName('country'),
  budgetInput: $('#budget-input'),
  startButton: $('#start-button'),
  startError: $('#start-error'),
  header: $('#main-header'),
  selectedCountry: $('#selected-country'),
  gameContainer: $('#game-container'),
  turnCounter: $('#turn-counter'),
  maxTurns: $('#max-turns'),
  budgetValue: $('#budget-value'),
  totalFoodValue: $('#total-food-value'),
  envScoreValue: $('#env-score-value'),
  eraValue: $('#era-value'),
  cropValue: $('#crop-value'),
  ndviValue: $('#ndvi-value'),
  moistureValue: $('#moisture-value'),
  precipitationValue: $('#precipitation-value'),
  temperatureValue: $('#temperature-value'),
  map: $('#map'),
  cropSelect: $('#crop-select'),
  fertilizerSlider: $('#fertilizer-slider'),
  irrigationSlider: $('#irrigation-slider'),
  techSlider: $('#tech-slider'),
  fertilizerValue: $('#fertilizer-value'),
  irrigationValue: $('#irrigation-value'),
  techValue: $('#tech-value'),
  remainingBudget: $('#remaining-budget'),
  allocationWarning: $('#allocation-warning'),
  executeButton: $('#execute-turn-button'),
  autoAllocateButton: $('#auto-allocate-button'),
  turnResultText: $('#turn-result-text'),
  eventText: $('#event-text'),
  miniGraph: $('#mini-graph'),
  log: $('#log'),
  gameOverModal: $('#game-over-modal'),
  finalFood: $('#final-food'),
  finalEnv: $('#final-env'),
  finalTech: $('#final-tech'),
  finalScore: $('#final-score'),
  replayButton: $('#replay-button'),
  downloadLog: $('#download-log')
};

let state = {
  countryKey: null,
  turn: 0,
  budget: 0,
  totalFoodValue: 0,
  envScore: 70,
  techPoints: 0,
  eraIndex: 0,
  mapData: [],
  currentData: {},
  history: []
};

function parseBudgetInput(str){
  if(!str) return null;
  str = str.trim().toUpperCase();
  const m = str.match(/^([0-9]+(?:\.[0-9]+)?)\s*([BM])?$/);
  if(!m) return null;
  let val = parseFloat(m[1]);
  const suffix = m[2];
  if(suffix === 'B') val = val * 1e9;
  else if(suffix === 'M') val = val * 1e6;
  return Math.round(val);
}

function formatUSD(n){
  if (n===null||n===undefined) return '$0';
  if (Math.abs(n) >= 1e12) return '$' + (n/1e12).toFixed(2) + 'T';
  if (Math.abs(n) >= 1e9) return '$' + (n/1e9).toFixed(2) + 'B';
  if (Math.abs(n) >= 1e6) return '$' + (n/1e6).toFixed(2) + 'M';
  return '$' + n.toLocaleString();
}

function initStartScreen(){
  elements.startButton.addEventListener('click', onStart);
  elements.startError.textContent = '';
}

function getSelectedCountryKey(){
  for(const r of elements.countrySelectRadios){
    if(r.checked) return r.value;
  }
  return 'usa';
}

function onStart(){
  const countryKey = getSelectedCountryKey();
  const input = elements.budgetInput.value;
  const parsed = parseBudgetInput(input);
  if(parsed === null || isNaN(parsed) || parsed <= 0){
    elements.startError.textContent = 'Invalid budget. Use format like 200B or 500M.';
    return;
  }
  elements.startError.textContent = '';
  startGame(countryKey, parsed);
}

function startGame(countryKey, startingBudget){
  state.countryKey = countryKey;
  const c = COUNTRIES[countryKey];
  state.turn = 0;
  state.budget = startingBudget;
  state.totalFoodValue = 0;
  state.envScore = 70;
  state.techPoints = 0;
  state.eraIndex = 0;
  state.mapData = [];
  state.currentData = {};
  state.history = [];
  populateCrops(c.preferred);
  document.getElementById('start-screen').style.display='none';
  elements.header.style.display='flex';
  elements.gameContainer.style.display='grid';
  elements.selectedCountry.innerHTML = `<span class="flag">${c.flag}</span> <strong>${c.name}</strong> — Preferred: ${CROPS[c.preferred].name}`;
  elements.maxTurns.textContent = TURN_COUNT;
  log(`Mission started for ${c.name}. Starting budget ${formatUSD(state.budget)}.`);
  nextTurn();
}

function populateCrops(preferred){
  elements.cropSelect.innerHTML='';
  const order=[preferred,...Object.keys(CROPS).filter(k=>k!==preferred)];
  order.forEach(k=>{ const opt=document.createElement('option'); opt.value=k; opt.textContent=CROPS[k].name; elements.cropSelect.appendChild(opt); });
  elements.cropValue.textContent = CROPS[preferred].name;
}

function nextTurn(){
  state.turn++;
  if (state.turn > TURN_COUNT){ endGame(); return; }
  const base = generateBaseTurnData(state.countryKey, state.turn);
  state.currentData = base;
  state.mapData = generateMap(base.avgNdvi);
  renderUI();
  resetControls();
  log(`--- Turn ${state.turn} satellite feed received (avg NDVI ${base.avgNdvi.toFixed(2)}) ---`);
}

function generateBaseTurnData(countryKey, turn){
  const country = COUNTRIES[countryKey];
  let center = 0.5;
  switch(country.climate){
    case 'arid': center=0.35; break;
    case 'tropical': center=0.62; break;
    case 'temperate': center=0.56; break;
    case 'varied': center=0.5; break;
    case 'cool': center=0.48; break;
    default: center=0.5;
  }
  const season = 0.08 * Math.sin(turn*1.2 + Math.random());
  const noise = (Math.random()-0.5)*0.18;
  const avgNdvi = Math.max(0.05, Math.min(0.95, center + season + noise));
  const soilMoisture = Math.round((0.4 + (Math.random()*0.45)) * 100);
  const precipitation = Math.round( Math.max(0, (Math.random()*60) * (country.climate==='arid'?0.4:1.0)) );
  const temperature = Math.round(15 + (Math.random()*20) + (country.climate==='cool'?-5:0) + (country.climate==='tropical'?5:0));
  return {avgNdvi, soilMoisture, precipitation, temperature, turn};
}

function generateMap(avg){
  const arr = [];
  const countryShape = COUNTRY_SHAPES[state.countryKey];
  const landCells = countryShape.flat().filter(cell => cell === 1).length;

  for (let i = 0; i < landCells; i++) {
    let v = avg + (Math.random() - 0.5) * 0.45;
    v = Math.max(0.02, Math.min(0.98, v));
    arr.push(v);
  }
  return arr;
}

function renderUI(){
  elements.turnCounter.textContent=state.turn;
  elements.budgetValue.textContent=formatUSD(state.budget);
  elements.totalFoodValue.textContent=formatUSD(state.totalFoodValue);
  elements.envScoreValue.textContent=state.envScore;
  elements.eraValue.textContent=ERAS[state.eraIndex];
  const selCrop=elements.cropSelect.value || Object.keys(CROPS)[0];
  elements.cropValue.textContent=CROPS[selCrop].name;
  elements.ndviValue.textContent=state.currentData.avgNdvi.toFixed(2);
  elements.moistureValue.textContent=state.currentData.soilMoisture;
  elements.precipitationValue.textContent=state.currentData.precipitation;
  elements.temperatureValue.textContent=state.currentData.temperature;
  renderMap();
  drawMiniGraph();
  updateRemainingBudget();
}

function renderMap(){
  elements.map.innerHTML = '';
  const countryShape = COUNTRY_SHAPES[state.countryKey];
  let dataIndex = 0;

  for (let row = 0; row < MAP_SIZE; row++) {
    for (let col = 0; col < MAP_SIZE; col++) {
      const d = document.createElement('div');
      if (countryShape[row][col] === 1) {
        // 国土の場合
        const ndviValue = state.mapData[dataIndex];
        d.style.background = ndviToColor(ndviValue);
        d.title = `NDVI ${ndviValue.toFixed(2)}`;
        dataIndex++;
      } else {
        // 領海外の場合
        d.style.background = 'rgba(10, 20, 40, 0.3)';
        d.style.boxShadow = 'none';
      }
      elements.map.appendChild(d);
    }
  }
}

function ndviToColor(v){ if(v<0.2) return '#2b0b28'; if(v<0.35) return '#ff3b3b'; if(v<0.5) return '#ff9f3b'; if(v<0.7) return '#ffd93b'; if(v<0.85) return '#66ffb3'; return '#66ccff'; }

function resetControls(){ elements.fertilizerSlider.max=state.budget; elements.irrigationSlider.max=state.budget; elements.techSlider.max=state.budget; elements.fertilizerSlider.value=0; elements.irrigationSlider.value=0; elements.techSlider.value=0; updateRemainingBudget(); }

function updateRemainingBudget(){ const fert=Number(elements.fertilizerSlider.value)||0; const irri=Number(elements.irrigationSlider.value)||0; const tech=Number(elements.techSlider.value)||0; const total=fert+irri+tech; const remaining=state.budget-total; elements.fertilizerValue.textContent=formatUSD(fert); elements.irrigationValue.textContent=formatUSD(irri); elements.techValue.textContent=formatUSD(tech); elements.remainingBudget.textContent=formatUSD(remaining); if(remaining<0){ elements.allocationWarning.textContent='Over budget! Adjust allocations.'; elements.executeButton.disabled=true; } else { elements.allocationWarning.textContent=''; elements.executeButton.disabled=false; } }

function autoNormalize(){ let a=Number(elements.fertilizerSlider.value)||0; let b=Number(elements.irrigationSlider.value)||0; let c=Number(elements.techSlider.value)||0; const sum=a+b+c||1; const bud=state.budget; a=Math.round(a/sum*bud); b=Math.round(b/sum*bud); c=bud-a-b; elements.fertilizerSlider.value=a; elements.irrigationSlider.value=b; elements.techSlider.value=c; updateRemainingBudget(); }

function executeTurn(){
  const fert=Number(elements.fertilizerSlider.value)||0; const irri=Number(elements.irrigationSlider.value)||0; const tech=Number(elements.techSlider.value)||0; const total=fert+irri+tech; if(total>state.budget){ elements.allocationWarning.textContent='Over budget!'; return; }
  const cropKey=elements.cropSelect.value; const crop=CROPS[cropKey];
  const avgNdvi=state.currentData.avgNdvi;
  const mapQuality=state.mapData.reduce((s,v)=>s+v,0)/(state.mapData.length || 1);
  const eraMultiplier=1+state.eraIndex*0.12;
  const fertEffect=1 + (fert/(state.budget+1))*0.6;
  const irriEffect=1 + (irri/(state.budget+1))*0.5;
  const techEffect=1 + (state.techPoints/100)*0.8 + (tech/(state.budget+1))*0.4;
  let baseProduction=Math.round((100000 + Math.round(mapQuality*50000)) * avgNdvi * eraMultiplier * crop.yieldFactor);
  let production=Math.round(baseProduction * fertEffect * irriEffect * techEffect);

  let event='';
  if(state.currentData.precipitation<6 && state.currentData.temperature>28 && (irri < state.budget*0.2) && Math.random()<0.5){ production=Math.round(production*0.55); event='🚨 Drought severely reduced production.'; }
  if(!event && state.currentData.temperature>30 && Math.random()<0.3){ production=Math.round(production*0.75); event='🦠 Heat-linked pest outbreak reduced production.'; }
  if(!event && state.currentData.precipitation<12 && Math.random()<0.18){ production=Math.round(production*1.25); event='☔ Unexpected rain boosted production.'; }

  const revenue=Math.round(production * crop.basePrice);
  let envChange = - Math.round(Math.max(0, fert - state.budget*0.15)/(state.budget/1000000 + 1)) - Math.round(Math.max(0, irri - state.budget*0.25)/(state.budget/2000000 + 1));
  envChange += Math.round((state.techPoints/10));
  state.envScore = Math.max(0, Math.min(100, state.envScore + envChange));

  const techGain = Math.round( tech / 10000000 + Math.random()* (tech/50000000) );
  state.techPoints += techGain;
  const thresholds=[0,50,120,240,500,1200,2500];
  for(let i=thresholds.length-1;i>=0;i--){ if(state.techPoints>=thresholds[i]){ state.eraIndex = i; break; } }

  state.budget = Math.max(0, Math.round(state.budget - total + revenue));
  state.totalFoodValue += revenue;

  const record = {turn: state.turn, country: state.countryKey, crop: cropKey, production, revenue, fert, irri, tech, envChange, techPoints: state.techPoints, era: ERAS[state.eraIndex]};
  state.history.push(record);

  elements.turnResultText.textContent = `Produced ${production.toLocaleString()} tons of ${crop.name}, Revenue: ${formatUSD(revenue)}.`;
  elements.eventText.textContent = event || 'No major events this turn.';
  log(`Turn ${state.turn}: +${formatUSD(revenue)} revenue. ${event}`);

  setTimeout(()=>{ nextTurn(); }, 900);
}

function endGame(){ elements.finalFood.textContent=formatUSD(state.totalFoodValue); elements.finalEnv.textContent=state.envScore; elements.finalTech.textContent=ERAS[state.eraIndex]; const finalScore = Math.round(state.budget/1000000 + state.envScore*100 + state.eraIndex*1000); elements.finalScore.textContent=finalScore; elements.gameOverModal.classList.remove('modal-hidden'); elements.gameOverModal.classList.add('modal-visible'); elements.replayButton.addEventListener('click', ()=> location.reload()); elements.downloadLog.addEventListener('click', downloadHistory); log('Mission complete.'); }

function downloadHistory(){ const blob = new Blob([JSON.stringify(state.history, null, 2)], {type:'application/json'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'reverse_arc_national_log.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url); }

function drawMiniGraph(){ elements.miniGraph.innerHTML=''; const ndvi = Math.round(state.currentData.avgNdvi*100/2); const m = Math.round(state.currentData.soilMoisture/2); const p = Math.round(state.currentData.precipitation/2); [ndvi,m,p].forEach((v,i)=>{ const b = document.createElement('div'); b.className='bar'; b.style.height=(20+v)+'px'; if(i===0) b.style.background='linear-gradient(180deg,#ff9f3b,#ff3b3b)'; if(i===1) b.style.background='linear-gradient(180deg,#66ffb3,#22c55e)'; if(i===2) b.style.background='linear-gradient(180deg,#ffd93b,#f76b1c)'; elements.miniGraph.appendChild(b); }); }

function attachListeners(){ elements.fertilizerSlider.addEventListener('input', updateRemainingBudget); elements.irrigationSlider.addEventListener('input', updateRemainingBudget); elements.techSlider.addEventListener('input', updateRemainingBudget); elements.executeButton.addEventListener('click', executeTurn); elements.autoAllocateButton.addEventListener('click', autoNormalize); elements.cropSelect.addEventListener('change', ()=> { elements.cropValue.textContent = CROPS[elements.cropSelect.value].name; }); }

function log(msg){ const p=document.createElement('p'); p.textContent=msg; elements.log.appendChild(p); elements.log.scrollTop = elements.log.scrollHeight; }

document.addEventListener('DOMContentLoaded', ()=>{ initStartScreen(); attachListeners(); });