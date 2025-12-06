//Counter page untuk latihan useState, useEffect, dan event handler

"use client";

import { useState } from "react";

export default function CounterPage () {
	
	const [count, setCount] = useState(0);
	const [show, setShow] = useState(true);
	
	return (
		<>
			<h1> Test Counter Page </h1>
			
			<button className="border p-2 mr-1" onClick={() => setCount(count +1)}>+1</button>
			<button className="border p-2 mr-1" onClick={() => setCount(count -1)}>-1</button>
			<button className="border p-2 mr-1" onClick={() => setCount(0)}>Reset</button>
			<button className="border p-2 mr-1" onClick={() => setCount(count +5)}>+5</button>
			<button className="border p-2" onClick={() => setShow(!show)}>Toggle Counter</button>
			
			{show && <h2>{count}</h2>}
			
		</>
	)
    
}