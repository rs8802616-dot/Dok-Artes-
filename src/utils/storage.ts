import { ProjectData, ProjectMeta, PaperTemplate } from '../types';

const DB_NAME = 'freenote_studio_db';
const STORE_NAME = 'projects';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveProject(project: ProjectData): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.put({
      ...project,
      updatedAt: Date.now(),
    });
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getAllProjects(): Promise<ProjectMeta[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => {
      const all: ProjectData[] = req.result || [];
      // Sort by latest updated
      const metas: ProjectMeta[] = all
        .map((p) => ({
          id: p.id,
          name: p.name,
          width: p.width,
          height: p.height,
          dpi: p.dpi,
          paperTemplate: p.paperTemplate,
          backgroundColor: p.backgroundColor,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
          thumbnail: p.thumbnail,
          isFavorite: p.isFavorite,
        }))
        .sort((a, b) => b.updatedAt - a.updatedAt);
      resolve(metas);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getProjectById(id: string): Promise<ProjectData | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteProject(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function duplicateProject(id: string): Promise<ProjectData | null> {
  const original = await getProjectById(id);
  if (!original) return null;
  const newId = 'proj_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  const copy: ProjectData = {
    ...original,
    id: newId,
    name: `${original.name} (Cópia)`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await saveProject(copy);
  return copy;
}

export function createNewDefaultProject(
  name: string = 'Sem Título',
  width: number = 1920,
  height: number = 1080,
  template: PaperTemplate = 'blank',
  bgColor: string = '#ffffff'
): ProjectData {
  const projId = 'proj_' + Date.now();
  const layer1Id = 'layer_' + Date.now();
  return {
    id: projId,
    name,
    width,
    height,
    dpi: 150,
    paperTemplate: template,
    backgroundColor: bgColor,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    activeLayerId: layer1Id,
    layers: [
      {
        id: layer1Id,
        name: 'Camada 1',
        visible: true,
        locked: false,
        alphaLocked: false,
        opacity: 1,
        blendMode: 'source-over',
        dataUrl: '',
      },
    ],
  };
}
