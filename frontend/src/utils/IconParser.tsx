import homeIcon from '../assets/home.png';
import airIcon from '../assets/air.png';
import search from '../assets/search.png'

import greenStateIcon from '../assets/green_air_state.png'
import yellowStateIcon from '../assets/yellow_air_state.png'
import redStateIcon from '../assets/red_air_state.png'

import faceRed from '../assets/svg/face_red.svg'
import faceYellow from '../assets/svg/face_yellow.svg'
import faceGreen from '../assets/svg/face_green.svg'

export const IconsParser = {
    homeIcon,
    airIcon,
    search,

    greenStateIcon,
    yellowStateIcon,
    redStateIcon,

    faceRed,
    faceGreen,
    faceYellow
};

export const getIcon = (name: keyof typeof IconsParser) => IconsParser[name];