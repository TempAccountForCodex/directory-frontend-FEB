/**
 * Translation dictionaries for supported languages
 * This is a lightweight i18n foundation that can be expanded
 */

export type Language = "en" | "es" | "fr" | "de" | "pt" | "ar" | "zh" | "hi";

export interface Translations {
  [key: string]: string | Translations;
}

/**
 * English translations (default)
 */
export const en: Translations = {
  common: {
    loading: "Loading...",
    error: "Error",
    success: "Success",
    submit: "Submit",
    cancel: "Cancel",
    close: "Close",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    search: "Search",
    filter: "Filter",
    clear: "Clear",
    apply: "Apply",
    back: "Back",
    next: "Next",
    previous: "Previous",
    finish: "Finish",
    yes: "Yes",
    no: "No",
  },
  website: {
    powered_by: "Powered by TechieTribe",
    all_rights_reserved: "All rights reserved",
    get_started: "Get Started",
    learn_more: "Learn More",
    contact_us: "Contact Us",
    read_more: "Read More",
  },
  contact: {
    name: "Name",
    email: "Email",
    phone: "Phone",
    message: "Message",
    send_message: "Send Message",
    success_message: "Thank you! Your message has been sent successfully.",
    error_message:
      "Sorry, there was an error sending your message. Please try again.",
    required_field: "This field is required",
  },
  navigation: {
    home: "Home",
    about: "About",
    services: "Services",
    contact: "Contact",
    blog: "Blog",
  },
  validation: {
    required: "This field is required",
    email: "Please enter a valid email address",
    min_length: "Must be at least {min} characters",
    max_length: "Must be at most {max} characters",
    invalid: "Invalid value",
  },
};

/**
 * Spanish translations
 */
export const es: Translations = {
  common: {
    loading: "Cargando...",
    error: "Error",
    success: "Éxito",
    submit: "Enviar",
    cancel: "Cancelar",
    close: "Cerrar",
    save: "Guardar",
    delete: "Eliminar",
    edit: "Editar",
    create: "Crear",
    search: "Buscar",
    filter: "Filtrar",
    clear: "Limpiar",
    apply: "Aplicar",
    back: "Atrás",
    next: "Siguiente",
    previous: "Anterior",
    finish: "Finalizar",
    yes: "Sí",
    no: "No",
  },
  website: {
    powered_by: "Desarrollado por TechieTribe",
    all_rights_reserved: "Todos los derechos reservados",
    get_started: "Comenzar",
    learn_more: "Saber Más",
    contact_us: "Contáctanos",
    read_more: "Leer Más",
  },
  contact: {
    name: "Nombre",
    email: "Correo Electrónico",
    phone: "Teléfono",
    message: "Mensaje",
    send_message: "Enviar Mensaje",
    success_message: "¡Gracias! Tu mensaje ha sido enviado exitosamente.",
    error_message:
      "Lo sentimos, hubo un error al enviar tu mensaje. Por favor, inténtalo de nuevo.",
    required_field: "Este campo es obligatorio",
  },
  navigation: {
    home: "Inicio",
    about: "Acerca de",
    services: "Servicios",
    contact: "Contacto",
    blog: "Blog",
  },
  validation: {
    required: "Este campo es obligatorio",
    email: "Por favor ingresa un correo electrónico válido",
    min_length: "Debe tener al menos {min} caracteres",
    max_length: "Debe tener como máximo {max} caracteres",
    invalid: "Valor inválido",
  },
};

/**
 * French translations
 */
export const fr: Translations = {
  common: {
    loading: "Chargement...",
    error: "Erreur",
    success: "Succès",
    submit: "Soumettre",
    cancel: "Annuler",
    close: "Fermer",
    save: "Enregistrer",
    delete: "Supprimer",
    edit: "Modifier",
    create: "Créer",
    search: "Rechercher",
    filter: "Filtrer",
    clear: "Effacer",
    apply: "Appliquer",
    back: "Retour",
    next: "Suivant",
    previous: "Précédent",
    finish: "Terminer",
    yes: "Oui",
    no: "Non",
  },
  website: {
    powered_by: "Propulsé par TechieTribe",
    all_rights_reserved: "Tous droits réservés",
    get_started: "Commencer",
    learn_more: "En Savoir Plus",
    contact_us: "Contactez-nous",
    read_more: "Lire Plus",
  },
  contact: {
    name: "Nom",
    email: "E-mail",
    phone: "Téléphone",
    message: "Message",
    send_message: "Envoyer le Message",
    success_message: "Merci! Votre message a été envoyé avec succès.",
    error_message:
      "Désolé, une erreur s'est produite lors de l'envoi de votre message. Veuillez réessayer.",
    required_field: "Ce champ est obligatoire",
  },
  navigation: {
    home: "Accueil",
    about: "À Propos",
    services: "Services",
    contact: "Contact",
    blog: "Blog",
  },
  validation: {
    required: "Ce champ est obligatoire",
    email: "Veuillez entrer une adresse e-mail valide",
    min_length: "Doit contenir au moins {min} caractères",
    max_length: "Doit contenir au plus {max} caractères",
    invalid: "Valeur invalide",
  },
};

/**
 * All available translations
 */
export const translations: Record<Language, Translations> = {
  en,
  es,
  fr,
  de: en, // German - fallback to English for now
  pt: en, // Portuguese - fallback to English for now
  ar: en, // Arabic - fallback to English for now
  zh: en, // Chinese - fallback to English for now
  hi: en, // Hindi - fallback to English for now
};

/**
 * Language metadata
 */
export const languageInfo: Record<
  Language,
  { name: string; nativeName: string; rtl?: boolean }
> = {
  en: { name: "English", nativeName: "English" },
  es: { name: "Spanish", nativeName: "Español" },
  fr: { name: "French", nativeName: "Français" },
  de: { name: "German", nativeName: "Deutsch" },
  pt: { name: "Portuguese", nativeName: "Português" },
  ar: { name: "Arabic", nativeName: "العربية", rtl: true },
  zh: { name: "Chinese", nativeName: "中文" },
  hi: { name: "Hindi", nativeName: "हिन्दी" },
};

export default translations;
