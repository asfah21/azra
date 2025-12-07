// https://api.vercel.app/blog'
// page/api

export default async function ApiPage() {
  const data = await fetch("https://api.vercel.app/blog");
  const posts = await data.json();

  return (
    <>
      <h1>API Page</h1>
      <ul>
        <pre>{JSON.stringify(posts, null, 2)}</pre>

        {posts.map((e: any) => (
          <li key={e.id}> {e.author}</li>
        ))}
      </ul>
    </>
  );
}
