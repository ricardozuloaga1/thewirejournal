/**
 * Image Pipeline - Main Export
 * 
 * 3-Tier Image Pipeline:
 * 1. Extract OG images from news sources (free, fast, authentic)
 * 2. Gemini Imagen generation (fallback)
 * 3. DALL-E generation (final fallback)
 */

export { 
  generateArticleImages, 
  generateImagePrompt,
  type GeneratedImage, 
  type ImageGenerationResult 
} from './dalle';

export {
  extractImagesFromSources,
  extractSingleImage,
  type ExtractedImage,
} from './extract';
