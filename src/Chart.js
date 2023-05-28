import { React, useState, useMemo } from 'react';
import { useTable, useSortBy } from 'react-table';
import { Vega } from 'react-vega';
import Table from 'react-bootstrap/Table';
import Collapse from 'react-bootstrap/Collapse';
import { SimpleSelect, LookupTable, DecimalFormat, FloatFormat, GetColor, ArgMax, ArgMin } from './Utils';
import { visDict, pIndicator, nIndicator } from './Config';

import indicators from './data/indicators.json';
import specs from './data/chart_spec.json';
//import colormaps from './data/colormaps.json';

function Legend({ indicator }){
  const direction = (pIndicator.includes(indicator)) ? 'Higher value' : 'Lower value';
  return (
  <div className='m-0 p-1'>
    <svg height='100' width='100' style={{background:'#f0f0f0', borderRadius:'10px'}}>
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor='#2b2b2b' />
          <stop offset="100%" stopColor='#e90051' />
        </linearGradient>
      </defs>

      <text x='50' y='30' fill='black' textAnchor='middle' fontSize='10px' >
        <tspan x='50' y='15' textAnchor='middle'>{direction}</tspan>
        <tspan x='50' y='25' textAnchor='middle'>means</tspan>
        <tspan x='50' y='35' textAnchor='middle'>improvement</tspan>
      </text>
      <line x1='20' y1='50' x2='20' y2='65' stroke='black' strokeWidth='0.5px' />
      <line x1='80' y1='50' x2='80' y2='80' stroke='black' strokeWidth='0.5px' />
      <circle cx='20' cy='50' r='6' fill='#2b2b2b' stroke='#f0f0f0' strokeWidth='2px' />
      <circle cx='80' cy='50' r='6' fill='#e90051' stroke='#f0f0f0' strokeWidth='2px' />
      <rect x='20' y='49' width='60' height='2' fill='url(#grad1)' />
      <text x='10' y='75' fill='black' fontSize='10px' >R1{'\u25b9'}NFHS-4</text>
      <text x='37' y='90' fill='black' fontSize='10px' >R2{'\u25b9'}NFHS-5</text>
    </svg>
  </div>
)}

function Average(array) {
  return array.reduce((a, b) => a + b) / array.length;
}

function MakeTable({ columns, data, palette }) {
  const {
      getTableProps,
      getTableBodyProps,
      headerGroups,
      rows,
      prepareRow,
  } = useTable({
      columns,
      data,
  }, useSortBy
  )

  return (
      <Table bordered hover size='sm'>
          <thead>
              {headerGroups.map((headerGroup, i) => (
                  <tr key={i}>
                      {headerGroup.headers.map((column, j) => (
                      <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                      {column.render('Header')}
                      <span>
                      {column.isSorted ? column.isSortedDesc ? ' \u2bc5' : ' \u2bc6' : ' \u2bc8'}
                      </span>
                      </th>
                  ))}
                  </tr>
              ))}
          </thead>
          <tbody>
              {rows.map((row, i) => {
                  prepareRow(row);
                  return (
                      <tr key={i}>
                          {row.cells.map((cell, j) => {
                            let cstyle = {}
                            if (palette[cell.column.Header]) {
                              const color = GetColor(cell.value, palette[cell.column.Header]['Minmax'], palette[cell.column.Header]['Palette'])
                              cstyle['backgroundColor'] = color;
                            }
                            return (
                                <td key={j} style={cstyle}>{cell.render('Cell')}</td>
                                )
                          })}
                      </tr>
                  )}
              )}
          </tbody>
      </Table>
  )
}

function TwoPointChart({ input, field, sorter }){
  const fields = [field + "_R1", field + "_R2"];
  const mapper = {
    'SortbySub-unit':'district',
    'SortbyR1': fields[0],
    'SortbyR2': fields[1],
    'SortbyChange': field + '_CH',
  };

  const minmax = (visDict[field]['Minmax']);
  let spec = JSON.parse(JSON.stringify(specs['TwoPointSpec']));

  spec.signals[1].value = 20*input.length;
  spec.data[0].values = input;
  spec.data[1].transform[0].expr = "datum." + field + "_R1";
  spec.data[1].transform[1].expr = "datum." + field + "_R2";
  spec.data[2].transform[1].extent = minmax;
  //spec.marks[0].marks[0].encode.update.width.value = 0.25*(minmax[1] - minmax[0])
  //spec.data[3].bandwidth = (minmax[1] - minmax[0])/40;
  spec.scales[1].domain = minmax;
  spec.scales[3].domain = minmax;
  spec.scales[4].domain.sort.field = mapper[sorter];
  return <Vega spec={spec} actions={false} />
}

function DistrictChart({ input, field, sorter }){
  const fields = [field + "_R1", field + "_R2", field + "_CH"];
  const mapper = {
    'SortbySub-unit':'district',
    'SortbyLocation':'r',
    'SortbyR1': fields[0],
    'SortbyR2': fields[1],
    'SortbyChange': fields[2],
  };

  const minmax = (visDict[field]['Minmax']);
  let spec = JSON.parse(JSON.stringify(specs['DistrictBars']));

  spec.data[0].values = input;
  spec.data[1].transform[0].expr = "datum." + fields[0];
  spec.data[1].transform[1].expr = "datum." + fields[1];
  spec.signals[0].value = 200;
  
  spec.marks[2].sort.field = "datum[\"" + mapper[sorter] + "\"]";
  spec.scales[0].domain = minmax;
  return <Vega spec={spec} actions={false} />
}

function DensityChart({ input, field, minmax, xlabels=true, type='Histogram' }){
  let spec = JSON.parse(JSON.stringify(specs[`${type}Spec`]));
  spec.width = 210;
  spec.data[0].values = input;
  spec.data[1].transform[0].expr = "datum." + field + "_R1";
  spec.data[1].transform[1].expr = "datum." + field + "_R2";
  //spec.data[1].transform[1].bandwidth = Math.abs(0.025*(minmax[1] - minmax[0]));
  spec.data[1].transform[3].extent = [0,100];
  spec.scales[0].domain = minmax;

  if (xlabels) {
    spec.axes[0].labels = true;
  }
  return (
  <div className='row p-0' id={field}>
    <b style={{fontSize:'70%'}}>{visDict[field].Indicator}</b>
    <Vega spec={spec} actions={false} />
  </div>
  )
}

export function AllIn({ country, data, pass }){
  const info = LookupTable({'items':indicators, 'first':'Abbreviation', 'second':['R1','R2','Y1','Y2','Unit'], 'value':'C_Prev'});

  let concerning = [];
  
  const leftDensity = useMemo(() => {
    let y = {};
    return (<div className='row'>
      {pIndicator.map((item) => {
        const fields = [item+'_R1', item+'_R2'];
        y = data.map((x) => (x[fields[1]] - x[fields[0]]))
        if (Average(y) <= 0) {concerning.push(visDict[item])}
        return (
          <a key={'svg_'+item} className='svg-panel' href='#mapContainer' onClick={() => pass(item)}>
            <DensityChart key={item} input={data} field={item} minmax={[0,100]}/>
          </a>
        )
      })}
    </div>)
  }, [data, pass, concerning])

  const rightDensity = useMemo(() => {
    let y = {};
    return (
    <div className='row'>
      {nIndicator.map((item) => {
        const fields = [item+'_R1', item+'_R2'];
        y = data.map((x) => (x[fields[1]] - x[fields[0]]))
        if (Average(y) >= 0) {concerning.push(visDict[item])}
        return (
          <a key={'svg_'+item} className='svg-panel' href='#mapContainer' onClick={() => pass(item)}>
            <DensityChart key={item} input={data} field={item} minmax={[0,100]}/>
          </a>
        )
      })}
    </div>
  )}, [data, pass])

  const clength = concerning.length;

  return (
    <>
      <div className='row'>
        <div className='title'>Summary of All Indicators</div>
        <div className='frame' style={{fontSize:'90%'}}>
          How a region improves the level of well-being of its people can be seen in the following charts. 
          For each indicator, spatial variation of the indicator value can be observed from the smoothed distribution constructed. 
          By comparing the distribution of the first and second rounds, the level of improvement can be evaluated.
        </div>

        <div>
          <div className='row info'>
            <h5 style={{padding:'5px', borderRadius:'5px', background:'#cfcccc', color:'#000'}}>{data[0].state}, {country.Name} ({data.length} sub-unit)</h5>
            <div className='row m-0' style={{fontSize:'100%'}}>
              In this administrative unit, there are {clength} indicators without significant improvement.
              <ul>
                {concerning.map((c, index) => <li key={index} style={{width:'50%'}}>
                  <a href={`#${c.Abbreviation}`}>{c.Indicator}</a>
                </li>)}
              </ul>                
            </div>
          </div>
        </div>

        <div className='row m-0 p-0'>
          <div className='col-6 m-0 p-1'>
            <div className='row m-0 framed-content'>
            <div className='mb-2' style={{fontSize:'70%'}}>
              <span style={{color:'#8d8d8d'}}>{'\u2b24'}</span>{'\u25B9'} {info[0]}, {info[2]}<br/>
              <span style={{color:'#e9546e'}}>{'\u2b24'}</span>{'\u25B9'} {info[1]}, {info[3]}
            </div>
              <div style={{fontSize:'70%', paddingBottom:'10px', width:'250px', textAlign:'left'}}><b>An increase</b> of the indicators below means an improvement.</div>
              {leftDensity}
            </div>
          </div>
          <div className='col-6 m-0 p-1'>
            <div className='row m-0 framed-content'>
            <div className='mb-2' style={{fontSize:'70%'}}>
              <span style={{color:'#8d8d8d'}}>{'\u2b24'}</span>{'\u25B9'} {info[0]}, {info[2]}<br/>
              <span style={{color:'#e9546e'}}>{'\u2b24'}</span>{'\u25B9'} {info[1]}, {info[3]}
            </div>
              <div style={{fontSize:'70%', paddingBottom:'10px', width:'250px', textAlign:'left'}}><b>A decrease</b> of the indicators below means an improvement.</div>
              {rightDensity}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export function AllIndicators({ input, proportional }){
  let spec = JSON.parse(JSON.stringify(specs['StateAggregate']));
  spec.data[0].values = input;

  if (proportional) {
    spec.title.text = "An increase in the indicator below means improvement";
    spec.data[1].transform[0].expr = "(datum.Proportional === true)";
  } else {
    spec.title.text = "A decrease in the indicator below means improvement";
    spec.data[1].transform[0].expr = "(datum.Proportional === false)";
  }

  spec.signals[0].value = 150;
  return <Vega spec={spec} actions={false} />
}

export function AllIndicatorsDistribution({ input, proportional }){
  let spec = JSON.parse(JSON.stringify(specs['StateAggregateDistribution']));
  spec.data[0].values = input;

  if (proportional) {
    spec.title.text = "An increase in the indicator below means improvement";
    spec.data[1].transform[2].expr = "(datum.Proportional === true)";
  } else {
    spec.title.text = "A decrease in the indicator below means improvement";
    spec.data[1].transform[2].expr = "(datum.Proportional === false)";
  }

  spec.signals[0].value = 150;
  return <Vega spec={spec} actions={false} />
}

export function TheChart({ country, data, aggData, indicator, selected, pass }){
  const [sortChart, setSortChart] = useState('SortbySub-unit');

  const stateName = data[0].state;

  let palette = useMemo(() => {
    let obj = {}
    const x = ['R1', 'R2', 'CH'].map((item) => {
      obj[item] = {}
      const minmax = visDict[indicator]['Minmax']
      if (item === 'CH') {
        obj[item]['Palette'] = visDict[indicator]['Palette2']
        obj[item]['Minmax'] = [0.5*(minmax[0] - minmax[1]), 0.5*(minmax[1] - minmax[0])]
      } else {
        obj[item]['Palette'] = visDict[indicator]['Palette1']
        obj[item]['Minmax'] = minmax
      }
      return 0
    })

    return obj
  }, [indicator])

  const columns = [
    {Header:'Sub-unit Name', accessor:'district'},
    {Header:`R1`, accessor: `${indicator}_R1`, Cell:DecimalFormat, sortType:'basic'},
    {Header:'R2', accessor:`${indicator}_R2`, Cell:DecimalFormat, sortType:'basic'},
    {Header:'CH', accessor:`${indicator}_CH`, Cell:DecimalFormat, sortType:'basic'}
  ]
  
  const districtchart = useMemo(() => (
    <DistrictChart input={data} field={indicator} sorter={sortChart}/>
  ), [data, indicator, sortChart])

  const allindicators = useMemo(() => (
    <div className='row m-0 p-0'>
      <div className='float-end m-0 p-0'>
        <AllIndicators input={aggData} proportional={true}/>
      </div>
      <hr/>
      <div className='float-end m-0 p-0'>
        <AllIndicators input={aggData} proportional={false}/>
      </div>
    </div>
  ), [aggData])

  const hilite = ['_R1', '_R2', '_CH'].map((item) => {
    let obj = {}
    const y = data.map((x) => x[indicator+item])
    const z = data.map((x) => x['district'])
    obj['avg'] = FloatFormat(Average(y), 1) + '%';
    if (pIndicator.includes(indicator)){
      obj['best'] = z[ArgMax(y)]
      obj['worst'] = z[ArgMin(y)]
    } else {
      obj['best'] = z[ArgMin(y)]
      obj['worst'] = z[ArgMax(y)]
    }
    return obj
  })

  const summaryTab = (
    <>
      <p style={{fontSize:'90%'}}>
        Descriptive summary about the indicators from the selected administrative unit goes here.
      </p>
    </>
  )

  const indicatorsTab = (
    <>
      <p style={{fontSize:'90%'}}>
      Overall improvement in the selected administrative unit can also be assessed by comparing the aggregated (mean) values of all indicators.
      </p>
      <hr/>
      {allindicators}
    </>
  )

  const chartTab = (
    <>
      <p style={{fontSize:'90%'}}>
      The chart below summarizes the indicator values (in percentage) aggregated at sub-unit level.
      </p>
      <div className='m-0 p-0 mb-3' style={{width:'200px'}}>
        <SimpleSelect 
          items={['Sort by Sub-unit', 'Sort by Location', 'Sort by R1', 'Sort by R2', 'Sort by Change']} 
          defaultOpt={'SortbySub-unit'}
          noDefault={true}
          name={'sortChart'}
          pass={setSortChart}
        />
      </div>
      <hr/>
      <div className='m-0 p-0'><h6>{visDict[indicator]['Indicator']}</h6></div>
      {districtchart}
    </>
  )

  const tableTab = (
    <>
      <p style={{fontSize:'90%'}}>
      The table below summarizes the indicator values (in percentage) aggregated at sub-unit level.
      </p>
      <hr/>
      {<MakeTable columns={columns} data={data} palette={palette}/>}
    </>
  )

  return (
    <div className='row'>
      <div className='title'>Detailed Data</div>
      <div className='pt-1 pb-2 frame' style={{fontSize:'100%'}}>
        <div>
          <p>
            The indicator values from the first and second round survey are presented, including the change between the rounds. Those values are aggregated at sub-unit level.
          </p>
          <p>
            All indicators values are aggregated at unit level.
          </p>
        </div>
      </div>
    
      <div className='row m-0 info'>
        <h5 style={{padding:'5px', borderRadius:'5px', background:'#cfcccc', color:'#000'}}>{stateName} ({data.length} sub-unit)</h5>
        <div className='row m-0 p-0'>
          <Table striped bordered hover size='sm'>
            <thead>
              <tr>
                <td></td><td>Round 1</td><td>Round 2</td><td>Change</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Average</td><td>{hilite[0]['avg']}</td><td>{hilite[1]['avg']}</td><td>{hilite[2]['avg']}</td>
              </tr>
              <tr>
                <td>Highest Performing</td><td>{hilite[0]['best']}</td><td>{hilite[1]['best']}</td><td>{hilite[2]['best']}</td>
              </tr>
              <tr>
                <td>Least Performing</td><td>{hilite[0]['worst']}</td><td>{hilite[1]['worst']}</td><td>{hilite[2]['worst']}</td>
              </tr>
            </tbody>
          </Table>
        </div>
      </div>

      <div className='m-0 mt-3'>
        <ul className="nav nav-tabs" role='tablist'>
          <li className="nav-item">
            <a className="nav-link active" data-bs-toggle="tab" href="#summaryTab">Summary</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" data-bs-toggle="tab" href="#indicatorsTab">All Indicators</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" data-bs-toggle="tab" href="#chartTab">Chart</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" data-bs-toggle="tab" href="#tableTab">Table</a>
          </li>
        </ul>
      </div>

      <div className='tab-content framed-content'>
        <div id='summaryTab' className='container tab-pane active'>{summaryTab}</div>
        <div id='indicatorsTab' className='container tab-pane fade'>{indicatorsTab}</div>
        <div id='chartTab' className='container tab-pane fade'>{chartTab}</div>
        <div id='tableTab' className='container tab-pane fade'>{tableTab}</div>
      </div>

    </div>
  )
}
