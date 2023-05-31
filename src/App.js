import { React, useState, useMemo } from 'react';
import { GroupSelect, SimpleSelect } from './Utils';
import { TheChart } from './Chart';
import { TheMap } from './Map';

import 'leaflet/dist/leaflet.css';
import './index.css';

import { indDict, visDict, countries } from './Config';
import indicators from './data/indicators.json';

export function App(){
  const [countryShort, setCountryShort] = useState('India');
  const [region, setRegion] = useState('');
  const [indicator, setIndicator] = useState('LBW');

  const country = useMemo(() => {
    return countries.filter((item) => item.Short === countryShort)[0]
  }, [countryShort]);

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

      <div className='row mt-4 pt-2 pb-2' style={{backgroundColor:'#f0f0f0', borderRadius:'10px'}}>
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