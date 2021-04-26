import './App.css';
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import equations from './components/equations';

function App() {
  
  // initiate props for data display. 
  const [dataCsv, setDatacsv] = useState([]);
  const [targetNumber, setTargetNumber] = useState(0);
  const [equationsList, setEquationsList] = useState({equations: []});
  const [summary, setSummary] = useState("");
  
    // process CSV data
    const processData = dataString => {
      const dataStringLines = dataString.split(/\r\n|\n/);
      const headers = dataStringLines[0].split(/,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/);

      const list = [];
      
      for (let i = 0; i < dataStringLines.length; i++) {
        const row = dataStringLines[i].split(/,(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)/);
        if (headers && row.length === headers.length) {
          const obj = {};
          for (let j = 0; j < headers.length; j++) {
            let d = row[j];
            if (d.length > 0) {
              if (d[0] === '"')
                d = d.substring(1, d.length - 1);
              if (d[d.length - 1] === '"')
                d = d.substring(d.length - 2, 1);
            }
            if (headers[j]) {
              obj[headers[j]] = d;
            }
          }
          // remove the blank rows
          if (Object.values(obj).filter(x => x).length > 0) {
            for(var key in obj) {
              list.push(parseInt(obj[key]));
              
            }
          }
          setDatacsv(list);
        }
      }
    }

    // handle file upload
    const handleFileUpload = e => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (evt) => {
        /* Parse data */
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        /* Get first worksheet */
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        /* Convert array of arrays */
        const data = XLSX.utils.sheet_to_csv(ws, { header: 1 });
        processData(data);
      };
      reader.readAsBinaryString(file);
    }
    
    // save the target Number
    const saveTargetNumber = e => {
      setTargetNumber(e)
    }


  // start a recursive / knapsack algorith to calculate all equations.
  function  findTotalWays(arr, t, equation, dict){
  // If target is reached, return 1
 
  if (t === 0){
      if (equation.length >=2) {
        var equ = equation.substring(1, equation.length-1);
        if(equations.indexOf(equ) === -1){
          equations.push(equ)
          setEquationsList({equations: equations})
          return 1
        }
      }
  }
  
  // If all elements are processed and
  // target is not reached, return 0
  if (Object.keys(dict).length === arr.length && t !== 0){
    return 0
  }

  // Return total count of 2 cases
  // 1. Don't consider current element
  // 2. Consider current element and add / subtract / multiply / delete it from remaining target recursively.
  var sum = 0
  for(var index = 0; index < arr.length && !dict.hasOwnProperty(index); index++){

    dict[index] = index
    sum += (findTotalWays(arr, t, equation, dict) + 
          findTotalWays(arr, t + arr[index], "(" + equation + "+" + arr[index].toString() + ")",dict ) + 
          findTotalWays(arr, t - arr[index],"(" + equation  + "-"+ arr[index].toString() + ")",dict ) +
          findTotalWays(arr, t * arr[index],"(" + equation  + "*"+ arr[index].toString() + ")",dict ) + 
          findTotalWays(arr, t / arr[index],"(" + equation + "/" + arr[index].toString() + ")",dict ))
    delete dict[index]
    }

  return sum
  } 

  // form onSumbit function
  const onSubmit = (e) => {
    e.preventDefault();
    var data = [...dataCsv]
    equations.length = 0;
    setEquationsList({equations:[]})
    var sum = findTotalWays(data, targetNumber, targetNumber.toString(), {} )
    setSummary('Target number ' + targetNumber + ' can be generated in ' + sum +' different ways using the list ' + dataCsv.toString())
  

  
  }


  // prepare list of equations tahta re valid for a target
  var list
  if( equationsList.equations && equationsList.equations.length > 0) {
    list = []
    var i = 1
    equationsList.equations.map( eq => 
        list.push((  <li key={eq} className='equations' >{ i++ } . {eq}</li> ))
        
        ) 
  }
  else{
    list = (<p></p>)
  }

  return (
    <div className='form-body'>
      <form onSubmit={onSubmit}>
      <h3>Target Number Generator - Check if target can be generated from given list of numbers in a CSV.</h3>
      <input
        type="file"
        accept=".csv"
        onClick={(e)=> { e.target.value=null } }
        onChange={handleFileUpload}
        required={true}
      />
      <br/>
      <label>Enter target Number </label>
       <input
       className='target-sum'
        type="number"
        onChange={(e) =>  {saveTargetNumber(e.target.value)}}
        value = {targetNumber}
        min="1"
        required={true}
      />
      <br/>
      <input type='submit' value='Generate Equations' className='submit-button'/>
      <h3 className={equationsList.equations? 'summary-success': 'summary-fail'}>{summary}</h3>
      <ul>
      { 
        list
      }
      </ul>
      </form>
  </div>
  );
}

export default App;
