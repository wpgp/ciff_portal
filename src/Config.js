import indicators from './data/indicators.json';

export const countries = [
  {'Name':'default', 'Short':'default', 'Abbreviation':'', 'Center':[0, 0], 'Zoom':4, 'Adm1':'', 'Adm2':''},
  {'Name':'Burkina Faso', 'Short':'BurkinaFaso', 'Abbreviation':'BFA', 'Center':[12.7, -1.8], 'Zoom':6, 'Adm1':'Region', 'Adm2':'Departments'},
  {'Name':'Cambodia', 'Short':'Cambodia', 'Abbreviation':'KHM', 'Center':[12.7, 104.9], 'Zoom':6, 'Adm1':'Province', 'Adm2':'District'},
  {'Name':'India', 'Short':'India', 'Abbreviation':'IND', 'Center':[22.9, 79.6], 'Zoom':4, 'Adm1':'State', 'Adm2':'District'},
  {'Name':'Kenya', 'Short':'Kenya', 'Abbreviation':'KEN', 'Center':[0.6, 37.8], 'Zoom':5, 'Adm1':'Province', 'Adm2':'District'},
  {'Name':'Nigeria', 'Short':'Nigeria', 'Abbreviation':'NGA', 'Center':[9.5, 8.0], 'Zoom':5, 'Adm1':'Province', 'Adm2':'LGA'},
]

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