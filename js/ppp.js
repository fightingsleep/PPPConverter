var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const WORLD_BANK_DATA_INDEX = 1;
const WORLD_BANK_AGGREGATE_TYPE = 'Aggregates';
let SourcePPP = 0;
let TargetPPP = 0;
function getCountries() {
    return fetch('http://api.worldbank.org/v2/country/all?format=json&per_page=20000')
        .then(response => response.json())
        .then(data => data[WORLD_BANK_DATA_INDEX]
        .filter(x => x.region.value != WORLD_BANK_AGGREGATE_TYPE)
        .map(x => { return { [x.name]: x.id }; })
        .reduce((acc, curr) => { return Object.assign(Object.assign({}, acc), curr); }))
        .catch(() => { console.log("Failed to retrieve the list of countries"); return {}; });
}
function getPppForCountry(country) {
    const year = new Date().getFullYear();
    return fetch(`https://api.worldbank.org/v2/en/country/${country}/indicator/PA.NUS.PPP?format=json&per_page=20000&source=2&date=${year - 5}:${year}`)
        .then(response => response.json())
        .then(data => data[WORLD_BANK_DATA_INDEX]
        .filter(x => x.value != null)
        .map(x => { return { [x.date]: x.value }; })
        .reduce((acc, curr) => { return Object.assign(Object.assign({}, acc), curr); }))
        .catch(() => { console.log(`Failed to retrieve PPP for ${country}`); return {}; });
}
function populateCountries() {
    return __awaiter(this, void 0, void 0, function* () {
        yield getCountries()
            .then(countries => Object.keys(countries)
            .sort()
            .map(country => {
            const sourceCountry = document.getElementById('sourceCountry');
            const targetCountry = document.getElementById('targetCountry');
            const opt = document.createElement('option');
            opt.value = countries[country];
            opt.appendChild(document.createTextNode(country));
            sourceCountry.appendChild(opt);
            targetCountry.appendChild(opt.cloneNode(true));
        }));
    });
}
function calculatePPP() {
    return __awaiter(this, void 0, void 0, function* () {
        const sourceCountry = document.getElementById('sourceCountry').value;
        const targetCountry = document.getElementById('targetCountry').value;
        const sourcePppList = yield getPppForCountry(sourceCountry);
        const targetPppList = yield getPppForCountry(targetCountry);
        const sourceDate = Math.max(...Object.keys(sourcePppList).map(x => parseInt(x)));
        const targetDate = Math.max(...Object.keys(targetPppList).map(x => parseInt(x)));
        SourcePPP = sourcePppList[sourceDate];
        TargetPPP = targetPppList[targetDate];
        updateTargetAmount();
    });
}
function updateTargetAmount() {
    const sourceAmount = parseFloat(document.getElementById('sourceAmount').value);
    const targetAmount = sourceAmount ? sourceAmount / SourcePPP * TargetPPP : 0;
    document.getElementById('targetAmount').value = `${targetAmount.toFixed(2)}`;
}
function initialize() {
    return __awaiter(this, void 0, void 0, function* () {
        yield populateCountries();
        yield calculatePPP();
    });
}
$(document).ready(function () {
    $('.searchableSelect').select2({
        theme: 'bootstrap4',
    });
});
//# sourceMappingURL=ppp.js.map