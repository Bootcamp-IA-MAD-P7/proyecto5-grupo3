export const AdminPage = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Título */}
      <h1 className="text-3xl font-bold">Dashboard Churn Prediction</h1>
      <p className="text-gray-600">Panel de métricas y predicciones</p>

      {/* Métricas */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Métricas del modelo</h2>
        <p>Accuracy: —</p>
        <p>Precision: —</p>
        <p>Recall: —</p>
        <p>F1-score: —</p>
      </div>

      {/* Gráficas */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Gráficas</h2>
        <p>Aquí irán las visualizaciones del churn.</p>
      </div>

      {/* Formulario */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Predicción</h2>

        <form className="space-y-4">
          <div>
            <label className="block mb-1">Tenure</label>
            <input type="number" className="border p-2 w-full rounded" />
          </div>

          <div>
            <label className="block mb-1">Monthly Charges</label>
            <input type="number" className="border p-2 w-full rounded" />
          </div>

          <div>
            <label className="block mb-1">Contract Type</label>
            <select className="border p-2 w-full rounded">
              <option>Month-to-month</option>
              <option>One year</option>
              <option>Two year</option>
            </select>
          </div>

          <button className="w-full bg-blue-600 text-white px-4 py-2 rounded">
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
};
