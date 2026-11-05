import { mergedPortfolioProjects } from './src/assetScanner.js';
const p = mergedPortfolioProjects.find(p => p.id === 'empathtune-web');
console.log('empathtune-web project:', {
  id: p?.id,
  name: p?.name,
  image: typeof p?.image === 'string' ? p.image.slice(0, 50) : p?.image,
  galleryLength: p?.gallery?.length,
  galleryFiles: p?.gallery?.map(g => g.fileName)
});

