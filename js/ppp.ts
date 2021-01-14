const WORLD_BANK_DATA_INDEX: number = 1
let SourcePPP: number = 0
let TargetPPP: number = 0
let PPPData: Record<string, Record<number, number>>

/**
 * Fetches the list of countries and their Purchasing Power Parity from The World Bank API
 *
 * @returns A Promise to a dictionary whose key is the country name and whose value is
 * a dictionary whose key is the date and whose value is the PPP value
 *
 */
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

/**
 * Populates the list of countries in the country select elements
 */
function populateCountries() : void {
    (Object.keys(PPPData) as Array<string>)
        .sort()
        .map((country: string) => {
            $('#sourceCountry').append($("<option></option>").text(country).val(country))
            $('#targetCountry').append($("<option></option>").text(country).val(country))
        })  
}

/**
 * Calculates and stores the PPP values for the currently selected countries
 */
function calculatePPP() : void {
    const sourceCountry: string = $('#sourceCountry').val() as string
    const targetCountry: string = $('#targetCountry').val() as string

    updateCountryText()

    SourcePPP = PPPData[sourceCountry][Math.max(...Object.keys(PPPData[sourceCountry]).map(x => parseInt(x)))]
    TargetPPP = PPPData[targetCountry][Math.max(...Object.keys(PPPData[targetCountry]).map(x => parseInt(x)))]

    updateTargetAmount()
}

/**
 * Calculates the resulting salary given the current input salary
 */
function updateTargetAmount() : void {
    const sourceAmount: number = parseFloat($('#sourceAmount').val() as string)
    if (sourceAmount && sourceAmount > 0 || sourceAmount == 0) {
        // @ts-ignore
        new bootstrap.Collapse($('#outputCollapse')[0], { toggle: false }).show()
        $('#sourceAmountLabel').text(`${sourceAmount.toFixed(2)}`)
        const targetAmount: number = sourceAmount / SourcePPP * TargetPPP
        $('#output').val(`${targetAmount.toFixed(2)}`)
        $('#targetAmount').text(`${targetAmount.toFixed(2)}`)
    }
    else {
        // @ts-ignore
        new bootstrap.Collapse($('#outputCollapse')[0], { toggle: false }).hide()
        $('#sourceAmountLabel').text('_______')
        $('#output').val('')
        $('#targetAmount').text('_______')
    }
    // Return focus to the source salary input
    window.setTimeout(function () { 
        document.getElementById('sourceAmount').focus(); 
    }, 0)
}

/**
 * Update all of the country names on the page
 */
function updateCountryText() : void {
    $('#sourceCountryName, #sourceCountryLabel').text($('#sourceCountry').val() as string)
    $('#targetCountryName').text($('#targetCountry').val() as string)
}

/**
 * Perform a one-time initialization of the entire page
 */
async function initialize() : Promise<void> {
    PPPData = await getCountryAndPPPData()
    populateCountries()
    calculatePPP()
}

/**
 * This is a requirement for our fancy searchable select boxes to work
 */
$(function() {
    $('.searchableSelect').select2({
        theme: 'bootstrap4',
    });
});