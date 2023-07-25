import { React, useState, useMemo } from 'react';
import { useTable, useSortBy } from 'react-table';
import { Vega } from 'react-vega';
import Table from 'react-bootstrap/Table';
import { BsInfoCircleFill } from 'react-icons/bs';
import { SimpleSelect, DecimalFormat, FloatFormat, GetColor, ArgMax, ArgMin } from './Utils';
import { visDict, pIndicator } from './Config';

import specs from './data/chart_spec.json';
import indicators from './data/indicators.json';

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
    <div style={{fontSize:'small'}}>
      <Table bordered hover size='sm'>
          <thead>
              {headerGroups.map((headerGroup, i) => (
                  <tr key={i}>
                      {headerGroup.headers.map((column, j) => (
                      <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                      {column.render('Header')}
                      <span>
                      {column.isSorted ? column.isSortedDesc ? ' \u2bc5' : ' \u2bc6' : ' '}
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
    </div>
  )
}

/*
function DistrictChart({ input, field, sorter, sorttype }){
  const fields = [field + "_R1", field + "_R2", field + "_CH"];
  const mapper = {
    'SortbyName':'district',
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
  spec.data[1].transform[2].expr = "datum." + mapper[sorter];
  spec.signals[0].value = 200;

  spec.marks[0].sort.order = sorttype;
  spec.marks[2].sort.order = [sorttype];

  spec.scales[0].domain = minmax;
  return <Vega spec={spec} actions={false} />
}
*/

function RangeChart({ input, field, sorter, sorttype }){
  const fields = [field + "_R1", field + "_R2", field + "_CH"];
  const mapper = {
    'SortbyName':'district',
    'SortbyLocation':'r',
    'SortbyR1': fields[0],
    'SortbyR2': fields[1],
    'SortbyChange': fields[2],
  };

  let spec = JSON.parse(JSON.stringify(specs['DistrictRanges']));

  spec.height = 20*input.length;
  spec.data[0].values = input;
  spec.data[1].transform[0].expr = "datum." + field + '_R1L';
  spec.data[1].transform[1].expr = "datum." + field + '_R1';
  spec.data[1].transform[2].expr = "datum." + field + '_R1U';
  spec.data[1].transform[3].expr = "datum." + field + '_R2L';
  spec.data[1].transform[4].expr = "datum." + field + '_R2';
  spec.data[1].transform[5].expr = "datum." + field + '_R2U';
  spec.data[1].transform[6].expr = "datum." + mapper[sorter];
  spec.scales[1].domain.sort.order = sorttype;

  return <Vega spec={spec} actions={false} />
}

/*
function AllIndicators({ input, proportional }){
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
*/

function howToTable(){
  var modal = document.getElementById("modal");
  var modalTitle = document.getElementById("modalTitle");
  var modalBody = document.getElementById("modalBody");
  var content;

  modal.style.display = "block";
  modalTitle.innerHTML = '<h4>How to read tables and charts</h4>';
  fetch('./aboutSummary.inc').then(resp => resp.text()).then(text => {
    content = text;
    modalBody.innerHTML = content;
  });
}

export function TheChart({ country, data, aggData, indicator, pass }){
  const [sortChart, setSortChart] = useState('SortbyName');
  const [sorttype, setSorttype] = useState('ascending');

  const stateName = data[0].state;

  const adm1 = String(country.Adm1).toLowerCase()
  const adm2 = String(country.Adm2).toLowerCase()
  const description = useMemo(() => {
    return indicators.filter((item) => item.Abbreviation === indicator)[0]
  }, [indicator]);

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
      return null
    })

    return obj
  }, [indicator])

  const columns = [
    {Header:`${country.Adm2} Name`, accessor:'district'},
    {Header:`R1`, accessor: `${indicator}_R1`, Cell:DecimalFormat, sortType:'basic'},
    {Header:`CI_R1`, accessor: `${indicator}_R1CI`, disableSortBy: true},
    {Header:'R2', accessor:`${indicator}_R2`, Cell:DecimalFormat, sortType:'basic'},
    {Header:`CI_R2`, accessor: `${indicator}_R2CI`, disableSortBy: true},
    {Header:'CH', accessor:`${indicator}_CH`, Cell:DecimalFormat, sortType:'basic'}
  ]
  
  const districtchart = useMemo(() => {
    return (
    <RangeChart input={data} field={indicator} sorter={sortChart} sorttype={sorttype}/>
  )}, [data, indicator, sortChart, sorttype])

  /*
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
  */

  const hilite = useMemo(() => {
    return (
      ['_R1', '_R2', '_CH'].map((item) => {
        let obj = {}
        const y = data.map((x) => x[indicator+item])
        const z = data.map((x) => x['district'])
        const maxi = ArgMax(y)
        const mini = ArgMin(y)

        obj['avg'] = FloatFormat(Average(y), 1)// + description['Unit'];
        if (pIndicator.includes(indicator)){
          obj['best'] = z[maxi]
          obj['worst'] = z[mini]
          obj['bestVal'] = FloatFormat(y[maxi], 1)
          obj['worstVal'] = FloatFormat(y[mini], 1)
        } else {
          obj['best'] = z[mini]
          obj['worst'] = z[maxi]
          obj['bestVal'] = FloatFormat(y[mini], 1)
          obj['worstVal'] = FloatFormat(y[maxi], 1)
        }
        return obj
      })
    )
  }, [data, indicator])
  
  const sortButton = (
    <div className='float-end p-2' style={{marginLeft:'10px'}}>
      <button className='map-btn' title={'reverse sort'} onClick={() => {setSorttype(sorttype === 'ascending' ? 'descending' : 'ascending')}}>
        {(sorttype === 'ascending') ? ' \u2bc6' : ' \u2bc5'}
      </button>
    </div>
  )

  const summaryTab = (
    <>
      <p style={{fontSize:'90%'}}>
        In the {adm1} of <b>{stateName}</b>, approximately {hilite[0]['avg']}{description['Unit']} {description['Statement']} in {description['Y1']} ({description['R1']}) and {hilite[1]['avg']}{description['Unit']} in {description['Y2']} ({description['R2']}).
      </p>
      <p>
        The {adm2} of <b>{hilite[2]['best']}</b> experienced the highest {pIndicator.includes(indicator) ? 'increase': 'decrease (lowest increase)'} in {description['Unit']} of {description['Indicator']} with a {hilite[2]['bestVal']}{description['Unit']} change from round 1 to round 2, showing an improvement in conditions.
      </p>
    </>
  )

  /*
  const indicatorsTab = (
    <>
      <p style={{fontSize:'90%'}}>
      Overall improvement in the selected {adm1} can also be assessed by comparing the aggregated (average) values of all indicators.
      </p>
      <hr/>
      {allindicators}
    </>
  )
  */

  const chartTab = (
    <div id="charte">
      <p style={{fontSize:'90%'}}>
      The chart below summarises the indicator values aggregated at {adm2} level.
      </p>
      <hr/>
      <div className='col m-0 p-0'>
        <div className='float-start pt-2'><h6>{visDict[indicator]['Indicator']}</h6></div>
        <div className='float-end' >{sortButton}</div>
        <div className='float-end' style={{width:'140px'}}>
          <SimpleSelect 
            items={['Sort by Name', 'Sort by Location', 'Sort by R1', 'Sort by R2', 'Sort by Change']} 
            defaultOpt={'SortbyName'}
            noDefault={true}
            name={'sortChart'}
            value={sortChart}
            pass={setSortChart}
          />
        </div>
      </div>
      {districtchart}
    </div>
  )

  const tableTab = (
    <>
      <div className='float-end'><span onClick={howToTable} title='How to read'><BsInfoCircleFill /></span></div>
      <p style={{fontSize:'90%'}}>
      The table below summarises the indicator values aggregated at {adm2} level.
      </p>
      <hr/>
      {<MakeTable columns={columns} data={data} palette={palette}/>}
    </>
  )

  return (
    <div className='row m-0 p-0'>
      <div className='title'>Detailed Data</div>
      <div className='pt-1 pb-2 frame' style={{fontSize:'100%'}}>
        <div>
          <p>{country.Adm2} and {adm1} level summary estimates are presented for the selected indicators and for each survey round and for the change between the two rounds.</p>
          <p>A summary chart for all indicators is also displayed, and it shows {country.Adm1} level aggregated values for all indicators and for each of the selected {country.Adm1}.</p>
        </div>
      </div>
    
      <div className='row m-0 info'>
        <h5 style={{padding:'5px', borderRadius:'5px', background:'#cfcccc', color:'#000'}}>{stateName} ({data.length} {adm2}s)</h5>
        <div className='row m-0 p-0'>
          <Table striped bordered hover size='sm'>
            <thead>
              <tr>
                <td><span onClick={howToTable} title='How to read'><BsInfoCircleFill /></span></td><td>Round 1</td><td>Round 2</td><td>Change</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{country.Adm1} Level Average</td><td>{hilite[0]['avg']}</td><td>{hilite[1]['avg']}</td><td>{hilite[2]['avg']}</td>
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
        <ul className="nav nav-tabs float-start" role='tablist'>
          <li className="nav-item">
            <a className="nav-link active" data-bs-toggle="tab" href="#summaryTab">Summary</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" data-bs-toggle="tab" href="#chartTab">Chart</a>
          </li>
          <li className="nav-item">
            <a className="nav-link" data-bs-toggle="tab" href="#tableTab">Table</a>
          </li>
          {/*
          <li className="nav-item">
            <a className="nav-link" data-bs-toggle="tab" href="#indicatorsTab" style={{fontWeight:'bold'}}>All Indicators</a>
          </li>
          */}
        </ul>
      </div>

      <div className='tab-content framed-content'>
        <div id='summaryTab' className='container tab-pane active'>{summaryTab}</div>
        <div id='chartTab' className='container tab-pane fade'>{chartTab}</div>
        <div id='tableTab' className='container tab-pane fade'>{tableTab}</div>
        {/*<div id='indicatorsTab' className='container tab-pane fade'>{indicatorsTab}</div>*/}
      </div>

    </div>
  )
}
