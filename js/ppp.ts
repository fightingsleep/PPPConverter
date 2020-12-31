const WORLD_BANK_DATA_INDEX: number = 1
let SourcePPP: number = 0
let TargetPPP: number = 0
let PPPData: Record<string, Record<number, number>>

function getCountryAndPPPData(): Promise<Record<string, Record<number, number>>> {
    const year: number = new Date().getFullYear();
    return fetch(`https://api.worldbank.org/v2/en/country/all/indicator/PA.NUS.PPP?format=json&per_page=20000&source=2&date=${year - 5}:${year}`)
        .then(response => response.json())
        .then(data => data[WORLD_BANK_DATA_INDEX]
            .filter(x => x.value != null)
            .map(x => { return { 'country': x.country.value, 'date': x.date, 'ppp': x.value } })
            .reduce((acc, curr) => {
                return {...acc, [curr.country]: {...(acc[curr.country] || []), [curr.date]: curr.ppp } } 
            }, {}))
        .catch(() => { console.log(`Failed to retrieve country & PPP data`); return {}})
}

function populateCountries() : void {
    (Object.keys(PPPData) as Array<string>)
        .sort()
        .map((country: string) => {
            const sourceCountry = document.getElementById('sourceCountry')
            const targetCountry = document.getElementById('targetCountry')
            const opt = document.createElement('option')
            opt.value = country
            opt.appendChild(document.createTextNode(country))
            sourceCountry.appendChild(opt)
            targetCountry.appendChild(opt.cloneNode(true))
        })
}

function calculatePPP() : void {
    const sourceCountry: string = (<HTMLInputElement>document.getElementById('sourceCountry')).value
    const targetCountry: string = (<HTMLInputElement>document.getElementById('targetCountry')).value;

    (<HTMLInputElement>document.getElementById('sourceCountryName')).textContent =
        (<HTMLInputElement>document.getElementById('sourceCountry')).value;

        (<HTMLInputElement>document.getElementById('targetCountryName')).textContent =
        (<HTMLInputElement>document.getElementById('targetCountry')).value

    SourcePPP = PPPData[sourceCountry][Math.max(...Object.keys(PPPData[sourceCountry]).map(x => parseInt(x)))]
    TargetPPP = PPPData[targetCountry][Math.max(...Object.keys(PPPData[targetCountry]).map(x => parseInt(x)))]

    updateTargetAmount()
}

function updateTargetAmount() : void {
    const sourceAmount: number = parseFloat((<HTMLInputElement>document.getElementById('sourceAmount')).value)
    const targetAmount: number = sourceAmount ? sourceAmount / SourcePPP * TargetPPP : 0;
    (<HTMLInputElement>document.getElementById('targetAmount')).value = `${targetAmount.toFixed(2)}`
}

async function initialize() {
    PPPData = await getCountryAndPPPData()
    populateCountries();
    calculatePPP()
}

$(function() {
    $('.searchableSelect').select2({
        theme: 'bootstrap4',
    });
});