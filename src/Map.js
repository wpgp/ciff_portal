import { React, useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { MapContainer, GeoJSON, Pane, TileLayer, useMap } from 'react-leaflet';
import { BsInfoCircleFill, BsFullscreenExit, BsFullscreen, BsFillGridFill, BsSquareFill, BsFill1CircleFill, BsFill2CircleFill, BsSubtract, BsDashCircleFill, BsPlusCircleFill, BsArrowLeftCircleFill } from 'react-icons/bs';
import { TiledMapLayer } from 'react-esri-leaflet';

import { indDict, visDict, pIndicator } from './Config.js'
import { ArgMin, FloatFormat, LookupTable, GetColor, SimpleSelect, BasicSelect } from './Utils.js';
//import GeoRasterLayer from 'georaster-layer-for-leaflet';

import 'leaflet/dist/leaflet.css';
import indicators from './data/indicators.json';
import colormaps from './data/colormaps.json';

const optIndicator = indicators.map((item) => item.Indicator);
//const parseG = require('georaster');
var main_map;

const StateStyle = () => {
    return {
        weight: 0.5,
        opacity: 0.5,
        color: 'red',
        fillOpacity: 0,
    }
}

const DistrictStyle = () => {
  return {
      weight: 1.5,
      opacity: 1,
      color: 'red',
      fillOpacity: 0,
  }
}

function ZoomPanel({ country }){
  return (
    <div className='leaflet-bottom leaflet-left'>
      <div className='leaflet-control btn-group-vertical'>
        <button className='map-btn' title='Zoom-in' onClick={() => main_map.zoomIn()}><BsPlusCircleFill /></button>
        <button className='map-btn' title='Zoom-out' onClick={() => main_map.zoomOut()}><BsDashCircleFill /></button>
        <button className='map-btn' title='Reset View' onClick={() => main_map.setView(country.Center, country.Zoom)}><BsArrowLeftCircleFill /></button>
      </div>
    </div>
  )
}

/*
function FullScreenControl({ fullscreen, pass }){
  function FullScreen(set){
    return
  }

  return (
    <div className='leaflet-top leaflet-right'>
      <div className='leaflet-control btn-group-vertical'>
        <button id='btn-fullScreen' className='map-btn' title='Full Screen' onClick={() => {pass(!fullscreen); FullScreen(!fullscreen)}}>
          {fullscreen ? <BsFullscreenExit /> : <BsFullscreen />}
        </button>
      </div>
    </div>
  )
}
*/

function RadioPanel({ passOpt, passRaster, indicator }){
  let available = ['LBW', 'ANC_4plus'];
  let disabled = available.includes(indicator) ? false : true;
  let gridTitle = available.includes(indicator) ? 'Gridded Data' : 'Gridded Data (Unavailable)';

  let optClick = (val) => {
    passOpt(val);
    passRaster(false);
    if (val === 'CH') {
      document.getElementById('optionCI').style.display = 'block'
    } else {
      document.getElementById('optionCI').style.display = 'none'
    }
    document.getElementById('radio_agg').checked = true;
    document.getElementById('radio_grid').checked = false;
  }

  let showGridded = () => {
    passRaster(true)
    document.getElementById('optionCI').style.display = 'none'
  }

    return (
      <div className='leaflet-top leaflet-left'>
        <div className='leaflet-control'>
          <>
            <label className='new-container'>
              <input className='new-radio' type='radio' name='dataOpt' id={'radio_R1'} defaultChecked onClick={() => optClick('R1')}/>
              <span className='new-label' title='Round 1'><BsFill1CircleFill /></span>
            </label><br/>
  
            <label className='new-container'>
              <input className='new-radio' type='radio' name='dataOpt' id={'radio_R2'} onClick={() => optClick('R2')}/>
              <span className='new-label' title='Round 2'><BsFill2CircleFill /></span>
            </label><br/>
  
            <label className='new-container'>
              <input className='new-radio' type='radio' name='dataOpt' id={'radio_CH'} onClick={() => optClick('CH')}/>
              <span className='new-label' title='R2 - R1'><BsSubtract /></span>
            </label>
          </>
        </div>
        <div className='leaflet-control' style={{paddingTop:'15px'}}>
          <>
            <label className='new-container'>
              <input className='new-radio' type='radio' name='layerOpt' id={'radio_agg'} defaultChecked onClick={() => passRaster(false)}/>
              <span className='new-label' title='Aggregated Data'><BsSquareFill /></span>
            </label><br/>
  
            <label className='new-container'>
              <input className='new-radio' type='radio' name='layerOpt' id={'radio_grid'} disabled={disabled} onClick={showGridded}/>
              <span className='new-label' title={gridTitle}><BsFillGridFill /></span>
            </label>
          </>
        </div>
      </div>
    )
}

function Legend({ indicator, opt, pass }){
    let palette = ''
    let minmax = visDict[indicator]['Minmax']
  
    if (opt === 'CH'){
      palette = 'Palette2'
      let a = 0.5*(minmax[0] - minmax[1])
      let b = 0.5*(minmax[1] - minmax[0])
      minmax = [a,b]
    } else {
      palette = 'Palette1'
    }

    const info = LookupTable({'items':indicators, 'first':'Abbreviation', 'second':['Indicator','Definition','Source','Link','R1','R2','Y1','Y2','Unit','Proportional'], 'value':indicator})
    const colormap = colormaps[visDict[indicator][palette]]
    const ids = [...Array(20).keys()]
    const remark = ((opt === 'CH') ? 'Change in ' : 'Value in ') + info[8]
    const proportional = info[9] ? 'increasing value means better condition' : 'increasing value means worse condition'

    let delta = [0.1,0.2,0.5,1,2,5,10,20]
    let digit = [1,1,1,0,0,0,0,0]
    const idx = ArgMin(
      delta.map((item) => (
        Math.abs(6 - (minmax[1] - minmax[0])/item)
    )))
    delta = delta[idx]
    digit = digit[idx]
  
    let ticks = [minmax[0]]
    let sticks = [5]
    const sdelta = 90*delta/(minmax[1]-minmax[0])
    while (ticks[ticks.length-1] < minmax[1]){
      const n = ticks.length
      ticks.push(ticks[n-1] + delta)
      sticks.push(sticks[n-1] + sdelta)
    }

    const cbar = (
      <svg width='100%' height='95'>
        {ids.slice(0,18).map((item) => (
          <rect key={item} x={(5+item*5)+'%'} y='0%' rx='5px' ry='5px' width='5%' height='30' stroke='#2b2b2b' fill={colormap[item]}/>
        ))}
        <line x1='0' x2='100%' y1='40' y2='40' stroke='black' weight='2'/>
        {sticks.map((item, id) => (
          <line key={id} x1={item+'%'} x2={item+'%'} y1='37' y2='43' stroke='black' weight='2'/>
        ))}
        {ticks.map((item, id) => (
          <text key={id} x={sticks[id]+'%'} y='55' textAnchor='middle' fontSize='90%'>{parseFloat(item).toFixed(digit)}</text>
        ))}
        <text x='50%' y='70' textAnchor='middle'>{remark}</text>
        <text x='50%' y='83' textAnchor='middle' fontSize='90%'>{proportional}</text>
      </svg>
    )
    
    const updateIndicator = (value) => {}

    return (
      <div className='row m-0 pt-2 mb-2' style={{background:'#f0f0f0', borderRadius:'10px', minHeight:'125px'}}>
        <div className='p-0'>
          <div style={{display:'inline-block',background:'#cfcccc',borderRadius:'5px',padding:'2px',marginBottom:'10px'}}>
          <BasicSelect
            name={'legendIndicator'}
            items={optIndicator} 
            noDefault={true}
            value={visDict[indicator]['Short']}
            pass={pass}
            extras={updateIndicator(visDict[indicator]['Short'])}
            style={{background:'none',border:'none',fontSize:'larger',fontWeight:'600',padding:'0px'}}
          />
          </div>
        </div>
        
        <div className='row p-0 m-0'>
          <div className='col-5 p-0 m-0' style={{fontSize:'75%'}}>
            <p>
              <b>Definition</b><br/>{info[1]}
            </p>
          </div>
          
          <div className='col-7' style={{fontSize:'75%'}}>
            <div className='row p-0 m-0'>
              <div className='col-md-5 p-1 m-0'>
                <b>Remarks</b><br/>
                <b>R<sub>1</sub>{'\u25B9'}</b> {info[4]}, {info[6]}
                <br/><b>R<sub>2</sub>{'\u25B9'}</b> {info[5]}, {info[7]}
                <br/><b>Ch{'\u25B9'}</b> (R<sub>2</sub> - R<sub>1</sub>)
              </div>

              <div className='col-md-7 p-1 m-0'>
                {cbar}
              </div>
            </div>
          </div>

          <div className='row p-0' style={{fontSize:'60%'}}>
            <p><b>Note:</b> Irrespective of the direction of each indicator (i.e. increasing value meaning better condition like % of contraceptive prevalence, increasing value meaning worse condition like % of low birth weight) the legend displays a better condition relative to other areas in the country (improvement over time when looking at time change) in blue, and a worse condition relative to other areas in the country (worsening over time when looking at time change) in red. </p>
          </div>
        </div>
      </div>
    )
}

function DistrictPopup(obj, col){
    let content = `<div><b>${obj.district}</b>`;
    content += `<br/>${obj.state}<br/>`
    content += `<br/>R<sub>1</sub>\u25b9 ${FloatFormat(obj[col+'_R1'], 1)}%`
    content += `<br/>R<sub>2</sub>\u25b9 ${FloatFormat(obj[col+'_R2'], 1)}%`
    content += `<br/>Change\u25b9 ${FloatFormat(obj[col+'_CH'], 1)}%`
    content += '</div>'
    return (content)
}

function infoCI(indicator){
  var modal = document.getElementById("modal");
  var modalTitle = document.getElementById("modalTitle");
  var modalBody = document.getElementById("modalBody");
  const file = pIndicator.includes(indicator) ? './aboutCI_pIndicator.inc' : './aboutCI_nIndicator.inc';

  modal.style.display = "block";
  modalTitle.innerHTML = '<h4>About the confidence limit</h4>';
  
  fetch(file).then(resp => resp.text()).then(text => {
    let content = text;
    modalBody.innerHTML = content;
  });
}

/*
function GriddedData({ country, indicator, band }){
  const palette = (band === 'CH') ? 'Palette2' : 'Palette1';
  
  let path = 'https://raw.githubusercontent.com/rhorom/ciff_portal/main/'
  path += `./data/${country.Abbreviation}_${indicator}_${band}.tif`;
  
  document.getElementById('loadRaster').setAttribute('style', 'display:block !important');
  fetch(path)
      .then(resp => resp.arrayBuffer()).then(arr => {
          parseG(arr).then(georaster => {
              var layer = new GeoRasterLayer({
                  georaster: georaster,
                  opacity: 1,
                  pixelValuesToColorFn: x => GetColor(x, [0.0,0.4], visDict[indicator][palette]),
                  resolution: 128,
                  pane: 'tiles'
              });

              main_map.addLayer(layer)
              document.getElementById('loadRaster').setAttribute('style', 'display:none !important');
            });
      }).catch(error => alert(error));

  return (null);
}
*/

export function TheMap({ country, boundary, data, selected, pass, indicator, passIndicator }){
    const [opt, setOpt] = useState('R1')
    const [raster, setRaster] = useState(false)
    const [showLabel, setShowLabel] = useState(false)
    //const [fullscreen, setFullscreen] = useState(false)

    const DefineMap = () => {
      main_map = useMap();
      return null
    }
  
    const field = useMemo(() => (indicator + '_' + opt), [indicator, opt])
    const adm = String(country.Adm1).toLowerCase();

    var minmax = visDict[indicator]['Minmax']
    if (opt === 'CH') {
      let a = 0.5*(minmax[0] - minmax[1])
      let b = 0.5*(minmax[1] - minmax[0])
      minmax = [a,b]
    }
  
    const zoomFit = (bounds) => {main_map.fitBounds(bounds)}    
    const states = boundary.features.map((item) => item.properties.state);
    const selectStates = (
      <SimpleSelect 
        name={adm}
        items={states}
        defaultOpt={selected}
        value={selected}
        pass={pass}
        noDefault={false}
      />
    )

    const onEachState = (feature, layer) => {
      layer.on({
        mouseover: function(e){
          const prop = e.target.feature.properties;
          let content = `<div><b>${prop.state}</b></div>`;
          layer.setStyle({weight:2})
          layer.bindTooltip(content)
          layer.openTooltip()
        },
        mouseout: function(e){
          layer.setStyle({weight:0.5})
          //layer.unbindTooltip()
          layer.closeTooltip()
        },
        click: function(e){
          zoomFit(e.target._bounds)
          pass(e.target.feature.properties.state.replaceAll(' ',''))
        }
      })
    }
  
    const onEachDistrict = (feature, layer) => {
      layer.on({
        mouseover: function(e){
          const prop = e.target.feature.properties;
          const content = DistrictPopup(prop, indicator);

          layer.setStyle({weight:3})
          layer.bindTooltip(content)
          layer.openTooltip()
        },
        mouseout: function(e){
          layer.setStyle({weight:1.5})
          //layer.unbindTooltip()
          layer.closeTooltip()
        },
      })
    }
  
    const TileStyle = useCallback((feature) => {
      const palette = (opt === 'CH') ? 'Palette2' : 'Palette1';
      const color = GetColor(feature.properties[field], minmax, visDict[indicator][palette]);
      return {
          zIndex: 2,
          weight: 0.5,
          opacity: 1,
          color: color,
          fillOpacity: 1,
          fillColor: color
      }
    }, [indicator, opt, field, minmax])

    const district = data.features.filter((item) => (item.properties.state.replaceAll(' ','') === selected))
    const ref = useRef()
    useEffect(() => {
      if (ref.current) {
        ref.current.clearLayers()
        ref.current.addData(district)
      }
    }, [ref, district])

    //const theraster = useMemo(() => <GriddedData country={country} indicator={indicator} band={opt}/>, [country, indicator, opt]);
    
    const mainLayer = useMemo(() => {
      if (raster) {
        let url = "https://tiles.arcgis.com/tiles/DP1uf58TYllWKwpl/arcgis/rest/services/";
        url += `${country.Abbreviation}_${indicator}_${opt}/MapServer`;
        return <TiledMapLayer url={url}/>;
      } else {
        return <GeoJSON data={data} style={TileStyle}/>
      }
    }, [raster, country, indicator, opt, data, TileStyle])
  
    const legend = useMemo(() => (
        <Legend indicator={indicator} opt={opt} pass={(short) => {passIndicator(indDict[short]['Abbreviation'])}}/>
    ), [indicator, passIndicator, opt])

    const info = LookupTable({'items':indicators, 'first':'Abbreviation', 'second':['Source','R1','R2','Y1','Y2'], 'value':indicator})
    
    const changeCI = () => {
      let val = document.getElementById('rangeCI').value
      const label = {'0':' (very low)', '25':' (low)', '50':' (medium)', '75':' (high)', '100':' (very high)'}
      let text = val + label[val]
      document.getElementById('valueCI').innerText = text
    }

    return (
      <div className='row'>
      <div className='title'>Map of {country.Name}</div>
      <div className='row' style={{minHeight:'100px'}}>
        <div className='frame' style={{fontSize:'100%'}}>

          <div>
            <p>The map below displays surfaces of subnational areas (either {country.Adm1} and {country.Adm2} level or high-resolution 5x5km - pixel level data) of a particular indicator in {country.Name}.</p>
            <p>Data from Round 1 ({info[1]}, {info[3]}), Round 2 ({info[2]}, {info[4]}), or the change between rounds (Round 2 - Round 1) for {country.Name} can be selected and displayed.</p>
            <p>To get deeper information on a specific {country.Adm1} or {country.Adm2} in {country.Name}, click on an area on the map or use the drop-down menu below. Once an area on the map has been selected, an additional set of information including tables and graphs to facilitate the interpretation of the data is displayed on the right side panel (Summary, Chart, Table, All indicators tabs).</p>
          </div>
          <div className='float-end p-2 pt-0 pb-0'>
            {selectStates}
          </div>
        </div>
      </div>

      <div id='mapContainer' className='row m-0' style={{paddingLeft:'0px', paddingRight:'25px'}}>
        {legend}
      
        <MapContainer 
          zoomControl={false}
          center={country.Center}
          zoom={country.Zoom}
          minZoom={3}
          maxZoom={9}
          style={{width:'100%', height:'60vh', background:'#fff', borderRadius:'10px'}}
          >

          <DefineMap />
          
          <RadioPanel passOpt={setOpt} passRaster={setRaster} indicator={indicator}/>
    
          <ZoomPanel country={country}/>

          {/*<FullScreenControl fullscreen={fullscreen} pass={setFullscreen}/>*/}

          {/*<TileLayer url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"/>*/}
          
          <Pane name='tiles' style={{zIndex:1}}>
            {mainLayer} 
          </Pane>
    
          <Pane name='boundary' style={{zIndex:10}}>
            <GeoJSON
              data={boundary}
              style={StateStyle}
              onEachFeature={onEachState}
              />
    
            <GeoJSON
              data={district}
              ref={ref}
              style={DistrictStyle}
              onEachFeature={onEachDistrict}
              />
          </Pane>

          {showLabel ? <TileLayer url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png" zIndex={500}/> : <></>}
        </MapContainer>

        <div className='row m-0 p-0 pt-2'  style={{fontSize:'small', minHeight:'55px'}}>
          <div className='col-3 m-0 p-2'>
            <div className='form-check form-switch' style={{marginRight:'20px'}}>
              <label className='form-check-label'>
                <input className='form-check-input' type="checkbox" checked={showLabel} onChange={() => {setShowLabel(!showLabel)}}/>
                toggle labels
              </label>
            </div>

          </div>

          <div className='col-9 m-0 p-0 pt-2 pb-1' id='optionCI' style={{display:'none', background:'#f0f0f0', borderRadius:'5px'}}>
            <div className='row m-0 p-0'>
              <div className='col-5'>
                <div className='form-check row'>
                  <label className='form-check-label'>
                    <input className='form-check-input' type='radio' defaultChecked value='improvement' id='showImprove' name='showImprove'/>
                    show improvement
                  </label>
                  <label className='form-check-label'>
                    <input className='form-check-input' type='radio' value='worsening' id='showWorse' name='showImprove'/>
                    show worsening
                  </label>
                </div>
              </div>
              <div className='col-7'>
                <label className='form-check-label'>confidence limit: <span id='valueCI'>0 (very low)</span></label>
                  <div className='float-end' onClick={infoCI} title='More info'><BsInfoCircleFill /></div>
                <input className='form-range' type='range' id='rangeCI' defaultValue='0' min='0' max='100' step='25' name='CIRange' onChange={changeCI}/><br/>
              </div>
            </div>
          </div>
        </div>

        <div id='loadRaster' className="row" style={{display:'none'}}>
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      </div>

      </div>
    )
}
