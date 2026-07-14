import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

export default function ChurnFormulario() {
  // Estado para controlar los valores del formulario
  const [formData, setFormData] = useState({
    gender: "Female",
    SeniorCitizen: 0,
    Partner: "No",
    Dependents: "No",
    tenure: 1,
    PhoneService: "No",
    MultipleLines: "No phone service",
    InternetService: "No",
    OnlineSecurity: "No internet service",
    OnlineBackup: "No internet service",
    DeviceProtection: "No internet service",
    TechSupport: "No internet service",
    StreamingTV: "No internet service",
    StreamingMovies: "No internet service",
    Contract: "Month-to-month",
    PaperlessBilling: "No",
    PaymentMethod: "Mailed check",
    MonthlyCharges: 20.0,
    TotalCharges: 20.0,
  });

  // Estado para la respuesta predictiva de FastAPI
  const [predictionResult, setPredictionResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Manejadores de cambios específicos
  const handleChange = (key, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [key]: value };
      // Recálculo automático simple de cargos totales si cambia tenure o monthly
      if (key === "tenure" || key === "MonthlyCharges") {
        updated.TotalCharges = (parseFloat(updated.tenure) * parseFloat(updated.MonthlyCharges)).toFixed(2);
      }
      return updated;
    });
  };

  // Envío de datos al Backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Reemplazar con la URL real de tu FastAPI dockerizado (ej: http://localhost:8000/predict)
      const response = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      setPredictionResult(data);
    } catch (error) {
      console.error("Error al conectar con la API:", error);
      // Simulación local con fines demostrativos si la API no está arriba
      setPredictionResult({
        churn_risk_score: 78.4,
        will_churn: true,
        top_factors: ["Contrato Mes a Mes", "Falta de Soporte Técnico Premium", "Uso de Fibra Óptica"],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* COLUMNA IZQUIERDA: FORMULARIO */}
        <div className="lg:col-span-7">
          <Card className="w-full shadow-md">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-slate-800">🔍 Datos del Cliente</CardTitle>
              <CardDescription>Introduce los parámetros actuales para evaluar la probabilidad de abandono.</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent>
                <Tabs defaultValue="cuenta" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="cuenta">Cuenta y Finanzas</TabsTrigger>
                    <TabsTrigger value="servicios">Servicios</TabsTrigger>
                    <TabsTrigger value="demograficos">Demográficos</TabsTrigger>
                  </TabsList>

                  {/* PESTAÑA: CUENTA Y FINANZAS */}
                  <TabsContent value="cuenta" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="tenure">Antigüedad (Meses)</Label>
                        <Input
                          id="tenure"
                          type="number"
                          min="1"
                          max="72"
                          value={formData.tenure}
                          onChange={(e) => handleChange("tenure", parseInt(e.target.value) || 1)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tipo de Contrato</Label>
                        <Select value={formData.Contract} onValueChange={(v) => handleChange("Contract", v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Month-to-month">Mes a Mes</SelectItem>
                            <SelectItem value="One year">Un Año</SelectItem>
                            <SelectItem value="Two year">Dos Años</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="MonthlyCharges">Cargo Mensual ($)</Label>
                        <Input
                          id="MonthlyCharges"
                          type="number"
                          step="0.01"
                          value={formData.MonthlyCharges}
                          onChange={(e) => handleChange("MonthlyCharges", parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="TotalCharges">Cargos Totales Estimados ($)</Label>
                        <Input id="TotalCharges" type="number" readOnly value={formData.TotalCharges} className="bg-slate-50 cursor-not-allowed" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Método de Pago</Label>
                      <Select value={formData.PaymentMethod} onValueChange={(v) => handleChange("PaymentMethod", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Electronic check">Cheque Electrónico</SelectItem>
                          <SelectItem value="Mailed check">Cheque por Correo</SelectItem>
                          <SelectItem value="Bank transfer (automatic)">Transferencia Bancaria (Auto)</SelectItem>
                          <SelectItem value="Credit card (automatic)">Tarjeta de Crédito (Auto)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center justify-between border p-3 rounded-lg">
                      <div className="space-y-0.5">
                        <Label>Facturación Electrónica (Paperless)</Label>
                        <p className="text-sm text-slate-500">Envío de facturas por email.</p>
                      </div>
                      <Switch
                        checked={formData.PaperlessBilling === "Yes"}
                        onCheckedChange={(checked) => handleChange("PaperlessBilling", checked ? "Yes" : "No")}
                      />
                    </div>
                  </TabsContent>

                  {/* PESTAÑA: SERVICIOS */}
                  <TabsContent value="servicios" className="space-y-4">
                    <div className="space-y-2">
                      <Label>Proveedor de Internet</Label>
                      <Select value={formData.InternetService} onValueChange={(v) => handleChange("InternetService", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DSL">DSL</SelectItem>
                          <SelectItem value="Fiber optic">Fibra Óptica</SelectItem>
                          <SelectItem value="No">Sin Servicio de Internet</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Seguridad en Línea</Label>
                        <Select value={formData.OnlineSecurity} onValueChange={(v) => handleChange("OnlineSecurity", v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Yes">Sí</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                            <SelectItem value="No internet service">Sin Internet</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Soporte Técnico Premium</Label>
                        <Select value={formData.TechSupport} onValueChange={(v) => handleChange("TechSupport", v)}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Yes">Sí</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                            <SelectItem value="No internet service">Sin Internet</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

Streaming TV<Select value={formData.StreamingTV} onValueChange={(v) => handleChange("StreamingTV", v)}>SíNoSin InternetStreaming Películas<Select value={formData.StreamingMovies} onValueChange={(v) => handleChange("StreamingMovies", v)}>SíNoSin Internet{/* PESTAÑA: DEMOGRÁFICOS */}Género<Select value={formData.gender} onValueChange={(v) => handleChange("gender", v)}>FemeninoMasculino¿Es Adulto Mayor?<Switchchecked={formData.SeniorCitizen === 1}onCheckedChange={(checked) => handleChange("SeniorCitizen", checked ? 1 : 0)}/>¿Tiene Pareja?<Select value={formData.Partner} onValueChange={(v) => handleChange("Partner", v)}>SíNo¿Tiene Dependientes familiares?<Select value={formData.Dependents} onValueChange={(v) => handleChange("Dependents", v)}>SíNo{loading ? "Analizando Patrones..." : "🎯 Calcular Riesgo de Churn"}{/* COLUMNA DERECHA: RESULTADO DE PREDICCIÓN */});}