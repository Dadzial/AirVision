import Poland from '../assets/flags/poland.png'
import England from '../assets/flags/england.png'
import Germany from '../assets/flags/germany.png'
import Austria from '../assets/flags/austria.png'
import Greece from '../assets/flags/greece.png'
import Slovakia from '../assets/flags/slovakia.png'
import Netherlands from '../assets/flags/netherlands.png'
import France from '../assets/flags/france.png'
import Spain from '../assets/flags/spain.png'
import CzechRepublic from '../assets/flags/the_czech_republic.png'
import Sweden from '../assets/flags/sweden.png'
import Italy from '../assets/flags/italy.png'


export const countryFlags: Record<string, string> = {
    PL: Poland,
    GB: England,
    DE: Germany,
    AT: Austria,
    GR: Greece,
    SK: Slovakia,
    NL: Netherlands,
    FR: France,
    ES: Spain,
    CZ: CzechRepublic,
    SE: Sweden,
    IT: Italy,
}


export const getFlagByCountryCode = (countryCode: string) => {
    return countryFlags[countryCode] || undefined;
};
