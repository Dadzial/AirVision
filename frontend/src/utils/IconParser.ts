export const IconsParser = {

};

export const getIcon = (name: keyof typeof IconsParser) => IconsParser[name];