import React, { useState } from "react";
import { Plus, Eye, Edit, Trash2, X, Save } from "lucide-react";
import { getMainBackgroundClasses, CSS_CLASSES } from "../../components/layout";

interface Medicine {
  id: string;
  name: string;
  category: string;
  manufacturer: string;
  stock: number;
  price: number;
  description: string;
}

const MedicineInventory: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([
    {
      id: "1",
      name: "Penicilina G",
      category: "Antibiótico",
      manufacturer: "FarmVet",
      stock: 15,
      price: 45.5,
      description: "Antibiótico de amplio espectro",
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [stock, setStock] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");

  const clearForm = () => {
    setName("");
    setCategory("");
    setManufacturer("");
    setStock("");
    setPrice("");
    setDescription("");
  };

  const openAddModal = () => {
    clearForm();
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (medicine: Medicine) => {
    setName(medicine.name);
    setCategory(medicine.category);
    setManufacturer(medicine.manufacturer);
    setStock(medicine.stock.toString());
    setPrice(medicine.price.toString());
    setDescription(medicine.description);
    setEditingId(medicine.id);
    setShowModal(true);
  };

  const handleSave = () => {
    if (!name.trim() || !manufacturer.trim()) {
      alert("Por favor completa nombre y fabricante");
      return;
    }

    const medicineData: Medicine = {
      id: editingId || Date.now().toString(),
      name: name.trim(),
      category: category.trim(),
      manufacturer: manufacturer.trim(),
      stock: parseInt(stock) || 0,
      price: parseFloat(price) || 0,
      description: description.trim(),
    };

    if (editingId) {
      // Editar
      setMedicines(prev => prev.map(med => 
        med.id === editingId ? medicineData : med
      ));
    } else {
      // Agregar
      setMedicines(prev => [...prev, medicineData]);
    }

    setShowModal(false);
    clearForm();
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("¿Eliminar este medicamento?")) {
      setMedicines(prev => prev.filter(med => med.id !== id));
    }
  };

  const openDetailModal = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setShowDetailModal(true);
  };

  return (
    <div className={`min-h-screen ${getMainBackgroundClasses()}`}>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Inventario de Medicamentos
              </h1>
              <p className="text-white/90">
                Gestión de medicamentos veterinarios
              </p>
            </div>
            <button
              onClick={openAddModal}
              className="bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:from-[#265a44] hover:to-[#3d7a5c] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Medicamento</span>
            </button>
          </div>
        </div>

        {/* Lista de Medicamentos */}
        <div className="space-y-4">
          {medicines.map((medicine) => (
            <div
              key={medicine.id}
              className={`${CSS_CLASSES.card} p-6 hover:shadow-lg transition-all`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {medicine.name}
                  </h3>
                  <p className="text-gray-600 mb-3">{medicine.description}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <strong>Categoría:</strong> {medicine.category}
                    </div>
                    <div>
                      <strong>Fabricante:</strong> {medicine.manufacturer}
                    </div>
                    <div>
                      <strong>Stock:</strong> {medicine.stock}
                    </div>
                    <div>
                      <strong>Precio:</strong> ${medicine.price}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => openDetailModal(medicine)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEditModal(medicine)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(medicine.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal Formulario */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">
                    {editingId ? "Editar Medicamento" : "Nuevo Medicamento"}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nombre del medicamento"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoría
                    </label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Categoría"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fabricante *
                    </label>
                    <input
                      type="text"
                      value={manufacturer}
                      onChange={(e) => setManufacturer(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Fabricante"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock
                    </label>
                    <input
                      type="number"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Precio
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    placeholder="Descripción del medicamento"
                  />
                </div>
              </div>

              <div className="p-6 border-t bg-gray-50">
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white rounded-lg hover:from-[#265a44] hover:to-[#3d7a5c] flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Guardar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Detalle */}
        {showDetailModal && selectedMedicine && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">Detalle del Medicamento</h2>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold">{selectedMedicine.name}</h3>
                    <p className="text-gray-600">{selectedMedicine.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Categoría:</span>
                      <span className="ml-2">{selectedMedicine.category}</span>
                    </div>
                    <div>
                      <span className="font-medium">Fabricante:</span>
                      <span className="ml-2">{selectedMedicine.manufacturer}</span>
                    </div>
                    <div>
                      <span className="font-medium">Stock:</span>
                      <span className="ml-2">{selectedMedicine.stock}</span>
                    </div>
                    <div>
                      <span className="font-medium">Precio:</span>
                      <span className="ml-2">${selectedMedicine.price}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicineInventory;