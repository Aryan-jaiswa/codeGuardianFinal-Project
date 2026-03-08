import React, { useEffect, useState } from "react";
import axios from "axios";
import {
 LineChart,
 Line,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 ResponsiveContainer
} from "recharts";

function TimelineGraph(){

 const [data,setData] = useState([]);

 useEffect(()=>{

  axios.get("http://localhost:3001/api/timeline")
  .then(res=>{
   setData(res.data);
  })
  .catch(err=>{
   console.log(err);
  });

 },[]);

 return(

  <div style={{width:"100%",height:300}}>

   <h2>Security Timeline</h2>

   <ResponsiveContainer>

    <LineChart data={data}>

     <CartesianGrid strokeDasharray="3 3"/>

     <XAxis dataKey="date"/>

     <YAxis/>

     <Tooltip/>

     <Line
       type="monotone"
       dataKey="vulnerabilityCount"
       stroke="#ff4d4f"
       strokeWidth={3}
     />

    </LineChart>

   </ResponsiveContainer>

  </div>

 );

}

export default TimelineGraph;