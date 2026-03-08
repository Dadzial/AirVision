import homeIcon from '../assets/home.png';
import airIcon from '../assets/air.png';
import search from '../assets/search.png'
export const IconsParser = {
    homeIcon,
    airIcon,
    search
};

export const getIcon = (name: keyof typeof IconsParser) => IconsParser[name];