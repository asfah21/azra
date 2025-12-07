// "use client"

// import { useState } from "react";

// export default function FormPage(){
//     const [name, setName] = useState("");
//     const [result, setResult] = useState("");

//     const handleSubmit = (e: any) => {
//         e.preventDefault();
//         setResult(name);
//     };

//     return (
//         <>
//         <div> Form Page Test </div>
//         <div>
//             <form onSubmit={handleSubmit}>
//                 <label htmlFor="name">Name:</label>
//                 <input
//                     type="text"
//                     id="name"
//                     value={name}
//                     onChange={(e) => setName(e.target.value)}
//                 />
//                 <button type="submit">Submit</button>
//             </form>
//             {result && <p> Result: {result}</p>}
//         </div>
//         </>
//     )
// }

"use client";

import { useState } from "react";

export default function FormPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");
  const [result, setResult] = useState({
    name: "",
    email: "",
    hp: "",
  });

  const aturSubmit = (e: any) => {
    e.preventDefault();
    setResult({ name, email, hp });
  };

  return (
    <>
      <h1>FORM PAGE GSI</h1>

      <form onSubmit={aturSubmit}>
        <label htmlFor="name">Name:</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label htmlFor="email"> Email:</label>
        <input
          id="email"
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="hp"> HP:</label>
        <input
          id="hp"
          type="text"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
        />
        <button className="border p-1 m-2 rounded-md" type="submit">
          {" "}
          Kirim Data
        </button>
      </form>

      {/* {result && <p> Result : {result} </p>} */}
      {/* {result.length > 0 && <p>Result : {result.join(" | ")}</p>} */}
      <p>{result.name}</p>
      <p>{result.email}</p>
      <p>{result.hp}</p>
    </>
  );
}
