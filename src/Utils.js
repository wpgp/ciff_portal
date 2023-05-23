import { React, useState } from 'react';
import Form from 'react-bootstrap/Form';

import colormaps from './data/colormaps.json';

export function ArgMax(array) {
    return [].map.call(array, (x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1];
}

export function ArgMin(array) {
    return [].map.call(array, (x, i) => [x, i]).reduce((r, a) => (a[0] < r[0] ? a : r))[1];
}

export function DecimalFormat({ value, precision=1 }){
    return parseFloat(value).toFixed(precision)
}

export function FloatFormat(value, precision=3){
    return parseFloat(value).toFixed(precision)
}

export function GetColor(d, minmax, cmapID){
    if (d < -90) {
        return null
    } else {
        d = (d - minmax[0])/(minmax[1] - minmax[0])
        const palette = colormaps[cmapID]
        const val = Math.min(Math.max(0, parseInt(19*d)), 19)
        const idx = String(val)    
        return palette[idx]
    }
}

export function LookupTable(props){
    const second = props.second === undefined ? props.first : props.second
    const filtered = props.items.filter((item) => item[props.first].replaceAll(' ','') === props.value.replaceAll(' ',''))
    if (typeof(second) === 'string'){
      return filtered[0] === undefined ? '' : filtered[0][second]
    } else {
      return (
        second.map((item) => (
          filtered[0] === undefined ? '' : filtered[0][item]
        ))
      )
    }
}

export function GroupSelect({ items, lead, end, defaultOpt, pass }){
    const group = [...new Set(items.map((item) => item[lead]))];

    function handleChange(e){
        pass(e.target.value)
    }
    
    return (
        <div>
            <Form.Select defaultValue={defaultOpt} onChange={handleChange}>
                {group.map((item) => {
                    const itm = (items.filter((i) => i[lead] === item)).map((i) => i[end]);
                    return (
                        <optgroup key={'group'+item} label={item}>
                            {itm.map((i) => <option key={'opt'+i} value={i.replaceAll(' ','')}>{i}</option>)}
                        </optgroup>
                    )
                })}
            </Form.Select>
        </div>
    )
}

export function GroupSelects(props){
    const [itm, setItm] = useState(props.items);
    const fixed = props.fixed ? props.fixed : ['none'];
    const lead = props.lead ? props.lead : props.keys;
    const end = props.end ? props.end : props.keys[-1];
    
    function handleChange(event){
        const value = event.target.value;
        const key = event.target.id.slice(6);
        let filtered = {};
  
        if (end.includes(key)) {
            props.pass(value);
            if (value !== 'default') {
              filtered = props.items.filter((item) => (item === value))
            }
        }
  
        if (lead.includes(key)) {
            if (value === 'default') {
              setItm(props.items)
            } else {
              filtered = props.items.filter((item) => {
                return item[key].replaceAll(' ','') === value
              })
              setItm(filtered)    
            }
        }
    }
  
    return (
        <div>
            {props.keys.map((key) => {
                const items = (fixed.includes(key)) ? [...new Set(props.items.map((item) => item[key]))] : [...new Set(itm.map((item) => item[key]))];
                const defaultOpt = ((key === end) && (props.defaultOpt)) ? props.defaultOpt : 'default';
                const disabled_ = (key === end) ? true : false;
  
                return (
                  <div className='col' key={'div'+key}>
                    <Form.Select id={'select'+key} key={'select'+key} onChange={handleChange} defaultValue={defaultOpt}>
                        <option key={'default'+key} value={'default'} disabled={disabled_}>{'Select '+key}</option>
                        {items.map((item) => {
                            const value = item.replaceAll(' ','')
                            return (
                                <option key={'opt'+value} value={value}>{item}</option>
                            )
                        })}
                    </Form.Select>
                  </div>
                )
            })}
        </div>
    )
}

export function SimpleSelect({ name, items, defaultOpt, pass, noDefault }){
    function handleChange(e){
        pass(e.target.value)
    }
  
    return (
        <>
            <Form.Select id={'select'+name} key={'select'+name} defaultValue={defaultOpt} onChange={handleChange}>
                {noDefault ? '' : <option key={'default'+defaultOpt} value={''}>Select {name}</option>}
                {items.map((item) => {
                    const value = item.replaceAll(' ','')
                    return (
                        <option key={'opt'+value} value={value}>{item}</option>
                    )
                })}
            </Form.Select>
        </>
    )
}
