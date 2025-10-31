/**
 * Medical Image Types for OrtoKompanion
 *
 * Handles X-rays, anatomical illustrations, surgical techniques, and clinical photos
 * with proper attribution and licensing information
 */

import { Domain } from './onboarding';
import { EducationLevel } from './education';

export type ImageType =
  | 'xray'           // Röntgenbilder
  | 'ct'             // CT-bilder
  | 'mri'            // MR-bilder
  | 'illustration'   // Anatomiska illustrationer
  | 'clinical-photo' // Kliniska foton
  | 'surgical'       // Kirurgiska tekniker
  | 'diagram'        // Diagram och scheman
  | 'classification'; // Klassificeringssystem

export type ImageLicense =
  | 'cc-by-4.0'           // Creative Commons Attribution 4.0
  | 'cc-by-sa-4.0'        // Creative Commons Attribution-ShareAlike 4.0
  | 'cc0'                 // Public Domain
  | 'educational-use'     // Educational use only
  | 'permission-granted'  // Permission granted by author
  | 'copyright-holder';   // Copyright holder permission

export interface ImageSource {
  type: 'journal' | 'textbook' | 'database' | 'institution' | 'original' | 'wikimedia';
  name: string;
  url?: string;
  doi?: string;
  citation?: string;
}

export interface MedicalImage {
  id: string;
  type: ImageType;
  title: string;
  description: string;

  // File information
  path: string; // Actual image path (e.g., /images/xrays/garden-iv-fracture.jpg)
  thumbnail?: string; // Optional thumbnail path

  // Medical context
  domain: Domain;
  level: EducationLevel;
  tags: string[];

  // Attribution and licensing
  source: ImageSource;
  license: ImageLicense;
  attribution: string; // Full attribution text
  year?: number;

  // Content relationships
  relatedQuestions?: string[]; // Question IDs
  relatedCases?: string[]; // Case study IDs
  relatedPearls?: string[]; // Pearl IDs

  // Educational metadata
  annotations?: ImageAnnotation[];
  viewCount?: number;
}

export interface ImageAnnotation {
  id: string;
  label: string;
  description: string;
  coordinates: {
    x: number; // Percentage from left
    y: number; // Percentage from top
  };
  color?: string;
}

export interface ImageCollection {
  id: string;
  name: string;
  description: string;
  images: string[]; // Image IDs
  domain?: Domain;
}
