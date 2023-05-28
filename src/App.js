import { React, useState, useMemo } from 'react';
import { GroupSelect, SimpleSelect } from './Utils';
import { TheChart } from './Chart';
import { TheMap } from './Map';

import 'leaflet/dist/leaflet.css';
import './index.css';

import { indDict, visDict } from './Config';
import indicators from './data/indicators.json';

const countries = [
  {'Country':'default', 'Abbreviation':'', 'Center':[0, 0], 'Zoom':4},
  {'Country':'Burkina Faso', 'Abbreviation':'BFA', 'Center':[12.7, -1.8], 'Zoom':6},
  {'Country':'Cambodia', 'Abbreviation':'KHM', 'Center':[12.7, 104.9], 'Zoom':6},
  {'Country':'India', 'Abbreviation':'IND', 'Center':[22.9, 79.6], 'Zoom':4},
  {'Country':'Kenya', 'Abbreviation':'KEN', 'Center':[0.6, 37.8], 'Zoom':5},
  {'Country':'Nigeria', 'Abbreviation':'NGA', 'Center':[9.5, 8.0], 'Zoom':5},
]
const countryDict = {};
countries.forEach((item) => {
  const short = item.Country.replaceAll(' ','');
  countryDict[short] = {};
  countryDict[short]['Name'] = item.Country;
  countryDict[short]['Abbreviation'] = item.Abbreviation;
  countryDict[short]['Center'] = item.Center;
  countryDict[short]['Zoom'] = item.Zoom;
});

export function App(){
  const [countryShort, setCountryShort] = useState('India');
  const [region, setRegion] = useState('');
  const [indicator, setIndicator] = useState('LBW');

  const country = useMemo(() => (countryDict[countryShort]), [countryShort]);
  const stateBoundary = useMemo(() => (require(`./data/${country.Abbreviation}_adm1.json`)), [country]);
  const data = useMemo(() => (require(`./data/${country.Abbreviation}_data.json`)), [country]);
  const agg_data = useMemo(() => (require(`./data/${country.Abbreviation}_aggregate.json`)), [country]);
  const dataTable = useMemo(() => (data.features.map((item) => item.properties)), [data]);

  var filteredData = dataTable
  var filteredAggData = agg_data

  if (region) {
    filteredData = dataTable.filter((item) => {
        return item.state.replaceAll(' ','') === region
    })
    filteredAggData = agg_data.filter((item) => {
        return item.State.replaceAll(' ','') === region
    })
  }

  const chart = useMemo(() => {
    if (region !== ''){      
      return (
      <TheChart country={country} data={filteredData} aggData={filteredAggData} selected={region} pass={setIndicator} indicator={indicator}/>
    )} else {
      return (<></>)
    }
  }, [filteredData, filteredAggData, indicator, country, region])

  const map = useMemo(() => (
    <TheMap country={country} boundary={stateBoundary} data={data} selected={region} pass={setRegion} indicator={indicator}/>
  ), [indicator, country, region, data, stateBoundary])

  return (
    <div className='container-fluid main-body'>
      <hr/>
      <blockquote className='blockquote text-center p-3'>
        <q><i>Subnational mapping of child and maternal health and development indicators in selected low- and middle-income countries</i></q>
      </blockquote>
      <hr/>

      <div className='row pt-2 pb-2' style={{backgroundColor:'#f0f0f0', borderRadius:'10px'}}>
        <div className='col-lg-7'>
          <p>This web application presents a summary of the family health conditions at subnational level. Multiple indicators are presented in map, chart, and tabulated form.</p>
          <p style={{color:'red', fontWeight:'bold', border:'2px solid red', padding:'10px'}}>The data used for this prototype are not real data but made up for the purpose of purely presenting the design of the application, and therefore no inference should be made about any of the indicator's values, distributions, and patterns.</p>
        </div>
        <div className='col-lg-3' id='selection'>
          Select country
          <SimpleSelect
            name='Country'
            items={['India']}
            defaultOpt={country.Name}
            pass={setCountryShort}
            noDefault={true}/>
          <br/>

          Select indicator
          <GroupSelect
            items={indicators} 
            keys={['Theme', 'Indicator']} 
            fixed={['Theme']}
            lead={['Theme']}
            end={'Indicator'}
            defaultOpt={visDict[indicator]['Short']}
            pass={(short) => {setIndicator(indDict[short]['Abbreviation']); window.location='#mapContainer';}}/>
        </div>
      </div>

      <div className='row'>
        <div className='col-lg-7'>
          {map}
        </div>

        <div className='col-lg-5'>
          {chart}
        </div>
      </div>
    </div>
  )
}

export default App;