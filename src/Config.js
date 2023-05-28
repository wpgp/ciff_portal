import indicators from './data/indicators.json';

export const pIndicator = indicators.filter((item) => item.Proportional).map((item) => item.Abbreviation);
export const nIndicator = indicators.filter((item) => !item.Proportional).map((item) => item.Abbreviation);

export var indDict = {}
export var visDict = {}
indicators.forEach((item) => {
  let short = item.Indicator.replaceAll(' ','')
  indDict[short] = {}
  indDict[short]['Indicator'] = item.Indicator
  indDict[short]['Abbreviation'] = item.Abbreviation

  visDict[item.Abbreviation] = {}
  visDict[item.Abbreviation]['Indicator'] = item.Indicator
  visDict[item.Abbreviation]['Short'] = item.Indicator.replaceAll(' ','')
  visDict[item.Abbreviation]['Abbreviation'] = item.Abbreviation
  visDict[item.Abbreviation]['Minmax'] = [item.Min, item.Max]
  visDict[item.Abbreviation]['Palette1'] = item.Palette1
  visDict[item.Abbreviation]['Palette2'] = item.Palette2
})