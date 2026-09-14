import { Project } from '../types';

export const storageService = {
  saveProject(project: Project) {
    try {
      localStorage.setItem(`devils_eye_project_${project.id}`, JSON.stringify(project));
    } catch (e) {
      console.warn('Failed to save project to localStorage', e);
    }
  },

  getProject(id: string): Project | null {
    try {
      const data = localStorage.getItem(`devils_eye_project_${id}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  removeProject(id: string) {
    try {
      localStorage.removeItem(`devils_eye_project_${id}`);
    } catch {}
  }
};
