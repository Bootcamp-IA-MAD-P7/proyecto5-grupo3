import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Link } from "react-router-dom";


import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export const AdminPage = () => {
  const [tenure, setTenure] = useState("");
  const [monthlyCharges, setMonthlyCharges] = useState("");
  const [contractType, setContractType] = useState("");

  return (
    <div className="p-6 space-y-6">
      {/* Título */}
      <h1 className="text-3xl font-bold">Dashboard Churn Prediction</h1>
      <p className="text-gray-600">Panel de métricas y predicciones</p>

      {/* Métricas */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas del modelo</CardTitle>
        </CardHeader>

        <CardContent>
          <p>Accuracy: 0.82</p>
          <p>Precision: 0.79</p>
          <p>Recall: 0.75</p>
          <p>F1-score: 0.77</p>

          <p className="text-sm text-gray-500 mt-2">
            Estas métricas son representativas. Cuando conectemos el backend, se
            actualizarán automáticamente.
          </p>
        </CardContent>
      </Card>

      <Separator />

      {/* Gráficas */}
      <Card>
        <CardHeader>
          <CardTitle>Gráficas</CardTitle>
        </CardHeader>

        <CardContent>
          <p>Aquí irán las visualizaciones del churn.</p>
        </CardContent>
      </Card>

      <Separator />

      {/* Formulario */}
      <Card>
        <CardHeader>
          <CardTitle>Predicción</CardTitle>
        </CardHeader>

       <CardContent className="space-y-4">
  <div className="space-y-2">
    <Label>Tenure</Label>
    <Input
      type="number"
      value={tenure}
      onChange={(e) => setTenure(e.target.value)}
    />
  </div>

  <div className="space-y-2">
    <Label>Monthly Charges</Label>
    <Input
      type="number"
      value={monthlyCharges}
      onChange={(e) => setMonthlyCharges(e.target.value)}
    />
  </div>

  <div className="space-y-2">
    <Label>Contract Type</Label>
    <Select
      value={contractType}
      onValueChange={(value) => setContractType(value)}
    >
      <SelectTrigger>
        <SelectValue placeholder="Selecciona un contrato" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="month-to-month">Month-to-month</SelectItem>
        <SelectItem value="one-year">One year</SelectItem>
        <SelectItem value="two-year">Two year</SelectItem>
      </SelectContent>
    </Select>
  </div>

  <Button className="w-full">Enviar</Button>

  <Link to="/admin/eda">
    <Button className="w-full bg-blue-600 text-white mt-4">
      Ver análisis EDA y modelo
    </Button>
  </Link>

  <div className="p-4 border rounded-md text-gray-600">
    Aquí aparecerá la predicción del churn.
  </div>
</CardContent>
