"use client";

import { useState} from "react";

export default  function apiPostPage() {

    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [result, setResult] = useState(null);

    const handleSubmit = async (e: any) => {
        e.preventDefault();        

        const response = await fetch ('https://jsonplaceholder.typicode.com/posts', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                title,
                body,
                // userId: 1
            }),
        });
        const data = await response.json();
        console.log(data);
        setResult(data);
    };

    return (
        <>
            <h1>Latihan API Post</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="title">Title </label>
                <input 
                    type="text"
                    id="title" 
                    name="title"
                    value={title}
                    onChange = {(e) => setTitle(e.target.value)}
                />

                <label htmlFor="body"> Body</label>
                <input 
                    type="text" 
                    id="body"
                    name="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                />

                <button type="submit"> Submit</button>
            </form>

            {result && <pre>{JSON.stringify(result, null, 2)}</pre>}

            {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
        </>
    )
}