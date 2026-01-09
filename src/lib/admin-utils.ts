// Utility functions for admin panel

/**
 * Convert file to base64 string
 */
export const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Extract YouTube video ID from URL or return as-is if already an ID
 */
export const extractYouTubeId = (url: string): string | null => {
  if (!url || !url.trim()) return null;
  
  const trimmedUrl = url.trim();
  
  // If already an ID (11 characters, alphanumeric with - and _)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmedUrl)) {
    return trimmedUrl;
  }
  
  // Common YouTube URL patterns
  const patterns = [
    // youtube.com/watch?v=VIDEO_ID
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    // youtu.be/VIDEO_ID
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    // youtube.com/embed/VIDEO_ID
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    // youtube.com/watch?feature=...&v=VIDEO_ID
    /(?:youtube\.com\/watch\?.*[&?]v=)([a-zA-Z0-9_-]{11})/,
    // youtube.com/v/VIDEO_ID
    /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    // youtube.com/.../VIDEO_ID (catch-all)
    /youtube\.com\/.*[\/=]([a-zA-Z0-9_-]{11})(?:[?&#]|$)/,
  ];
  
  for (const pattern of patterns) {
    const match = trimmedUrl.match(pattern);
    if (match && match[1] && match[1].length === 11) {
      return match[1];
    }
  }
  
  // Si no coincide con ningún patrón pero tiene 11 caracteres, podría ser un ID
  const possibleId = trimmedUrl.split(/[?&#]/)[0]; // Tomar solo la parte antes de query params
  if (/^[a-zA-Z0-9_-]{11}$/.test(possibleId)) {
    return possibleId;
  }
  
  return null;
};

/**
 * Get YouTube thumbnail URL from video ID
 */
export const getYouTubeThumbnail = (videoId: string): string => {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
};

/**
 * Generate slug from text
 */
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
};

/**
 * Format date for display
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-BO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

/**
 * Format datetime for display
 */
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-BO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

/**
 * Validate file size (in bytes)
 */
export const validateFileSize = (file: File, maxSizeBytes: number): boolean => {
  return file.size <= maxSizeBytes;
};

/**
 * Validate file type
 */
export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  return allowedTypes.includes(file.type);
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

/**
 * Get initials from name
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Color options for plan estudios
 */
export const MATERIA_COLORS = [
  { name: 'Azul', value: '#2563eb' },
  { name: 'Cian', value: '#06b6d4' },
  { name: 'Verde', value: '#10b981' },
  { name: 'Rosa', value: '#ec4899' },
  { name: 'Naranja', value: '#c77316' },
  { name: 'Rojo', value: '#dc2626' },
  { name: 'Morado', value: '#8b5cf6' },
  { name: 'Amarillo', value: '#eab308' },
];

/**
 * Categories for plan estudios
 */
export const MATERIA_CATEGORIAS = [
  'Electrónica',
  'Matemática',
  'Física',
  'Control',
  'Otros',
] as const;

/**
 * Event types
 */
export const EVENTO_TIPOS = [
  'Académico',
  'Cultural',
  'Deportivo',
] as const;
