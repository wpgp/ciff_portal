import { React, useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { MapContainer, GeoJSON, Circle, Pane, TileLayer, useMap } from 'react-leaflet';
import { BsQuestionCircleFill, BsCaretUpFill, BsArrowDownCircleFill, BsPrinterFill, BsDashCircleFill, BsPlusCircleFill, BsHouseFill, BsCaretDownFill } from 'react-icons/bs';
import { TiledMapLayer } from 'react-esri-leaflet';
import { Form } from 'react-bootstrap';

import { indDict, visDict, pIndicator } from './Config.js'
import { getInfo, ArgMin, FloatFormat, LookupTable, GetColor, GetXFromRGB, SimpleSelect, BasicSelect } from './Utils.js';
//import GeoRasterLayer from 'georaster-layer-for-leaflet';

import 'leaflet/dist/leaflet.css';
import indicators from './data/indicators.json';
import colormaps from './data/colormaps.json';
import colorList from './data/colorList.json';

//const optIndicator = indicators.map((item) => item.Indicator);
//const parseG = require('georaster');
var main_map;

const basemaps = {
  'esri':'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
  'label':'https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png',
  'positron': 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png'
}

const StateStyle = () => {
    return {
        weight: 0.5,
        opacity: 0.5,
        color: 'purple',
        fillOpacity: 0,
    }
}

const StateStyle2 = () => {
  return {
      weight: 3,
      opacity: 1,
      color: 'purple',
      fillOpacity: 0,
  }
}

const DistrictStyle = () => {
  return {
      weight: 0.5,
      opacity: 1,
      color: 'purple',
      fillColor: 'purple',
      fillOpacity: 0,
  }
}

function ZoomPanel({ country }){
  return (
    <div id='zoomPanel' className='leaflet-bottom leaflet-left'>
      <div className='leaflet-control btn-group-vertical'>
        <button className='map-btn' title='Zoom-in' onClick={() => main_map.zoomIn()}><BsPlusCircleFill /></button>
        <button className='map-btn' title='Zoom-out' onClick={() => main_map.zoomOut()}><BsDashCircleFill /></button>
        <button className='map-btn' title='Reset View' onClick={() => main_map.setView(country.Center, country.Zoom)}><BsHouseFill /></button>
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

function RadioPanel({ pass, indicator }){
  const [showControl, setShowControl] = useState(true);

  let availRaster = ['LBW', 'ANC_4plus'];
  let disabled = availRaster.includes(indicator) ? false : true;
  let gridTitle = availRaster.includes(indicator) ? 'Show gridded data' : 'Unavailable for this indicator';

  let optClick = (val) => {
    pass[0](val);
    pass[1](false);
    pass[2](false);
    pass[4](0);
    if (pass.length === 6) {pass[5]({'level':'', 'prob':0, 'direction':''})}


    if (val === 'CH'){
      document.getElementById('optionCI').style.display = 'block';
    } else {
      document.getElementById('optionCI').style.display = 'none';
      pass[3]('')
    }
    document.getElementById('optionInspect').style.display = 'none';
    document.getElementById('radio_agg').checked = true;
    document.getElementById('radio_grid').checked = false;
  }

  let showAgg = () => {
    pass[1](false);
    pass[2](false);
    document.getElementById('optionCI').style.display = 'block';
    document.getElementById('optionInspect').style.display = 'none';
  }

  let showGridded = () => {
    pass[1](true);
    document.getElementById('optionCI').style.display = 'none';
    document.getElementById('optionInspect').style.display = 'block';
  }

  const hideLayerControl = () => {
    let elem = document.getElementById('layerControl');
    if (elem.getAttribute('style') === 'display: block;') {
      elem.style.display = 'none';
      setShowControl(false);
    } else {
      elem.style.display = 'block';
      setShowControl(true);
    }
  }

    return (
      <div className='leaflet-top leaflet-left'>
        <div className='leaflet-control m-2 pb-0 mb-0'>
          <div id='layerButton' className='p-1 m-0 text-light' onClick={hideLayerControl}
            style={{minHeight:'20px', width:'100px', borderRadius:'7px', background:'#e9546e'}}>
            Layers <span className='float-end'>{showControl ? <BsCaretUpFill/> : <BsCaretDownFill/>}</span>
            </div>
  
          <div id='layerControl' style={{display:'block'}}>
          <Form style={{padding:'5px 5px 0px 5px', borderRadius:'7px', background:'#f0f0f0'}}>
            <div className='m-0'>
              <Form.Check 
                defaultChecked='true'
                type='radio'
                id='radio1'
                label='Round 1'
                name='dataOpt1'
                title='Show round 1 data'
                onClick={() => optClick('R1')}
              />
            </div>
            <div className='m-0'>
              <Form.Check 
                type='radio'
                id='radio2'
                label='Round 2'
                name='dataOpt1'
                title='Show round 2 data'
                onClick={() => optClick('R2')}
              />
            </div>
            <div className='m-0'>
              <Form.Check 
                type='radio'
                id='radio3'
                label='Change'
                name='dataOpt1'
                title='Show R2 - R1'
                onClick={() => optClick('CH')}
              />
            </div>
          </Form>
          <Form style={{padding:'5px 5px 0px 5px', borderRadius:'7px', background:'#f0f0f0'}}>
            <div>
              <Form.Check 
                defaultChecked='true'
                type='radio'
                id='radio_agg'
                label='District Level'
                name='dataOpt2'
                title='Show aggregated data'
                onClick={showAgg}
              />
            </div>
            <div>
              <Form.Check 
                disabled={disabled}
                type='radio'
                id='radio_grid'
                label='Grid Level'
                name='dataOpt2'
                title={gridTitle}
                onClick={showGridded}
              />
            </div>
          </Form>
        </div>
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
      <>
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
      </>
    )
    
    //const updateIndicator = (value) => {}

    return (
      <div className='row m-0 mt-2 pt-2 mb-2' style={{background:'#f0f0f0', borderRadius:'10px', minHeight:'125px'}}>
        <div className='p-0 text-light'>
          <div style={{display:'inline-block', background:'#e9546e', borderRadius:'7px', padding:'5px', marginBottom:'10px'}}>
          {/*
          <BasicSelect
            name={'legendIndicator'}
            items={optIndicator} 
            noDefault={true}
            value={visDict[indicator]['Short']}
            pass={pass}
            extras={updateIndicator(visDict[indicator]['Short'])}
            style={{background:'none',border:'none',fontSize:'larger',fontWeight:'600',padding:'0px'}}
          />
          */}
          {visDict[indicator]['Indicator']}
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
                <div className='float-end' onClick={() => getInfo('Note on the color scale', './aboutChange.inc')} title='More info'><BsQuestionCircleFill /></div>
                {cbar}
              </div>
            </div>
          </div>

        </div>
      </div>
    )
}

function DistrictPopup(obj, col){
  let content = `<div><b>${obj.district}</b>`;
  content += `<br/>${obj.state}<br/>`
  content += `<br/>R<sub>1</sub>\u25b9 ${FloatFormat(obj[col+'_R1'], 1)}`
  content += `<br/>R<sub>2</sub>\u25b9 ${FloatFormat(obj[col+'_R2'], 1)}`
  content += `<br/>Change\u25b9 ${FloatFormat(obj[col+'_CH'], 1)}`
  content += '</div>'
  return (content)
}

function infoCI(indicator){
  const path = pIndicator.includes(indicator) ? './aboutCI_pIndicator.inc' : './aboutCI_nIndicator.inc';
  getInfo('Note on the change certainty', path);
}

function PrintMap(){
  var content = document.getElementById("mapContainer");
  var pri = document.getElementById("ifmcontentstoprint").contentWindow;
  pri.document.open();
  pri.document.write(content.innerHTML);
  pri.document.close();
  pri.focus();
  pri.print();
}

function DownloadRaster(){
  const path = './downloadRaster.inc';
  getInfo('Download Raster Data', path);
}

export function TheMap({ country, boundary, data, selected, setFunc, indicator }){

    const mapper = useMemo(() => ({'R1':'Value in Round 1', 'R2':'Value in Round 2', 'CH':'Change (R2-R1)'}), []);
    const [opt, setOpt] = useState('R1');
    const [raster, setRaster] = useState(false);
    const [showLabel, setShowLabel] = useState(false);
    const [showImprove, setShowImprove] = useState('');
    const [coords, setCoords] = useState({lat:0, lng:0, val:0, remark:mapper[opt]});
    const [probLimit, setProbLimit] = useState(0);
    
    const noPE = ['NMR', 'CHMR', 'Teen_Pregn']
    const disableRange = noPE.includes(indicator);

    const setShowImprove_ = (x) => {
      setShowImprove(x); 
      if (setFunc.length === 3) {setFunc[2]({'level':'', 'prob':probLimit, 'direction':x})}
    }
    const field = useMemo(() => (indicator + '_' + opt), [indicator, opt])
    const adm = String(country.Adm1).toLowerCase();
    var minmax = visDict[indicator]['Minmax']
    
    const DefineMap = () => {
      main_map = useMap();
      return null
    }
  
    {/* Get grid/pixel value based on the choropleth*/}
    useEffect(() => {
      if (!main_map) {return}
      const inspectMap = (e) => {
        let layer = e.target._layers;
        const key = Object.keys(layer).filter((k) => {
          return layer[k].options.name === 'thisRaster';
        });

        try {
          //Getting the RGB value of the clicked pixel
          layer = layer[key];
          let size = layer._tileSize;
          let point = layer._map.project(e.latlng, layer._tileZoom).floor();
          let coords = point.unscaleBy(size).floor();
          let offset = point.subtract(coords.scaleBy(size));
          coords.z = layer._tileZoom;
          let tile = layer._tiles[layer._tileCoordsToKey(coords)];

          if (!tile || !tile.loaded) return;
          tile.el.crossOrigin = 'anonymous';

          let canvas = document.createElement('canvas');
          let context = canvas.getContext('2d');
          canvas.width = 1;
          canvas.height = 1;
          context.drawImage(tile.el, -offset.x, -offset.y, size.x, size.y);

          const a = context.getImageData(0, 0, 1, 1).data;
          const palette = (opt === 'CH') ? colorList[visDict[indicator]['Palette2']] : colorList[visDict[indicator]['Palette1']];
          const val = GetXFromRGB(a, palette, minmax);
          setCoords({ lat: e.latlng.lat, lng: e.latlng.lng, val:val, remark:mapper[opt] });
          
        } catch {
          console.log('error')
        }
      }

      if (showLabel) {
        main_map.addEventListener("click", (e) => {inspectMap(e)})
      } else {
        main_map.removeEventListener('click');
      };

      return
    }, [showLabel, indicator, minmax, opt, mapper]);

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
        pass={setFunc[0]}
        noDefault={false}
      />
    )

    const onEachState = (feature, layer) => {
      layer.on({
        mouseover: function(e){
          const prop = e.target.feature.properties;
          let content = `<div><b>${prop.state}</b></div>`;
          layer.setStyle({weight:3})
          layer.bindTooltip(content)
          layer.openTooltip()
        },
        mouseout: function(e){
          layer.setStyle({weight:0.5})
          //layer.unbindTooltip()
          layer.closeTooltip()
        },
        click: function(e){
          layer.setStyle({weight:3})
          zoomFit(e.target._bounds)
          setFunc[0](e.target.feature.properties.state.replaceAll(' ',''))
        }
      })
    }
  
    const onEachDistrict = (feature, layer) => {
      layer.on({
        mouseover: function(e){
          const prop = e.target.feature.properties;
          const content = DistrictPopup(prop, indicator);

          layer.setStyle({weight:3, fillOpacity:0.7})
          layer.bindTooltip(content)
          layer.openTooltip()
        },
        mouseout: function(e){
          layer.setStyle({weight:0.5, fillOpacity:0})
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

    const district = data.features.filter((item) => (item.properties.state.replaceAll(' ','') === selected));
    const selectedState = boundary.features.filter((item) => (item.properties.state.replaceAll(' ','') === selected));
  
    const ref = useRef()
    useEffect(() => {
      if (ref.current) {
        ref.current.clearLayers()
        ref.current.addData(district)
      }
    }, [ref, district])

    const refState = useRef()
    useEffect(() => {
      if (refState.current) {
        refState.current.clearLayers()
        refState.current.addData(selectedState)
      }
    }, [ref, selectedState])

    //const theraster = useMemo(() => <GriddedData country={country} indicator={indicator} band={opt}/>, [country, indicator, opt]);    

    const choropleth = useRef()
    useEffect(() => {
      const filterData = (feature) => {
        const val = feature.properties[`${indicator}_CH`];
        const pval = feature.properties[`${indicator}_CH_P`];
        let res = true
        if (pIndicator.includes(indicator)){
          res = showImprove === 'ShowImprovement' ? (val > 0 && pval > probLimit)  : showImprove === 'ShowWorsening' ? (val <= 0 && pval < (1-probLimit)) : true
        } else {
          res = showImprove === 'ShowWorsening' ? (val > 0 && pval > probLimit)  : showImprove === 'ShowImprovement' ? (val <= 0 && pval < (1-probLimit)) : true
        }
        return res
      }

      let filteredData = {};
      filteredData.features = data.features.filter(filterData);

      if (choropleth.current) {
        choropleth.current.clearLayers()
        choropleth.current.addData(filteredData)
        choropleth.current.setStyle(TileStyle)
      }
    }, [showImprove, indicator, data, TileStyle, probLimit])

    const mainLayer = useMemo(() => {  
      if (raster) {
        let url = "https://tiles.arcgis.com/tiles/DP1uf58TYllWKwpl/arcgis/rest/services/";
        url += `${country.Abbreviation}_${indicator}_${opt}/MapServer`;
        return <TiledMapLayer name='thisRaster' url={url}/>;
      } else {  
        return <GeoJSON
          data={data}
          ref={choropleth}
          style={TileStyle}
          attribution='Powered by <a href="https://www.esri.com">Esri</a>'
          />
      }
    }, [raster, country, indicator, opt, data, TileStyle])
  
    const legend = useMemo(() => (
        <Legend indicator={indicator} opt={opt} pass={(short) => {setFunc[1](indDict[short]['Abbreviation'])}}/>
    ), [indicator, setFunc, opt])

    const info = LookupTable({'items':indicators, 'first':'Abbreviation', 'second':['Source','R1','R2','Y1','Y2'], 'value':indicator})
    
    const changeCI = (val) => {
      if (val === '-1') {
        val = document.getElementById('rangeCI').value
      } else {
        document.getElementById('rangeCI').value = val
      }
        
      const label = {'0':'any (0-100%)', '1':'likely (>90%)', '2':'highly likely (>95%)', '3':'almost certain (>99%)'}
      const limit = {'0':0.00, '1':0.90, '2':0.95, '3':0.99}
      const text = label[val]
      setProbLimit(limit[val])
      if (setFunc.length === 3){setFunc[2]({'level':label[val], 'prob':limit[val], 'direction':showImprove})}
      document.getElementById('valueCI').innerText = text
    }
    
    const displaySlider = useMemo(() => {
      let show;
      if (['ShowImprovement', 'ShowWorsening'].includes(showImprove)) {
        show = 'block'
        changeCI('0')
      } else {
        show = 'none'
      }
      return show
    }, [showImprove])

    return (
      <div className='row'>
      <div className='title'>Map of {country.Name}</div>
      <div className='row' style={{minHeight:'120px'}}>
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

      <div id='mapContainer' className='row m-0 mb-5' style={{paddingLeft:'0px', paddingRight:'25px'}}>
      
        {/* PANEL ABOVE THE MAP */}
        <div className='row m-0 p-0 pt-2 mb-2'  style={{fontSize:'small', minHeight:'55px', background:'#f0f0f0', borderRadius:'10px'}}>
          <div className='col-10 m-0 p-0'>
          {/* INSPECT GRID */}
          <div className='row m-0 p-0' id='optionInspect' style={{display:'none', minWidth:'100px'}}>
            <div className='row m-0 p-0'>
              <div className='col-4'>
                <div className='pb-1' style={{fontWeight:'bold'}}>
                  Get grid value
                  <span> </span>
                  <span title='Toggle to inspect gridded data'><BsQuestionCircleFill /></span>
                </div>
                <div className='form-check form-switch' style={{marginRight:'20px'}}>
                <label className='form-check-label'>
                  <input id='showLabelSwitch' className='form-check-input' type="checkbox" checked={showLabel} onChange={() => {
                    setShowLabel(!showLabel)
                    setCoords({lat:0, lng:0, val:0, remark:mapper[opt]})
                    }}/>
                </label>
                </div>
              </div>
              <div className='col-6' style={{display:showLabel ? 'block' : 'none'}}>
                <b>{coords.remark} : {coords.val}</b>
              </div>
            </div>
          </div>

          {/* FILTER BY CHANGE */}
          <div className='row m-0 p-0' id='optionCI' style={{display:'none'}}>
            <div className='row m-0 p-0'>
              <div className='col-4' style={{minWidth:'50px'}}>
              <div className='pb-1' style={{fontWeight:'bold'}}>
                Filter by change
                <span> </span>
                <span title='Filtering units based on the change in the indicator'><BsQuestionCircleFill /></span>
              </div>
              <BasicSelect
                name={'Filter'}
                items={['Show Improvement', 'Show Worsening', 'Show All']} 
                value={showImprove}
                pass={setShowImprove_}
              />
              </div>
              <div className='col-7' style={{minWidth:'50px', display:displaySlider}}>
                <label className='form-check-label'><b>Change significance</b>: <span id='valueCI'>any (0-100%)</span></label>
                  <div className='float-end' onClick={infoCI} title='Selecting significance level of the change [click for more info]'><BsQuestionCircleFill /></div>
                <input className='form-range' type='range' id='rangeCI' disabled={disableRange} defaultValue='0' min='0' max='3' step='1' name='CIRange' onChange={() => changeCI('-1')}/><br/>
              </div>
            </div>
          </div>
          
          </div>
          <div className='col-2 m-0 float-end' style={{fontSize:'medium'}}>
            <div className='m-1 float-end'><span title='Download data' onClick={DownloadRaster}><BsArrowDownCircleFill /></span></div>
            <div className='m-1 float-end'><span title='Print map' onClick={PrintMap}><BsPrinterFill /></span></div>
          </div>
        </div>

        <MapContainer 
          zoomControl={false}
          center={country.Center}
          zoom={country.Zoom}
          minZoom={3}
          maxZoom={9}
          style={{width:'100%', height:'60vh', background:'#fff', borderRadius:'10px'}}
          >

          <DefineMap />
          
          {/* raster && showLabel ? <InspectPanel coords={coords}/> : <></> */}

          <RadioPanel pass={[setOpt, setRaster, setShowLabel, setShowImprove, setProbLimit, setFunc[2]]} indicator={indicator}/>
    
          <ZoomPanel country={country}/>

          {/*<FullScreenControl fullscreen={fullscreen} pass={setFullscreen}/>*/}

          <Pane name='basemap' style={{zIndex:0}}>
            {<TileLayer url={basemaps['positron']}/>}
          </Pane>
          
          {showLabel ? <TileLayer url={basemaps['label']} zIndex={500}/> : <></>}

          <Pane name='tiles' style={{zIndex:5}}>
            {mainLayer}
            <GeoJSON
              data={selectedState}
              ref={refState}
              style={StateStyle2}
            />
            <GeoJSON
              data={boundary}
              style={StateStyle}
              zIndex={500}
              />
          </Pane>
    
          {showLabel ? null :
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
          </Pane>}

          <Circle center={[coords.lat, coords.lng]} radius={1000} color={'#000'} fill={showLabel ? 1 : 0} fillColor={'#000'} fillOpacity={1}>
          </Circle>

        </MapContainer>

        {legend}
      
        <div id='loadRaster' className="row" style={{display:'none'}}>
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      </div>

      </div>
    )
}
