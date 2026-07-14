import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const AdminEDA = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Título */}
      <h1 className="text-3xl font-bold">
        Análisis Exploratorio de Datos (EDA)
      </h1>
      <p className="text-gray-600">Visualización y exploración del churn</p>

      {/* Gráfica de churn */}
      <Card>
        <CardHeader>
          <CardTitle>Cancelación (Churn)</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Aquí irá la gráfica de churn.</p>
        </CardContent>
      </Card>

      {/* Correlación */}
      <Card>
        <CardHeader>
          <CardTitle>Matriz de correlación</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Aquí irá la matriz de correlación.</p>
        </CardContent>
      </Card>

      {/* Distribución de contratos */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución de contratos</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Aquí irá la gráfica de distribución de contratos.</p>
        </CardContent>
      </Card>

      {/* Guía del modelo */}
      <Card>
        <CardHeader>
          <CardTitle>Guía del modelo</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Este modelo se entrenó usando Tenure, Monthly Charges y Contract
            Type.
          </p>
          <p>Las métricas del modelo se muestran en el panel principal.</p>
        </CardContent>
      </Card>
    </div>
  );
};
