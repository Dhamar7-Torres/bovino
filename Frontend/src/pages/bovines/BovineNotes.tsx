import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  Search,
  Filter,
  User,
  Tag,
  FileText,
  Image,
  Paperclip,
  Edit3,
  Trash2,
  Share2,
  Eye,
  EyeOff,
  Clock,
  MoreVertical,
  Save,
  X,
  AlertCircle,
  Heart,
  Activity,
  Droplets,
  Baby,
  ShieldCheck,
  Weight,
  Stethoscope,
  MessageSquare,
  Pin,
  Bell,
  Copy,
  Mic,
  RefreshCw,
} from "lucide-react";

// Interfaces para las notas
interface NoteAttachment {
  id: string;
  name: string;
  type: "IMAGE" | "DOCUMENT" | "AUDIO" | "VIDEO";
  url: string;
  size: number;
  uploadDate: Date;
}

interface NoteReminder {
  id: string;
  date: Date;
  message: string;
  isCompleted: boolean;
  notificationSent: boolean;
}

interface BovineNote {
  id: string;
  title: string;
  content: string;
  category: NoteCategory;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  tags: string[];
  isPrivate: boolean;
  isPinned: boolean;
  authorId: string;
  authorName: string;
  createdAt: Date;
  updatedAt: Date;
  attachments: NoteAttachment[];
  reminders: NoteReminder[];
  relatedNotes: string[];
  template?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  weather?: {
    temperature: number;
    condition: string;
    humidity: number;
  };
}

type NoteCategory =
  | "HEALTH"
  | "BEHAVIOR"
  | "REPRODUCTION"
  | "FEEDING"
  | "TREATMENT"
  | "VACCINATION"
  | "WEIGHT"
  | "GENERAL"
  | "EMERGENCY";

interface NoteTemplate {
  id: string;
  name: string;
  category: NoteCategory;
  content: string;
  fields: {
    name: string;
    type: "text" | "number" | "date" | "select";
    required: boolean;
    options?: string[];
  }[];
}

interface FilterOptions {
  searchTerm: string;
  category: NoteCategory | "ALL";
  priority: string;
  author: string;
  dateRange: string;
  tags: string[];
  showPinned: boolean;
  showPrivate: boolean;
}

// Configuración de categorías
const noteCategories = {
  HEALTH: {
    label: "Salud",
    icon: Heart,
    color: "bg-red-100 text-red-800 border-red-200",
    description: "Estado de salud general, síntomas, observaciones médicas",
  },
  BEHAVIOR: {
    label: "Comportamiento",
    icon: Activity,
    color: "bg-blue-100 text-blue-800 border-blue-200",
    description: "Patrones de comportamiento, actividad, temperamento",
  },
  REPRODUCTION: {
    label: "Reproducción",
    icon: Baby,
    color: "bg-pink-100 text-pink-800 border-pink-200",
    description: "Ciclos reproductivos, gestación, apareamiento",
  },
  FEEDING: {
    label: "Alimentación",
    icon: Droplets,
    color: "bg-green-100 text-green-800 border-green-200",
    description: "Consumo de alimento, agua, suplementos",
  },
  TREATMENT: {
    label: "Tratamiento",
    icon: Stethoscope,
    color: "bg-purple-100 text-purple-800 border-purple-200",
    description: "Medicamentos, terapias, procedimientos médicos",
  },
  VACCINATION: {
    label: "Vacunación",
    icon: ShieldCheck,
    color: "bg-indigo-100 text-indigo-800 border-indigo-200",
    description: "Vacunas aplicadas, calendario de inmunización",
  },
  WEIGHT: {
    label: "Peso",
    icon: Weight,
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    description: "Registro de peso, crecimiento, desarrollo",
  },
  GENERAL: {
    label: "General",
    icon: FileText,
    color: "bg-gray-100 text-gray-800 border-gray-200",
    description: "Observaciones generales, notas diversas",
  },
  EMERGENCY: {
    label: "Emergencia",
    icon: AlertCircle,
    color: "bg-red-100 text-red-800 border-red-200",
    description: "Situaciones de emergencia, alertas urgentes",
  },
};

// Componente para mostrar etiquetas de prioridad
const PriorityBadge: React.FC<{ priority: BovineNote["priority"] }> = ({
  priority,
}) => {
  const config = {
    LOW: { color: "bg-gray-100 text-gray-800", label: "Baja" },
    MEDIUM: { color: "bg-blue-100 text-blue-800", label: "Media" },
    HIGH: { color: "bg-orange-100 text-orange-800", label: "Alta" },
    URGENT: { color: "bg-red-100 text-red-800", label: "Urgente" },
  };

  const { color, label } = config[priority];

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}
    >
      {label}
    </span>
  );
};

// Componente para la tarjeta de nota
const NoteCard: React.FC<{
  note: BovineNote;
  onEdit: (note: BovineNote) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onTogglePrivate: (id: string) => void;
  onView: (note: BovineNote) => void;
  index: number;
}> = ({
  note,
  onEdit,
  onDelete,
  onTogglePin,
  onTogglePrivate,
  onView,
  index,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const category = noteCategories[note.category];
  const IconComponent = category.icon;

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return "Hace unos minutos";
    if (hours < 24) return `Hace ${hours} hora${hours > 1 ? "s" : ""}`;
    return date.toLocaleDateString("es-MX");
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-md border-2 transition-all duration-300 hover:shadow-lg ${
        note.isPinned
          ? "border-yellow-300 bg-yellow-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
      style={{
        opacity: 1,
        transform: `translateY(0px)`,
        transitionDelay: `${index * 50}ms`,
      }}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {note.isPinned && <Pin className="w-4 h-4 text-yellow-500" />}
              {note.isPrivate && <EyeOff className="w-4 h-4 text-gray-500" />}
              <IconComponent className="w-4 h-4" />
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${category.color}`}
              >
                {category.label}
              </span>
              <PriorityBadge priority={note.priority} />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg mb-1" style={{
              overflow: "hidden",
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
            }}>
              {note.title}
            </h3>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {note.authorName}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDate(note.createdAt)}
              </div>
              {note.attachments.length > 0 && (
                <div className="flex items-center gap-1">
                  <Paperclip className="w-3 h-3" />
                  {note.attachments.length}
                </div>
              )}
            </div>
          </div>

          {/* Menú de acciones */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div
                className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[140px]"
                style={{
                  opacity: 1,
                  transform: 'scale(1) translateY(0px)',
                }}
              >
                <button
                  onClick={() => {
                    onView(note);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                >
                  <Eye className="w-4 h-4" />
                  Ver completa
                </button>
                <button
                  onClick={() => {
                    onEdit(note);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                >
                  <Edit3 className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => {
                    onTogglePin(note.id);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                >
                  <Pin className="w-4 h-4" />
                  {note.isPinned ? "Desfijar" : "Fijar"}
                </button>
                <button
                  onClick={() => {
                    onTogglePrivate(note.id);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                >
                  {note.isPrivate ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                  {note.isPrivate ? "Hacer pública" : "Hacer privada"}
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${note.title}\n\n${note.content}`
                    );
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                >
                  <Copy className="w-4 h-4" />
                  Copiar
                </button>
                <button
                  onClick={() => {
                    onDelete(note.id);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4">
        <p className="text-gray-700 mb-3" style={{
          overflow: "hidden",
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: 3,
        }}>{note.content}</p>

        {/* Tags */}
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {note.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700"
              >
                <Tag className="w-2.5 h-2.5 mr-1" />
                {tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{note.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Recordatorios pendientes */}
        {note.reminders.filter((r) => !r.isCompleted).length > 0 && (
          <div className="flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded mb-3">
            <Bell className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              {note.reminders.filter((r) => !r.isCompleted).length}{" "}
              recordatorio(s) pendiente(s)
            </span>
          </div>
        )}

        {/* Attachments preview */}
        {note.attachments.length > 0 && (
          <div className="flex items-center gap-2 mb-3">
            {note.attachments.slice(0, 3).map((attachment) => (
              <div
                key={attachment.id}
                className="w-12 h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center"
              >
                {attachment.type === "IMAGE" ? (
                  <Image className="w-6 h-6 text-gray-500" />
                ) : attachment.type === "AUDIO" ? (
                  <Mic className="w-6 h-6 text-gray-500" />
                ) : (
                  <FileText className="w-6 h-6 text-gray-500" />
                )}
              </div>
            ))}
            {note.attachments.length > 3 && (
              <div className="w-12 h-12 bg-gray-100 rounded border border-gray-200 flex items-center justify-center">
                <span className="text-xs text-gray-600">
                  +{note.attachments.length - 3}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Acciones rápidas */}
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={() => onView(note)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded transition-colors"
          >
            <Eye className="w-4 h-4" />
            Ver
          </button>
          <button
            onClick={() => onEdit(note)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
          >
            <Edit3 className="w-4 h-4" />
            Editar
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal para crear/editar notas
const NoteModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  note?: BovineNote;
  onSave: (note: Partial<BovineNote>) => void;
  templates: NoteTemplate[];
}> = ({ isOpen, onClose, note, onSave, templates }) => {
  const [formData, setFormData] = useState<Partial<BovineNote>>({
    title: "",
    content: "",
    category: "GENERAL",
    priority: "MEDIUM",
    tags: [],
    isPrivate: false,
    isPinned: false,
    attachments: [],
    reminders: [],
  });
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [newTag, setNewTag] = useState("");
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [reminderDate, setReminderDate] = useState("");
  const [reminderMessage, setReminderMessage] = useState("");

  // Inicializar formulario con datos de la nota existente
  useEffect(() => {
    if (note) {
      setFormData({
        ...note,
        tags: [...note.tags],
      });
    } else {
      setFormData({
        title: "",
        content: "",
        category: "GENERAL",
        priority: "MEDIUM",
        tags: [],
        isPrivate: false,
        isPinned: false,
        attachments: [],
        reminders: [],
      });
    }
  }, [note, isOpen]);

  const handleSave = () => {
    if (!formData.title?.trim() || !formData.content?.trim()) {
      alert("El título y contenido son obligatorios");
      return;
    }

    onSave({
      ...formData,
      updatedAt: new Date(),
      ...(note
        ? {}
        : {
            id: Date.now().toString(),
            createdAt: new Date(),
            authorId: "current-user",
            authorName: "Usuario Actual",
          }),
    });
    onClose();
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags?.filter((tag) => tag !== tagToRemove) || [],
    }));
  };

  const addReminder = () => {
    if (reminderDate && reminderMessage.trim()) {
      const newReminder: NoteReminder = {
        id: Date.now().toString(),
        date: new Date(reminderDate),
        message: reminderMessage.trim(),
        isCompleted: false,
        notificationSent: false,
      };

      setFormData((prev) => ({
        ...prev,
        reminders: [...(prev.reminders || []), newReminder],
      }));

      setReminderDate("");
      setReminderMessage("");
      setShowReminderForm(false);
    }
  };

  const applyTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setFormData((prev) => ({
        ...prev,
        title: template.name,
        content: template.content,
        category: template.category,
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      style={{ opacity: 1 }}
    >
      <div
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        style={{
          transform: 'scale(1)',
          opacity: 1,
        }}
      >
        {/* Header del modal */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {note ? "Editar Nota" : "Nueva Nota"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Templates */}
          {!note && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usar plantilla
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => {
                  setSelectedTemplate(e.target.value);
                  if (e.target.value) {
                    applyTemplate(e.target.value);
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Seleccionar plantilla...</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name} ({noteCategories[template.category].label})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Formulario básico */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título *
              </label>
              <input
                type="text"
                value={formData.title || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Título de la nota..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    category: e.target.value as NoteCategory,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {Object.entries(noteCategories).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioridad
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    priority: e.target.value as BovineNote["priority"],
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="LOW">Baja</option>
                <option value="MEDIUM">Media</option>
                <option value="HIGH">Alta</option>
                <option value="URGENT">Urgente</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isPinned || false}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isPinned: e.target.checked,
                    }))
                  }
                  className="rounded text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Fijar nota</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isPrivate || false}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isPrivate: e.target.checked,
                    }))
                  }
                  className="rounded text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Nota privada</span>
              </label>
            </div>
          </div>
        </div>

        {/* Contenido del modal */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Contenido de la nota */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contenido *
            </label>
            <textarea
              value={formData.content || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, content: e.target.value }))
              }
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              placeholder="Escribe el contenido de la nota..."
            />
          </div>

          {/* Tags */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Etiquetas
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags?.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addTag()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Agregar etiqueta..."
              />
              <button
                onClick={addTag}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Agregar
              </button>
            </div>
          </div>

          {/* Recordatorios */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Recordatorios
              </label>
              <button
                onClick={() => setShowReminderForm(!showReminderForm)}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                + Agregar recordatorio
              </button>
            </div>

            {/* Lista de recordatorios */}
            {formData.reminders && formData.reminders.length > 0 && (
              <div className="space-y-2 mb-4">
                {formData.reminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {reminder.message}
                      </p>
                      <p className="text-xs text-gray-600">
                        {reminder.date.toLocaleString("es-MX")}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          reminders:
                            prev.reminders?.filter(
                              (r) => r.id !== reminder.id
                            ) || [],
                        }));
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Formulario de nuevo recordatorio */}
            {showReminderForm && (
              <div
                className="overflow-hidden"
                style={{
                  opacity: 1,
                  height: 'auto',
                }}
              >
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
                  <input
                    type="datetime-local"
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    value={reminderMessage}
                    onChange={(e) => setReminderMessage(e.target.value)}
                    placeholder="Mensaje del recordatorio..."
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={addReminder}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      Agregar
                    </button>
                    <button
                      onClick={() => setShowReminderForm(false)}
                      className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer del modal */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              {note ? "Actualizar" : "Guardar"} Nota
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente principal de notas del bovino
const BovineNotes: React.FC = () => {
  // Estados principales
  const [notes, setNotes] = useState<BovineNote[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<BovineNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState<BovineNote | undefined>();
  const [viewingNote, setViewingNote] = useState<BovineNote | undefined>();
  const [showFilters, setShowFilters] = useState(false);

  // Estados de filtros
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: "",
    category: "ALL",
    priority: "",
    author: "",
    dateRange: "",
    tags: [],
    showPinned: false,
    showPrivate: true,
  });

  // Templates de notas
  const [templates, setTemplates] = useState<NoteTemplate[]>([]);

  // Cargar datos
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Datos simulados de notas
        const mockNotes: BovineNote[] = [
          {
            id: "1",
            title: "Revisión veterinaria mensual",
            content:
              "Revisión general del estado de salud. El bovino presenta excelente condición corporal. Peso: 550kg. No se observan signos de enfermedad. Recomendación: continuar con el programa nutricional actual.",
            category: "HEALTH",
            priority: "MEDIUM",
            tags: ["revisión", "peso", "salud"],
            isPrivate: false,
            isPinned: true,
            authorId: "vet-001",
            authorName: "Dr. Carlos Mendoza",
            createdAt: new Date("2024-07-01"),
            updatedAt: new Date("2024-07-01"),
            attachments: [],
            reminders: [
              {
                id: "r1",
                date: new Date("2024-08-01"),
                message: "Próxima revisión veterinaria",
                isCompleted: false,
                notificationSent: false,
              },
            ],
            relatedNotes: [],
          },
          {
            id: "2",
            title: "Cambio en comportamiento alimentario",
            content:
              "Se observa una disminución en el consumo de alimento en los últimos 3 días. El bovino muestra preferencia por el pasto fresco sobre el concentrado. Posible causa: cambio de clima o estrés. Monitorear de cerca.",
            category: "BEHAVIOR",
            priority: "HIGH",
            tags: ["alimentación", "comportamiento", "monitoreo"],
            isPrivate: false,
            isPinned: false,
            authorId: "user-001",
            authorName: "Juan Pérez",
            createdAt: new Date("2024-07-05"),
            updatedAt: new Date("2024-07-05"),
            attachments: [],
            reminders: [],
            relatedNotes: [],
          },
          {
            id: "3",
            title: "Vacunación IBR aplicada",
            content:
              "Vacuna IBR-PI3-BRSV-BVD aplicada correctamente. Dosis: 5ml vía subcutánea. Sin reacciones adversas inmediatas. Próxima vacunación programada para junio 2025.",
            category: "VACCINATION",
            priority: "MEDIUM",
            tags: ["IBR", "vacuna", "calendario"],
            isPrivate: false,
            isPinned: false,
            authorId: "vet-001",
            authorName: "Dr. Carlos Mendoza",
            createdAt: new Date("2024-06-15"),
            updatedAt: new Date("2024-06-15"),
            attachments: [],
            reminders: [
              {
                id: "r2",
                date: new Date("2025-06-15"),
                message: "Renovar vacunación IBR",
                isCompleted: false,
                notificationSent: false,
              },
            ],
            relatedNotes: [],
          },
          {
            id: "4",
            title: "Episodio de mastitis subclínica",
            content:
              "Detectada mastitis subclínica en cuarto posterior derecho. Iniciado tratamiento con antibióticos intramamarios. Duración del tratamiento: 3 días. Evolución favorable.",
            category: "TREATMENT",
            priority: "URGENT",
            tags: ["mastitis", "tratamiento", "antibióticos"],
            isPrivate: false,
            isPinned: false,
            authorId: "vet-002",
            authorName: "Dr. Luis Fernández",
            createdAt: new Date("2024-04-20"),
            updatedAt: new Date("2024-04-25"),
            attachments: [],
            reminders: [],
            relatedNotes: [],
          },
        ];

        // Templates simulados
        const mockTemplates: NoteTemplate[] = [
          {
            id: "t1",
            name: "Revisión Veterinaria",
            category: "HEALTH",
            content:
              "Revisión general del estado de salud.\n\nObservaciones:\n- Condición corporal: \n- Peso actual: \n- Signos vitales: \n- Observaciones generales: \n\nRecomendaciones:\n- \n\nPróxima revisión: ",
            fields: [],
          },
          {
            id: "t2",
            name: "Aplicación de Vacuna",
            category: "VACCINATION",
            content:
              "Aplicación de vacuna.\n\nDetalles:\n- Tipo de vacuna: \n- Dosis aplicada: \n- Vía de administración: \n- Lote: \n- Fabricante: \n\nObservaciones:\n- \n\nPróxima aplicación: ",
            fields: [],
          },
          {
            id: "t3",
            name: "Registro de Peso",
            category: "WEIGHT",
            content:
              "Registro de peso corporal.\n\nMedición:\n- Peso actual: \n- Peso anterior: \n- Diferencia: \n- Método de medición: \n\nObservaciones:\n- \n\nPróxima medición: ",
            fields: [],
          },
        ];

        setNotes(mockNotes);
        setFilteredNotes(mockNotes);
        setTemplates(mockTemplates);
      } catch (error) {
        console.error("Error cargando notas:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filtrar notas
  useEffect(() => {
    let filtered = notes;

    // Filtro por búsqueda
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(searchLower) ||
          note.content.toLowerCase().includes(searchLower) ||
          note.tags.some((tag) => tag.toLowerCase().includes(searchLower)) ||
          note.authorName.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por categoría
    if (filters.category !== "ALL") {
      filtered = filtered.filter((note) => note.category === filters.category);
    }

    // Filtro por prioridad
    if (filters.priority) {
      filtered = filtered.filter((note) => note.priority === filters.priority);
    }

    // Filtro por autor
    if (filters.author) {
      filtered = filtered.filter((note) =>
        note.authorName.toLowerCase().includes(filters.author.toLowerCase())
      );
    }

    // Filtro por notas fijadas
    if (filters.showPinned) {
      filtered = filtered.filter((note) => note.isPinned);
    }

    // Filtro por privacidad
    if (!filters.showPrivate) {
      filtered = filtered.filter((note) => !note.isPrivate);
    }

    // Ordenar: fijadas primero, luego por fecha
    filtered.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });

    setFilteredNotes(filtered);
  }, [notes, filters]);

  // Manejar acciones de notas
  const handleSaveNote = (noteData: Partial<BovineNote>) => {
    if (editingNote) {
      // Actualizar nota existente
      setNotes((prev) =>
        prev.map((note) =>
          note.id === editingNote.id
            ? { ...note, ...noteData, updatedAt: new Date() }
            : note
        )
      );
    } else {
      // Crear nueva nota
      const newNote: BovineNote = {
        id: Date.now().toString(),
        title: noteData.title || "",
        content: noteData.content || "",
        category: noteData.category || "GENERAL",
        priority: noteData.priority || "MEDIUM",
        tags: noteData.tags || [],
        isPrivate: noteData.isPrivate || false,
        isPinned: noteData.isPinned || false,
        authorId: "current-user",
        authorName: "Usuario Actual",
        createdAt: new Date(),
        updatedAt: new Date(),
        attachments: noteData.attachments || [],
        reminders: noteData.reminders || [],
        relatedNotes: [],
      };
      setNotes((prev) => [newNote, ...prev]);
    }
    setEditingNote(undefined);
  };

  const handleEditNote = (note: BovineNote) => {
    setEditingNote(note);
    setShowModal(true);
  };

  const handleDeleteNote = (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar esta nota?")) {
      setNotes((prev) => prev.filter((note) => note.id !== id));
    }
  };

  const handleTogglePin = (id: string) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id
          ? { ...note, isPinned: !note.isPinned, updatedAt: new Date() }
          : note
      )
    );
  };

  const handleTogglePrivate = (id: string) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id
          ? { ...note, isPrivate: !note.isPrivate, updatedAt: new Date() }
          : note
      )
    );
  };

  const handleViewNote = (note: BovineNote) => {
    setViewingNote(note);
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      searchTerm: "",
      category: "ALL",
      priority: "",
      author: "",
      dateRange: "",
      tags: [],
      showPinned: false,
      showPrivate: true,
    });
  };

  // Obtener estadísticas
  const getStats = () => {
    return {
      total: notes.length,
      pinned: notes.filter((n) => n.isPinned).length,
      private: notes.filter((n) => n.isPrivate).length,
      urgent: notes.filter((n) => n.priority === "URGENT").length,
      withReminders: notes.filter((n) =>
        n.reminders.some((r) => !r.isCompleted)
      ).length,
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 via-yellow-100 to-orange-400 flex items-center justify-center">
        <div
          className="bg-white bg-opacity-90 backdrop-blur-sm rounded-2xl p-8 text-center"
          style={{
            opacity: 1,
            transform: 'scale(1)',
          }}
        >
          <div
            className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"
            style={{
              animation: 'spin 1s linear infinite',
            }}
          />
          <p className="text-lg font-medium text-gray-700">
            Cargando notas del bovino...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-yellow-100 to-orange-400 p-4">
      <div
        className="max-w-7xl mx-auto"
        style={{
          opacity: 1,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between mb-6"
          style={{
            opacity: 1,
            transform: 'translateY(0px)',
          }}
        >
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg text-white hover:bg-white hover:bg-opacity-30 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Regresar al Detalle</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 backdrop-blur-sm rounded-lg text-white transition-all duration-300 ${
                showFilters ? "bg-white bg-opacity-30" : "bg-white bg-opacity-20 hover:bg-white hover:bg-opacity-30"
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="font-medium">Filtros</span>
            </button>

            <button
              onClick={() => {
                setEditingNote(undefined);
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 bg-opacity-80 backdrop-blur-sm rounded-lg text-white hover:bg-green-700 hover:bg-opacity-80 transition-all duration-300"
            >
              <Plus className="w-4 h-4" />
              <span className="font-medium">Nueva Nota</span>
            </button>
          </div>
        </div>

        {/* Título */}
        <div 
          className="text-center mb-8"
          style={{
            opacity: 1,
            transform: 'translateY(0px)',
          }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Notas y Observaciones
          </h1>
          <p className="text-lg text-white text-opacity-80 max-w-2xl mx-auto">
            Registra y gestiona todas las observaciones y notas del bovino
          </p>
        </div>

        {/* Estadísticas */}
        <div
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6"
          style={{
            opacity: 1,
            transform: 'translateY(0px)',
          }}
        >
          <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">
              {stats.total}
            </div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pinned}
            </div>
            <div className="text-sm text-gray-600">Fijadas</div>
          </div>
          <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gray-600">
              {stats.private}
            </div>
            <div className="text-sm text-gray-600">Privadas</div>
          </div>
          <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {stats.urgent}
            </div>
            <div className="text-sm text-gray-600">Urgentes</div>
          </div>
          <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.withReminders}
            </div>
            <div className="text-sm text-gray-600">Con Recordatorios</div>
          </div>
        </div>

        {/* Controles y filtros */}
        <div
          className="bg-yellow-50 bg-opacity-90 backdrop-blur-sm rounded-2xl shadow-xl border border-white border-opacity-20 p-6 mb-6"
          style={{
            opacity: 1,
            transform: 'translateY(0px)',
          }}
        >
          {/* Búsqueda */}
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por título, contenido, etiquetas o autor..."
                value={filters.searchTerm}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    searchTerm: e.target.value,
                  }))
                }
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtros expandibles */}
          {showFilters && (
            <div
              className="border-t border-gray-200 pt-4 overflow-hidden"
              style={{
                opacity: 1,
                height: 'auto',
              }}
            >
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-4">
                <select
                  value={filters.category}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      category: e.target.value as FilterOptions["category"],
                    }))
                  }
                  className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="ALL">Todas las categorías</option>
                  {Object.entries(noteCategories).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.label}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.priority}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      priority: e.target.value,
                    }))
                  }
                  className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Todas las prioridades</option>
                  <option value="LOW">Baja</option>
                  <option value="MEDIUM">Media</option>
                  <option value="HIGH">Alta</option>
                  <option value="URGENT">Urgente</option>
                </select>

                <input
                  type="text"
                  placeholder="Buscar por autor..."
                  value={filters.author}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      author: e.target.value,
                    }))
                  }
                  className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showPinned"
                    checked={filters.showPinned}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        showPinned: e.target.checked,
                      }))
                    }
                    className="rounded text-green-600 focus:ring-green-500"
                  />
                  <label
                    htmlFor="showPinned"
                    className="text-sm text-gray-700 cursor-pointer"
                  >
                    Solo fijadas
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="showPrivate"
                    checked={filters.showPrivate}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        showPrivate: e.target.checked,
                      }))
                    }
                    className="rounded text-green-600 focus:ring-green-500"
                  />
                  <label
                    htmlFor="showPrivate"
                    className="text-sm text-gray-700 cursor-pointer"
                  >
                    Incluir privadas
                  </label>
                </div>

                <button
                  onClick={clearFilters}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Limpiar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Lista de notas */}
        <div
          className="bg-yellow-50 bg-opacity-90 backdrop-blur-sm rounded-2xl shadow-xl border border-white border-opacity-20 p-6"
          style={{
            opacity: 1,
            transform: 'translateY(0px)',
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Notas ({filteredNotes.length})
            </h2>
          </div>

          {filteredNotes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNotes.map((note, index) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onEdit={handleEditNote}
                  onDelete={handleDeleteNote}
                  onTogglePin={handleTogglePin}
                  onTogglePrivate={handleTogglePrivate}
                  onView={handleViewNote}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No se encontraron notas
              </h3>
              <p className="text-gray-600 mb-4">
                {filters.searchTerm ||
                filters.category !== "ALL" ||
                filters.priority
                  ? "No hay notas que coincidan con los filtros aplicados."
                  : "Aún no se han creado notas para este bovino."}
              </p>
              {filters.searchTerm ||
              filters.category !== "ALL" ||
              filters.priority ? (
                <button
                  onClick={clearFilters}
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  Limpiar filtros
                </button>
              ) : (
                <button
                  onClick={() => {
                    setEditingNote(undefined);
                    setShowModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Crear primera nota
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal de nota */}
        {showModal && (
          <NoteModal
            isOpen={showModal}
            onClose={() => {
              setShowModal(false);
              setEditingNote(undefined);
            }}
            note={editingNote}
            onSave={handleSaveNote}
            templates={templates}
          />
        )}

        {/* Modal de vista de nota */}
        {viewingNote && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            style={{ opacity: 1 }}
          >
            <div
              className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              style={{
                transform: 'scale(1)',
                opacity: 1,
              }}
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {viewingNote.isPinned && (
                        <Pin className="w-4 h-4 text-yellow-500" />
                      )}
                      {viewingNote.isPrivate && (
                        <EyeOff className="w-4 h-4 text-gray-500" />
                      )}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          noteCategories[viewingNote.category].color
                        }`}
                      >
                        {noteCategories[viewingNote.category].label}
                      </span>
                      <PriorityBadge priority={viewingNote.priority} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {viewingNote.title}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {viewingNote.authorName}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {viewingNote.createdAt.toLocaleString("es-MX")}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setViewingNote(undefined)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Contenido */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {viewingNote.content}
                  </p>
                </div>

                {/* Tags */}
                {viewingNote.tags.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Etiquetas
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {viewingNote.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recordatorios */}
                {viewingNote.reminders.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                      Recordatorios
                    </h3>
                    <div className="space-y-2">
                      {viewingNote.reminders.map((reminder) => (
                        <div
                          key={reminder.id}
                          className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {reminder.message}
                            </p>
                            <p className="text-xs text-gray-600">
                              {reminder.date.toLocaleString("es-MX")}
                            </p>
                          </div>
                          <div
                            className={`w-3 h-3 rounded-full ${
                              reminder.isCompleted
                                ? "bg-green-500"
                                : "bg-yellow-500"
                            }`}
                          ></div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200">
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setViewingNote(undefined)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={() => {
                      setEditingNote(viewingNote);
                      setViewingNote(undefined);
                      setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    Editar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default BovineNotes;