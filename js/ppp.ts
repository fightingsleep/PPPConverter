const WORLD_BANK_DATA_INDEX: number = 1
const WORLD_BANK_AGGREGATE_TYPE: string = 'Aggregates'
let SourcePPP: number = 0
let TargetPPP: number = 0

function getCountries(): Promise<Record<string, string>> {
    return fetch('http://api.worldbank.org/v2/country/all?format=json&per_page=20000')
        .then(response => response.json())
        .then(data => data[WORLD_BANK_DATA_INDEX]
            .filter(x => x.region.value != WORLD_BANK_AGGREGATE_TYPE)
            .map(x => { return {[x.name]: x.id} })
            .reduce((acc, curr) => { return {...acc, ...curr} }))
        .catch(() => { console.log("Failed to retrieve the list of countries"); return {}})
}

function getPppForCountry(country: string): Promise<Record<number, number>> {
    const year: number = new Date().getFullYear();
    return fetch(`https://api.worldbank.org/v2/en/country/${country}/indicator/PA.NUS.PPP?format=json&per_page=20000&source=2&date=${year - 5}:${year}`)
        .then(response => response.json())
        .then(data => data[WORLD_BANK_DATA_INDEX]
            .filter(x => x.value != null)
            .map(x => { return {[x.date]: x.value} })
            .reduce((acc, curr) => { return {...acc, ...curr} }))
        .catch(() => { console.log(`Failed to retrieve PPP for ${country}`); return {}})
}

async function populateCountries() : Promise<void> {
    await getCountries()
        .then(countries => (Object.keys(countries) as Array<string>)
            .sort()
            .map(country => {
                const sourceCountry = document.getElementById('sourceCountry')
                const targetCountry = document.getElementById('targetCountry')
                const opt = document.createElement('option')
                opt.value = countries[country]
                opt.appendChild(document.createTextNode(country))
                sourceCountry.appendChild(opt)
                targetCountry.appendChild(opt.cloneNode(true))
            }))
}

async function calculatePPP() : Promise<void> {
    const sourceCountry: string = (<HTMLInputElement>document.getElementById('sourceCountry')).value
    const targetCountry: string = (<HTMLInputElement>document.getElementById('targetCountry')).value

    const sourcePppList: Record<number, number> = await getPppForCountry(sourceCountry)
    const targetPppList: Record<number, number> = await getPppForCountry(targetCountry)

    const sourceDate: number = Math.max(...Object.keys(sourcePppList).map(x => parseInt(x)))
    const targetDate: number = Math.max(...Object.keys(targetPppList).map(x => parseInt(x)))

    SourcePPP = sourcePppList[sourceDate]
    TargetPPP = targetPppList[targetDate]

    updateTargetAmount()
}

function updateTargetAmount() : void {
    const sourceAmount: number = parseFloat((<HTMLInputElement>document.getElementById('sourceAmount')).value)
    const targetAmount: number = sourceAmount ? sourceAmount / SourcePPP * TargetPPP : 0;
    (<HTMLInputElement>document.getElementById('targetAmount')).value = `${targetAmount.toFixed(2)}`
}

async function initialize() {
    await populateCountries()
    await calculatePPP()   
}

$(document).ready(function() {
    $('.searchableSelect').select2({
        theme: 'bootstrap4',
    });
});