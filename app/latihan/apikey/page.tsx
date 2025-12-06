export default async function ApiKey() {
    
    const data = await fetch("https://gsi.db-ku.com/api/towerlamp",{
		headers : {
			"x-api-key" : process.env.API_Public || "gsi_b12e4a0df871b8436d92ea57c1f843azva2d4f0b6cd72fae9158b63d4ac9f",
			"Content-type" : "application/json"
		}
	});	
	const result = await data.json()
    const array = Array.isArray(result.data) ? result.data : [];

	return (
		<>
			<h1> DATA API KEY </h1>
			<pre>{JSON.stringify(result, null, 2)}</pre>
            
            {array.map((e:any) => (
				<li key={e.id}> {e.nama_driver}</li>
			))}			
		</>
	)
}