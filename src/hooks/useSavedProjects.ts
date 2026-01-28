'use client';

import { useState, useCallback, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { SavedProject, MapStyle, StyleSettings } from '@/types';

interface UseSavedProjectsReturn {
  projects: SavedProject[];
  isLoading: boolean;
  saveProject: (project: Omit<SavedProject, 'id' | 'createdAt' | 'updatedAt'>) => Promise<{ error: string | null }>;
  deleteProject: (id: string) => Promise<{ error: string | null }>;
  loadProjects: () => Promise<void>;
}

export function useSavedProjects(userId: string | null): UseSavedProjectsReturn {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isConfigured = isSupabaseConfigured();

  const loadProjects = useCallback(async () => {
    if (!isConfigured || !userId) {
      setProjects([]);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const mappedProjects: SavedProject[] = (data || []).map((row: {
        id: string;
        name: string;
        location_name: string;
        location_lat: number;
        location_lng: number;
        location_zoom: number;
        location_pitch: number;
        location_bearing: number;
        style: MapStyle;
        settings: StyleSettings;
        created_at: string;
        updated_at: string;
        thumbnail?: string;
      }) => ({
        id: row.id,
        name: row.name,
        locationName: row.location_name,
        location: {
          lat: row.location_lat,
          lng: row.location_lng,
          zoom: row.location_zoom,
          pitch: row.location_pitch,
          bearing: row.location_bearing
        },
        style: row.style,
        settings: row.settings,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        thumbnail: row.thumbnail
      }));

      setProjects(mappedProjects);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isConfigured, userId]);

  const saveProject = useCallback(async (
    project: Omit<SavedProject, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!isConfigured || !userId) {
      return { error: 'Not authenticated' };
    }

    try {
      const { error } = await supabase.from('projects').insert({
        user_id: userId,
        name: project.name,
        location_name: project.locationName,
        location_lat: project.location.lat,
        location_lng: project.location.lng,
        location_zoom: project.location.zoom,
        location_pitch: project.location.pitch,
        location_bearing: project.location.bearing,
        style: project.style,
        settings: project.settings,
        thumbnail: project.thumbnail
      });

      if (error) throw error;

      await loadProjects();
      return { error: null };
    } catch (error) {
      console.error('Failed to save project:', error);
      return { error: 'Failed to save project' };
    }
  }, [isConfigured, userId, loadProjects]);

  const deleteProject = useCallback(async (id: string) => {
    if (!isConfigured || !userId) {
      return { error: 'Not authenticated' };
    }

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

      await loadProjects();
      return { error: null };
    } catch (error) {
      console.error('Failed to delete project:', error);
      return { error: 'Failed to delete project' };
    }
  }, [isConfigured, userId, loadProjects]);

  // Load projects when userId changes
  useEffect(() => {
    if (userId) {
      loadProjects();
    } else {
      setProjects([]);
    }
  }, [userId, loadProjects]);

  return {
    projects,
    isLoading,
    saveProject,
    deleteProject,
    loadProjects
  };
}
