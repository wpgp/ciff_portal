import { React, useState, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { useTable, useSortBy } from 'react-table';
import { Vega } from 'react-vega';
import Table from 'react-bootstrap/Table';
import { BsBarChartFill} from 'react-icons/bs';
import { Tab, Tabs } from 'react-bootstrap';
import { SimpleSelect, DecimalFormat, FloatFormat, GetColor, ArgMax, ArgMin } from './Utils';
import { Ask } from './Info';
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
                      {column.isSorted ? column.isSortedDesc ? ' \u2bc5' : ' \u2bc6' : ' \u2b24'}
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

const modalRoot = ReactDOM.createRoot(document.getElementById('modalBody'));

export function TheChart({ country, data, data0, aggData, indicator, pass, exceed }){
  const [sortChart, setSortChart] = useState('SortbyName');
  const [sorttype, setSorttype] = useState('ascending');

  const stateName = data0[0].state;
  const nodata = data.length === 0 ? <kbd>No data displayed. Modify the filter.</kbd> : ''

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
    {Header:'CH', accessor:`${indicator}_CH`, Cell:DecimalFormat, sortType:'basic'},
    {Header:`CI_CH`, accessor: `${indicator}_CHCI`, disableSortBy: true}
  ]
  
  const districtchart = useMemo(() => {
    return (
    <RangeChart input={data} field={indicator} sorter={sortChart} sorttype={sorttype}/>
  )}, [data, indicator, sortChart, sorttype])

  const showIndicators = () => {
    console.log('show modal')
    modalRoot.render(
      <div>
        <div className='p-0 m-0 mb-2'>
          The charts below summarise the average values of all indicators in <b>{stateName}</b>.
        </div>
        <div>
          <div className='float-start m-0 p-0'>
            <AllIndicators input={aggData} proportional={true}/>
          </div>
          <div className='float-end m-0 p-0'>
            <AllIndicators input={aggData} proportional={false}/>
          </div>
        </div>
      </div>
    )
    document.getElementById('modal').style.display = "block";
    document.getElementById('modalTitle').innerHTML = `<h4>All Indicator Comparison</h4>`;
  }

  const hilite = useMemo(() => {
    return (
      ['_R1', '_R2', '_CH'].map((item) => {
        let obj = {}
        const y = data0.map((x) => x[indicator+item])
        const z = data0.map((x) => x['district'])
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
  }, [data0, indicator])
  
  const sortButton = (
    <div className=' p-2'>
      <button className='map-btn' title={'reverse sort'} onClick={() => {setSorttype(sorttype === 'ascending' ? 'descending' : 'ascending')}}>
        {(sorttype === 'ascending') ? ' \u2bc6' : ' \u2bc5'}
      </button>
    </div>
  )

  const summaryTab = (
    <div style={{fontSize:'90%'}}>
      <p>
        In the {adm1} of <b>{stateName}</b>, approximately {hilite[0]['avg']}{description['Unit']} {description['Statement']} in round 1 ({description['R1']}, {description['Y1']}) and {hilite[1]['avg']}{description['Unit']} in round 2 ({description['R2']}, {description['Y2']}).
      </p>
      <p>
        The {adm2} of <b>{hilite[2]['best']}</b> experienced the highest {pIndicator.includes(indicator) ? 'increase': 'decrease (lowest increase)'} in {description['Unit']} of {(description['Indicator']).toLowerCase()} with a {hilite[2]['bestVal']}{description['Unit']} change from round 1 ({description['R1']}, {description['Y1']}) to round 2 ({description['R2']}, {description['Y2']}), showing an improvement in conditions.
      </p>
      <p><span onClick={() => showIndicators()}><BsBarChartFill/></span> Compare with other indicators</p>
    </div>
  )

  const chartTab = (
    <div id="charte">
      <p style={{fontSize:'90%'}}>
      The chart below summarises the indicator values aggregated at {adm2} level. Credible intervals <b>(CIs)</b> with 95% significance for round 1 <b>(R1)</b> and round 2 <b>(R2)</b> are represented as washout rectangles around the mean values.
      </p>
      <p style={{fontSize:'80%'}}>
      The data can be sorted by name, round 1 <b>(R1)</b> values, round 2 <b>(R2)</b> values and change <b>(CH)</b> values by clicking on each heading.
      </p>
      <hr/>
      <div className='row'>
      <div className='d-flex justify-content-between'>
        <div className='col-6 pt-2'><h6>{visDict[indicator]['Indicator']}</h6></div>
        <div className='col-4' style={{width:'180px'}}>
          <SimpleSelect 
            items={['Sort by Name', 'Sort by R1', 'Sort by R2', 'Sort by Change']} 
            defaultOpt={'SortbyName'}
            noDefault={true}
            name={'sortChart'}
            value={sortChart}
            pass={setSortChart}
          />
        </div>
        {sortButton}
      </div>
      <div style={{maxHeight:'440px', overflowY:'auto'}}>
        {districtchart}
      </div>
      <div style={{fontSize:'90%'}}>
        {nodata}
      </div>
      </div>
    </div>
  )

  const tableTab = (
    <div>
      <p style={{fontSize:'90%'}}>
      The table below summarises the indicator values aggregated at {adm2} level. Credible intervals <b>(CIs)</b> with 95% significance for round 1 <b>(R1)</b> and round 2 <b>(R2)</b> can be found in brackets.
      </p>
      <p style={{fontSize:'80%'}}>
      The data can be sorted by name, round 1 <b>(R1)</b> values, round 2 <b>(R2)</b> values and change <b>(CH)</b> values by clicking on each heading.
      </p>
      <hr/>
      <div className='row'>
      <div className='float-start pt-2'><h6>{visDict[indicator]['Indicator']}</h6></div>
      <div style={{maxHeight:'490px', overflowY:'auto'}}>
        {<MakeTable columns={columns} data={data} palette={palette}/>}
      </div>
      <div style={{fontSize:'90%'}}>
        {nodata}
      </div>
      </div>
    </div>
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
        <h5 style={{padding:'5px', borderRadius:'5px', background:'#cfcccc', color:'#000'}}>{stateName} ({data0.length} {adm2}s)</h5>
        <div className='row m-0 p-0'>
          <Table striped bordered hover size='sm'>
            <thead>
              <tr>
                <td>
                  <Ask about='How to read table' />
                </td><td>Round 1</td><td>Round 2</td><td>Change</td>
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

      <Tabs
        defaultActiveKey="summary"
        id="data-tabs"
        className="mt-3"
      >
        <Tab eventKey="summary" title="Summary">
          {summaryTab}
        </Tab>
        <Tab eventKey="table" title="Table">
          {tableTab}
        </Tab>
        <Tab eventKey="chart" title="Chart">
          {chartTab}
        </Tab>
      </Tabs>

    </div>
  )
}