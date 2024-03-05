import { React, useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { MapContainer, GeoJSON, Circle, Pane, TileLayer, useMap } from 'react-leaflet';
import { BsQuestionCircleFill, BsCaretUpFill, BsArrowDownCircleFill, BsPrinterFill, BsDashCircleFill, BsPlusCircleFill, BsHouseFill, BsCaretDownFill } from 'react-icons/bs';
import { TiledMapLayer } from 'react-esri-leaflet';
import { Form } from 'react-bootstrap';

import { indDict, visDict, pIndicator } from './Config'
import { ArgMin, FloatFormat, LookupTable, GetColor, GetXFromRGB, SimpleSelect, BasicSelect } from './Utils';
import { Ask } from './Info';
//import GeoRasterLayer from 'georaster-layer-for-leaflet';

import 'leaflet/dist/leaflet.css';
import indicators from './data/indicators.json';
import colormaps from './data/colormaps.json';
import colorList from './data/colorlist.json';

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
        color: 'black',
        fillOpacity: 0,
    }
}

const StateStyle2 = () => {
  return {
      weight: 3,
      opacity: 1,
      color: 'black',
      fillOpacity: 0,
  }
}

const DistrictStyle = () => {
  return {
      weight: 0.5,
      opacity: 1,
      color: 'black',
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

function RadioPanel({ pass, indicator }){
  const [showControl, setShowControl] = useState(true);

  const districtOnly = ['NMR', 'Unsafe_Ab', 'CHMR', 'Lab_child', 'Stillbirth'];
  const round1Only = ['Lab_child'];
  let disabled = districtOnly.includes(indicator) ? true : false;
  let gridTitle = districtOnly.includes(indicator) ? 'Unavailable for this indicator' : 'Show gridded data';

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
    pass[2](true);
    document.getElementById('optionCI').style.display = 'none';
    //document.getElementById('optionInspect').style.display = 'block';
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
                disabled={round1Only.includes(indicator)}
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
                disabled={round1Only.includes(indicator)}
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

function Legend({ indicator, opt }){
    let palette = 'Palette1'
    let minmax = (opt === 'CH') ? visDict[indicator]['CHMinmax'] : visDict[indicator]['Minmax']
  
    const info = LookupTable({'items':indicators, 'first':'Abbreviation', 'second':['Indicator','Definition','Source','Link','R1','R2','Y1','Y2','Unit','Proportional','Remark'], 'value':indicator})
    const colormap = colormaps[visDict[indicator][palette]]
    const ids = [...Array(20).keys()]
    const remark = ((info[8] === '%') ? 'value in %' : info[8])
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
      <div className='text-center'>
      <svg width='100%' height='65'>
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
      </svg>
      <span><b>{remark}</b></span><br/>
      <span><i>{proportional}</i></span>
      </div>
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
              {info[10] ? 
              <>
                <br/><br/><b>{info[10]}</b>{info[0] === 'Prevalence of child workers' ? 
                  <Ask about='Note on census boundaries'/> : <Ask about='Note on changing boundaries'/>
                }
              </>
              : <></>}
              
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
                <div className='float-end'>
                  <Ask about='About this color bar' />
                </div>
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
  const mapper = {
    'R1': 'R<sub>1</sub>',
    'R2': 'R<sub>2</sub>',
    'CH': 'Change',
  }
  content += `<br/>${obj.state}<br/>`
  //content += `<br/>R<sub>1</sub>\u25b9 ${FloatFormat(obj[col+'_R1'], 1)}`
  //content += `<br/>R<sub>2</sub>\u25b9 ${FloatFormat(obj[col+'_R2'], 1)}`
  //content += `<br/>Change\u25b9 ${FloatFormat(obj[col+'_CH'], 1)}`
  //content += `<br/>${obj['toDisplay']}`
  Object.keys(obj.toDisplay).forEach((key, i) => {
    content += `<br/> ${mapper[key]}\u25b9 ${FloatFormat(obj.toDisplay[key], 1)}`
  })
  content += '</div>'
  return (content)
}

export function TheMap({ country, boundary, data, selected, setFunc, indicator }){

    const mapper = {'R1':'Value in Round 1', 'R2':'Value in Round 2', 'CH':'Change (R2-R1)'};
    const [opt, setOpt] = useState('R1');
    const [raster, setRaster] = useState(false);
    const [showLabel, setShowLabel] = useState(false);
    const [showImprove, setShowImprove] = useState('');
    const [coords, setCoords] = useState({lat:0, lng:0, val:null, remark:mapper[opt]});
    const [probLimit, setProbLimit] = useState(0);

    useEffect(() => {
      setOpt('R1')
      setRaster(false)
      setShowLabel(false)
      setShowImprove('')
      setProbLimit(0)
    }, [indicator])
    
    const noPE = ['NMR', 'CHMR', 'Teen_Pregn', 'Lab_child', 'Stillbirth']
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
          const val = FloatFormat(GetXFromRGB(a, palette, minmax), 1);
          setCoords({ lat: e.latlng.lat, lng: e.latlng.lng, val:val, remark:mapper[opt] });
          
        } catch {
          console.log('failed to get grid value')
        }
      }

      if (showLabel) {
        main_map.addEventListener("click", (e) => {inspectMap(e)})
      } else {
        main_map.removeEventListener('click');
      };

      return
    }, [showLabel, indicator, minmax, opt, mapper]);

    minmax = (opt === 'CH') ? visDict[indicator]['CHMinmax'] : visDict[indicator]['Minmax']
  
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

    let district = data.features.filter((item) => (item.properties.state.replaceAll(' ','') === selected));
    district.forEach((item) => {
      const content = opt === 'CH' ? (
        {
          'R1': item.properties[indicator+'_R1'], 
          'R2': item.properties[indicator+'_R2'], 
          'CH': item.properties[indicator+'_CH']}
      ) : (
        {
          [opt]: item.properties[indicator+'_'+opt],
        }
      )
      item.properties['toDisplay'] = content
    })
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
          res = showImprove === 'ShowImprovement' ? (val > 0 && pval > probLimit)  : showImprove === 'ShowWorsening' ? (val <= 0 && pval < (100-probLimit)) : true
        } else {
          res = showImprove === 'ShowWorsening' ? (val > 0 && pval > probLimit)  : showImprove === 'ShowImprovement' ? (val <= 0 && pval < (100-probLimit)) : true
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
        let url = "https://tiles.arcgis.com/tiles/7vxqqNxnsIHE3EKt/arcgis/rest/services/";
        url += `${indicator}_${opt}/MapServer`;
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
      const limit = {'0':0.00, '1':90, '2':95, '3':99}
      const text = label[val]
      setProbLimit(limit[val])
      if (setFunc.length === 3){setFunc[2]({'level':label[val], 'prob':limit[val], 'direction':showImprove})}
      document.getElementById('valueCI').innerText = text
    }
    
    const displaySlider = useMemo(() => {
      let show;
      if (['ShowImprovement', 'ShowWorsening'].includes(showImprove) && !disableRange) {
        show = 'block'
        changeCI('0')
      } else {
        show = 'none'
      }
      return show
    }, [showImprove, disableRange])

    const theRadioPanel = useMemo(() => {
      return (
        <RadioPanel pass={[setOpt, setRaster, setShowLabel, setShowImprove, setProbLimit, setFunc[2]]} indicator={indicator}/>
      )
    }, [indicator])
    
    return (
      <div className='row'>
      <div className='row' style={{minHeight:'120px'}}>
        <div className='title'>Map of {country.Name}</div>
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
        {legend}    

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
                <b>{coords.remark} : {coords.val ? coords.val : ''}</b>
              </div>
            </div>
          </div>

          {/* FILTER BY CHANGE */}
          <div className='row m-0 p-0' id='optionCI' style={{display:'none'}}>
            <div className='row m-0 p-0 pb-2 justify-content-between'>
              <div className='col-sm-4' style={{minWidth:'50px'}}>
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
              <div className='col-sm-7 bg-danger-subtle rounded-3' style={{minWidth:'50px', display:displaySlider}}>
                <label className='form-check-label'><b>Change significance</b>: <span id='valueCI'>any (0-100%)</span></label>
                  <Ask about='Note on the change certainty' positive={pIndicator.includes(indicator)}/>
                <input className='form-range' type='range' id='rangeCI' disabled={disableRange} defaultValue='0' min='0' max='3' step='1' name='CIRange' onChange={() => changeCI('-1')}/><br/>
              </div>
            </div>
          </div>
          
          </div>
          <div className='col-2 m-0 float-end' style={{fontSize:'medium'}}>
          </div>
        </div>

        <MapContainer 
          zoomControl={false}
          center={country.Center}
          zoom={country.Zoom}
          minZoom={3}
          maxZoom={9}
          style={{width:'100%', height:'60vh', minHeight:'400px', background:'#fff', borderRadius:'10px'}}
          >

          <DefineMap />
          
          {/* raster && showLabel ? <InspectPanel coords={coords}/> : <></> */}

          {theRadioPanel}

          <ZoomPanel country={country}/>

          {/*<FullScreenControl fullscreen={fullscreen} pass={setFullscreen}/>*/}

          <Pane name='basemap' style={{zIndex:0}}>
            {<TileLayer url={basemaps['positron']}/>}
          </Pane>
          
          {showLabel ? <TileLayer url={basemaps['label']} zIndex={500}/> : <></>}

          <Pane name='tiles' style={{zIndex:55}}>
            {mainLayer}
          </Pane>
    
          <Pane name='selected' style={{zIndex:60}}>
            <GeoJSON
              data={selectedState}
              ref={refState}
              style={StateStyle2}
              zIndex={400}
            />
            <GeoJSON
              data={boundary}
              style={StateStyle}
              zIndex={400}
            />
          </Pane>

          {showLabel ? null :
          <Pane name='boundary' style={{zIndex:65}}>    
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

        <div id='loadRaster' className="row" style={{display:'none'}}>
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      </div>

      </div>
    )
}

export function TheMape({ country, boundary, data, selected, setFunc, indicator }){
  return <></>
}