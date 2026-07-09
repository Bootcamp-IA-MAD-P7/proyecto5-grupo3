import { Button } from "@/components/ui/button";
import "./App.css";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <>
      {/* Código de tu compañero */}
      <div className="flex min-h-svh flex-col items-center justify-center">
        <h1>Proyecto de Clasificación</h1>
        <Button>Click me</Button>
      </div>

      {/* Tu Dashboard debajo */}
      <Dashboard />
    </>
  );
}

export default App;
