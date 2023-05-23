import { React, useState, useMemo } from 'react';
import { GroupSelect, SimpleSelect } from './Utils';
import { TheChart, AllIndicators } from './Chart';
import { TheMap } from './Map';

import 'leaflet/dist/leaflet.css';
import './index.css';

import { dataTable, indDict, visDict } from './Config';
import indicators from './data/indicators.json';

console.log(document.getElementsByClassName('leaflet-control-zoom-in'));

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

  var filteredData = data
  if (region) {
    filteredData = dataTable.filter((item) => {
        return item.state.replaceAll(' ','') === region
    })
  }

  const chart = useMemo(() => {
    if (region !== ''){      
      return (
      <TheChart country={country} data={filteredData} selected={region} pass={setIndicator} indicator={indicator}/>
    )} else {
      return (<></>)
    }
  }, [filteredData, indicator, country, region])

  const map = useMemo(() => (
    <TheMap country={country} boundary={stateBoundary} data={data} selected={region} pass={setRegion} indicator={indicator}/>
  ), [indicator, country, region, data, stateBoundary])

  const allindicators = useMemo(() => {
    if (region){
      return (<AllIndicators data={filteredData} country={country} selected={region} pass={setIndicator} />)
    } else {
      return (<></>)
    }
  }, [country, region, filteredData])

  return (
    <div className='row m-0 p-5 pt-1 pb-1'>
      <div className='row m-0 p-0 mb-2'>
        <div className='col-8 m-0 p-3'>
          In vitae massa at nisl rhoncus fermentum. Cras suscipit sagittis dictum. In eleifend velit non fermentum maximus. Cras varius ante lacus, ac malesuada quam scelerisque et. Mauris accumsan metus libero, id consequat orci finibus et. Sed malesuada justo venenatis justo gravida, quis fringilla enim blandit. Maecenas sed tempor nisl. Sed dictum mauris vitae odio viverra imperdiet. Nunc sed enim ac neque mollis imperdiet. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </div>
        <div className='col-4 m-0 p-1 pt-3 pb-2' id='selection'>
          Select country from the list
          <SimpleSelect
            name='Country'
            items={['India']}
            defaultOpt={country.Name}
            pass={setCountryShort}
            noDefault={true}/>
          <br/>

          Select indicator from the list
          <GroupSelect
            items={indicators} 
            keys={['Theme', 'Indicator']} 
            fixed={['Theme']}
            lead={['Theme']}
            end={'Indicator'}
            defaultOpt={visDict[indicator]['Short']}
            pass={(short) => {setIndicator(indDict[short]['Abbreviation']); window.location='#mapContainer';}}/>
        </div>

        <hr/>
      </div>

      <div className='row m-0 p-0'>
        <div className='col' style={{marginLeft:'20px'}}>
          <div className='row'>
            {map}
            {allindicators}
          </div>
        </div>

        <div className='col-5'>
          {chart}
        </div>
      </div>
    </div>
  )
}

export default App;