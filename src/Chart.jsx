import { useState, useMemo } from 'react';
import { useTable, useSortBy } from 'react-table';
import { Vega } from 'react-vega';
import Table from 'react-bootstrap/Table';
import { Tab, Tabs, Modal, Badge } from 'react-bootstrap';
import { SimpleSelect, FloatFormat, GetColor } from './Utils';
import { Ask } from './pages/Info';
import { pIndicator, indicatorDef } from './config';

import specs from './chart_spec.json';

function AllIndicators({ input, proportional }){
  let spec = JSON.parse(JSON.stringify(specs['AllInRanges']));
  spec.data[0].values = input;
  spec.width = Math.max(200, 100*Math.floor(window.innerWidth/500));

  if (proportional) {
    //spec.title.text = "An increase in the indicator below means improvement";
    spec.title.text = "Higher value means improvement"
    spec.data[1].transform[1].expr = "(datum.Proportional === true)";
  } else {
    //spec.title.text = "A decrease in the indicator below means improvement";
    spec.title.text = "Lower value means improvement"
    spec.data[1].transform[1].expr = "(datum.Proportional === false)";
  }

  return <Vega spec={spec} actions={false} />
}

function transformIndicators(obj, indicators){
  let new_obj = []
  indicators.forEach((key) => {
    new_obj.push({
        'State': obj['state'],
        'District': obj['district'],
        'R1L': obj[key+'_R1L'],
        'R1U': obj[key+'_R1U'],
        'R1': obj[key+'_R1'],
        'R2L': obj[key+'_R2L'],
        'R2U': obj[key+'_R2U'],
        'R2': obj[key+'_R2'],
        'Indicator': indicatorDef[key].Indicator,
        'Abbreviation': key,
        'Proportional': indicatorDef[key].Proportional
      })
    }
  )
  return new_obj
}

function ShowIndicators({ obj, indicators }){
  const [show,setShow] = useState(false)
  function handleShow(){setShow(true)}
  function handleHide(){setShow(false)}
  
  const new_obj = transformIndicators(obj.original, indicators)

  return (
      <div className="text-center m-0 p-0 mb-2">
          <i className='mx-1 pi pi-arrow-circle-right' title='Show all indicator comparison' onClick={handleShow}></i>

          <Modal show={show} onHide={handleHide} size='lg'>
              <Modal.Header closeButton><h4>All Indicator Comparison</h4></Modal.Header>
              <Modal.Body>
                <div>
                  <div className='p-0 m-0 mb-2'>
                    The charts below summarise the average values of all indicators in <b>{obj.original.district}, {obj.original.state}</b>.
                  </div>
                  <hr/>
                  <div className='row'>
                    <div className='d-flex justify-content-center'>
                      <AllIndicators input={new_obj} proportional={true}/>
                    </div>
                    <div className='d-flex justify-content-center'>
                      <AllIndicators input={new_obj} proportional={false}/>
                    </div>
                  </div>
                </div>
              </Modal.Body>
          </Modal>
      </div>
  )
}

function MakeTable({ columns, data, palette, indicators }) {
  if (data.length === 0){
    return <kbd>No data displayed. Modify the filter.</kbd>
  } else {
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
                      <td></td>
                        {headerGroup.headers.map((column, j) => (
                        <th key={j} {...column.getHeaderProps(column.getSortByToggleProps())}>
                        {column.render('Header')}
                        {column.disableSortBy ? <></> :
                          <span>
                            {column.isSorted ? column.isSortedDesc ? ' \u25b3' : ' \u25bd' : ' \u25cb'}
                          </span>}
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
                          <td><ShowIndicators obj={row} indicators={indicators}/></td>
                            {row.cells.map((cell, j) => {
                              let cstyle = {}
                              if (palette[cell.column.Header]) {
                                const color = GetColor(cell.value, palette[cell.column.Header]['Minmax'], palette[cell.column.Header]['Palette'])
                                cstyle['backgroundColor'] = color;
                                cstyle['fontWeight'] = 'bold';
                                cstyle['textAlign'] = cell.column.align;
                              } else if (cell.column.Header === '') {
                                cstyle['color'] = (cell.value === '\u25b2') ? 'limegreen' : 'red';
                              } else {
                                cstyle['textAlign'] = cell.column.align;
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
}

function MakeChart({ input, field }){
  if (input.length === 0){
    return <div><kbd>No data displayed. Modify the filter.</kbd></div>
  } else {
    const [sortChart, setSortChart] = useState('SortbyName');
    const [sortType, setSortType] = useState('ascending');
    
    const fields = [field + "_R1", field + "_R2", field + "_CH"];
    const mapper = {
      'SortbyName':'district',
      'SortbyR1': fields[0],
      'SortbyR2': fields[1],
      'SortbyChange': fields[2],
    };

    let spec = JSON.parse(JSON.stringify(specs['DistrictRanges']));

    spec.height = 25*input.length;
    spec.width = Math.max(300, 100*Math.floor(window.innerWidth/500));
    spec.data[0].values = input;
    spec.data[1].transform[0].expr = "datum." + field + '_R1L';
    spec.data[1].transform[1].expr = "datum." + field + '_R1';
    spec.data[1].transform[2].expr = "datum." + field + '_R1U';
    spec.data[1].transform[3].expr = "datum." + field + '_R2L';
    spec.data[1].transform[4].expr = "datum." + field + '_R2';
    spec.data[1].transform[5].expr = "datum." + field + '_R2U';
    spec.data[1].transform[6].expr = "datum." + mapper[sortChart];
    spec.scales[1].domain.sort.order = sortType;

    return (
      <div className='row'>
        <div className='p-0 mb-2'>
          <div className='float-start' style={{width:'180px'}}>
            <SimpleSelect 
              items={['Sort by Name', 'Sort by R1', 'Sort by R2', 'Sort by Change']} 
              defaultOpt={'SortbyName'}
              noDefault={true}
              name={'sortChart'}
              value={sortChart}
              pass={setSortChart}
            />
          </div>
          <div className='float-start m-2'>
            <button className='map-btn' title={'reverse sort'} onClick={() => {setSortType(sortType === 'ascending' ? 'descending' : 'ascending')}}>
              {(sortType === 'ascending') ? ' \u2bc6' : ' \u2bc5'}
            </button>
          </div>
        </div>
        <div style={{maxHeight:'560px', overflowY:'auto'}}>
          <Vega spec={spec} actions={false} />
        </div>
      </div>
    )
  }
}

export function Chart({ param, data, stat, filterFunc}){
  const length = data.length

  const stateName = length === 0 ? '' : data[0].state;
  const adm1 = String(param.config.Adm1).toLowerCase()
  const adm2 = String(param.config.Adm2).toLowerCase()
  const adm2s = adm2.slice(-1) === 'y' ? adm2.slice(0,-1) + 'ies' : adm2 + 's'
  const description = param.config.indicators[param.indicator]
  const indicators = Object.keys(param.config.indicators)
  const definition = indicatorDef[param.indicator]
  const rounds = ['R1', 'R2', 'CH']
  
  let filteredData = data.filter(filterFunc)
  filteredData = filteredData.map((row) => {
    const clr = pIndicator.includes(param.indicator) ? 
      ((row[param.indicator + '_CH'] > 0) ? 'limegreen' : 'red' ) :
      ((row[param.indicator + '_CH'] < 0) ? 'limegreen' : 'red')
    const arr = (row[param.indicator + '_CH']) ? 
      ((row[param.indicator + '_CH'] > 0) ? '\u25b2' : '\u25bc') :
      ''
    row['good'] = arr
    row['color'] = clr
    return row
  })
  
  let stateData = [structuredClone(filteredData[0])]
  let admHeader = param.config.Adm2 + ' Name'
  if (stateData[0] && param.config.StateOnly.includes(param.indicator)){
    stateData[0]['district'] = stateData[0]['state']
    admHeader = param.config.Adm1 + ' Name'
  }

  let palette = {}
  rounds.forEach((item) => {
    palette[item] = {}
    if (item === 'CH') {
      palette[item]['Palette'] = description.Palette2
      palette[item]['Minmax'] = [description.CHMin,description.CHMax]
    } else {
      palette[item]['Palette'] = description.Palette1
      palette[item]['Minmax'] = [description.Min,description.Max]
    }
  })

  function CellFormater({value}){
    if (value) {
      return parseFloat(value).toFixed(description['Precision'])
    } else {
      return '-'
    }
  }

  const columns = [
    {Header:`${admHeader}`, accessor:'district', align:'left'},
    {Header:`R1`, accessor: `${param.indicator}_R1`, Cell:CellFormater, sortType:'basic', align:'center'},
    {Header:`CI_R1`, accessor: `${param.indicator}_R1CI`, disableSortBy: true, align:'center'},
    {Header:'R2', accessor:`${param.indicator}_R2`, Cell:CellFormater, sortType:'basic', align:'center'},
    {Header:`CI_R2`, accessor: `${param.indicator}_R2CI`, disableSortBy: true, align:'center'},
    {Header:'CH', accessor:`${param.indicator}_CH`, Cell:CellFormater, sortType:'basic', align:'center'},
    {Header:`CI_CH`, accessor: `${param.indicator}_CHCI`, disableSortBy: true, align:'center'},
    {Header:``, accessor:'good', disableSortBy: true, align:'left'},
  ]
  
  const districtchart = useMemo(() => {
    return <MakeChart input={filteredData} field={param.indicator}/>
  }, [filteredData])

  const hilite = useMemo(() => {
    return (
      ['_R1', '_R2', '_CH'].map((item) => {
        let obj = {}
        const x = param.indicator + item   
        function removeNull(x){
          return x[param.indicator+item] != null
        }
        

        obj['avg'] = FloatFormat(stat[0][x + '_wavg'], description['Precision'])// + description['Unit'];
          if (pIndicator.includes(param.indicator)){
            obj['best'] = stat[0][x + '_max_unit']
            obj['worst'] = stat[0][x + '_min_unit']
            obj['bestVal'] = FloatFormat(stat[0][x + '_max'], description['Precision'])
            obj['worstVal'] = FloatFormat(stat[0][x + '_min'], description['Precision'])
          } else {
            obj['best'] = stat[0][x + '_min_unit']
            obj['worst'] = stat[0][x + '_max_unit']
            obj['bestVal'] = FloatFormat(stat[0][x + '_min'], description['Precision'])
            obj['worstVal'] = FloatFormat(stat[0][x + '_max'], description['Precision'])
          }  
        return obj
      })
    )
  }, [data, param])

  const nodata = ((hilite[0]['avg'] === '-') && (hilite[1]['avg'] === '-'))

  let text = []
  if (pIndicator.includes(param.indicator)){
    if (hilite[2]['bestVal'].startsWith('-')){
      text.push('experienced the smallest decrease')
    } else {
      text.push('had the highest increase')
      text.push(', showing an improvement in conditions')
    }
  } else {
    if (hilite[2]['bestVal'].startsWith('-')){
      text.push('experience the largest decrease')
      text.push(', showing an improvement in conditions')
    } else {
      text.push('had the lowest increase')
    }
  }
  
  let wording = ''
  if (description['R1'] !== ''){
    wording += `approximately ${hilite[0]['avg']} ${definition['Unit']} ${definition['Statement']} in round 1 (${description['R1']}, ${description['Y1']}).`
    if (description['R2'] !== ''){
      wording += ` In round 2 (${description['R2']}, ${description['Y2']}), the figure was ${hilite[1]['avg']} ${definition['Unit']}.`
    }
  } else {
    wording += `approximately ${hilite[1]['avg']} ${definition['Unit']} ${definition['Statement']} in round 2 (${description['R2']}, ${description['Y2']}).`
  }

  const sumChange = <>
    Among the listed {adm2s}, <b>{hilite[2]['best']}</b> {text[0]} in {(description['Indicator'])} with a {hilite[2]['bestVal']} {description['Unit']} change from round 1 ({description['R1']}, {description['Y1']}) to round 2 ({description['R2']}, {description['Y2']}){text[1]}.
  </>

  const summaryTab = (
    <div>
      <div className='row p-2'>
        <Table striped bordered size='sm'>
          <thead>
            <tr>
              <td>
                <Ask about='How to read table' />
              </td><td>Round 1</td><td>Round 2</td><td>Change</td>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{param.config.Adm1} Level Average</td><td>{hilite[0]['avg']}</td><td>{hilite[1]['avg']}</td><td>{hilite[2]['avg']}</td>
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

      <p>
        In the {adm1} of <b>{stateName}</b>, {wording}
      </p>
      <p>
          {hilite[2]['best'] === '-' ? '' : sumChange}
      </p>
    </div>
  )

  const chartTab = (
    <div className='row p-0'>
      <p>
      The chart below summarises the indicator values aggregated at {adm2} level. If available, the credible intervals <b>(CIs)</b> with 95% significance for round 1 <b>(R1)</b> and round 2 <b>(R2)</b> are represented as washout rectangles around the mean values.
      </p>
      <p style={{fontSize:'80%'}}>
      The data can be sorted by name, round 1 <b>(R1)</b> values, round 2 <b>(R2)</b> values and change <b>(CH)</b> values by clicking on each heading.
      </p>
      <hr/>
      {districtchart}
    </div>
  )

  const tableTab = (
    <div className='p-0 m-0'>
      <p>
      The table below summarises the indicator values aggregated at {adm2} level. If available, the credible intervals <b>(CIs)</b> with 95% significance for round 1 <b>(R1)</b> and round 2 <b>(R2)</b> can be found in brackets.
      </p>
      <p style={{fontSize:'80%'}}>
      The data can be sorted by name, round 1 <b>(R1)</b> values, round 2 <b>(R2)</b> values and change <b>(CH)</b> values by clicking on each heading. Additionally, all-indicator summary can be displayed by clicking <i className='pi pi-arrow-circle-right'></i> on each row.
      </p>
      <hr/>
      <div style={{maxHeight:'610px', overflowY:'auto'}}>
        {<MakeTable columns={columns} data={filteredData} palette={palette} indicators={indicators}/>}
      </div>
    </div>
  )

  const tableTab2 = (
    <div className='p-0 m-0'>
      <p>
      The table below summarises the indicator values aggregated at <b>{adm1} level</b>. If available, the credible intervals <b>(CIs)</b> with 95% significance for round 1 <b>(R1)</b> and round 2 <b>(R2)</b> can be found in brackets.
      </p>
      <hr/>
      <div style={{maxHeight:'610px', overflowY:'auto'}}>
        {<MakeTable columns={columns} data={stateData} palette={palette} indicators={indicators}/>}
      </div>
    </div>
  )

  const chartTab2 = (
    <div className='row p-0'>
      <p>
      The chart below summarises the indicator values aggregated at <b>{adm1} level</b>. If available, the credible intervals <b>(CIs)</b> with 95% significance for round 1 <b>(R1)</b> and round 2 <b>(R2)</b> are represented as washout rectangles around the mean values.
      </p>
      <hr/>
      <div style={{maxHeight:'610px', overflowY:'auto'}}>
        {<MakeChart input={stateData} field={param.indicator}/>}
      </div>
    </div>
  )

  return (
    <div className='row m-0 p-0'>
      <div className='row m-0 p-2 pt-2 rounded-3 bg-secondary-subtle'>
        <div className='p-0'>
          <h5>
            <Badge bg='danger' style={{marginRight:'8px'}}>{description.Indicator}</Badge>
            <Badge bg='danger'>{stateName} ({data.length} {adm2s})</Badge>
          </h5>
        </div>
        <div className='p-0'>
          <p>{param.config.Adm2} and {adm1} level summary estimates are presented for the selected indicators and for each survey round and for the change between the two rounds.</p>
        </div>
      </div>
    
      {nodata ? <div className='m-0 p-0 mt-2'><kbd>No data for this {param.config.Adm1.toLowerCase()}</kbd></div> : 
      param.config.StateOnly.includes(param.indicator) ? <>
        <div className='m-0 p-0 mt-2'>
          <kbd>For this indicator, only {adm1} level data is available</kbd>
        </div>
        <Tabs
          defaultActiveKey="table"
          id="data-tabs"
          className="mt-2"
        >
          <Tab eventKey="table" title="Table">
            {tableTab2}
          </Tab>
          <Tab eventKey="chart" title="Chart">
            {chartTab2}
          </Tab>
        </Tabs>
      </> : <>
        <Tabs
          defaultActiveKey="summary"
          id="data-tabs"
          className="mt-2"
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
      </>}
      
    </div>
  )
}