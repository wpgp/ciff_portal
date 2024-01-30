import { React, useState, useMemo } from 'react';
import { GroupSelect, SimpleSelect } from './Utils';
import { TheChart } from './Chart';
import { TheMap } from './Map';

import 'leaflet/dist/leaflet.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';

import { indDict, countries, pIndicator } from './Config';
import indicators from './data/indicators.json';

import stateBoundary from './data/IND_adm1.json'
import data from './data/IND_data.json'
import dataTable from './data/IND_table.json'
import agg_data from './data/IND_agg.json'

export default function MainApp(){
  const [countryShort, setCountryShort] = useState('India');
  const [region, setRegion] = useState('');
  const [exceedance, setExceedance] = useState({'level':'disabled', 'prob':0.0, 'direction':''})
  const [indicator, setIndicator] = useState('');

  const country = useMemo(() => {
    return countries.filter((item) => item.Short === countryShort)[0]
  }, [countryShort]);

  //const stateBoundary = useMemo(() => (require(`./data/${country.Abbreviation}_adm1.json`)), [country]);
  //const data = useMemo(() => (require(`./data/${country.Abbreviation}_data.json`)), [country]);
  //const dataTable = useMemo(() => (require(`./data/${country.Abbreviation}_table.json`)), [country]);
  //const agg_data = useMemo(() => (require(`./data/${country.Abbreviation}_aggregate.json`)), [country]);
  //const dataTable = useMemo(() => (data.features.map((item) => item.properties)), [data]);

  var selectedData = dataTable
  var filteredData = dataTable
  var filteredAggData = agg_data

  if (region) {
    selectedData = dataTable.filter((item) => {
      return item.state.replaceAll(' ','') === region
    })

    filteredData = selectedData.filter((item) => {
      let res = item.state.replaceAll(' ','') === region
      const val = item[`${indicator}_CH`]
      const pval = item[`${indicator}_CH_P`]

      const st = pIndicator.includes(indicator) ? ['ShowImprovement','ShowWorsening'] : ['ShowWorsening', 'ShowImprovement']
      if (exceedance.direction === st[0]) {
        res = res && (val > 0 && pval > exceedance.prob)
      } else if (exceedance.direction === st[1]) {
        res = res && (val <= 0 && pval < (100-exceedance.prob))
      }
      
      return res
    })

    filteredAggData = agg_data.filter((item) => {
        return item.State.replaceAll(' ','') === region
    })
  }

  const chart = useMemo(() => {
    if (region !== '' && indicator !== ''){      
      return (
      <TheChart country={country} data={filteredData} data0={selectedData} aggData={filteredAggData} selected={region} pass={setIndicator} exceed={exceedance} indicator={indicator}/>
    )} else {
      return (<></>)
    }
  }, [filteredData, filteredAggData, indicator, country, region, exceedance, selectedData])

  //to filter the table according to the change layer on map,
  //setFunc={[setRegion, setIndicator, setExceedance]}.
  //Otherwise, exclude setExceedance in setFunc
  const map = useMemo(() => {
    if (indicator !== ''){      
      return (
        <TheMap country={country} boundary={stateBoundary} data={data} selected={region} setFunc={[setRegion, setIndicator, setExceedance]} indicator={indicator}/>
      )} else {
      return (<></>)
    }

  }, [indicator, country, region, data, stateBoundary])

  return (
    <div className='container-fluid main-body'>
      <hr/>
      <blockquote className='blockquote text-center p-3'>
        <h2 className='display-5'>Subnational mapping of child and maternal health and development indicators in selected low- and middle-income countries</h2>
      </blockquote>
      <hr/>

      <div className='row mt-3 p-3 mb-3 rounded-3 bg-secondary-subtle'>
        <div className='row d-flex justify-content-between'>
        <div className='col-lg-8'>
          <p>This web application presents a summary of the child and maternal health and development indicators calculated at subnational level (geographic areas below the national level) for a selection of countries of interest to CIFF.</p>
          <p>Multiple indicators are presented in map, chart, and tabulated form, and for multiple time points based on data availability. Changes over time for each indicator are also presented.</p>
          <p>Please consult the Guide and the About sections for more information on how to use this portal.</p>
          {/*<p style={{color:'red', fontWeight:'bold', border:'2px solid red', padding:'10px'}}>The data used for this prototype are not real data but made up for the purpose of purely presenting the design of the application, and therefore no inference should be made about any of the indicator's values, distributions, and patterns.</p>*/}
        </div>
        <div className='col-lg-4 p-3' id='selection'>
          <b>Select country</b>
          <SimpleSelect
            name='Country'
            items={['India']}
            //defaultOpt={country.Name}
            pass={setCountryShort}
            noDefault={true}/>
          <br/>

          <b>Select indicator</b>
          <GroupSelect
            items={indicators} 
            keys={['Theme', 'Indicator']} 
            fixed={['Theme']}
            lead={['Theme']}
            end={'Indicator'}
            //defaultOpt={visDict[indicator]['Short']}
            pass={(short) => {setIndicator(indDict[short]['Abbreviation']);}}/>
        </div>
        </div>
      </div>

      <div className='row p-0 m-0'>
        <div className='col-md-7 m-0 p-0'>
          {map}
        </div>

        <div className='col-md-5 m-0 p-0'>
          {chart}
        </div>
      </div>
    </div>
  )
}