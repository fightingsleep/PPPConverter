const WORLD_BANK_DATA_INDEX = 1;
function getCountries() {
    return fetch('http://api.worldbank.org/v2/country/all?format=json&per_page=20000')
        .then(response => response.json())
        .then(data => {
        let dict = {};
        data[WORLD_BANK_DATA_INDEX].filter(x => x.region.value != 'Aggregates').map(x => dict[x.name] = x.id);
        return dict;
    });
}
function getPppForCountry(country) {
    const year = new Date().getFullYear();
    return fetch(`https://api.worldbank.org/v2/en/country/${country}/indicator/PA.NUS.PPP?format=json&per_page=20000&source=2&date=${year - 5}:${year}`)
        .then(response => response.json());
}
function populateCountries() {
    getCountries()
        .then(countries => Object.keys(countries)
        .sort()
        .map(country => {
        let source = document.getElementById('sourceCountry');
        let target = document.getElementById('targetCountry');
        let opt = document.createElement('option');
        opt.value = countries[country];
        opt.appendChild(document.createTextNode(country));
        source.appendChild(opt);
        target.appendChild(opt.cloneNode(true));
    }));
}
//# sourceMappingURL=ppp.js.map