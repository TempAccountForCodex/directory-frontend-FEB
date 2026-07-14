import { apiClient } from "../api/client";

export const MEDIA_UPLOAD_LIMITS = {
  imageMaxBytes: 10 * 1024 * 1024,
  videoMaxBytes: 100 * 1024 * 1024,
  websiteTotalBytes: 500 * 1024 * 1024,
};

export const ALLOWED_IMAGE_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "gif",
  "svg",
];

export const ALLOWED_VIDEO_EXTENSIONS = ["mp4", "webm", "mov"];

export const IMAGE_ACCEPT_ATTR = ALLOWED_IMAGE_EXTENSIONS.map(
  (extension) => `.${extension}`,
).join(",");
export const VIDEO_ACCEPT_ATTR = ALLOWED_VIDEO_EXTENSIONS.map(
  (extension) => `.${extension}`,
).join(",");

export const IMAGE_DROPZONE_ACCEPT = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
  "image/gif": [".gif"],
  "image/svg+xml": [".svg"],
};

const ALLOWED_IMAGE_MIME_TYPES = Object.keys(IMAGE_DROPZONE_ACCEPT);
const ALLOWED_VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
];

const MEDIA_RESPONSE_SIZE_KEYS = [
  "sizeBytes",
  "fileSizeBytes",
  "fileSize",
  "size",
  "bytes",
];

const toRecord = (value) =>
  value && typeof value === "object" && !Array.isArray(value) ? value : null;

const extractMediaResponseItems = (responseData) => {
  if (Array.isArray(responseData)) return responseData;
  if (Array.isArray(responseData?.data?.media)) return responseData.data.media;
  if (Array.isArray(responseData?.media)) return responseData.media;
  if (Array.isArray(responseData?.data)) return responseData.data;
  return [];
};

const readPositiveNumber = (value) => {
  if (typeof value === "number" && Number.isFinite(value) && value >= 0) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed >= 0) {
      return parsed;
    }
  }
  return 0;
};

export const formatBytes = (bytes) => {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 MB";
  }

  const units = ["bytes", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  const precision = unitIndex >= 2 ? 1 : 0;
  return `${value.toFixed(precision)} ${units[unitIndex]}`;
};

export const extractMediaItemSizeBytes = (item) => {
  if (!item || typeof item !== "object") return 0;

  for (const key of MEDIA_RESPONSE_SIZE_KEYS) {
    const value = readPositiveNumber(item[key]);
    if (value > 0) return value;
  }

  const metadata = toRecord(item.metadata);
  if (metadata) {
    for (const key of MEDIA_RESPONSE_SIZE_KEYS) {
      const value = readPositiveNumber(metadata[key]);
      if (value > 0) return value;
    }
  }

  return 0;
};

export const calculateWebsiteMediaUsageBytes = (items) =>
  (Array.isArray(items) ? items : []).reduce(
    (total, item) => total + extractMediaItemSizeBytes(item),
    0,
  );

export const fetchWebsiteMediaUsage = async (websiteId) => {
  if (!websiteId) {
    return { usedBytes: 0, items: [] };
  }

  const response = await apiClient.get(`/websites/${websiteId}/media`);
  const items = extractMediaResponseItems(response.data);
  return {
    usedBytes: calculateWebsiteMediaUsageBytes(items),
    items,
  };
};

const getFileExtension = (fileName) => {
  if (typeof fileName !== "string") return "";
  const parts = fileName.toLowerCase().split(".");
  return parts.length > 1 ? parts.pop() || "" : "";
};

export const getMediaTypeForFile = (file) => {
  const extension = getFileExtension(file?.name);
  if (ALLOWED_IMAGE_EXTENSIONS.includes(extension)) return "image";
  if (ALLOWED_VIDEO_EXTENSIONS.includes(extension)) return "video";
  if (extension) return null;

  const mimeType = String(file?.type || "").toLowerCase();
  if (ALLOWED_IMAGE_MIME_TYPES.includes(mimeType)) return "image";
  if (ALLOWED_VIDEO_MIME_TYPES.includes(mimeType)) return "video";
  return null;
};

const getAllowedFormatsLabel = (mediaType) =>
  mediaType === "video"
    ? ALLOWED_VIDEO_EXTENSIONS.map((value) => value.toUpperCase()).join(", ")
    : ALLOWED_IMAGE_EXTENSIONS.map((value) => value.toUpperCase()).join(", ");

const buildStorageContext = (usedBytes = 0) => {
  const used = Math.max(0, usedBytes);
  const remaining = Math.max(0, MEDIA_UPLOAD_LIMITS.websiteTotalBytes - used);
  return { used, remaining };
};

export const getMediaLimitSummary = (mediaType) =>
  mediaType === "video"
    ? `Allowed formats: ${getAllowedFormatsLabel("video")}. Max ${formatBytes(MEDIA_UPLOAD_LIMITS.videoMaxBytes)} per video. Website total ${formatBytes(MEDIA_UPLOAD_LIMITS.websiteTotalBytes)}.`
    : `Allowed formats: ${getAllowedFormatsLabel("image")}. Max ${formatBytes(MEDIA_UPLOAD_LIMITS.imageMaxBytes)} per image. Website total ${formatBytes(MEDIA_UPLOAD_LIMITS.websiteTotalBytes)}.`;

export const validateWebsiteMediaUpload = async ({
  file,
  websiteId,
  currentUsageBytes,
  allowedMediaType,
}) => {
  if (!file) {
    return { ok: false, message: "No file selected." };
  }

  const detectedMediaType = getMediaTypeForFile(file);
  if (!detectedMediaType) {
    return {
      ok: false,
      message: `Unsupported file type. Allowed image formats: ${getAllowedFormatsLabel("image")}. Allowed video formats: ${getAllowedFormatsLabel("video")}.`,
    };
  }

  if (allowedMediaType && detectedMediaType !== allowedMediaType) {
    return {
      ok: false,
      message:
        allowedMediaType === "video"
          ? `Unsupported file type. Allowed video formats: ${getAllowedFormatsLabel("video")}.`
          : `Unsupported file type. Allowed image formats: ${getAllowedFormatsLabel("image")}.`,
    };
  }

  const websiteUsage =
    typeof currentUsageBytes === "number"
      ? currentUsageBytes
      : (await fetchWebsiteMediaUsage(websiteId)).usedBytes;
  const { used, remaining } = buildStorageContext(websiteUsage);
  const fileLimitBytes =
    detectedMediaType === "video"
      ? MEDIA_UPLOAD_LIMITS.videoMaxBytes
      : MEDIA_UPLOAD_LIMITS.imageMaxBytes;

  if (file.size > fileLimitBytes) {
    return {
      ok: false,
      mediaType: detectedMediaType,
      usedBytes: used,
      remainingBytes: remaining,
      message: `This ${detectedMediaType} exceeds the max allowed file size of ${formatBytes(fileLimitBytes)}. Current website storage used: ${formatBytes(used)}. Remaining available storage: ${formatBytes(remaining)}.`,
    };
  }

  if (used + file.size > MEDIA_UPLOAD_LIMITS.websiteTotalBytes) {
    return {
      ok: false,
      mediaType: detectedMediaType,
      usedBytes: used,
      remainingBytes: remaining,
      message: `This upload would exceed the website media limit of ${formatBytes(MEDIA_UPLOAD_LIMITS.websiteTotalBytes)}. Max allowed file size: ${formatBytes(fileLimitBytes)}. Current website storage used: ${formatBytes(used)}. Remaining available storage: ${formatBytes(remaining)}.`,
    };
  }

  return {
    ok: true,
    mediaType: detectedMediaType,
    usedBytes: used,
    remainingBytes: Math.max(
      0,
      MEDIA_UPLOAD_LIMITS.websiteTotalBytes - used - file.size,
    ),
    fileLimitBytes,
  };
};
