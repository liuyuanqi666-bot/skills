import { Meteors } from "./meteors"
function App() {
  return (
    <main className="page-shell">
      <section className="meteor-demo" aria-labelledby="meteor-title">
        <Meteors number={30} />
        <h1 id="meteor-title">流星</h1>
      </section>
    </main>
  )
}

export default App;
