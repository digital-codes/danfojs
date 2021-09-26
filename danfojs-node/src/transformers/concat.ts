/**
*  @license
* Copyright 2021, JsData. All rights reserved.
*
* This source code is licensed under the MIT license found in the
* LICENSE file in the root directory of this source tree.

* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
* ==========================================================================
*/

import Series from "../core/series"
import DataFrame from "../core/frame"
import Utils from "../shared/utils"
import { ArrayType1D, ArrayType2D } from "shared/types"

function processColumn(dfList: Array<DataFrame | Series>, axis: 1 | 0 ): DataFrame {
  let allDf: any = {}
  let dublicateColumns: any = {}
  let maxLen = 0
  for(let i=0; i < dfList.length; i++) {
    let df = dfList[i]
    let columnData = df.getColumnData as ArrayType2D
    let columns = df.columns
    for(let j=0; j < columns.length; j++) {
      let column = columns[j]
      let colData: ArrayType1D = columnData[j]
      if (colData.length > maxLen) {
        maxLen = colData.length
      }
      if (!(column in allDf)) {
        allDf[column] = colData
        dublicateColumns[column] = 0
      } else {
        dublicateColumns[column] +=1
        column += dublicateColumns[column]
        allDf[column] = colData
      }
    }
  }
  Object.keys(allDf).forEach(value => {
    let colLength = allDf[value].length
    if  (colLength < maxLen) {
      let residualLen = maxLen - colLength
      let nanList = new Array(residualLen).fill(NaN)
      allDf[value].push(...nanList)
    }
  })

  return new DataFrame(allDf)
}


function processRow(dfList: Array<DataFrame | Series>, axis: 1 | 0 ): DataFrame {
    let allDf: any = {}
    let maxLen = 0
    for (let i=0; i < dfList.length; i++) {
      let df = dfList[i]
      let columns = df.columns
      let columnData = df.getColumnData as ArrayType2D

      if (i ===0) {
        for(let j=0; j < columns.length; j++) {
          let column = columns[j]
          let colData = columnData[j]
          allDf[column] = colData
        }
      } else {
        let nonColumn = Object.keys(allDf).filter( (key:any) =>{
            return !columns.includes(key)
        })

        for(let j=0; j < columns.length; j++) {
          let column = columns[j]
          let colData = columnData[j]
          if (Object.keys(allDf).includes(column)) {
            allDf[column].push(...colData)
          }
           else {
            let residualArray = new Array(maxLen).fill(NaN)
            residualArray.push(...colData)
            allDf[column] = residualArray
          }
        }
        if (nonColumn.length > 0) {
          let currentDfLen = columnData[0].length
          for( let j=0; j < nonColumn.length; j++) {
            let column = nonColumn[j]
            let residualArray = new Array(currentDfLen).fill(NaN)
            allDf[column].push(...residualArray)
          }
        }
      }
      maxLen += columnData[0].length
    }
    return new DataFrame(allDf)
}

/**
* Concatenate pandas objects along a particular axis.
* @param object
* dfList: Array of DataFrame or Series
* axis: axis of concatenation 1 or 0
* @returns {DataFrame}
*/
function concat({dfList, axis}: {
  dfList : Array<DataFrame | Series>,
  axis: 1 | 0
}): DataFrame {
  if (axis === 1) {
    return processColumn(dfList, axis)
  }
  return processRow(dfList, 0)
}

export default concat