const SUPPORTED_MIME_TYPES = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/wave',
  'audio/x-wav',
  'audio/ogg',
  'audio/mp4',
  'audio/x-m4a',
])

const SUPPORTED_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.m4a']

export function createAudioSourceFromFile(file) {
  const fileName = file.name.toLowerCase()
  const hasAllowedExtension = SUPPORTED_EXTENSIONS.some((ext) => fileName.endsWith(ext))
  const hasSupportedMimeType = SUPPORTED_MIME_TYPES.has(file.type)

  if (!hasAllowedExtension && !hasSupportedMimeType) {
    return { ok: false, reason: 'unsupported-format' }
  }

  const url = URL.createObjectURL(file)

  return {
    ok: true,
    url,
    revoke: () => URL.revokeObjectURL(url),
  }
}

export function formatAudioFileError(reason) {
  if (reason === 'unsupported-format') {
    return 'Unsupported file. Please upload mp3, wav, ogg, or m4a.'
  }

  return 'Could not load this file. Please try another audio file.'
}
