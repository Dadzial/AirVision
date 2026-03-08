export const IconsParser = {
    homeIcon : require('../assets/home.png'),
    airIcon : require('../assets/air.png'),
};

export const getIcon = (name: keyof typeof IconsParser) => IconsParser[name];